export interface ProcessedAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  sizeFormatted: string;
  content: string;
  previewUrl?: string;
  isDataSnippet?: boolean;
  format: 'csv' | 'json' | 'text' | 'pdf' | 'image' | 'code' | 'other';
  lineCount?: number;
  charCount?: number;
  metadata?: {
    rowCount?: number;
    columnCount?: number;
    keysCount?: number;
    dimensions?: string;
  };
}

/**
 * Formats byte size into human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Detects format archetype based on filename and mime type
 */
export function detectFormat(name: string, mimeType: string): ProcessedAttachment['format'] {
  const ext = name.split('.').pop()?.toLowerCase() || '';

  if (ext === 'csv' || ext === 'tsv' || mimeType.includes('csv')) return 'csv';
  if (ext === 'json' || mimeType.includes('json')) return 'json';
  if (ext === 'pdf' || mimeType.includes('pdf')) return 'pdf';
  if (
    mimeType.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp'].includes(ext)
  ) {
    return 'image';
  }
  if (
    ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'html', 'css', 'sql', 'yaml', 'yml', 'xml', 'sh'].includes(ext)
  ) {
    return 'code';
  }
  if (['txt', 'md', 'rtf', 'log'].includes(ext) || mimeType.startsWith('text/')) {
    return 'text';
  }
  return 'other';
}

/**
 * Extracts readable text streams from a PDF array buffer
 */
export function extractTextFromPdfBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const rawStr = decoder.decode(bytes);

  const extractedLines: string[] = [];

  // Match text objects between BT and ET
  const textObjectRegex = /BT[\s\S]*?ET/g;
  const matches = rawStr.match(textObjectRegex);

  if (matches && matches.length > 0) {
    for (const block of matches) {
      // Find (string) Tj or [(array)] TJ
      const stringMatches = block.match(/\((.*?)\)\s*Tj/g);
      if (stringMatches) {
        const line = stringMatches
          .map((m) => m.replace(/^\(/, '').replace(/\)\s*Tj$/, '').trim())
          .join(' ');
        if (line) extractedLines.push(line);
      }

      const tjArrayMatches = block.match(/\[(.*?)\]\s*TJ/g);
      if (tjArrayMatches) {
        for (const tj of tjArrayMatches) {
          const innerStrings = tj.match(/\((.*?)\)/g);
          if (innerStrings) {
            const line = innerStrings
              .map((s) => s.replace(/^\(/, '').replace(/\)$/, '').trim())
              .join(' ');
            if (line) extractedLines.push(line);
          }
        }
      }
    }
  }

  // If stream extraction produced text
  if (extractedLines.length > 0) {
    return extractedLines.join('\n');
  }

  // Fallback: extract continuous ASCII printable strings (minimum 4 characters)
  const asciiMatches = rawStr.match(/[A-Za-z0-9\s.,;:'"?!@#$%&*()_+=\-\/\\<>\[\]{}]{5,}/g);
  if (asciiMatches && asciiMatches.length > 0) {
    const filtered = asciiMatches
      .map((s) => s.trim())
      .filter((s) => s.length > 4 && !s.startsWith('/Filter') && !s.startsWith('/Length') && !s.startsWith('/Font'));
    if (filtered.length > 0) {
      return filtered.slice(0, 500).join('\n');
    }
  }

  return `[PDF Document: ${formatFileSize(buffer.byteLength)} - Binary document structure parsed]`;
}

/**
 * Parses any File object into a ProcessedAttachment
 */
export async function processFile(file: File): Promise<ProcessedAttachment> {
  const format = detectFormat(file.name, file.type);
  const sizeFormatted = formatFileSize(file.size);
  let content = '';
  let previewUrl: string | undefined = undefined;
  let rowCount: number | undefined;
  let columnCount: number | undefined;
  let keysCount: number | undefined;

  // Maximum characters to feed into prompt to prevent overflow
  const MAX_CONTENT_CHARS = 80000;

  if (format === 'image') {
    // For images: create data URL for thumbnail display
    previewUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    content = `[Attached Image File: ${file.name} (${file.type}, ${sizeFormatted})]`;
  } else if (format === 'pdf') {
    // For PDFs: read array buffer and extract readable text
    try {
      const buffer = await file.arrayBuffer();
      const extracted = extractTextFromPdfBuffer(buffer);
      content = extracted.slice(0, MAX_CONTENT_CHARS);
      if (extracted.length > MAX_CONTENT_CHARS) {
        content += `\n... [Content truncated at ${MAX_CONTENT_CHARS} characters; total ${extracted.length} chars]`;
      }
    } catch {
      content = `[PDF Document: ${file.name} (${sizeFormatted})]`;
    }
  } else {
    // For text, CSV, JSON, code, and other text-based files
    try {
      const text = await file.text();
      let cleanText = text;

      if (format === 'json') {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            rowCount = parsed.length;
            keysCount = parsed[0] ? Object.keys(parsed[0]).length : 0;
          } else if (typeof parsed === 'object' && parsed !== null) {
            keysCount = Object.keys(parsed).length;
          }
          cleanText = JSON.stringify(parsed, null, 2);
        } catch {
          // Keep raw text if invalid JSON
        }
      } else if (format === 'csv') {
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        rowCount = lines.length;
        if (lines[0]) {
          columnCount = lines[0].split(',').length;
        }
      }

      content = cleanText.slice(0, MAX_CONTENT_CHARS);
      if (cleanText.length > MAX_CONTENT_CHARS) {
        content += `\n... [Content truncated at ${MAX_CONTENT_CHARS} characters; total ${cleanText.length} chars]`;
      }
    } catch {
      // If reading as text fails, fall back to basic info
      content = `[File: ${file.name}, MIME: ${file.type || 'binary'}, Size: ${sizeFormatted}]`;
    }
  }

  const lines = content.split('\n');

  return {
    id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    sizeFormatted,
    content,
    previewUrl,
    format,
    lineCount: lines.length,
    charCount: content.length,
    metadata: {
      rowCount,
      columnCount,
      keysCount
    }
  };
}

