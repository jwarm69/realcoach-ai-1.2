import { NextResponse } from 'next/server';
import { getConversionFunnel } from '@/lib/services/sales';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET() {
  try {
    const funnel = await getConversionFunnel();

    return NextResponse.json(funnel);
  } catch (error: any) {
    console.error('Conversion funnel error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Not authenticated' ? 401 : 500 }
    );
  }
}
