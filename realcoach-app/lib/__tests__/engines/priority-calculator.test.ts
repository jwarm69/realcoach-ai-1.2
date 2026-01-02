import { calculatePriorityScore, getPriorityLevel, getPriorityColor } from '../../engines/priority-calculator';
import type { Contact } from '@/lib/database.types';

describe('Priority Calculator', () => {
  const createMockContact = (overrides?: Partial<Contact>): Contact => ({
    id: 'test-id',
    user_id: 'user-1',
    name: 'Test Contact',
    phone: '1234567890',
    email: 'test@example.com',
    address: null,
    pipeline_stage: 'Lead',
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

  describe('calculatePriorityScore', () => {
    it('should return high score for high motivation lead', () => {
      const contact = createMockContact({
        motivation_level: 'High',
        pipeline_stage: 'New Opportunity',
        days_since_contact: 1,
        timeframe: 'Immediate',
      });

      const score = calculatePriorityScore(contact);
      expect(score).toBeGreaterThan(70);
    });

    it('should return low score for low motivation lead', () => {
      const contact = createMockContact({
        motivation_level: 'Low',
        pipeline_stage: 'Lead',
        days_since_contact: 30,
        timeframe: '6+ months',
      });

      const score = calculatePriorityScore(contact);
      expect(score).toBeLessThan(40);
    });

    it('should add bonus for 7-day rule violation', () => {
      const contact1 = createMockContact({
        motivation_level: 'Medium',
        pipeline_stage: 'Active Opportunity',
        days_since_contact: 5,
        seven_day_rule_flag: false,
      });

      const contact2 = createMockContact({
        ...contact1,
        seven_day_rule_flag: true,
      });

      const score1 = calculatePriorityScore(contact1);
      const score2 = calculatePriorityScore(contact2);

      expect(score2).toBeGreaterThan(score1);
      expect(score2 - score1).toBe(10);
    });

    it('should cap score at 100', () => {
      const contact = createMockContact({
        motivation_level: 'High',
        pipeline_stage: 'Active Opportunity',
        days_since_contact: 0,
        timeframe: 'Immediate',
        seven_day_rule_flag: true,
      });

      const score = calculatePriorityScore(contact);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('getPriorityLevel', () => {
    it('should return Critical for score >= 80', () => {
      expect(getPriorityLevel(80)).toBe('Critical');
      expect(getPriorityLevel(95)).toBe('Critical');
    });

    it('should return High for score >= 60', () => {
      expect(getPriorityLevel(60)).toBe('High');
      expect(getPriorityLevel(75)).toBe('High');
    });

    it('should return Medium for score >= 40', () => {
      expect(getPriorityLevel(40)).toBe('Medium');
      expect(getPriorityLevel(55)).toBe('Medium');
    });

    it('should return Low for score < 40', () => {
      expect(getPriorityLevel(20)).toBe('Low');
      expect(getPriorityLevel(39)).toBe('Low');
    });
  });

  describe('getPriorityColor', () => {
    it('should return red colors for Critical', () => {
      expect(getPriorityColor(80)).toContain('red');
    });

    it('should return orange colors for High', () => {
      expect(getPriorityColor(60)).toContain('orange');
    });

    it('should return yellow colors for Medium', () => {
      expect(getPriorityColor(40)).toContain('yellow');
    });

    it('should return slate colors for Low', () => {
      expect(getPriorityColor(20)).toContain('slate');
    });
  });
});
