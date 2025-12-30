import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
}

export interface ParsedConversation {
  phoneNumbers: string[];
  timestamps: string[];
  messages: {
    sender: 'me' | 'them';
    text: string;
    timestamp?: string;
  }[];
  conversationType: 'ios' | 'android' | 'whatsapp' | 'unknown';
}

let worker: Tesseract.Worker | null = null;

export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  try {
    if (!worker) {
      worker = await Tesseract.createWorker('eng', 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(Math.round(m.progress * 100));
          }
        },
      });
    }

    const result = await worker.recognize(file);

    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}

export function parseConversationFromText(text: string): ParsedConversation {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const phoneNumbers = extractPhoneNumbers(text);
  const timestamps = extractTimestamps(text);
  const conversationType = detectConversationType(text);

  const messages: ParsedConversation['messages'] = [];

  for (const line of lines) {
    const parsedMessage = parseLine(line, conversationType);
    if (parsedMessage) {
      messages.push(parsedMessage);
    }
  }

  return {
    phoneNumbers,
    timestamps,
    messages,
    conversationType,
  };
}

function extractPhoneNumbers(text: string): string[] {
  const phonePatterns = [
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    /\b\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    /\b\d{10}\b/g,
  ];

  const phones = new Set<string>();

  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(phone => {
        const cleaned = phone.replace(/[^\d+]/g, '');
        if (cleaned.length >= 10) {
          phones.add(cleaned);
        }
      });
    }
  }

  return Array.from(phones);
}

function extractTimestamps(text: string): string[] {
  const patterns = [
    /(Today|Yesterday)\s+(at\s+)?(\d{1,2}:\d{2}\s*(?:AM|PM)?)/gi,
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/g,
    /(\d{1,2}:\d{2}\s*(?:AM|PM)?)/gi,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}/gi,
  ];

  const timestamps = new Set<string>();

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => timestamps.add(match));
    }
  }

  return Array.from(timestamps);
}

function detectConversationType(text: string): ParsedConversation['conversationType'] {
  if (/Today\s+\d{1,2}:\d{2}\s*(AM|PM)/i.test(text)) {
    return 'ios';
  }
  if (/\d{1,2}\/\d{2}\/\d{2,4}/.test(text) && /^\d{1,2}:\d{2}\s*(AM|PM)/m.test(text)) {
    return 'android';
  }
  if (/\d{1,2}:\d{2}\s*(AM|PM)/i.test(text) && /encrypted|WhatsApp/i.test(text)) {
    return 'whatsapp';
  }
  return 'unknown';
}

function parseLine(line: string, type: ParsedConversation['conversationType']): ParsedConversation['messages'][0] | null {
  const trimmedLine = line.trim();

  if (trimmedLine.length < 2) return null;

  if (type === 'ios') {
    const iosPattern = /^(Today|Yesterday)?\s*(\d{1,2}:\d{2}\s*(?:AM|PM))\s*$/i;
    const timestampMatch = trimmedLine.match(iosPattern);

    if (timestampMatch) {
      return {
        sender: 'them',
        text: trimmedLine,
        timestamp: trimmedLine,
      };
    }
  }

  if (trimmedLine.length > 0 && !/^(\d{1,2}:\d{2}|Today|Yesterday)/i.test(trimmedLine)) {
    return {
      sender: 'them',
      text: trimmedLine,
    };
  }

  return null;
}

export function formatConversationForLog(parsed: ParsedConversation): string {
  const parts: string[] = [];

  if (parsed.phoneNumbers.length > 0) {
    parts.push(`Phone Numbers: ${parsed.phoneNumbers.join(', ')}`);
  }

  if (parsed.messages.length > 0) {
    parts.push('\nMessages:');
    parsed.messages.forEach(msg => {
      const sender = msg.sender === 'me' ? 'You' : 'Them';
      parts.push(`  [${sender}] ${msg.text}`);
    });
  }

  return parts.join('\n');
}

export async function destroyWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
