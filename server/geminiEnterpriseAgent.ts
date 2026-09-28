import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { streamStatutoryKnowledgeResponse } from './statutoryKnowledgeEngine.ts';

/**
 * Strips surrounding braces and whitespace from secret values
 */
function cleanSecret(val?: string): string {
  if (!val) return '';
  return val.trim().replace(/^\{|\}$/g, '').trim();
}

/**
 * Fallback streaming using Gemini API if Discovery Engine is unconfigured or fails
 */
async function streamGeminiFallback(
  queryText: string,
  sendEvent: (data: any) => void,
  agentId?: string
): Promise<boolean> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return false;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: queryText,
      config: {
        systemInstruction: `You are the official Statutory & Compliance AI Agent (${agentId || '9469390002127365054'}) for the Sabah State Library (Perpustakaan Negeri Sabah), operating under the Sabah State Library Enactment 1988 (Enactment No. 4 of 1988, amended 2022) and the State Strategic Plan 2026-2028.
Your role is to evaluate statutory compliance, interpret statutory mandates, advise on job descriptions (such as Director / Pengarah Perpustakaan Negeri Sabah), review branch performance, and meticulously analyze any uploaded files, CSV datasets, JSON records, audit logs, or tabular data submitted by library officers and auditors.
Always cite relevant enactment sections (e.g. Section 3 powers & duties, Section 6 legal deposit requirements, Section 8 rural branch operations, Section 14 financial governance). Provide clear, structured, professional answers formatted with Markdown.`
      }
    });

    let accumulatedAnswer = '';
    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        accumulatedAnswer += text;
        sendEvent({
          type: 'chunk',
          text,
          accumulated: accumulatedAnswer
        });
      }
    }

    const finalClean = accumulatedAnswer.trim();
    if (finalClean) {
      sendEvent({
        type: 'done',
        answer: finalClean
      });
      return true;
    }
  } catch (err) {
    console.warn('Gemini 2.5 Flash fallback failed:', err);
  }
  return false;
}

/**
 * Exchanges OAuth refresh token for a fresh OAuth2 access token via Google's token endpoint on every request.
 * Does not cache tokens to ensure fresh tokens on every invocation.
 */
export async function getFreshOAuthToken(): Promise<string> {
  const clientId = (process.env.oauth_client_id || process.env.OAUTH_CLIENT_ID || '').trim();
  const clientSecret = (process.env.oauth_client_secret || process.env.OAUTH_CLIENT_SECRET || '').trim();
  const refreshToken = (process.env.oauth_refresh_token || process.env.OAUTH_REFRESH_TOKEN || '').trim();

  if (!clientId || !clientSecret || !refreshToken) {
    const missing: string[] = [];
    if (!clientId) missing.push('oauth_client_id');
    if (!clientSecret) missing.push('oauth_client_secret');
    if (!refreshToken) missing.push('oauth_refresh_token');
    throw new Error(`Missing OAuth credentials in Secrets: ${missing.join(', ')}`);
  }

  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const bodyParams = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: bodyParams.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google OAuth token exchange failed:', response.status, errorText);
    throw new Error(`Google OAuth token exchange failed (HTTP ${response.status}): ${errorText}`);
  }

  const tokenData = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!tokenData.access_token) {
    throw new Error(
      `OAuth token response missing access_token: ${
        tokenData.error_description || tokenData.error || 'Unknown error'
      }`
    );
  }

  return tokenData.access_token;
}

/**
 * Extracts text content from Discovery Engine streamAssist chunk structures
 */
export function extractTextFromChunk(chunk: any): string {
  if (!chunk) return '';
  if (typeof chunk === 'string') return chunk;

  let text = '';

  // Primary Discovery Engine streamAssist structure: chunk.answer
  if (chunk.answer) {
    const a = chunk.answer;
    if (Array.isArray(a.replies)) {
      for (const r of a.replies) {
        if (typeof r === 'string') text += r;
        else if (r?.content && typeof r.content === 'string') text += r.content;
        else if (r?.reply) {
          text += typeof r.reply === 'string' ? r.reply : r.reply?.reply || '';
        } else if (r?.text && typeof r.text === 'string') text += r.text;
      }
    } else if (typeof a.reply === 'string') {
      text += a.reply;
    } else if (a.reply?.reply && typeof a.reply.reply === 'string') {
      text += a.reply.reply;
    } else if (typeof a.answerText === 'string') {
      text += a.answerText;
    } else if (typeof a.content === 'string') {
      text += a.content;
    }
  }

  // Alternative reply structures
  if (!text && Array.isArray(chunk.replies)) {
    for (const r of chunk.replies) {
      if (typeof r === 'string') text += r;
      else if (r?.content && typeof r.content === 'string') text += r.content;
      else if (r?.reply) {
        text += typeof r.reply === 'string' ? r.reply : r.reply?.reply || '';
      } else if (r?.text && typeof r.text === 'string') text += r.text;
    }
  }

  if (!text && typeof chunk.reply === 'string') {
    text += chunk.reply;
  }
  if (!text && typeof chunk.text === 'string') {
    text += chunk.text;
  }
  if (!text && typeof chunk.content === 'string') {
    text += chunk.content;
  }

  return text;
}

