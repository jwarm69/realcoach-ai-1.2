import OpenAI from 'openai';
import type { PipelineStage } from '@/lib/database.types';

/**
 * Stage Detector (Tier 3)
 *
 * Uses GPT-4o for complex pipeline stage detection.
 * Analyzes conversation context and patterns to determine appropriate stage.
 */

export interface StageDetectionResult {
  currentStage: PipelineStage;
  confidence: number;
  reasoning: string;
  suggestedTransition?: {
    from: PipelineStage;
    to: PipelineStage;
    confidence: number;
  };
  indicators: {
    positive: string[];
    negative: string[];
  };
}

/**
 * Detect pipeline stage from conversation using GPT-4o
 */
export async function detectStage(
  text: string,
  currentStage: PipelineStage | null,
  openai: OpenAI
): Promise<StageDetectionResult> {
  try {
    const prompt = buildStageDetectionPrompt(text, currentStage);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert real estate agent analyzing client conversations to determine pipeline stages.

Pipeline Stages:
1. Lead - Initial contact, minimal engagement, qualifying stage
2. New Opportunity - Motivated, has timeframe, discussing property needs
3. Active Opportunity - Viewing properties, high engagement, 7-day rule applies
4. Under Contract - Offer accepted, in closing process
5. Closed - Transaction completed, follow-up phase

Stage Transition Criteria:
- Lead → New Opportunity: High motivation + specific timeframe + property preferences
- New Opportunity → Active Opportunity: Completed showings + active engagement + 7-day activity
- Active Opportunity → Under Contract: Offer accepted by seller
- Under Contract → Closed: Closing completed, documents signed

Analyze the conversation and determine:
1. Most appropriate current stage
2. Confidence level (0-100)
3. Reasoning for stage determination
4. If a stage transition is warranted
5. Positive indicators supporting the stage
6. Negative indicators (evidence against the stage)

Return ONLY valid JSON.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    return normalizeStageDetection(parsed, currentStage);
  } catch (error) {
    console.error('Stage detection error:', error);
    return getDefaultStageDetection(currentStage);
  }
}

/**
 * Build stage detection prompt
 */
function buildStageDetectionPrompt(text: string, currentStage: PipelineStage | null): string {
  const context = currentStage
    ? `Current Stage: ${currentStage}\n\nConversation:\n"${text}"`
    : `Conversation:\n"${text}"`;

  return `${context}

Determine the appropriate pipeline stage and return JSON with this structure:
{
  "currentStage": "Lead|New Opportunity|Active Opportunity|Under Contract|Closed",
  "confidence": 0-100,
  "reasoning": "Explanation of why this stage fits",
  "suggestedTransition": {
    "from": "current stage",
    "to": "recommended stage",
    "confidence": 0-100
  },
  "indicators": {
    "positive": ["evidence supporting this stage"],
    "negative": ["evidence against this stage"]
  }
}`;
}

/**
 * Normalize stage detection result
 */
function normalizeStageDetection(
  raw: any,
  currentStage: PipelineStage | null
): StageDetectionResult {
  const stage = normalizePipelineStage(raw.currentStage);

  return {
    currentStage: stage || currentStage || 'Lead',
    confidence: clamp(raw.confidence || 0, 0, 100),
    reasoning: raw.reasoning || '',
    suggestedTransition: raw.suggestedTransition?.to ? {
      from: normalizePipelineStage(raw.suggestedTransition.from) || currentStage || 'Lead',
      to: normalizePipelineStage(raw.suggestedTransition.to) || 'Lead',
      confidence: clamp(raw.suggestedTransition.confidence || 0, 0, 100)
    } : undefined,
    indicators: {
      positive: Array.isArray(raw.indicators?.positive) ? raw.indicators.positive : [],
      negative: Array.isArray(raw.indicators?.negative) ? raw.indicators.negative : []
    }
  };
}

/**
 * Normalize pipeline stage
 */
