import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculatePriorityScore } from '@/lib/engines/priority-calculator';
import type { Contact } from '@/lib/database.types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/contacts/[id]/recalculate - Recalculate priority score
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the contact
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const contact = data as Contact;

    // Calculate new priority score
    const newScore = calculatePriorityScore(contact);

    // Update the contact
    const { data: updated, error: updateError } = await supabase
      .from('contacts')
      .update({ priority_score: newScore } as never)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      contact: updated,
      oldScore: contact.priority_score,
      newScore,
    });
  } catch (error) {
    console.error('Error recalculating priority score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
