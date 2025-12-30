import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');

  if (code) {
    const supabase = await createClient();

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) throw error;

      return NextResponse.redirect(new URL('/contacts', requestUrl.origin));
    } catch (error) {
      console.error('OAuth callback error:', error);
      return NextResponse.redirect(
        new URL('/contacts?error=oauth_failed', requestUrl.origin)
      );
    }
  }

  return NextResponse.redirect(new URL('/contacts', requestUrl.origin));
}
