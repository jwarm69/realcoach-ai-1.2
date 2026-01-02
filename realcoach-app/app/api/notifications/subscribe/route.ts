import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validatePushSubscription } from '@/lib/notifications/push';

export const dynamic = 'force-dynamic';

interface SubscribeRequest {
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  userAgent?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body: SubscribeRequest = await request.json();
    const { subscription, userAgent } = body;

    // Validate subscription format
    if (!validatePushSubscription(subscription)) {
      return NextResponse.json(
        { error: 'Invalid subscription format' },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('endpoint', subscription.endpoint)
      .single();

    const existingRecord = existing as { id: string } | null;

    if (existingRecord) {
      // Update existing subscription
      const { error: updateError } = await (supabase as any)
        .from('push_subscriptions')
        .update({
          keys_p256dh: subscription.keys.p256dh,
          keys_auth: subscription.keys.auth,
          user_agent: userAgent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingRecord.id);

      if (updateError) {
        console.error('Failed to update push subscription:', updateError);
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Subscription updated',
      });
    }

    // Insert new subscription
    const { error: insertError } = await (supabase as any)
      .from('push_subscriptions')
      .insert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        keys_p256dh: subscription.keys.p256dh,
        keys_auth: subscription.keys.auth,
        user_agent: userAgent,
      });

    if (insertError) {
      console.error('Failed to save push subscription:', insertError);
      return NextResponse.json(
        { error: 'Failed to save subscription' },
        { status: 500 }
      );
    }

    // Enable push notifications if not already enabled
    await (supabase as any)
      .from('notification_preferences')
      .update({ push_enabled: true })
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Subscribed to push notifications',
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, user_agent, created_at, updated_at')
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Get push preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('push_enabled, push_daily_actions, push_seven_day_alerts, push_consistency_reminders, push_weekly_summary')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      subscriptions: subscriptions || [],
      preferences: preferences || {},
      hasSubscriptions: (subscriptions?.length || 0) > 0,
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'endpoint is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Check if user has any remaining subscriptions
    const { data: remaining } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', user.id);

    // If no subscriptions left, disable push
    if (!remaining || remaining.length === 0) {
      await (supabase as any)
        .from('notification_preferences')
        .update({ push_enabled: false })
        .eq('user_id', user.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription removed',
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
