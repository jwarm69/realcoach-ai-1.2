import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  calculateConsistencyScore,
  getConsistencyColor,
  getConsistencyEmoji,
  getConsistencyMessage,
  getConsistencyRecommendations,
} from '@/lib/engines/consistency-scoring';

/**
 * GET /api/stats/consistency
 *
 * Returns consistency score and stats:
 * - Score (0-100%)
 * - Current streak
 * - Last 7 days data
 * - Rating category
 * - Today's progress
 * - Recommendations
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate consistency score
    const consistency = await calculateConsistencyScore(user.id);

    // Add UI helpers
    const response = {
      ...consistency,
      ui: {
        color: getConsistencyColor(consistency.score),
        emoji: getConsistencyEmoji(consistency.score),
        message: getConsistencyMessage(consistency.score, consistency.streak),
        recommendations: getConsistencyRecommendations(
          consistency.score,
          consistency.streak
        ),
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Consistency stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
