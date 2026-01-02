import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateDailyActionsForUser } from '@/lib/services/actions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const date = dateParam || new Date().toISOString().split('T')[0];

  try {
    const startTime = Date.now();

    const result = await generateDailyActionsForUser(user.id, date);

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: result.success,
      userId: user.id,
      userEmail: user.email,
      date,
      actionsCount: result.actionsCount,
      actions: result.actions,
      errors: result.errors,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
