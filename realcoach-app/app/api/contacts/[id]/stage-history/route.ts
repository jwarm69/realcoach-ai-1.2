import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Verify contact belongs to user
    const { data: contact } = await supabase
      .from('contacts')
      .select('user_id')
      .eq('id', id)
      .single();

    const contactData = contact as { user_id: string } | null;

    if (!contactData || contactData.user_id !== user.id) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Get stage history
    const { data: history, error } = await supabase
      .from('pipeline_stage_history')
      .select('*')
      .eq('contact_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ history: history || [] });
  } catch (error) {
    console.error('Stage history API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stage history' },
      { status: 500 }
    );
  }
}
