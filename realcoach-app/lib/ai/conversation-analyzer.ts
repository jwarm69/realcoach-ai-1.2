import OpenAI from 'openai';
import { routeTask, modelUsageTracker, type TaskType } from './model-router';
import { detectPatterns, isPatternDetectionSufficient } from './pattern-detector';
import { extractEntities } from './entity-extractor';
import { detectStage, shouldTransitionStage, getTransitionLevel } from './stage-detector';
import { generateNextAction } from './action-generator';
import { generateReply } from './reply-generator';
import type { PipelineStage, MotivationLevel, Timeframe } from '@/lib/database.types';

/**
 * Conversation Analyzer
 *
 * Main orchestrator that coordinates all AI analysis components.
 * Implements smart routing to minimize costs while maintaining quality.
 */

export interface ConversationAnalysis {
  // Pattern detection (Tier 1 - Free)
  patterns: {
    buyingIntent: boolean;
    sellingIntent: boolean;
    urgency: boolean;
    specificProperty: boolean;
    preapproval: boolean;
    showings: boolean;
    offerAccepted: boolean;
    closing: boolean;
    confidence: number;
  };

  // Entity extraction (Tier 2 - GPT-4o-mini)
  entities: {
    motivation: {
      level: MotivationLevel | null;
      confidence: number;
      indicators: string[];
    };
    timeframe: {
      range: Timeframe | null;
      confidence: number;
      indicators: string[];
    };
    propertyPreferences: {
      location: string | null;
      priceRange: string | null;
      propertyType: string | null;
      beds: number | null;
      baths: number | null;
      mustHaves: string[];
    };
    budget: {
      range: string | null;
      preapproved: boolean;
      mentioned: boolean;
    };
  };

  // Stage detection (Tier 3 - GPT-4o)
  stage: {
    currentStage: PipelineStage;
    confidence: number;
    reasoning: string;
    suggestedTransition?: {
      from: PipelineStage;
      to: PipelineStage;
      confidence: number;
    };
    transitionLevel: 'auto' | 'review' | 'manual';
  };

  // Next action (Tier 3 - GPT-4o)
  nextAction: {
    actionType: 'Call' | 'Text' | 'Email' | 'Meeting' | 'Send Listing' | 'Follow-up';
    urgency: number;
    script: string;
    rationale: string;
    behavioralContext: {
      factor: string;
      explanation: string;
    };
    estimatedTimeframe: string;
  };

  // Reply draft (Tier 3 - GPT-4o)
  replyDraft: {
    greeting: string;
    acknowledgment: string;
    valueProposition: string;
    nextStep: string;
    closing: string;
    fullReply: string;
    tone: 'Professional' | 'Friendly' | 'Urgent' | 'Casual';
    editSuggestions: string[];
  };

  // Metadata
  analysisMetadata: {
    totalEstimatedCost: number;
    modelUsage: {
      ruleBased: boolean;
      mini: boolean;
      full: boolean;
    };
    processingTime: number;
    confidence: number;
  };
}

/**
 * Main analysis function - orchestrates all AI components
 */
