import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsOverview } from '@/lib/services/analytics';

export const dynamic = 'force-dynamic';

type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') || 'all') as TimePeriod;

    const analytics = await getAnalyticsOverview(period);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics API error:', error);

    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
