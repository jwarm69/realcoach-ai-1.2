import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeConversation } from '@/lib/ai/conversation-analyzer';

interface AnalysisRequest {
  conversation: string;
  contactId: string;
  generateReply?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as AnalysisRequest;

    if (!body.conversation || !body.contactId) {
      return NextResponse.json(
        { error: 'conversation and contactId are required' },
        { status: 400 }
      );
    }

    const { data: contact } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', body.contactId)
      .eq('user_id', user.id)
      .single();

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    const analysis = await analyzeConversation(body.conversation, {
      contactId: contact.id,
      contactName: contact.name,
      currentStage: contact.pipeline_stage,
      motivation: contact.motivation_level,
      timeframe: contact.timeframe,
      daysSinceContact: contact.days_since_contact,
      generateReply: body.generateReply !== false
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Conversation analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
