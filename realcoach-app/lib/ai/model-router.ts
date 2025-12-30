import OpenAI from 'openai';

/**
 * Smart Model Router
 *
 * Routes tasks to the most cost-effective model based on complexity.
 * Implements a 3-tier cost optimization strategy:
 *
 * Tier 1: Rule-based (free) - High-confidence regex patterns
 * Tier 2: GPT-4o-mini ($0.15/1M tokens) - Simple classification and extraction
 * Tier 3: GPT-4o ($2.50/1M tokens) - Complex reasoning and generation
 */

export type TaskType =
  | 'pattern_detection'
  | 'entity_extraction'
  | 'stage_detection'
  | 'action_generation'
  | 'reply_generation';

export type ModelTier = 'rule-based' | 'mini' | 'full';

export interface ModelRoute {
  tier: ModelTier;
  model: string;
  estimatedCost: number;
  reason: string;
}

/**
 * Task complexity assessment
 */
interface TaskComplexity {
  hasAmbiguity: boolean;
  requiresReasoning: boolean;
  requiresGeneration: boolean;
  tokenCount: number;
  hasHighConfidencePatterns: boolean;
}

/**
 * Analyze task complexity to determine appropriate model tier
 */
export function assessTaskComplexity(
  taskType: TaskType,
  text: string
): TaskComplexity {
  const tokenCount = estimateTokens(text);

  // Check for high-confidence patterns
  const hasHighConfidencePatterns = hasObviousPatterns(text);

  // Check for ambiguity indicators
  const ambiguityIndicators = [
    'maybe', 'possibly', 'might', 'could be', 'not sure',
    'probably', 'somewhat', 'kind of', 'sort of'
  ];
  const hasAmbiguity = ambiguityIndicators.some(indicator =>
    text.toLowerCase().includes(indicator)
  );

  // Task-specific complexity assessment
  const requiresReasoning = ['stage_detection', 'action_generation'].includes(taskType);
  const requiresGeneration = taskType === 'reply_generation';

  return {
    hasAmbiguity,
    requiresReasoning,
    requiresGeneration,
    tokenCount,
    hasHighConfidencePatterns
  };
}

/**
 * Route task to appropriate model
 */
export function routeTask(
  taskType: TaskType,
  text: string
): ModelRoute {
  const complexity = assessTaskComplexity(taskType, text);

  // Tier 1: Rule-based for high-confidence patterns
  if (complexity.hasHighConfidencePatterns && taskType === 'pattern_detection') {
    return {
      tier: 'rule-based',
      model: 'rule-based',
      estimatedCost: 0,
      reason: 'High-confidence patterns detected, using rule-based matching'
    };
  }

  // Tier 2: GPT-4o-mini for simple tasks
  if (!complexity.requiresReasoning && !complexity.requiresGeneration) {
    return {
      tier: 'mini',
      model: 'gpt-4o-mini',
      estimatedCost: estimateMiniCost(complexity.tokenCount),
      reason: 'Simple extraction task, using cost-effective mini model'
    };
  }

  // Tier 3: GPT-4o for complex tasks
  return {
    tier: 'full',
    model: 'gpt-4o',
    estimatedCost: estimateFullCost(complexity.tokenCount),
    reason: 'Complex reasoning or generation required, using full model'
  };
}

/**
 * Create OpenAI client with model selection
 */
export function createOpenAIClient(route: ModelRoute): OpenAI {
  if (route.tier === 'rule-based') {
    throw new Error('Cannot create OpenAI client for rule-based tier');
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Estimate cost for GPT-4o-mini
 * Input: $0.15/1M tokens, Output: $0.60/1M tokens
 */
function estimateMiniCost(inputTokens: number, outputTokens = 100): number {
  const inputCost = (inputTokens / 1_000_000) * 0.15;
  const outputCost = (outputTokens / 1_000_000) * 0.60;
  return inputCost + outputCost;
}

/**
 * Estimate cost for GPT-4o
 * Input: $2.50/1M tokens, Output: $10.00/1M tokens
 */
function estimateFullCost(inputTokens: number, outputTokens = 500): number {
  const inputCost = (inputTokens / 1_000_000) * 2.50;
  const outputCost = (outputTokens / 1_000_000) * 10.00;
  return inputCost + outputCost;
}

/**
 * Check if text has obvious patterns that can be matched with rules
 */
function hasObviousPatterns(text: string): boolean {
  const obviousPatterns = [
    // Buying/selling intent
    /\b(looking to buy|want to purchase|interested in buying)\b/i,
    /\b(looking to sell|want to sell|thinking of selling)\b/i,

    // Urgency
    /\b(asap|immediately|right now|urgent)\b/i,

    // Showings
    /\b(saw \d+ home|showing|viewed|visited|tour)\b/i,

    // Offer accepted
    /\b(offer accepted|under contract|seller accepted)\b/i,

    // Closing
    /\b(closed|closing complete|got the keys|funding)\b/i,

    // Pre-approval
    /\b(pre-approval|pre-qualified|pre-approved)\b/i
  ];

  return obviousPatterns.some(pattern => pattern.test(text));
}

/**
 * Get model usage statistics for monitoring
 */
export interface ModelUsageStats {
  ruleBasedCount: number;
  miniCount: number;
  fullCount: number;
  totalEstimatedCost: number;
}

export class ModelUsageTracker {
  private stats: ModelUsageStats = {
    ruleBasedCount: 0,
    miniCount: 0,
    fullCount: 0,
    totalEstimatedCost: 0
  };

  recordUsage(route: ModelRoute): void {
    switch (route.tier) {
      case 'rule-based':
        this.stats.ruleBasedCount++;
        break;
      case 'mini':
        this.stats.miniCount++;
        this.stats.totalEstimatedCost += route.estimatedCost;
        break;
      case 'full':
        this.stats.fullCount++;
        this.stats.totalEstimatedCost += route.estimatedCost;
        break;
    }
  }

  getStats(): ModelUsageStats {
    return { ...this.stats };
  }

  reset(): void {
    this.stats = {
      ruleBasedCount: 0,
      miniCount: 0,
      fullCount: 0,
      totalEstimatedCost: 0
    };
  }
}

// Global usage tracker instance
export const modelUsageTracker = new ModelUsageTracker();