/**
 * Creates an attachment from manually entered or pasted data
 */
export function createDataSnippetAttachment(
  title: string,
  rawContent: string,
  formatChoice?: 'auto' | 'csv' | 'json' | 'text'
): ProcessedAttachment {
  const cleanTitle = (title || 'Custom Data Snippet').trim();
  const text = rawContent.trim();
  let detected: ProcessedAttachment['format'] = 'text';

  if (formatChoice && formatChoice !== 'auto') {
    detected = formatChoice;
  } else {
    // Auto-detect
    if (
      (text.startsWith('{') && text.endsWith('}')) ||
      (text.startsWith('[') && text.endsWith(']'))
    ) {
      try {
        JSON.parse(text);
        detected = 'json';
      } catch {
        detected = 'text';
      }
    } else if (text.includes(',') && text.split('\n').length > 1) {
      detected = 'csv';
    }
  }

  let finalContent = text;
  let rowCount: number | undefined;
  let keysCount: number | undefined;
  let columnCount: number | undefined;

  if (detected === 'json') {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        rowCount = parsed.length;
        keysCount = parsed[0] ? Object.keys(parsed[0]).length : 0;
      } else if (typeof parsed === 'object' && parsed !== null) {
        keysCount = Object.keys(parsed).length;
      }
      finalContent = JSON.stringify(parsed, null, 2);
    } catch {
      // Keep as text
    }
  } else if (detected === 'csv') {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    rowCount = lines.length;
    if (lines[0]) {
      columnCount = lines[0].split(',').length;
    }
  }

  const byteSize = new Blob([finalContent]).size;
  const lines = finalContent.split('\n');

  const extension = detected === 'json' ? '.json' : detected === 'csv' ? '.csv' : '.txt';
  const fileName = cleanTitle.endsWith(extension) ? cleanTitle : `${cleanTitle}${extension}`;

  return {
    id: `snippet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: fileName,
    type: detected === 'json' ? 'application/json' : detected === 'csv' ? 'text/csv' : 'text/plain',
    size: byteSize,
    sizeFormatted: formatFileSize(byteSize),
    content: finalContent,
    isDataSnippet: true,
    format: detected,
    lineCount: lines.length,
    charCount: finalContent.length,
    metadata: {
      rowCount,
      columnCount,
      keysCount
    }
  };
}
