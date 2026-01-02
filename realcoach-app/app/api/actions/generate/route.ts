import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateDailyActionsForUser } from '@/lib/services/actions';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const date = body.date || new Date().toISOString().split('T')[0];

    const startTime = Date.now();
    const result = await generateDailyActionsForUser(user.id, date);
    const duration = Date.now() - startTime;

    // Determine if actions already existed
    const alreadyExisted = result.errors.some(
      e => e.includes('Actions already exist')
    );

    return NextResponse.json({
      success: result.success,
      actionsCount: result.actionsCount,
      alreadyExisted,
      errors: result.errors,
      duration: `${duration}ms`,
      date,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Generate actions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
