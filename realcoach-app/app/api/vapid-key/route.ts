import { NextResponse } from 'next/server';
import { getPublicVAPIDKey } from '@/lib/notifications/vapid';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const publicKey = getPublicVAPIDKey();
    return NextResponse.json({ publicKey });
  } catch (error) {
    return NextResponse.json(
      { error: 'VAPID not configured' },
      { status: 500 }
    );
  }
}
