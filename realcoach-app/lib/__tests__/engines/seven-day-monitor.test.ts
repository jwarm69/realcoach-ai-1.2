import { getSevenDayViolations } from '../../engines/seven-day-monitor';
import type { Contact } from '@/lib/database.types';

describe('Seven Day Monitor', () => {
  const createMockContact = (overrides?: Partial<Contact>): Contact => ({
    id: 'test-id',
    user_id: 'user-1',
    name: 'Test Contact',
    phone: '1234567890',
    email: 'test@example.com',
    address: null,
    pipeline_stage: 'Active Opportunity',
    lead_source: null,
    motivation_level: null,
    timeframe: null,
    property_preferences: null,
    budget_range: null,
    preapproval_status: false,
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
    mailchimp_synced: false,
    ...overrides,
  });

  describe('getSevenDayViolations', () => {
    it('should return empty array for empty contacts list', () => {
      const violations = getSevenDayViolations([]);
      expect(violations).toEqual([]);
    });

    it('should flag contacts with 7+ days since contact', () => {
      const contacts = [
        createMockContact({
          days_since_contact: 7,
          pipeline_stage: 'Active Opportunity',
        }),
        createMockContact({
          days_since_contact: 10,
          pipeline_stage: 'Active Opportunity',
        }),
      ];

      const violations = getSevenDayViolations(contacts);
      expect(violations).toHaveLength(2);
    });

    it('should not flag non-Active Opportunity contacts', () => {
      const contacts = [
        createMockContact({
          days_since_contact: 10,
          pipeline_stage: 'Lead',
        }),
        createMockContact({
          days_since_contact: 8,
          pipeline_stage: 'New Opportunity',
        }),
      ];

      const violations = getSevenDayViolations(contacts);
      expect(violations).toHaveLength(0);
    });

    it('should not flag contacts with < 7 days since contact', () => {
      const contacts = [
        createMockContact({
          days_since_contact: 5,
          pipeline_stage: 'Active Opportunity',
        }),
        createMockContact({
          days_since_contact: 6,
          pipeline_stage: 'Active Opportunity',
        }),
      ];

      const violations = getSevenDayViolations(contacts);
      expect(violations).toHaveLength(0);
    });
  });
});
