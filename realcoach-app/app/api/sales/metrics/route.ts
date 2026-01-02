import { NextRequest, NextResponse } from 'next/server';
import { getSalesMetrics } from '@/lib/services/sales';
import type { TimePeriod } from '@/lib/services/sales';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') || 'month') as TimePeriod;

    const metrics = await getSalesMetrics(period);

    return NextResponse.json(metrics);
  } catch (error: any) {
    console.error('Sales metrics error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Not authenticated' ? 401 : 500 }
    );
  }
}
