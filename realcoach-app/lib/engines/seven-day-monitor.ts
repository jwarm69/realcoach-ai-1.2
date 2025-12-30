import type { Contact, PipelineStage } from '@/lib/database.types';

/**
 * Seven-Day Rule Monitor
 * 
 * The 7-day rule applies to Active Opportunity contacts:
 * If 7+ days pass without contact, they should be flagged for immediate follow-up
 * 
 * This ensures high-value opportunities don't go cold
 */

export interface SevenDayRuleCheck {
  shouldFlag: boolean;
  daysSinceContact: number;
  reason: string;
}

/**
 * Check if a contact should be flagged for 7-day rule violation
 */
export function checkSevenDayRule(contact: Contact): SevenDayRuleCheck {
  const { pipeline_stage, days_since_contact, last_interaction_date } = contact;

  // Rule only applies to Active Opportunity stage
  if (pipeline_stage !== 'Active Opportunity') {
    return {
      shouldFlag: false,
      daysSinceContact: days_since_contact,
      reason: 'Not in Active Opportunity stage',
    };
  }

  // If never contacted, don't flag (new contact)
  if (!last_interaction_date) {
    return {
      shouldFlag: false,
      daysSinceContact: days_since_contact,
      reason: 'No previous interaction',
    };
  }

  // Check if 7+ days have passed
  const shouldFlag = days_since_contact >= 7;

  return {
    shouldFlag,
    daysSinceContact: days_since_contact,
    reason: shouldFlag
      ? `${days_since_contact} days without contact in Active Opportunity`
      : 'Within 7-day contact window',
  };
}

/**
 * Batch check multiple contacts for 7-day rule violations
 */
export function checkBatchSevenDayRule(
  contacts: Contact[]
): Map<string, SevenDayRuleCheck> {
  const results = new Map<string, SevenDayRuleCheck>();

  for (const contact of contacts) {
    results.set(contact.id, checkSevenDayRule(contact));
  }

  return results;
}

/**
 * Get all contacts that violate the 7-day rule
 */
export function getSevenDayViolations(contacts: Contact[]): Contact[] {
  return contacts.filter((contact) => {
    const check = checkSevenDayRule(contact);
    return check.shouldFlag;
  });
}

/**
 * Calculate days until 7-day rule violation (for proactive alerts)
 */
export function getDaysUntilSevenDayRule(contact: Contact): number | null {
  // Only relevant for Active Opportunity
  if (contact.pipeline_stage !== 'Active Opportunity') {
    return null;
  }

  // If no last interaction, not applicable
  if (!contact.last_interaction_date) {
    return null;
  }

  const daysRemaining = 7 - contact.days_since_contact;

  // If already violated, return 0
  return Math.max(0, daysRemaining);
}

/**
 * Get priority action message for 7-day rule contacts
 */
export function getSevenDayRuleAction(contact: Contact): string | null {
  const check = checkSevenDayRule(contact);

  if (!check.shouldFlag) {
    return null;
  }

  const daysOver = contact.days_since_contact - 7;

  if (daysOver === 0) {
    return 'URGENT: 7-day rule reached today. Contact immediately to maintain engagement.';
  }

  return `CRITICAL: ${daysOver} days past 7-day rule. Active opportunity at risk of going cold.`;
}

/**
 * Get suggested script for 7-day rule re-engagement
 */
export function getSevenDayReEngagementScript(contact: Contact): string {
  const name = contact.name.split(' ')[0]; // First name

  const scripts = [
    `Hi ${name}, I wanted to check in with you. The market is moving quickly, and I want to make sure you're seeing the latest opportunities. Are you still actively looking?`,
    `${name}, it's been a week since we last connected. I have some new listings that match your criteria. When's a good time to discuss?`,
    `Hi ${name}, just touching base. With interest rates fluctuating, I want to ensure you're positioned to act when the right property comes along. How's your search going?`,
  ];

  // Rotate script based on contact ID (deterministic but varied)
  const index = Math.abs(hashCode(contact.id)) % scripts.length;
  return scripts[index];
}

// Helper: Simple hash function for deterministic script selection
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

/**
 * Monitor configuration
 */
export const SEVEN_DAY_RULE_CONFIG = {
  enabled: true,
  thresholdDays: 7,
  applicableStages: ['Active Opportunity'] as PipelineStage[],
  warningDays: 5, // Start warning at 5 days
  criticalDays: 7, // Critical alert at 7 days
};

/**
 * Get alert level for a contact
 */
export function getSevenDayAlertLevel(
  contact: Contact
): 'none' | 'warning' | 'critical' {
  if (contact.pipeline_stage !== 'Active Opportunity') {
    return 'none';
  }

  if (!contact.last_interaction_date) {
    return 'none';
  }

  if (contact.days_since_contact >= SEVEN_DAY_RULE_CONFIG.criticalDays) {
    return 'critical';
  }

  if (contact.days_since_contact >= SEVEN_DAY_RULE_CONFIG.warningDays) {
    return 'warning';
  }

  return 'none';
}