export async function analyzeConversation(
  conversation: string,
  context: {
    contactId?: string;
    contactName: string;
    currentStage: PipelineStage;
    motivation: MotivationLevel | null;
    timeframe: Timeframe | null;
    daysSinceContact: number;
    lastMessageFrom?: 'client' | 'agent';
    conversationType?: 'text' | 'email' | 'call-followup';
    generateReply?: boolean;
  }
): Promise<ConversationAnalysis> {
  const startTime = Date.now();
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const analysis: ConversationAnalysis = {
    patterns: {
      buyingIntent: false,
      sellingIntent: false,
      urgency: false,
      specificProperty: false,
      preapproval: false,
      showings: false,
      offerAccepted: false,
      closing: false,
      confidence: 0
    },
    entities: {
      motivation: { level: null, confidence: 0, indicators: [] },
      timeframe: { range: null, confidence: 0, indicators: [] },
      propertyPreferences: {
        location: null,
        priceRange: null,
        propertyType: null,
        beds: null,
        baths: null,
        mustHaves: []
      },
      budget: { range: null, preapproved: false, mentioned: false }
    },
    stage: {
      currentStage: context.currentStage,
      confidence: 0,
      reasoning: '',
      transitionLevel: 'manual'
    },
    nextAction: {
      actionType: 'Call',
      urgency: 5,
      script: '',
      rationale: '',
      behavioralContext: { factor: '', explanation: '' },
      estimatedTimeframe: ''
    },
    replyDraft: {
      greeting: '',
      acknowledgment: '',
      valueProposition: '',
      nextStep: '',
      closing: '',
      fullReply: '',
      tone: 'Professional',
      editSuggestions: []
    },
    analysisMetadata: {
      totalEstimatedCost: 0,
      modelUsage: { ruleBased: false, mini: false, full: false },
      processingTime: 0,
      confidence: 0
    }
  };

  try {
    // Tier 1: Pattern Detection (Rule-based, Free)
    const patternRoute = routeTask('pattern_detection', conversation);
    if (patternRoute.tier === 'rule-based') {
      const patterns = detectPatterns(conversation);
      analysis.patterns = patterns;
      analysis.analysisMetadata.modelUsage.ruleBased = true;
      modelUsageTracker.recordUsage(patternRoute);
      analysis.analysisMetadata.totalEstimatedCost += patternRoute.estimatedCost;
    }

    // Tier 2: Entity Extraction (GPT-4o-mini)
    const entityRoute = routeTask('entity_extraction', conversation);
    if (entityRoute.tier === 'mini') {
      const entities = await extractEntities(conversation, openai);
      analysis.entities = entities;
      analysis.analysisMetadata.modelUsage.mini = true;
      modelUsageTracker.recordUsage(entityRoute);
      analysis.analysisMetadata.totalEstimatedCost += entityRoute.estimatedCost;
    }

    // Tier 3: Stage Detection (GPT-4o)
    const stageRoute = routeTask('stage_detection', conversation);
    if (stageRoute.tier === 'full') {
      const stageDetection = await detectStage(conversation, context.currentStage, openai);
      analysis.stage = {
        ...stageDetection,
        transitionLevel: getTransitionLevel(stageDetection)
      };
      analysis.analysisMetadata.modelUsage.full = true;
      modelUsageTracker.recordUsage(stageRoute);
      analysis.analysisMetadata.totalEstimatedCost += stageRoute.estimatedCost;
    }

    // Tier 3: Next Action Generation (GPT-4o)
    const actionRoute = routeTask('action_generation', conversation);
    if (actionRoute.tier === 'full') {
      const nextAction = await generateNextAction(
        conversation,
        {
          currentStage: context.currentStage,
          motivation: context.motivation,
          timeframe: context.timeframe,
          daysSinceContact: context.daysSinceContact
        },
        openai
      );
      analysis.nextAction = nextAction;
      if (!analysis.analysisMetadata.modelUsage.full) {
        analysis.analysisMetadata.modelUsage.full = true;
      }
      modelUsageTracker.recordUsage(actionRoute);
      analysis.analysisMetadata.totalEstimatedCost += actionRoute.estimatedCost;
    }

    // Tier 3: Reply Generation (GPT-4o) - Optional
    if (context.generateReply !== false) {
      const replyRoute = routeTask('reply_generation', conversation);
      if (replyRoute.tier === 'full') {
        const replyDraft = await generateReply(
          conversation,
          {
            contactName: context.contactName,
            currentStage: context.currentStage,
            lastMessageFrom: context.lastMessageFrom || 'client',
            conversationType: context.conversationType
          },
          openai
        );
        analysis.replyDraft = replyDraft;
        if (!analysis.analysisMetadata.modelUsage.full) {
          analysis.analysisMetadata.modelUsage.full = true;
        }
        modelUsageTracker.recordUsage(replyRoute);
        analysis.analysisMetadata.totalEstimatedCost += replyRoute.estimatedCost;
      }
    }

    // Calculate overall confidence
    analysis.analysisMetadata.confidence = calculateOverallConfidence(analysis);
    analysis.analysisMetadata.processingTime = Date.now() - startTime;

    return analysis;
  } catch (error) {
    console.error('Conversation analysis error:', error);
    analysis.analysisMetadata.processingTime = Date.now() - startTime;
    return analysis;
  }
}

/**
 * Calculate overall confidence score
 */
function calculateOverallConfidence(analysis: ConversationAnalysis): number {
  const scores = [
    analysis.patterns.confidence,
    analysis.entities.motivation.confidence,
    analysis.entities.timeframe.confidence,
    analysis.stage.confidence,
    analysis.nextAction.urgency * 10
  ];

  const validScores = scores.filter(s => s > 0);
  if (validScores.length === 0) return 0;

  return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
}

/**
 * Quick analysis for prioritization (pattern-only, fast)
 */
export async function quickAnalyze(
  conversation: string
): Promise<{
  urgency: boolean;
  buyingIntent: boolean;
  sellingIntent: boolean;
  priority: number;
}> {
  const patterns = detectPatterns(conversation);

  let priority = 0;
  if (patterns.urgency) priority += 30;
  if (patterns.buyingIntent || patterns.sellingIntent) priority += 20;
  if (patterns.showings) priority += 15;
  if (patterns.offerAccepted) priority += 25;
  if (patterns.closing) priority += 10;

  return {
    urgency: patterns.urgency,
    buyingIntent: patterns.buyingIntent,
    sellingIntent: patterns.sellingIntent,
    priority: Math.min(priority, 100)
  };
}

/**
 * Get model usage statistics
 */
export function getModelUsageStats() {
  return modelUsageTracker.getStats();
}

/**
 * Reset model usage tracking
 */
export function resetModelUsageStats() {
  modelUsageTracker.reset();
}
