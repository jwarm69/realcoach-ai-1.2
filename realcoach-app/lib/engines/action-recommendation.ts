import type {
  Contact,
  PipelineStage,
  MotivationLevel,
  Timeframe,
  ActionType,
} from '@/lib/database.types';
import { checkSevenDayRule, getSevenDayRuleAction } from './seven-day-monitor';

/**
 * Next Action Recommendation Engine
 *
 * Generates context-aware action recommendations based on:
 * - Pipeline stage
 * - Motivation level
 * - Days since contact
 * - Timeframe
 * - 7-day rule status
 * - Pre-approval status
 */

export interface NextAction {
  actionType: ActionType;
  urgency: number; // 1-10 scale
  script: string;
  rationale: string;
  behavioralFactors: string[];
}

/**
 * Generate next action recommendation for a contact
 */
export function generateNextAction(contact: Contact): NextAction {
  const {
    pipeline_stage,
    motivation_level,
    days_since_contact,
    timeframe,
    preapproval_status,
  } = contact;

  // Check for 7-day rule violation first (highest priority)
  const sevenDayCheck = checkSevenDayRule(contact);
  if (sevenDayCheck.shouldFlag) {
    return {
      actionType: 'Call',
      urgency: 10,
      script: getSevenDayReEngagementScript(contact),
      rationale: 'CRITICAL: 7-day rule violation - immediate re-engagement required',
      behavioralFactors: ['7-Day Rule', pipeline_stage],
    };
  }

  // Stage-specific logic
  switch (pipeline_stage) {
    case 'Lead':
      return generateLeadAction(contact);
    case 'New Opportunity':
      return generateNewOpportunityAction(contact);
    case 'Active Opportunity':
      return generateActiveOpportunityAction(contact);
    case 'Under Contract':
      return generateUnderContractAction(contact);
    case 'Closed':
      return generateClosedAction(contact);
    default:
      return generateDefaultAction(contact);
  }
}

/**
 * Lead stage actions
 */
function generateLeadAction(contact: Contact): NextAction {
  const { days_since_contact, motivation_level, timeframe, name } = contact;

  // Lead with 7+ days since contact
  if (days_since_contact >= 7) {
    return {
      actionType: 'Call',
      urgency: 9,
      script: `Hi ${getFirstName(name)}, it's been a while since we connected. I wanted to check in - are you still looking to ${timeframe?.toLowerCase() || 'buy or sell'}?`,
      rationale: `Urgent: ${days_since_contact} days since contact with new lead - at risk of going cold`,
      behavioralFactors: [
        'Lead Stage',
        `${days_since_contact} Days Since Contact`,
        motivation_level || 'Unknown' + ' Motivation',
      ],
    };
  }

  // Lead with no timeframe established
  if (!timeframe || timeframe === '6+ months') {
    return {
      actionType: 'Call',
      urgency: 6,
      script: `Hi ${getFirstName(name)}, I'd love to understand your timeline better. Are you looking to make a move in the next few months, or is this more long-term?`,
      rationale: 'Qualification needed: No timeframe established',
      behavioralFactors: ['Lead Stage', 'No Timeframe'],
    };
  }

  // Lead with low/medium motivation
  if (motivation_level === 'Low' || motivation_level === 'Medium') {
    return {
      actionType: 'Call',
      urgency: 5,
      script: `Hi ${getFirstName(name)}, I came across some opportunities that might interest you. Do you have a few minutes to chat about what you're looking for?`,
      rationale: 'Motivation building needed - engage to uncover urgency',
      behavioralFactors: ['Lead Stage', `${motivation_level} Motivation`],
    };
  }

  // Default lead action
  return {
    actionType: 'Call',
    urgency: 7,
    script: `Hi ${getFirstName(name)}, following up on our conversation. What questions can I answer about your real estate goals?`,
    rationale: 'Regular contact to maintain engagement and qualify opportunity',
    behavioralFactors: ['Lead Stage'],
  };
}

/**
 * New Opportunity stage actions
 */
function generateNewOpportunityAction(contact: Contact): NextAction {
  const { preapproval_status, motivation_level, days_since_contact, timeframe, name } = contact;

  // Missing pre-approval (critical for buyers)
  if (!preapproval_status && motivation_level === 'High') {
    return {
      actionType: 'Call',
      urgency: 8,
      script: `Hi ${getFirstName(name)}, with your motivation to find the right property, it's crucial we get your pre-approval in place. This will make your offers much stronger. Have you spoken with a lender yet?`,
      rationale: 'Pre-approval required for offer submission - high motivation needs readiness',
      behavioralFactors: ['New Opportunity', 'No Pre-approval', 'High Motivation'],
    };
  }

  // 5+ days since contact with high motivation
  if (days_since_contact >= 5 && motivation_level === 'High') {
    return {
      actionType: 'Call',
      urgency: 7,
      script: `Hi ${getFirstName(name)}, I know you're motivated to ${timeframe?.toLowerCase() || 'move forward'}. I want to make sure I'm providing the best service. When can we connect?`,
      rationale: 'High motivation + 5+ days = check in to maintain momentum',
      behavioralFactors: ['New Opportunity', 'High Motivation', `${days_since_contact} Days Since Contact`],
    };
  }

  // New Opportunity - get specific property preferences
  return {
    actionType: 'Meeting',
    urgency: 6,
    script: `Hi ${getFirstName(name)}, I'd like to better understand exactly what you're looking for. Can we schedule a quick call to discuss your must-haves vs. nice-to-haves?`,
    rationale: 'Gather detailed requirements to move toward Active Opportunity',
    behavioralFactors: ['New Opportunity', 'Requirements Gathering'],
  };
}

/**
 * Active Opportunity stage actions
 */
