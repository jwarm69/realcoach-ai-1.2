import { describe, it, expect, vi, beforeEach, afterEach } from '@jest/globals';
import {
  getDateRange,
  getPreviousDateRange,
  getSalesMetrics,
  getConversionFunnel,
  getLeadSourceDistribution,
  createSalesConversation,
  getSalesConversationsByType,
  deleteSalesConversation,
} from '@/lib/services/sales';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('Sales Service - Date Utilities', () => {
  describe('getDateRange', () => {
    it('should return today for "today" period', () => {
      const result = getDateRange('today');
      expect(result.startDate).toBe(result.endDate);
    });

    it('should return 7 days ago for "week" period', () => {
      const result = getDateRange('week');
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      expect(result.startDate).toBe(weekAgo.toISOString().split('T')[0]);
    });

    it('should return 1 month ago for "month" period', () => {
      const result = getDateRange('month');
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      expect(result.startDate).toBe(monthAgo.toISOString().split('T')[0]);
    });

    it('should return 3 months ago for "quarter" period', () => {
      const result = getDateRange('quarter');
      const quarterAgo = new Date();
      quarterAgo.setMonth(quarterAgo.getMonth() - 3);
      expect(result.startDate).toBe(quarterAgo.toISOString().split('T')[0]);
    });

    it('should return 1 year ago for "year" period', () => {
      const result = getDateRange('year');
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      expect(result.startDate).toBe(yearAgo.toISOString().split('T')[0]);
    });

    it('should return fixed date for "all" period', () => {
      const result = getDateRange('all');
      expect(result.startDate).toBe('2020-01-01');
    });
  });

  describe('getPreviousDateRange', () => {
    it('should calculate previous period correctly', () => {
      const current = getDateRange('month');
      const previous = getPreviousDateRange('month');

      const currentStart = new Date(current.startDate);
      const currentEnd = new Date(current.endDate);
      const prevEnd = new Date(previous.endDate);
      const prevStart = new Date(previous.startDate);

      const currentDiff = Math.floor((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
      const prevDiff = Math.floor((prevEnd.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24));

      expect(currentDiff).toBe(prevDiff);
      expect(prevEnd.getTime()).toBeLessThan(currentStart.getTime());
    });
  });
});

describe('Sales Service - getSalesMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default metrics when no conversations exist', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({ data: [] }),
            }),
          }),
        }),
      }),
    });

    const metrics = await getSalesMetrics('month');

    expect(metrics).toEqual({
      appointments: 0,
      listings: 0,
      closings: 0,
      gci: 0,
      period: 'month',
      startDate: expect.any(String),
      endDate: expect.any(String),
    });
  });

  it('should aggregate conversation counts correctly', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({
                data: [
                  { conversation_type: 'appointment', amount: null },
                  { conversation_type: 'appointment', amount: null },
                  { conversation_type: 'listing', amount: 15000 },
                  { conversation_type: 'closing', amount: 20000 },
                  { conversation_type: 'gci', amount: 5000 },
                ],
              }),
            }),
          }),
        }),
      }),
    });

    const metrics = await getSalesMetrics('month');

    expect(metrics.appointments).toBe(2);
    expect(metrics.listings).toBe(1);
    expect(metrics.closings).toBe(1);
    expect(metrics.gci).toBe(40000);
  });

  it('should include previous period comparison for non-all periods', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: vi.fn()
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                lte: vi.fn().mockResolvedValue({ data: [{ conversation_type: 'appointment', amount: null }] }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                lte: vi.fn().mockResolvedValue({ data: [{ conversation_type: 'appointment', amount: null }] }),
              }),
            }),
          }),
        }),
    });

    const metrics = await getSalesMetrics('month');

    expect(metrics.previousPeriod).toBeDefined();
    expect(metrics.previousPeriod?.appointments).toBe(1);
  });
});

describe('Sales Service - getConversionFunnel', () => {
  it('should return empty funnel when no contacts exist', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [] }),
        }),
      }),
    });

    const funnel = await getConversionFunnel();

    expect(funnel).toHaveLength(5);
    expect(funnel[0].count).toBe(0);
    expect(funnel.every(f => f.percentage === 0)).toBe(true);
  });

  it('should calculate funnel percentages correctly', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              { pipeline_stage: 'Lead' },
              { pipeline_stage: 'Lead' },
              { pipeline_stage: 'New Opportunity' },
              { pipeline_stage: 'Active Opportunity' },
              { pipeline_stage: 'Under Contract' },
              { pipeline_stage: 'Closed' },
            ],
          }),
        }),
      }),
    });

    const funnel = await getConversionFunnel();

    expect(funnel[0].stage).toBe('Lead');
    expect(funnel[0].count).toBe(2);
    expect(funnel[0].percentage).toBe(33);
    expect(funnel[4].stage).toBe('Closed');
    expect(funnel[4].count).toBe(1);
    expect(funnel[4].percentage).toBe(17);
  });

  it('should calculate drop-off from previous stage', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              { pipeline_stage: 'Lead' },
              { pipeline_stage: 'New Opportunity' },
            ],
          }),
        }),
      }),
    });

    const funnel = await getConversionFunnel();

    expect(funnel[1].dropOffFromPrevious).toBeDefined();
    expect(funnel[1].dropOffFromPrevious).toBe(0);
  });
});

describe('Sales Service - getLeadSourceDistribution', () => {
  it('should return empty array when no sources exist', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockReturnValue({
              mockResolvedValue({ data: [] }),
            }),
          }),
        }),
      }),
    });

    const sources = await getLeadSourceDistribution();

    expect(sources).toEqual([]);
  });

  it('should aggregate sources correctly', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockReturnValue({
              mockResolvedValue({
                data: [
                  { lead_source: 'Referral' },
                  { lead_source: 'Referral' },
                  { lead_source: 'Zillow' },
                  { lead_source: 'Zillow' },
                  { lead_source: 'Zillow' },
                ],
              }),
            }),
          }),
        }),
      }),
    });

    const sources = await getLeadSourceDistribution();

    expect(sources).toHaveLength(2);
    expect(sources[0].source).toBe('Zillow');
    expect(sources[0].count).toBe(3);
    expect(sources[0].percentage).toBe(60);
    expect(sources[1].source).toBe('Referral');
    expect(sources[1].count).toBe(2);
    expect(sources[1].percentage).toBe(40);
  });
});