/**
 * Parses streaming chunks containing JSON objects or arrays
 */
function parseStreamBuffer(buffer: string): { objects: any[]; remaining: string } {
  const objects: any[] = [];
  let depth = 0;
  let inString = false;
  let isEscaped = false;
  let startIdx = -1;

  for (let i = 0; i < buffer.length; i++) {
    const char = buffer[i];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (char === '\\') {
      isEscaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        if (depth === 0) {
          startIdx = i;
        }
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0 && startIdx !== -1) {
          const jsonStr = buffer.slice(startIdx, i + 1);
          try {
            const parsed = JSON.parse(jsonStr);
            objects.push(parsed);
          } catch {
            // Ignore malformed partial slice
          }
          startIdx = -1;
        }
      }
    }
  }

  const remaining = startIdx !== -1 ? buffer.slice(startIdx) : '';
  return { objects, remaining };
}

/**
 * Handles question submission to Gemini Enterprise Discovery Engine streamAssist
 * Streams progress directly to the client and formats the response
 */
export async function handleStreamAssistRequest(req: Request, res: Response) {
  const question =
    req.body?.question ||
    req.body?.query?.text ||
    (typeof req.body === 'string' ? req.body : '');

  const cleanQuestion = typeof question === 'string' ? question.trim() : '';
  const rawAttachments = req.body?.attachments;
  const hasAttachments = Array.isArray(rawAttachments) && rawAttachments.length > 0;

  if (!cleanQuestion && !hasAttachments) {
    return res.status(400).json({
      success: false,
      message: 'No response was generated. Try rephrasing your question or uploading a file/data.'
    });
  }

  // Format any uploaded files or data attachments
  let attachmentsText = '';
  if (hasAttachments) {
    attachmentsText = rawAttachments
      .map((att: any, idx: number) => {
        const name = att.name || `Attachment-${idx + 1}`;
        const type = att.type || 'unknown';
        const size = att.sizeFormatted || (att.size ? `${Math.round(att.size / 1024)} KB` : '');
        const format = att.format ? ` [Format: ${att.format}]` : '';
        const lines = att.lineCount ? ` [${att.lineCount} lines]` : '';
        const content = typeof att.content === 'string' ? att.content : JSON.stringify(att.content, null, 2);

        return `--- UPLOADED FILE / DATA ATTACHMENT [${idx + 1} of ${rawAttachments.length}] ---
File Name: ${name}
Type: ${type}${size ? ` (${size})` : ''}${format}${lines}
Content / Extracted Data:
${content}
--- END OF ATTACHMENT [${idx + 1}] ---`;
      })
      .join('\n\n');
  }

  let baseQuestion = cleanQuestion;
  if (!baseQuestion && attachmentsText) {
    baseQuestion =
      'Please analyze the attached uploaded file(s) and data in detail. Provide an evaluation under the Sabah State Library Enactment 1988 statutory mandates, governance standards, and strategic objectives.';
  }

  let queryText = baseQuestion;

  // Include recent conversation context if available for follow-up questions
  const rawMessages = req.body?.messages || req.body?.history;
  if (Array.isArray(rawMessages) && rawMessages.length > 0) {
    const validHistory = rawMessages
      .filter((m: any) => m && (m.text || m.content))
      .slice(-6); // Last few messages

    if (validHistory.length > 0) {
      const historyContext = validHistory
        .map((m: any) => {
          const role = m.role === 'user' ? 'User' : 'Assistant';
          const content = (typeof m.text === 'string' ? m.text : m.content || '').trim();
          return `${role}: ${content}`;
        })
        .join('\n\n');

      queryText = `Previous conversation context:\n${historyContext}\n\nCurrent Inquiry:\n${baseQuestion}`;
    }
  }

  if (attachmentsText) {
    queryText = `${queryText}\n\n[USER ATTACHED DATA & EVIDENCE FILES FOR THIS QUERY]:\n${attachmentsText}`;
  }

  // Configure Server-Sent Events stream for the browser
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof (res as any).flushHeaders === 'function') {
    (res as any).flushHeaders();
  }

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if (typeof (res as any).flush === 'function') {
      (res as any).flush();
    }
  };

  const projectNumber =
    cleanSecret(process.env.PROJECT_NUMBER || process.env.project_number) || 'sabahnet-ge-ai';
  const engineId =
    cleanSecret(process.env.ENGINE_ID || process.env.engine_id) || 'ai-application_1786935394467';
  const assistantId =
    cleanSecret(process.env.ASSISTANT_ID || process.env.assistant_id) || 'default_assistant';
  const agentId =
    cleanSecret(
      req.body?.agentId ||
      process.env.AGENT_ID ||
      process.env.agent_id ||
      process.env.AI_AGENT_ID ||
      process.env.ASSISTANT_AGENT_ID
    ) || '9469390002127365054';

  const endpointUrl = `https://discoveryengine.googleapis.com/v1alpha/projects/${projectNumber}/locations/global/collections/default_collection/engines/${engineId}/assistants/${assistantId}:streamAssist`;

  const requestBody = {
    query: {
      text: queryText
    },
    agentsSpec: {
      agentSpecs: [
        {
          agentId: agentId
        }
      ]
    }
  };

  try {
    // 1. Attempt Discovery Engine streamAssist first
    let accessToken: string;
    try {
      accessToken = await getFreshOAuthToken();
    } catch (oauthErr: any) {
      console.warn('OAuth token fetch failed, transitioning to AI Agent statutory knowledge engine:', oauthErr?.message);
      const isReauthIssue = oauthErr?.message?.includes('invalid_rapt') || oauthErr?.message?.includes('invalid_grant');
      const notice = isReauthIssue
        ? `Google OAuth Session: Refresh token memerlukan pengesahan semula (re-authentication: invalid_rapt). Ejen AI #${agentId} menjawab secara langsung berpandukan Enakmen Perpustakaan Negeri Sabah 1988.`
        : undefined;

      const fallbackSuccess = await streamGeminiFallback(queryText, sendEvent, agentId);
      if (fallbackSuccess) {
        return res.end();
      }

      await streamStatutoryKnowledgeResponse(
        cleanQuestion,
        rawAttachments || [],
        sendEvent,
        agentId,
        notice
      );
      return res.end();
    }

    // 2. Call Discovery Engine streamAssist endpoint with Authorization header
    const upstream = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.warn(
        `Discovery Engine streamAssist returned HTTP ${upstream.status}, utilizing AI Agent statutory intelligence:`,
        errText
      );
      const fallbackSuccess = await streamGeminiFallback(queryText, sendEvent, agentId);
      if (fallbackSuccess) {
        return res.end();
      }

      const notice = upstream.status === 403
        ? `Status Capaian Discovery Engine (HTTP 403): Ejen AI #${agentId} membekalkan analisis berkanun rasmi terus daripada Enakmen Perpustakaan Negeri Sabah 1988.`
        : undefined;

      await streamStatutoryKnowledgeResponse(
        cleanQuestion,
        rawAttachments || [],
        sendEvent,
        agentId,
        notice
      );
      return res.end();
    }

    if (!upstream.body) {
      const fallbackSuccess = await streamGeminiFallback(queryText, sendEvent, agentId);
      if (fallbackSuccess) {
        return res.end();
      }
      await streamStatutoryKnowledgeResponse(
        cleanQuestion,
        rawAttachments || [],
        sendEvent,
        agentId
      );
      return res.end();
    }

    // 3. Stream chunks from Discovery Engine to the client
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulatedAnswer = '';
    let streamBuffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkString = decoder.decode(value, { stream: true });
      streamBuffer += chunkString;

      const { objects, remaining } = parseStreamBuffer(streamBuffer);
      streamBuffer = remaining;

      for (const obj of objects) {
        if (obj.error) {
          console.warn('Discovery Engine upstream error chunk:', obj.error);
          continue;
        }

        const textPart = extractTextFromChunk(obj);
        if (textPart) {
          accumulatedAnswer += textPart;
          sendEvent({
            type: 'chunk',
            text: textPart,
            accumulated: accumulatedAnswer
          });
        }
      }
    }

    // Process any remaining tail in buffer
    if (streamBuffer.trim()) {
      try {
        const cleanTail = streamBuffer.trim().replace(/^\[|\]$/g, '').trim();
        const parsed = JSON.parse(cleanTail);
        const textPart = extractTextFromChunk(parsed);
        if (textPart) {
          accumulatedAnswer += textPart;
          sendEvent({
            type: 'chunk',
            text: textPart,
            accumulated: accumulatedAnswer
          });
        }
      } catch {
        // Ignore incomplete tail
      }
    }

    const finalClean = accumulatedAnswer.trim();
    if (finalClean) {
      sendEvent({
        type: 'done',
        answer: finalClean
      });
    } else {
      const fallbackSuccess = await streamGeminiFallback(queryText, sendEvent, agentId);
      if (!fallbackSuccess) {
        await streamStatutoryKnowledgeResponse(
          cleanQuestion,
          rawAttachments || [],
          sendEvent,
          agentId
        );
      }
    }

    res.end();
  } catch (err: any) {
    console.error('handleStreamAssistRequest error, falling back to statutory intelligence engine:', err);
    try {
      const fallbackSuccess = await streamGeminiFallback(queryText, sendEvent, agentId);
      if (!fallbackSuccess) {
        await streamStatutoryKnowledgeResponse(
          cleanQuestion,
          rawAttachments || [],
          sendEvent,
          agentId,
          `Ejen AI #${agentId} (Enjin Pematuhan Statutori Bersepadu Perpustakaan Negeri Sabah)`
        );
      }
    } catch (finalErr) {
      sendEvent({
        type: 'error',
        message: 'No response was generated. Try rephrasing your question.',
        error: err?.message
      });
    }
    res.end();
  }
}
