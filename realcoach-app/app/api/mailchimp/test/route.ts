import { NextRequest, NextResponse } from 'next/server';
import { testMailchimpConnection, type MailchimpConfig } from '@/lib/integrations/mailchimp';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing required field: apiKey' },
        { status: 400 }
      );
    }

    // Validate API key format
    const match = apiKey.match(/-(.+)$/);
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid Mailchimp API key format. Expected format: xxxxxxxxxxxxxxxxxxxxx-usxx' },
        { status: 400 }
      );
    }

    const config: MailchimpConfig = {
      apiKey,
      dataCenter: match[1],
      listId: '', // Not needed for ping test
    };

    const isValid = await testMailchimpConnection(config);

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: 'Connection successful',
      });
    } else {
      return NextResponse.json(
        { error: 'Connection failed. Please check your API key and try again.' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Mailchimp test connection error:', error);
    return NextResponse.json(
      { error: error.message || 'Connection failed. Please check your API key and try again.' },
      { status: 500 }
    );
  }
}
