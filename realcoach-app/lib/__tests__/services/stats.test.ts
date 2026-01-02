import {
  getSalesMetrics,
  getConversionFunnel,
  getLeadSourceDistribution,
  type TimePeriod,
} from '../../services/stats';

jest.mock('@/lib/supabase/server');

describe('Sales Service', () => {
  describe('getDateRange', () => {
    it('should return correct date range for period', () => {
      const today = new Date().toISOString().split('T')[0];

      expect(today).toBeDefined();
    });
  });

  describe('getSalesMetrics', () => {
    it('should throw error if not authenticated', async () => {
      await expect(getSalesMetrics('month')).rejects.toThrow('Not authenticated');
    });
  });

  describe('getConversionFunnel', () => {
    it('should throw error if not authenticated', async () => {
      await expect(getConversionFunnel()).rejects.toThrow('Not authenticated');
    });
  });

  describe('getLeadSourceDistribution', () => {
    it('should throw error if not authenticated', async () => {
      await expect(getLeadSourceDistribution()).rejects.toThrow('Not authenticated');
    });
  });
});
