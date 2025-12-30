import OpenAI from 'openai';
import type { PipelineStage } from '@/lib/database.types';

/**
 * Reply Generator
 *
 * Generates AI-powered response drafts based on conversation context.
 * Provides editable, professional responses that agents can customize.
 */

export interface ReplyDraft {
  greeting: string;
  acknowledgment: string;
  valueProposition: string;
  nextStep: string;
  closing: string;
  fullReply: string;
  tone: 'Professional' | 'Friendly' | 'Urgent' | 'Casual';
  editSuggestions: string[];
}

/**
 * Generate reply draft for conversation
 */
export async function generateReply(
  conversation: string,
  context: {
    contactName: string;
    currentStage: PipelineStage;
    lastMessageFrom: 'client' | 'agent';
    conversationType?: 'text' | 'email' | 'call-followup';
  },
  openai: OpenAI
): Promise<ReplyDraft> {
  try {
    const prompt = buildReplyPrompt(conversation, context);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert real estate agent crafting professional responses to clients.

Response Structure:
1. Greeting - Professional and personalized
2. Acknowledgment - Show you understand their needs/concerns
3. Value Proposition - How you're helping them achieve their goals
4. Next Step - Clear call to action
5. Closing - Professional sign-off

Tone Guidelines:
- Professional: For new clients, formal situations
- Friendly: For established relationships, warm and approachable
- Urgent: For time-sensitive matters, motivating but not pushy
- Casual: For long-term clients, relaxed communication

Generate responses that are:
- Concise and to the point
- Value-focused (what's in it for them)
- Action-oriented (clear next steps)
- Professional but not overly formal
- Editable and customizable by the agent

Return ONLY valid JSON.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    return normalizeReplyDraft(parsed, context.contactName);
  } catch (error) {
    console.error('Reply generation error:', error);
    return getDefaultReplyDraft(context);
  }
}

/**
 * Build reply generation prompt
 */
function buildReplyPrompt(
  conversation: string,
  context: {
    contactName: string;
    currentStage: PipelineStage;
    lastMessageFrom: 'client' | 'agent';
    conversationType?: 'text' | 'email' | 'call-followup';
  }
): string {
  const typeContext = context.conversationType
    ? `Conversation Type: ${context.conversationType}`
    : '';

  const contextInfo = `
Client: ${context.contactName}
Pipeline Stage: ${context.currentStage}
Last Message From: ${context.lastMessageFrom}
${typeContext}

Recent Conversation:
"${conversation}"
`;

  return `${contextInfo}

Generate a professional response and return JSON with this structure:
{
  "greeting": "Personalized greeting",
  "acknowledgment": "Show understanding of their message/needs",
  "valueProposition": "How you're helping them",
  "nextStep": "Clear call to action",
  "closing": "Professional closing",
  "fullReply": "Complete message combining all sections",
  "tone": "Professional|Friendly|Urgent|Casual",
  "editSuggestions": ["suggestion1", "suggestion2"]
}`;
}

/**
 * Normalize reply draft
 */
function normalizeReplyDraft(raw: any, contactName: string): ReplyDraft {
  const firstName = contactName.split(' ')[0];

  return {
    greeting: raw.greeting || `Hi ${firstName},`,
    acknowledgment: raw.acknowledgment || 'Thanks for reaching out.',
    valueProposition: raw.valueProposition || 'I\'m here to help you achieve your real estate goals.',
    nextStep: raw.nextStep || 'Let me know if you have any questions.',
    closing: raw.closing || 'Best regards,',
    fullReply: raw.fullReply || `Hi ${firstName},\n\nThanks for reaching out. I'm here to help with your real estate needs.\n\nBest,`,
    tone: normalizeTone(raw.tone),
    editSuggestions: Array.isArray(raw.editSuggestions) ? raw.editSuggestions : []
  };
}

/**
 * Normalize tone
 */
function normalizeTone(tone: string): ReplyDraft['tone'] {
  const validTones: ReplyDraft['tone'][] = [
    'Professional',
    'Friendly',
    'Urgent',
    'Casual'
  ];

  const normalized = tone?.toLowerCase();
  for (const validTone of validTones) {
    if (normalized?.includes(validTone.toLowerCase())) {
      return validTone;
    }
  }

  return 'Professional';
}

/**
 * Get default reply draft when AI fails
 */
function getDefaultReplyDraft(context: {
  contactName: string;
  currentStage: PipelineStage;
}): ReplyDraft {
  const firstName = context.contactName.split(' ')[0];

  if (context.currentStage === 'Lead') {
    return {
      greeting: `Hi ${firstName},`,
      acknowledgment: 'Thank you for your interest in working together.',
      valueProposition: 'I\'d love to learn more about your real estate goals and how I can help you achieve them.',
      nextStep: 'Would you be available for a quick call this week to discuss your needs?',
      closing: 'Looking forward to connecting!',
      fullReply: `Hi ${firstName},\n\nThank you for your interest in working together. I'd love to learn more about your real estate goals and how I can help you achieve them.\n\nWould you be available for a quick call this week to discuss your needs?\n\nLooking forward to connecting!`,
      tone: 'Professional',
      editSuggestions: [
        'Mention specific property type they\'re interested in',
        'Add your brokerage name',
        'Include your contact information'
      ]
    };
  }

  if (context.currentStage === 'Active Opportunity') {
    return {
      greeting: `Hi ${firstName},`,
      acknowledgment: 'Thanks for your message. I hope you\'re having a great week!',
      valueProposition: 'With the market moving quickly, I want to make sure you\'re seeing the best opportunities as soon as they hit.',
      nextStep: 'Should I send over the latest listings that match your criteria, or would you prefer to schedule another showing tour?',
      closing: 'Talk soon!',
      fullReply: `Hi ${firstName},\n\nThanks for your message! With the market moving quickly, I want to make sure you're seeing the best opportunities as soon as they hit.\n\nShould I send over the latest listings that match your criteria, or would you prefer to schedule another showing tour?\n\nTalk soon!`,
      tone: 'Friendly',
      editSuggestions: [
        'Mention specific properties they\'ve seen',
        'Reference their timeline',
        'Add personal touch based on previous conversations'
      ]
    };
  }

  return {
    greeting: `Hi ${firstName},`,
    acknowledgment: 'Thanks for reaching out.',
    valueProposition: 'I\'m here to help you navigate your real estate journey.',
    nextStep: 'Let me know if you have any questions or if there\'s anything specific I can help with.',
    closing: 'Best regards,',
    fullReply: `Hi ${firstName},\n\nThanks for reaching out. I'm here to help you navigate your real estate journey.\n\nLet me know if you have any questions or if there's anything specific I can help with.\n\nBest regards,`,
    tone: 'Professional',
    editSuggestions: [
      'Add personalized details',
      'Include relevant market insights',
      'Customize based on conversation history'
    ]
  };
}

/**
 * Generate quick reply for text message
 */
export function generateQuickReply(
  message: string,
  contactName: string,
  urgency: 'low' | 'medium' | 'high'
): string {
  const firstName = contactName.split(' ')[0];

  if (urgency === 'high') {
    return `Hi ${firstName}! Thanks for your message. I'll get back to you shortly with the information you need.`;
  }

  if (urgency === 'medium') {
    return `Thanks for reaching out, ${firstName}! I'll review this and get back to you soon.`;
  }

  return `Hi ${firstName}! Thanks for your message. I'll take a look and follow up with you.`;
}

/**
 * Format reply for specific channel
 */
export function formatReplyForChannel(
  reply: ReplyDraft,
  channel: 'text' | 'email'
): string {
  if (channel === 'text') {
    // Text messages should be shorter and more direct
    const shortReply = `${reply.greeting} ${reply.acknowledgment} ${reply.nextStep}`;
    return shortReply.replace(/\n+/g, ' ').trim();
  }

  // Email can use full formatted reply
  return `${reply.greeting}\n\n${reply.acknowledgment}\n\n${reply.valueProposition}\n\n${reply.nextStep}\n\n${reply.closing}`;
}
