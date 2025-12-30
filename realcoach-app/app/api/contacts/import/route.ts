import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ContactInput } from '@/lib/integrations/csv-parser';
import type { ContactInsert } from '@/lib/database.types';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contacts, options } = body as {
      contacts: ContactInput[];
      options: {
        skipDuplicates?: boolean;
        duplicateField?: 'email' | 'phone';
        batchSize?: number;
      };
    };

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts to import' }, { status: 400 });
    }

    const { skipDuplicates = false, duplicateField = 'email' } = options;

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const contact of contacts) {
      try {
        if (skipDuplicates && contact[duplicateField]) {
          const { data: existing } = await supabase
            .from('contacts')
            .select('id')
            .eq('user_id', user.id)
            .eq(duplicateField, contact[duplicateField]!)
            .single();

          if (existing) {
            skipped++;
            continue;
          }
        }

        const contactData = {
          user_id: user.id,
          name: contact.name,
          email: contact.email || null,
          phone: contact.phone || null,
          address: contact.address || null,
          pipeline_stage: contact.pipeline_stage || 'Lead',
          lead_source: contact.lead_source || null,
          motivation_level: contact.motivation_level || null,
          timeframe: contact.timeframe || null,
          budget_range: contact.budget_range || null,
          preapproval_status: contact.preapproval_status || false,
          property_preferences: contact.property_preferences || null,
          notes: contact.notes || null,
          priority_score: 50,
          consistency_score: 0,
          interaction_frequency: 0,
          days_since_contact: 0,
          seven_day_rule_flag: false,
          mailchimp_synced: false,
        };

        const { error: insertError } = await supabase.from('contacts').insert(contactData as never);

        if (insertError) {
          errors.push(`Failed to import "${contact.name}": ${insertError.message}`);
        } else {
          created++;
        }
      } catch (error) {
        errors.push(`Error importing "${contact.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      created,
      skipped,
      errors,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import contacts' },
      { status: 500 }
    );
  }
}
