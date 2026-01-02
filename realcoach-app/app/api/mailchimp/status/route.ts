import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: contacts } = await supabase
      .from('contacts')
      .select('mailchimp_synced_at, mailchimp_sync_error')
      .eq('user_id', user.id)
      .not('mailchimp_synced_at', 'is', null)
      .order('mailchimp_synced_at', { ascending: false })
      .limit(1);

    const lastSync = contacts && contacts.length > 0
      ? (contacts[0] as Record<string, any>).mailchimp_synced_at
      : null;

    const { count: totalSynced } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('mailchimp_synced_at', 'is', null);

    const { count: totalWithError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('mailchimp_sync_error', 'is', null);

    return NextResponse.json({
      lastSync,
      totalSynced: totalSynced || 0,
      totalWithError: totalWithError || 0,
    });
  } catch (error: any) {
    console.error('Mailchimp status error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
