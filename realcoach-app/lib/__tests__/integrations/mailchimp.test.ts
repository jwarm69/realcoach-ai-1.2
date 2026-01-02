import { describe, it, expect, vi, beforeEach } from '@jest/globals';
import {
  parseApiKey,
  getTagsForContact,
  toMailchimpContact,
  type MailchimpConfig,
  type Contact,
} from '@/lib/integrations/mailchimp';

describe('Mailchimp Integration - parseApiKey', () => {
  it('should extract data center from valid API key', () => {
    const result = parseApiKey('dummy-api-key-test-value-for-testing-only-us13');
    expect(result.dataCenter).toBe('us13');
  });

  it('should extract data center from key with multiple dashes', () => {
    const result = parseApiKey('abcd-efgh-ijkl-mnop-us4');
    expect(result.dataCenter).toBe('us4');
  });

  it('should throw error for invalid API key format', () => {
    expect(() => parseApiKey('invalid-key')).toThrow('Invalid Mailchimp API key format');
    expect(() => parseApiKey('nodash')).toThrow('Invalid Mailchimp API key format');
  });
});

describe('Mailchimp Integration - getTagsForContact', () => {
  it('should generate stage tag', () => {
    const contact: Partial<Contact> = {
      pipeline_stage: 'Active Opportunity',
    };
    const tags = getTagsForContact(contact as Contact);
    expect(tags).toContain('Stage: Active Opportunity');
  });

  it('should generate motivation tag when motivation exists', () => {
    const contact: Partial<Contact> = {
      pipeline_stage: 'Lead',
      motivation_level: 'High',
    };
    const tags = getTagsForContact(contact as Contact);
    expect(tags).toContain('Motivation: High');
  });

  it('should not add motivation tag when motivation is null', () => {
    const contact: Partial<Contact> = {
      pipeline_stage: 'Lead',
      motivation_level: null,
    };
    const tags = getTagsForContact(contact as Contact);
    expect(tags).not.toContain('Motivation: null');
  });

  it('should generate source tag when source exists', () => {
    const contact: Partial<Contact> = {
      pipeline_stage: 'Lead',
      lead_source: 'Zillow',
    };
    const tags = getTagsForContact(contact as Contact);
    expect(tags).toContain('Source: Zillow');
  });

  it('should add 7-Day Rule tag when flag is set', () => {
    const contact: Partial<Contact> = {
      pipeline_stage: 'Active Opportunity',
      seven_day_rule_flag: true,
    };
    const tags = getTagsForContact(contact as Contact);
    expect(tags).toContain('7-Day Rule');
  });

  it('should add Critical Priority tag for score >= 80', () => {
    const contact: Partial<Contact> = {
      pipeline_stage: 'Lead',
      priority_score: 85,
    };
    const tags = getTagsForContact(contact as Contact);
    expect(tags).toContain('Priority: Critical');
  });

  it('should add High Priority tag for score >= 60 and < 80', () => {
    const contact: Partial<Contact> = {
      pipeline_stage: 'Lead',
      priority_score: 65,
    };
    const tags = getTagsForContact(contact as Contact);
    expect(tags).toContain('Priority: High');
  });

  it('should not add Priority tag for score < 60', () => {
    const contact: Partial<Contact> = {
      pipeline_stage: 'Lead',
      priority_score: 45,
    };
    const tags = getTagsForContact(contact as Contact);
    const priorityTags = tags.filter(t => t.startsWith('Priority:'));
    expect(priorityTags).toHaveLength(0);
  });

  it('should add Urgent tag for Immediate timeframe', () => {
    const contact: Partial<Contact> = {
      pipeline_stage: 'Lead',
      timeframe: 'Immediate',
    };
    const tags = getTagsForContact(contact as Contact);
    expect(tags).toContain('Urgent: Immediate');
  });
});

describe('Mailchimp Integration - toMailchimpContact', () => {
  it('should transform contact to Mailchimp format', () => {
    const contact: Contact = {
      id: 'contact-1',
      user_id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      address: null,
      pipeline_stage: 'Lead',
      lead_source: 'Referral',
      motivation_level: 'High',
      timeframe: '1-3 months',
      property_preferences: null,
      budget_range: null,
      preapproval_status: null,
      last_interaction_date: null,
      last_touch_type: null,
      interaction_frequency: 0,
      consistency_score: 0,
      priority_score: 75,
      days_since_contact: 5,
      seven_day_rule_flag: false,
      last_activity_date: null,
      inactive_days: 0,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = toMailchimpContact(contact);

    expect(result.email).toBe('john@example.com');
    expect(result.firstName).toBe('John');
    expect(result.lastName).toBe('Doe');
    expect(result.mergeFields.FNAME).toBe('John');
    expect(result.mergeFields.LNAME).toBe('Doe');
    expect(result.mergeFields.STAGE).toBe('Lead');
    expect(result.mergeFields.MOTIVATION).toBe('High');
    expect(result.mergeFields.SOURCE).toBe('Referral');
    expect(result.mergeFields.PRIORITY).toBe(75);
    expect(result.tags).toContain('Stage: Lead');
    expect(result.tags).toContain('Motivation: High');
  });

  it('should handle single name contact', () => {
    const contact: Contact = {
      id: 'contact-1',
      user_id: 'user-1',
      name: 'Madonna',
      email: 'madonna@example.com',
      phone: null,
      address: null,
      pipeline_stage: 'Lead',
      lead_source: null,
      motivation_level: null,
      timeframe: null,
      property_preferences: null,
      budget_range: null,
      preapproval_status: null,
      last_interaction_date: null,
      last_touch_type: null,
      interaction_frequency: 0,
      consistency_score: 0,
      priority_score: 0,
      days_since_contact: 0,
      seven_day_rule_flag: false,
      last_activity_date: null,
      inactive_days: 0,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = toMailchimpContact(contact);

    expect(result.firstName).toBe('Madonna');
    expect(result.lastName).toBe('');
  });

  it('should return empty email when email is null', () => {
    const contact: Contact = {
      id: 'contact-1',
      user_id: 'user-1',
      name: 'John Doe',
      email: null,
      phone: '555-1234',
      address: null,
      pipeline_stage: 'Lead',
      lead_source: null,
      motivation_level: null,
      timeframe: null,
      property_preferences: null,
      budget_range: null,
      preapproval_status: null,
      last_interaction_date: null,
      last_touch_type: null,
      interaction_frequency: 0,
      consistency_score: 0,
      priority_score: 0,
      days_since_contact: 0,
      seven_day_rule_flag: false,
      last_activity_date: null,
      inactive_days: 0,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = toMailchimpContact(contact);

    expect(result.email).toBe('');
  });
});
