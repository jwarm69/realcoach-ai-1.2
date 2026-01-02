import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { recordPipelineStageChange } from '@/lib/services/pipeline';
import type { PipelineStage, Contact } from '@/lib/database.types';

const allowedStages: PipelineStage[] = [
  'Lead',
  'New Opportunity',
  'Active Opportunity',
  'Under Contract',
  'Closed',
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contact_id, new_stage, reason } = body || {};

    if (!contact_id || !new_stage) {
      return NextResponse.json(
        { error: 'contact_id and new_stage are required' },
        { status: 400 }
      );
    }

    if (!allowedStages.includes(new_stage)) {
      return NextResponse.json(
        { error: 'Invalid pipeline stage' },
        { status: 400 }
      );
    }

    const { data: contact } = await supabase
      .from('contacts')
      .select('id, pipeline_stage')
      .eq('id', contact_id)
      .eq('user_id', user.id)
      .single();

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found or access denied' },
        { status: 404 }
      );
    }

    const typedContact = contact as Pick<Contact, 'id' | 'pipeline_stage'>;

    const { error: updateError } = await supabase
      .from('contacts')
      .update({ pipeline_stage: new_stage } as never)
      .eq('id', contact_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    try {
      await recordPipelineStageChange({
        contactId: contact_id,
        previousStage: typedContact.pipeline_stage,
        newStage: new_stage as PipelineStage,
        changeReason: reason || 'Manual override',
        changeSource: 'manual',
        confidence: 100,
      });
    } catch (err) {
      console.error('Failed to log pipeline override:', err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error overriding pipeline stage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