function generateActiveOpportunityAction(contact: Contact): NextAction {
  const { days_since_contact, timeframe, property_preferences, name } = contact;

  // Within 7-day window - maintain active engagement
  if (days_since_contact <= 3) {
    return {
      actionType: 'Send Listing',
      urgency: 6,
      script: `Hi ${getFirstName(name)}, based on what we discussed, I found a property that matches your criteria. Would you like me to send over the details?`,
      rationale: 'Active showing phase - provide value with relevant listings',
      behavioralFactors: ['Active Opportunity', 'Recent Contact'],
    };
  }

  // 4-6 days since contact - proactive check-in
  if (days_since_contact <= 6) {
    return {
      actionType: 'Text',
      urgency: 5,
      script: `Hi ${getFirstName(name)}, just checking in. Any updates on your end? I'm seeing some new inventory hit the market.`,
      rationale: 'Maintain contact before 7-day rule threshold',
      behavioralFactors: ['Active Opportunity', 'Pre-7-Day Check'],
    };
  }

  // Default Active Opportunity action
  return {
    actionType: 'Call',
    urgency: 7,
    script: `Hi ${getFirstName(name)}, I want to ensure I'm providing great service. The market is moving quickly - should I send you fresh listings or schedule another showing?`,
    rationale: 'Maintain momentum in active showing phase',
    behavioralFactors: ['Active Opportunity'],
  };
}

/**
 * Under Contract stage actions
 */
function generateUnderContractAction(contact: Contact): NextAction {
  const { days_since_contact, name } = contact;

  return {
    actionType: 'Text',
    urgency: 5,
    script: `Hi ${getFirstName(name)}, checking in on your closing progress. Any questions or updates from the lender?`,
    rationale: 'Maintain contact during under contract period - be proactive with issues',
    behavioralFactors: ['Under Contract', 'Closing Support'],
  };
}

/**
 * Closed stage actions
 */
function generateClosedAction(contact: Contact): NextAction {
  const { days_since_contact, name } = contact;

  // First 30 days - request testimonial
  if (days_since_contact <= 30) {
    return {
      actionType: 'Email',
      urgency: 4,
      script: `Hi ${getFirstName(name)}, thank you again for choosing me as your agent. Would you be willing to share a brief review of your experience? It would mean a lot to me.`,
      rationale: 'Post-closing: Request testimonial while experience is fresh',
      behavioralFactors: ['Closed', 'Testimonial Request'],
    };
  }

  // 30-90 days - check for referrals
  if (days_since_contact <= 90) {
    return {
      actionType: 'Email',
      urgency: 3,
      script: `Hi ${getFirstName(name)}, I hope you're enjoying your new home! If you know anyone looking to buy or sell, I'd appreciate the introduction.`,
      rationale: 'Post-closing: Leverage satisfaction for referrals',
      behavioralFactors: ['Closed', 'Referral Request'],
    };
  }

  // Long-term closed - periodic check-in
  return {
    actionType: 'Email',
    urgency: 2,
    script: `Hi ${getFirstName(name)}, just checking in. How are you enjoying your home? Is there anything I can help you with?`,
    rationale: 'Long-term relationship maintenance',
    behavioralFactors: ['Closed', 'Relationship Maintenance'],
  };
}

/**
 * Default action for any stage
 */
function generateDefaultAction(contact: Contact): NextAction {
  const { name, pipeline_stage } = contact;

  return {
    actionType: 'Call',
    urgency: 5,
    script: `Hi ${getFirstName(name)}, checking in. How can I help you with your real estate goals?`,
    rationale: `Regular contact maintenance for ${pipeline_stage}`,
    behavioralFactors: [pipeline_stage],
  };
}

/**
 * Get 7-day rule re-engagement script
 */
function getSevenDayReEngagementScript(contact: Contact): string {
  const name = contact.name.split(' ')[0];
  const scripts = [
    `Hi ${name}, I wanted to check in with you. The market is moving quickly, and I want to make sure you're seeing the latest opportunities. Are you still actively looking?`,
    `${name}, it's been a week since we last connected. I have some new listings that match your criteria. When's a good time to discuss?`,
    `Hi ${name}, just touching base. With the market changing weekly, I want to ensure I'm providing the best service. How's your search going?`,
  ];

  const index = Math.abs(hashCode(contact.id)) % scripts.length;
  return scripts[index];
}

/**
 * Get urgency level category
 */
export function getUrgencyLevel(urgency: number): 'Critical' | 'High' | 'Medium' | 'Low' {
  if (urgency >= 9) return 'Critical';
  if (urgency >= 7) return 'High';
  if (urgency >= 5) return 'Medium';
  return 'Low';
}

/**
 * Get urgency color for UI
 */
export function getUrgencyColor(urgency: number): string {
  if (urgency >= 9) return 'text-red-600 bg-red-50 border-red-200';
  if (urgency >= 7) return 'text-orange-600 bg-orange-50 border-orange-200';
  if (urgency >= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-slate-600 bg-slate-50 border-slate-200';
}

/**
 * Get action type icon
 */
export function getActionIcon(actionType: ActionType): string {
  const icons: Record<ActionType, string> = {
    'Call': '📞',
    'Text': '💬',
    'Email': '✉️',
    'Send Listing': '🏠',
    'Follow-up': '🔄',
    'Meeting': '📅',
  };

  return icons[actionType] || '📋';
}

/**
 * Batch generate actions for multiple contacts
 */
export function generateBatchNextActions(contacts: Contact[]): Map<string, NextAction> {
  const actions = new Map<string, NextAction>();

  for (const contact of contacts) {
    actions.set(contact.id, generateNextAction(contact));
  }

  return actions;
}

// Helper: Get first name
function getFirstName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  return parts[0] || fullName;
}

// Helper: Simple hash function
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}
