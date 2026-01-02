import { createClient } from '@/lib/supabase/server';
import type { PipelineStage, PipelineStageHistory } from '@/lib/database.types';

interface StageChangeParams {
  contactId: string;
  previousStage: PipelineStage;
  newStage: PipelineStage;
  changeReason?: string;
  changeSource?: string;
  confidence?: number;
  conversationId?: string | null;
}

export async function recordPipelineStageChange(
  params: StageChangeParams
): Promise<PipelineStageHistory> {
  const supabase = await createClient();
  const {
    contactId,
    previousStage,
    newStage,
    changeReason,
    changeSource = 'system',
    confidence = 0,
    conversationId = null,
  } = params;

  const { data, error } = await supabase
    .from('pipeline_stage_history')
    .insert({
      contact_id: contactId,
      previous_stage: previousStage,
      new_stage: newStage,
      change_reason: changeReason || null,
      change_source: changeSource,
      confidence,
      conversation_id: conversationId,
    } as never)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to record pipeline stage change: ${error.message}`);
  }

  return data as PipelineStageHistory;
}
