import { describe, it, expect } from '@jest/globals';
import { generateNextAction } from '@/lib/engines/action-recommendation';

describe('Action Recommendation Engine', () => {
  describe('Stage: Lead', () => {
    it('should recommend Call for 7+ day inactive leads with high urgency', () => {
      const contact = {
        id: '1',
        name: 'Test Contact',
        pipeline_stage: 'Lead' as const,
        days_since_contact: 10,
        motivation_level: 'High' as const,
        timeframe: '1-3 months' as const,
        priority_score: 60,
        preapproval_status: false,
      };

      const action = generateNextAction(contact);

      expect(action.actionType).toBe('Call');
      expect(action.urgency).toBeGreaterThanOrEqual(8);
      expect(action.script).toContain('10 days');
    });

    it('should recommend Call for leads without timeframe', () => {
      const contact = {
        id: '1',
        name: 'Test Contact',
        pipeline_stage: 'Lead' as const,
        days_since_contact: 2,
        motivation_level: 'High' as const,
        timeframe: null,
        priority_score: 50,
        preapproval_status: false,
      };

      const action = generateNextAction(contact);

      expect(action.actionType).toBe('Call');
      expect(action.script).toContain('timeframe');
    });

    it('should recommend Call for leads with 6+ month timeframe', () => {
      const contact = {
        id: '1',
        name: 'Test Contact',
        pipeline_stage: 'Lead' as const,
        days_since_contact: 1,
        motivation_level: 'Medium' as const,
        timeframe: '6+ months' as const,
        priority_score: 30,
        preapproval_status: false,
      };

      const action = generateNextAction(contact);

      expect(action.actionType).toBe('Call');
      expect(action.rationale).toContain('No timeframe');
    });
  });

  describe('Stage: New Opportunity', () => {
    it('should recommend Call for leads without pre-approval', () => {
      const contact = {
        id: '1',
        name: 'Test Contact',
        pipeline_stage: 'New Opportunity' as const,
        days_since_contact: 2,
        motivation_level: 'High' as const,
        timeframe: 'Immediate' as const,
        priority_score: 70,
        preapproval_status: false,
      };

      const action = generateNextAction(contact);

      expect(action.actionType).toBe('Call');
      expect(action.urgency).toBeGreaterThanOrEqual(7);
      expect(action.script).toContain('pre-approval');
    });

    it('should recommend lower urgency when pre-approved', () => {
      const contact = {
        id: '1',
        name: 'Test Contact',
        pipeline_stage: 'New Opportunity' as const,
        days_since_contact: 2,
        motivation_level: 'High' as const,
        timeframe: 'Immediate' as const,
        priority_score: 80,
        preapproval_status: true,
      };

      const action = generateNextAction(contact);

      expect(action.urgency).toBeLessThan(7);
    });
  });

  describe('Stage: Active Opportunity', () => {
    it('should recommend Call with 7-day rule violation with critical urgency', () => {
      const contact = {
        id: '1',
        name: 'Test Contact',
        pipeline_stage: 'Active Opportunity' as const,
        days_since_contact: 8,
        motivation_level: 'High' as const,
        timeframe: 'Immediate' as const,
        priority_score: 85,
        preapproval_status: true,
        seven_day_rule_flag: true,
      };

      const action = generateNextAction(contact);

      expect(action.actionType).toBe('Call');
      expect(action.urgency).toBe(10);
      expect(action.rationale).toContain('CRITICAL');
      expect(action.rationale).toContain('7-day rule');
    });

    it('should recommend regular engagement for active opportunities under 7 days', () => {
      const contact = {
        id: '1',
        name: 'Test Contact',
        pipeline_stage: 'Active Opportunity' as const,
        days_since_contact: 3,
        motivation_level: 'High' as const,
        timeframe: '1-3 months' as const,
        priority_score: 70,
        preapproval_status: true,
      };

      const action = generateNextAction(contact);

      expect(action.actionType).toBeDefined();
      expect(action.urgency).toBeLessThan(10);
    });
  });

  describe('Stage: Under Contract', () => {
    it('should recommend Text for check-in', () => {
      const contact = {
        id: '1',
        name: 'Test Contact',
        pipeline_stage: 'Under Contract' as const,
        days_since_contact: 5,
        motivation_level: 'High' as const,
        timeframe: 'Immediate' as const,
        priority_score: 70,
        preapproval_status: true,
      };

      const action = generateNextAction(contact);

      expect(action.actionType).toBe('Text');
      expect(action.urgency).toBeLessThan(6);
      expect(action.script).toContain('closing');
    });
  });

  describe('Stage: Closed', () => {
    it('should recommend Email for testimonial within 30 days', () => {
      const contact = {
        id: '1',
        name: 'Test Contact',
        pipeline_stage: 'Closed' as const,
        days_since_contact: 5,
        motivation_level: null,
        timeframe: null,
        priority_score: 0,
        preapproval_status: true,
      };

      const action = generateNextAction(contact);

      expect(action.actionType).toBe('Email');
      expect(action.script).toContain('review');
    });

    it('should recommend maintenance for older closed contacts', () => {
      const contact = {
        id: '1',
        name: 'Test Contact',
        pipeline_stage: 'Closed' as const,
        days_since_contact: 60,
        motivation_level: null,
        timeframe: null,
        priority_score: 0,
        preapproval_status: true,
      };

      const action = generateNextAction(contact);

      expect(action.urgency).toBeLessThan(5);
    });
  });
});
