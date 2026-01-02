import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendDailyActionsEmail } from '@/lib/notifications/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const testActions = [
      {
        id: 'test-1',
        contact: {
          id: 'test-contact-1',
          name: 'Sarah Johnson',
          phone: '+1-555-0123',
          email: 'sarah@example.com'
        },
        action_type: 'Call',
        priority_level: 10,
        reason: '7-day rule violation - immediate re-engagement required',
        suggested_script: 'Hi Sarah, I wanted to check in with you. The market is moving quickly, and I want to make sure you\'re seeing the latest opportunities. Are you still actively looking?'
      },
      {
        id: 'test-2',
        contact: {
          id: 'test-contact-2',
          name: 'Michael Chen',
          phone: '+1-555-0456',
          email: 'michael@example.com'
        },
        action_type: 'Email',
        priority_level: 8,
        reason: 'High motivation + 5+ days = check in to maintain momentum',
        suggested_script: 'Hi Michael, I know you\'re motivated to move forward. I want to make sure I\'m providing the best service. When can we connect?'
      },
      {
        id: 'test-3',
        contact: {
          id: 'test-contact-3',
          name: 'Emily Rodriguez',
          phone: null,
          email: 'emily@example.com'
        },
        action_type: 'Send Listing',
        priority_level: 6,
        reason: 'Active showing phase - provide value with relevant listings',
        suggested_script: 'Hi Emily, based on what we discussed, I found a property that matches your criteria. Would you like me to send over the details?'
      }
    ];

    const result = await sendDailyActionsEmail(
      user.email!,
      user.user_metadata?.name || user.email!.split('@')[0],
      testActions
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
