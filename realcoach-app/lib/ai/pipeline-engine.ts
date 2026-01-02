import type { PipelineStage } from '@/lib/database.types';

export interface PipelineAnalysis {
  currentStage: PipelineStage;
  hasTimeframe: boolean;
  hasSpecificProperty: boolean;
  motivation: 'High' | 'Medium' | 'Low';
  hasHomeShowings: boolean;
  daysSinceLastActivity: number;
  offerAccepted: boolean;
  closingCompleted: boolean;
}

export interface PipelineStageResult {
  newStage: PipelineStage;
  confidence: number;
  rationale: string;
}

export const determinePipelineStage = (
  analysis: PipelineAnalysis
): PipelineStageResult => {
  const { currentStage } = analysis;

  // Lead → New Opportunity
  if (currentStage === 'Lead') {
    if (
      analysis.hasTimeframe &&
      analysis.hasSpecificProperty &&
      analysis.motivation === 'High'
    ) {
      return {
        newStage: 'New Opportunity',
        confidence: 85,
        rationale: 'Meets criteria: High motivation + timeframe + specific property',
      };
    }
  }

  // New Opportunity → Active Opportunity
  if (currentStage === 'New Opportunity') {
    if (analysis.hasHomeShowings && analysis.daysSinceLastActivity <= 7) {
      return {
        newStage: 'Active Opportunity',
        confidence: 90,
        rationale: 'Active showings + engagement within 7 days',
      };
    }
  }

  // Active Opportunity → Under Contract
  if (currentStage === 'Active Opportunity') {
    if (analysis.offerAccepted) {
      return {
        newStage: 'Under Contract',
        confidence: 95,
        rationale: 'Offer accepted by seller',
      };
    }
  }

  // Under Contract → Closed
  if (currentStage === 'Under Contract') {
    if (analysis.closingCompleted) {
      return {
        newStage: 'Closed',
        confidence: 100,
        rationale: 'Closing completed successfully',
      };
    }
  }

  return { newStage: currentStage, confidence: 0, rationale: 'No change' };
};