function normalizePipelineStage(stage: string): PipelineStage | null {
  const normalized = stage?.toLowerCase();
  const validStages: PipelineStage[] = [
    'Lead',
    'New Opportunity',
    'Active Opportunity',
    'Under Contract',
    'Closed'
  ];

  for (const validStage of validStages) {
    if (normalized?.includes(validStage.toLowerCase())) {
      return validStage;
    }
  }

  return null;
}

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Get default stage detection when AI fails
 */
function getDefaultStageDetection(currentStage: PipelineStage | null): StageDetectionResult {
  return {
    currentStage: currentStage || 'Lead',
    confidence: 0,
    reasoning: 'Stage detection unavailable - using current stage',
    indicators: {
      positive: [],
      negative: []
    }
  };
}

/**
 * Check if stage transition is warranted
 */
export function shouldTransitionStage(result: StageDetectionResult): boolean {
  if (!result.suggestedTransition) {
    return false;
  }

  // High confidence transition
  if (result.suggestedTransition.confidence >= 90) {
    return true;
  }

  // Medium confidence with strong reasoning
  if (result.suggestedTransition.confidence >= 70 && result.indicators.positive.length >= 2) {
    return true;
  }

  return false;
}

/**
 * Get stage transition warning level
 */
export type TransitionLevel = 'auto' | 'review' | 'manual';

export function getTransitionLevel(result: StageDetectionResult): TransitionLevel {
  if (!result.suggestedTransition) {
    return 'manual';
  }

  const confidence = result.suggestedTransition.confidence;

  if (confidence >= 90) {
    return 'auto'; // Auto-confirm
  }

  if (confidence >= 70) {
    return 'review'; // Suggest to user for review
  }

  return 'manual'; // Let user decide
}

/**
 * Validate stage transition based on business rules
 */
export function validateStageTransition(
  from: PipelineStage,
  to: PipelineStage
): { valid: boolean; reason?: string } {
  const validTransitions: Record<PipelineStage, PipelineStage[]> = {
    'Lead': ['New Opportunity', 'Lead'],
    'New Opportunity': ['Active Opportunity', 'Lead', 'New Opportunity'],
    'Active Opportunity': ['Under Contract', 'New Opportunity', 'Active Opportunity'],
    'Under Contract': ['Closed', 'Active Opportunity', 'Under Contract'],
    'Closed': ['Closed'] // Terminal stage
  };

  const allowed = validTransitions[from]?.includes(to);

  if (!allowed) {
    // Check for reverse movement (allowed in some cases)
    const reverseMovement: Record<PipelineStage, PipelineStage[]> = {
      'Lead': [],
      'New Opportunity': ['Lead'],
      'Active Opportunity': ['New Opportunity', 'Lead'],
      'Under Contract': ['Active Opportunity', 'New Opportunity'],
      'Closed': []
    };

    const allowedReverse = reverseMovement[to]?.includes(from);

    if (allowedReverse) {
      return {
        valid: true,
        reason: 'Reverse transition allowed'
      };
    }

    return {
      valid: false,
      reason: `Cannot transition from ${from} to ${to}`
    };
  }

  return { valid: true };
}

/**
 * Calculate stage progression score
 */
export function calculateStageProgression(
  currentStage: PipelineStage,
  detectionResult: StageDetectionResult
): number {
  const stageOrder: PipelineStage[] = [
    'Lead',
    'New Opportunity',
    'Active Opportunity',
    'Under Contract',
    'Closed'
  ];

  const currentIndex = stageOrder.indexOf(currentStage);
  const suggestedIndex = detectionResult.suggestedTransition
    ? stageOrder.indexOf(detectionResult.suggestedTransition.to)
    : currentIndex;

  if (suggestedIndex > currentIndex) {
    // Forward progression
    return detectionResult.suggestedTransition?.confidence || 0;
  } else if (suggestedIndex < currentIndex) {
    // Backward movement
    return -(detectionResult.suggestedTransition?.confidence || 0);
  }

  return 0; // No change
}
