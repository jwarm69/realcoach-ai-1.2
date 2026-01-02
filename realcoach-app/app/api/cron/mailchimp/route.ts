import { NextRequest, NextResponse } from 'next/server';
import { syncContactsToMailchimp, type MailchimpConfig } from '@/lib/integrations/mailchimp';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get('x-vercel-cron-secret') || request.nextUrl.searchParams.get('secret');

  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;

  if (!apiKey || !listId) {
    return NextResponse.json(
      { error: 'Mailchimp not configured' },
      { status: 400 }
    );
  }

  try {
    const dataCenter = apiKey.split('-')[1];
    const config: MailchimpConfig = {
      apiKey,
      dataCenter,
      listId,
    };

    const result = await syncContactsToMailchimp(config);

    if (result.success) {
      return NextResponse.json({
        success: true,
        synced: result.synced,
        failed: result.failed,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        success: false,
        synced: result.synced,
        failed: result.failed,
        errors: result.errors.slice(0, 10),
      });
    }
  } catch (error: any) {
    console.error('Mailchimp cron sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
