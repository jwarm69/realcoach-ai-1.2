import OpenAI from 'openai';

/**
 * Entity Extractor (Tier 2)
 *
 * Uses GPT-4o-mini for cost-effective extraction of structured entities.
 * Extracts motivation, timeframe, property preferences, and other key data.
 */

export interface ExtractedEntities {
  motivation: {
    level: 'High' | 'Medium' | 'Low' | null;
    confidence: number;
    indicators: string[];
  };
  timeframe: {
    range: 'Immediate' | '1-3 months' | '3-6 months' | '6+ months' | null;
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
}

/**
 * Extract entities from conversation text using GPT-4o-mini
 */
export async function extractEntities(
  text: string,
  openai: OpenAI
): Promise<ExtractedEntities> {
  try {
    const prompt = buildExtractionPrompt(text);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a real estate conversation analyzer. Extract key entities from the conversation and return ONLY valid JSON.

Analyze the following:
1. Motivation level (High/Medium/Low) - look for enthusiasm, urgency, commitment
2. Timeframe (Immediate/1-3 months/3-6 months/6+ months) - look for specific timing mentions
3. Property preferences - location, price range, property type, beds, baths, must-have features
4. Budget - price range mentioned, pre-approval status

Return confidence scores (0-100) and specific text indicators that support your analysis.

IMPORTANT: Return ONLY valid JSON, no additional text.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    return normalizeEntities(parsed);
  } catch (error) {
    console.error('Entity extraction error:', error);
    return getDefaultEntities();
  }
}

/**
 * Build the extraction prompt with context
 */
function buildExtractionPrompt(text: string): string {
  return `Analyze this real estate conversation:

"${text}"

Extract:
1. Motivation level with confidence and indicators
2. Timeframe with confidence and indicators
3. Property preferences (location, price, type, beds, baths, must-haves)
4. Budget information (range, pre-approval status)

Return as JSON with this structure:
{
  "motivation": { "level": "High|Medium|Low", "confidence": 0-100, "indicators": ["text evidence"] },
  "timeframe": { "range": "Immediate|1-3 months|3-6 months|6+ months", "confidence": 0-100, "indicators": ["text evidence"] },
  "propertyPreferences": { "location": "...", "priceRange": "...", "propertyType": "...", "beds": number, "baths": number, "mustHaves": ["..."] },
  "budget": { "range": "...", "preapproved": boolean, "mentioned": boolean }
}`;
}

/**
 * Normalize and validate extracted entities
 */
function normalizeEntities(raw: any): ExtractedEntities {
  return {
    motivation: {
      level: normalizeMotivation(raw.motivation?.level),
      confidence: clamp(raw.motivation?.confidence || 0, 0, 100),
      indicators: Array.isArray(raw.motivation?.indicators) ? raw.motivation.indicators : []
    },
    timeframe: {
      range: normalizeTimeframe(raw.timeframe?.range),
      confidence: clamp(raw.timeframe?.confidence || 0, 0, 100),
      indicators: Array.isArray(raw.timeframe?.indicators) ? raw.timeframe.indicators : []
    },
    propertyPreferences: {
      location: raw.propertyPreferences?.location || null,
      priceRange: raw.propertyPreferences?.priceRange || null,
      propertyType: raw.propertyPreferences?.propertyType || null,
      beds: typeof raw.propertyPreferences?.beds === 'number' ? raw.propertyPreferences.beds : null,
      baths: typeof raw.propertyPreferences?.baths === 'number' ? raw.propertyPreferences.baths : null,
      mustHaves: Array.isArray(raw.propertyPreferences?.mustHaves) ? raw.propertyPreferences.mustHaves : []
    },
    budget: {
      range: raw.budget?.range || null,
      preapproved: Boolean(raw.budget?.preapproved),
      mentioned: Boolean(raw.budget?.mentioned)
    }
  };
}

/**
 * Normalize motivation level
 */
function normalizeMotivation(level: string): 'High' | 'Medium' | 'Low' | null {
  const normalized = level?.toLowerCase();
  if (normalized === 'high') return 'High';
  if (normalized === 'medium') return 'Medium';
  if (normalized === 'low') return 'Low';
  return null;
}

/**
 * Normalize timeframe range
 */
function normalizeTimeframe(range: string): 'Immediate' | '1-3 months' | '3-6 months' | '6+ months' | null {
  const normalized = range?.toLowerCase();
  if (normalized?.includes('immediate') || normalized?.includes('asap') || normalized?.includes('right now')) {
    return 'Immediate';
  }
  if (normalized?.includes('1-3') || normalized?.includes('next couple') || normalized?.includes('few months')) {
    return '1-3 months';
  }
  if (normalized?.includes('3-6') || normalized?.includes('6 months') || normalized?.includes('half year')) {
    return '3-6 months';
  }
  if (normalized?.includes('6+') || normalized?.includes('6+ months') || normalized?.includes('year') || normalized?.includes('someday')) {
    return '6+ months';
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
 * Get default entities when extraction fails
 */
function getDefaultEntities(): ExtractedEntities {
  return {
    motivation: {
      level: null,
      confidence: 0,
      indicators: []
    },
    timeframe: {
      range: null,
      confidence: 0,
      indicators: []
    },
    propertyPreferences: {
      location: null,
      priceRange: null,
      propertyType: null,
      beds: null,
      baths: null,
      mustHaves: []
    },
    budget: {
      range: null,
      preapproved: false,
      mentioned: false
    }
  };
}

/**
 * Batch extract entities for multiple conversations
 */
export async function batchExtractEntities(
  conversations: Array<{ id: string; text: string }>,
  openai: OpenAI
): Promise<Map<string, ExtractedEntities>> {
  const results = new Map<string, ExtractedEntities>();

  // Process in parallel with concurrency limit
  const concurrencyLimit = 5;
  const batches = [];

  for (let i = 0; i < conversations.length; i += concurrencyLimit) {
    const batch = conversations.slice(i, i + concurrencyLimit);
    const batchPromises = batch.map(async (conv) => {
      const entities = await extractEntities(conv.text, openai);
      return { id: conv.id, entities };
    });
    batches.push(Promise.all(batchPromises));
  }

  const batchResults = await Promise.all(batches);
  for (const batch of batchResults) {
    for (const result of batch) {
      results.set(result.id, result.entities);
    }
  }

  return results;
}

/**
 * Calculate overall confidence score for entities
 */
export function calculateEntityConfidence(entities: ExtractedEntities): number {
  const scores = [
    entities.motivation.confidence,
    entities.timeframe.confidence,
    entities.budget.mentioned ? 50 : 0,
    entities.propertyPreferences.location ? 30 : 0,
    entities.propertyPreferences.beds ? 20 : 0
  ];

  const validScores = scores.filter(s => s > 0);
  if (validScores.length === 0) return 0;

  return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
}

/**
 * Check if entities are sufficient for decision making
 */
export function areEntitiesSufficient(entities: ExtractedEntities): boolean {
  return (
    entities.motivation.level !== null ||
    entities.timeframe.range !== null ||
    entities.propertyPreferences.location !== null ||
    entities.budget.mentioned
  );
}
