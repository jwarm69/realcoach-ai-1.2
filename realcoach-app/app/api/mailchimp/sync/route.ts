import { NextRequest, NextResponse } from 'next/server';
import { syncContactsToMailchimp, type MailchimpConfig } from '@/lib/integrations/mailchimp';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, listId } = body;

    if (!apiKey || !listId) {
      return NextResponse.json(
        { error: 'Missing required fields: apiKey, listId' },
        { status: 400 }
      );
    }

    const dataCenter = apiKey.split('-')[1];
    if (!dataCenter) {
      return NextResponse.json(
        { error: 'Invalid Mailchimp API key format' },
        { status: 400 }
      );
    }

    const config: MailchimpConfig = {
      apiKey,
      dataCenter,
      listId,
    };

    const result = await syncContactsToMailchimp(config);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Mailchimp sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Not authenticated' ? 401 : 500 }
    );
  }
}
