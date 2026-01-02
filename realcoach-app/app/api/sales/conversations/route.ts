import { NextRequest, NextResponse } from 'next/server';
import {
  createSalesConversation,
  getSalesConversationsByType,
  deleteSalesConversation,
} from '@/lib/services/sales';
import type { SalesConversationType } from '@/lib/services/sales';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const conversationType = (searchParams.get('type') || 'appointment') as SalesConversationType;
    const limit = parseInt(searchParams.get('limit') || '50');

    const conversations = await getSalesConversationsByType(conversationType, limit);

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error('Get sales conversations error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Not authenticated' ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationType, conversationDate, amount, contactId, notes } = body;

    if (!conversationType || !conversationDate) {
      return NextResponse.json(
        { error: 'Missing required fields: conversationType, conversationDate' },
        { status: 400 }
      );
    }

    const conversation = await createSalesConversation(
      conversationType as SalesConversationType,
      conversationDate,
      amount || null,
      contactId || null,
      notes || null
    );

    return NextResponse.json(conversation, { status: 201 });
  } catch (error: any) {
    console.error('Create sales conversation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Not authenticated' ? 401 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    await deleteSalesConversation(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete sales conversation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Not authenticated' ? 401 : 500 }
    );
  }
}
