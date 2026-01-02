import { NextResponse } from 'next/server';
import { getLeadSourceDistribution } from '@/lib/services/sales';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET() {
  try {
    const distribution = await getLeadSourceDistribution();

    return NextResponse.json(distribution);
  } catch (error: any) {
    console.error('Lead source distribution error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Not authenticated' ? 401 : 500 }
    );
  }
}
