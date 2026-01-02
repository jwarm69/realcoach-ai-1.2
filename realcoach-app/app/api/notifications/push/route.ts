import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendPushNotification, createPushNotification } from '@/lib/notifications/push';
import { isVAPIDConfigured } from '@/lib/notifications/vapid';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Check if VAPID is configured
  if (!isVAPIDConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Push notifications not configured on the server',
      hint: 'VAPID keys need to be set in environment variables',
    }, { status: 500 });
  }

  try {
    // Get user's push subscriptions
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('endpoint, keys_p256dh, keys_auth')
      .eq('user_id', user.id);

    if (fetchError) {
      console.error('Failed to fetch subscriptions:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch subscriptions',
      }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No push subscriptions found',
        hint: 'Please enable push notifications in your browser first',
      }, { status: 400 });
    }

    // Create test notification payload
    const payload = createPushNotification('test', {
      userId: user.id,
    });

    // Send to all subscriptions
    const subs = subscriptions as Array<{
      endpoint: string;
      keys_p256dh: string;
      keys_auth: string;
    }>;

    const results = await Promise.allSettled(
      subs.map((sub) => {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys_p256dh,
            auth: sub.keys_auth,
          },
        };
        return sendPushNotification(subscription, payload);
      })
    );

    const sent = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - sent;
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        errors.push(`Subscription ${index}: ${result.reason}`);
      } else if (!result.value.success) {
        errors.push(`Subscription ${index}: ${result.value.error}`);
        // Remove invalid/expired subscriptions
        if (result.value.statusCode === 404 || result.value.statusCode === 410) {
          const subToRemove = subs[index];
          supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', subToRemove.endpoint)
            .eq('user_id', user.id);
        }
      }
    });

    return NextResponse.json({
      success: sent > 0,
      message: sent > 0
        ? `Test notification sent to ${sent} device${sent > 1 ? 's' : ''}`
        : 'Failed to send test notification',
      sent,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Test push error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
