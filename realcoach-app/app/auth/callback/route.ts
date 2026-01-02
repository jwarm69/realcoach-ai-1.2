import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/';

  // Handle errors from Supabase (e.g., redirect URL not allowed)
  if (error) {
    console.error('[Auth Callback] Supabase error:', error, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    // Log specific exchange errors for debugging
    console.error('[Auth Callback] Code exchange failed:', {
      message: exchangeError.message,
      status: exchangeError.status,
      name: exchangeError.name,
    });

    // Provide user-friendly error messages
    let errorMessage = 'Could not authenticate user';
    if (exchangeError.message.includes('Invalid')) {
      errorMessage = 'Invalid or expired confirmation link. Please try signing up again.';
    } else if (exchangeError.message.includes('Email')) {
      errorMessage = 'Email confirmation failed. Please check your email and try again.';
    }

    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`);
  }

  // No code or error parameter present
  console.error('[Auth Callback] No code or error in callback URL');
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Invalid authentication link')}`);
}
