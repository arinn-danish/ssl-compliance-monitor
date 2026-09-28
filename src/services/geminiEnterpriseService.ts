/**
 * Client-Side Gemini Enterprise Assistant Service
 *
 * Calls ONLY the secure server-side route (/api/agent/stream-assist).
 * No secrets, API keys, or OAuth credentials are ever included in client-side code.
 */

import { ProcessedAttachment } from '../utils/fileDataProcessor';

export interface ChatAttachment extends ProcessedAttachment {}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  authorName?: string;
  isStreaming?: boolean;
  isError?: boolean;
  auditId?: string;
  attachments?: ChatAttachment[];
}

export interface StreamAssistResult {
  success: boolean;
  answer?: string;
  message?: string;
}

export interface AgentStatusInfo {
  configured: boolean;
  agentId?: string;
  projectNumber?: string;
  engineId?: string;
  assistantId?: string;
  oauthConfigured: {
    hasClientId: boolean;
    hasClientSecret: boolean;
    hasRefreshToken: boolean;
  };
  discoveryEngineConfigured: {
    hasProjectNumber: boolean;
    hasEngineId: boolean;
    hasAssistantId: boolean;
    hasAgentId: boolean;
  };
}

const NO_RESPONSE_MESSAGE = 'No response was generated. Try rephrasing your question.';

/**
 * Fetches current configuration status of the AI Agent from server
 */
export async function getAgentStatus(): Promise<AgentStatusInfo | null> {
  try {
    const res = await fetch('/api/agent/status');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Sends a question and optional uploaded file/data attachments from the chat to the server-side stream-assist route.
 * Includes recent conversation context so follow-up questions make sense.
 * Progressively streams back the agent's answer tokens and updates onProgress in real time.
 */
export async function queryGeminiEnterpriseAgent(
  questionText: string,
  options?: {
    messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    attachments?: ChatAttachment[];
    agentId?: string;
    onProgress?: (partialAnswer: string) => void;
  }
): Promise<StreamAssistResult> {
  const cleanQuestion = (questionText || '').trim();
  const hasAttachments = Boolean(options?.attachments && options.attachments.length > 0);

  if (!cleanQuestion && !hasAttachments) {
    return {
      success: false,
      message: NO_RESPONSE_MESSAGE
    };
  }

  try {
    const response = await fetch('/api/agent/stream-assist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream'
      },
      body: JSON.stringify({
        question: cleanQuestion,
        messages: options?.messages || [],
        attachments: options?.attachments || [],
        agentId: options?.agentId
      })
    });

    if (!response.ok && !response.body) {
      return {
        success: false,
        message: NO_RESPONSE_MESSAGE
      };
    }

    if (!response.body) {
      const json = await response.json().catch(() => null);
      if (json?.answer) {
        options?.onProgress?.(json.answer);
        return { success: true, answer: json.answer };
      }
      return {
        success: false,
        message: json?.message || NO_RESPONSE_MESSAGE
      };
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulatedAnswer = '';
    let buffer = '';
    let serverError: string | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.replace(/^data:\s*/, '').trim();
        if (!dataStr) continue;

        try {
          const payload = JSON.parse(dataStr);

          if (payload.type === 'chunk') {
            const currentText = payload.accumulated || (accumulatedAnswer + (payload.text || ''));
            accumulatedAnswer = currentText;
            options?.onProgress?.(accumulatedAnswer);
          } else if (payload.type === 'done') {
            if (payload.answer) {
              accumulatedAnswer = payload.answer;
            }
          } else if (payload.type === 'error') {
            serverError = payload.message || NO_RESPONSE_MESSAGE;
          }
        } catch {
          // If chunk is plain text data
          if (dataStr && !dataStr.startsWith('{')) {
            accumulatedAnswer += dataStr;
            options?.onProgress?.(accumulatedAnswer);
          }
        }
      }
    }

    // Flush any remaining buffer line
    if (buffer.trim().startsWith('data:')) {
      const dataStr = buffer.trim().replace(/^data:\s*/, '').trim();
      try {
        const payload = JSON.parse(dataStr);
        if (payload.type === 'chunk' && payload.accumulated) {
          accumulatedAnswer = payload.accumulated;
        } else if (payload.type === 'done' && payload.answer) {
          accumulatedAnswer = payload.answer;
        } else if (payload.type === 'error') {
          serverError = payload.message || NO_RESPONSE_MESSAGE;
        }
      } catch {
        // Ignore
      }
    }

    const finalClean = accumulatedAnswer.trim();
    if (finalClean) {
      options?.onProgress?.(finalClean);
      return {
        success: true,
        answer: finalClean
      };
    }

    return {
      success: false,
      message: serverError || NO_RESPONSE_MESSAGE
    };
  } catch (err) {
    console.error('Failed to communicate with agent stream-assist route:', err);
    return {
      success: false,
      message: NO_RESPONSE_MESSAGE
    };
  }
}
