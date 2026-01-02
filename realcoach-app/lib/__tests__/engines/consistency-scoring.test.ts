import { describe, it, expect, vi, beforeEach } from '@jest/globals';
import { calculateConsistencyScore } from '@/lib/engines/consistency-scoring';

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('Consistency Scoring Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Score Calculation', () => {
    it('should return 100 score when all 7 days have 5+ contacts', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn()
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 5 }] }),
          }),
        }),
      });

      const result = await calculateConsistencyScore();

      expect(result.score).toBe(100);
      expect(result.rating).toBe('Excellent');
    });

    it('should return 0 score when all days have 0 contacts', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn()
              .mockResolvedValueOnce({ data: [{ count: 0 }] })
              .mockResolvedValueOnce({ data: [{ count: 0 }] })
              .mockResolvedValueOnce({ data: [{ count: 0 }] })
              .mockResolvedValueOnce({ data: [{ count: 0 }] })
              .mockResolvedValueOnce({ data: [{ count: 0 }] })
              .mockResolvedValueOnce({ data: [{ count: 0 }] })
              .mockResolvedValueOnce({ data: [{ count: 0 }] }),
          }),
        }),
      });

      const result = await calculateConsistencyScore();

      expect(result.score).toBe(0);
      expect(result.rating).toBe('Critical');
    });

    it('should calculate partial score correctly', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn()
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 4 }] })
              .mockResolvedValueOnce({ data: [{ count: 3 }] })
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 2 }] })
              .mockResolvedValueOnce({ data: [{ count: 5 }] }),
          }),
        }),
      });

      const result = await calculateConsistencyScore();

      // Total: 29 contacts, target: 35, percentage: ~83%
      expect(result.score).toBeGreaterThan(80);
      expect(result.score).toBeLessThan(85);
    });

    it('should penalize zero days', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn()
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 0 }] })  // Zero day
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 5 }] }),
          }),
        }),
      });

      const result = await calculateConsistencyScore();

      // 100 base - 5 penalty for one zero day = 95
      expect(result.score).toBe(95);
    });

    it('should penalize multiple zero days', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn()
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 0 }] })  // Zero day 1
              .mockResolvedValueOnce({ data: [{ count: 0 }] })  // Zero day 2
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 5 }] }),
          }),
        }),
      });

      const result = await calculateConsistencyScore();

      // 100 base - 10 penalty for two zero days = 90
      expect(result.score).toBe(90);
    });
  });

  describe('Rating Assignment', () => {
    it('should rate Excellent for 90+ score', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn()
              .mockResolvedValueSevenTimes({ data: [{ count: 5 }] }),
          }),
        }),
      });

      const result = await calculateConsistencyScore();
      expect(result.rating).toBe('Excellent');
    });

    it('should rate Good for 70-89 score', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn()
              // Average of 3.5 per day = 70%
              .mockResolvedValueOnce({ data: [{ count: 4 }] })
              .mockResolvedValueOnce({ data: [{ count: 3 }] })
              .mockResolvedValueOnce({ data: [{ count: 4 }] })
              .mockResolvedValueOnce({ data: [{ count: 3 }] })
              .mockResolvedValueOnce({ data: [{ count: 4 }] })
              .mockResolvedValueOnce({ data: [{ count: 3 }] })
              .mockResolvedValueOnce({ data: [{ count: 4 }] }),
          }),
        }),
      });

      const result = await calculateConsistencyScore();
      expect(result.rating).toBe('Good');
    });

    it('should rate Needs Improvement for 50-69 score', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn()
              // Average of 2.5 per day = 50%
              .mockResolvedValueOnce({ data: [{ count: 3 }] })
              .mockResolvedValueOnce({ data: [{ count: 2 }] })
              .mockResolvedValueOnce({ data: [{ count: 3 }] })
              .mockResolvedValueOnce({ data: [{ count: 2 }] })
              .mockResolvedValueOnce({ data: [{ count: 3 }] })
              .mockResolvedValueOnce({ data: [{ count: 2 }] })
              .mockResolvedValueOnce({ data: [{ count: 3 }] }),
          }),
        }),
      });

      const result = await calculateConsistencyScore();
      expect(result.rating).toBe('Needs Improvement');
    });

    it('should rate Critical for < 50 score', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn()
              // Average of 1 per day = 20%
              .mockResolvedValueOnce({ data: [{ count: 1 }] })
              .mockResolvedValueOnce({ data: [{ count: 1 }] })
              .mockResolvedValueOnce({ data: [{ count: 1 }] })
              .mockResolvedValueOnce({ data: [{ count: 1 }] })
              .mockResolvedValueOnce({ data: [{ count: 1 }] })
              .mockResolvedValueOnce({ data: [{ count: 1 }] })
              .mockResolvedValueOnce({ data: [{ count: 1 }] }),
          }),
        }),
      });

      const result = await calculateConsistencyScore();
      expect(result.rating).toBe('Critical');
    });
  });

  describe('Last 7 Days Array', () => {
    it('should return array of 7 daily counts', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn()
              .mockResolvedValueOnce({ data: [{ count: 3 }] })
              .mockResolvedValueOnce({ data: [{ count: 4 }] })
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 2 }] })
              .mockResolvedValueOnce({ data: [{ count: 5 }] })
              .mockResolvedValueOnce({ data: [{ count: 3 }] })
              .mockResolvedValueOnce({ data: [{ count: 4 }] }),
          }),
        }),
      });

      const result = await calculateConsistencyScore();

      expect(result.last7Days).toHaveLength(7);
      expect(result.last7Days).toEqual([3, 4, 5, 2, 5, 3, 4]);
    });
  });
});

// Helper function for mock responses
function mockResolvedValueSevenTimes(data: any) {
  let callCount = 0;
  return {
    eq: vi.fn().mockReturnValue({
      data: Promise.resolve(data),
      then: (callback: any) => {
        callCount++;
        if (callCount <= 7) return Promise.resolve(data);
        return Promise.resolve({ data: null });
      },
    }),
  };
}
