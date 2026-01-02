import { createClient } from '@/lib/supabase/server';
import type { Contact, PipelineStage, MotivationLevel, LeadSource } from '@/lib/database.types';

export interface MailchimpConfig {
  apiKey: string;
  dataCenter: string;
  listId: string;
}

export interface MailchimpContact {
  email: string;
  firstName?: string;
  lastName?: string;
  tags: string[];
  mergeFields: Record<string, any>;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}

function parseApiKey(apiKey: string): { dataCenter: string } {
  const match = apiKey.match(/-(.+)$/);
  if (!match) {
    throw new Error('Invalid Mailchimp API key format');
  }
  return { dataCenter: match[1] };
}

async function mailchimpRequest(
  config: MailchimpConfig,
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<any> {
  const url = `https://${config.dataCenter}.api.mailchimp.com/3.0${endpoint}`;

  const headers: HeadersInit = {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `Mailchimp API error: ${response.status}`);
  }

  return response.json();
}

function getTagsForContact(contact: Contact): string[] {
  const tags: string[] = [];

  tags.push(`Stage: ${contact.pipeline_stage}`);

  if (contact.motivation_level) {
    tags.push(`Motivation: ${contact.motivation_level}`);
  }

  if (contact.lead_source) {
    tags.push(`Source: ${contact.lead_source}`);
  }

  if (contact.seven_day_rule_flag) {
    tags.push('7-Day Rule');
  }

  if (contact.priority_score >= 80) {
    tags.push('Priority: Critical');
  } else if (contact.priority_score >= 60) {
    tags.push('Priority: High');
  }

  if (contact.timeframe === 'Immediate') {
    tags.push('Urgent: Immediate');
  }

  return tags;
}

function toMailchimpContact(contact: Contact): MailchimpContact {
  const nameParts = contact.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  return {
    email: contact.email || '',
    firstName,
    lastName,
    tags: getTagsForContact(contact),
    mergeFields: {
      FNAME: firstName,
      LNAME: lastName,
      PHONE: contact.phone || '',
      STAGE: contact.pipeline_stage,
      MOTIVATION: contact.motivation_level || '',
      SOURCE: contact.lead_source || '',
      PRIORITY: contact.priority_score,
      DAYSSINCE: contact.days_since_contact,
      TIMEFRAME: contact.timeframe || '',
      NOTES: contact.notes || '',
    },
  };
}

async function syncContactToMailchimp(
  config: MailchimpConfig,
  contact: Contact,
  subscriberId: string | null = null
): Promise<{ subscriberId: string | null; error: string | null }> {
  try {
    const mcContact = toMailchimpContact(contact);

    if (!mcContact.email) {
      return { subscriberId: null, error: 'No email address' };
    }

    const body = {
      email_address: mcContact.email,
      status_if_new: 'subscribed',
      status: 'subscribed',
      merge_fields: mcContact.mergeFields,
      tags: mcContact.tags,
    };

    if (subscriberId) {
      await mailchimpRequest(
        config,
        `/lists/${config.listId}/members/${subscriberId}`,
        'PUT',
        body
      );
    } else {
      const result = await mailchimpRequest(
        config,
        `/lists/${config.listId}/members`,
        'POST',
        body
      );
      subscriberId = result.id;
    }

    return { subscriberId, error: null };
  } catch (error: any) {
    return { subscriberId: null, error: error.message };
  }
}

export async function syncContactsToMailchimp(config: MailchimpConfig): Promise<SyncResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', user.id)
    .not('email', 'is', null);

  if (!contacts || contacts.length === 0) {
    return { success: true, synced: 0, failed: 0, errors: [] };
  }

  const result: SyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    errors: [],
  };

  const BATCH_SIZE = 50;
  const batches = [];

  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    batches.push(contacts.slice(i, i + BATCH_SIZE));
  }

  for (const batch of batches) {
    const operations = batch.map((contact: Contact) => {
      const contactWithExtras = contact as Record<string, any>;
      const method = contactWithExtras.mailchimp_subscriber_id ? 'PUT' : 'POST';
      const mcContact = toMailchimpContact(contact);

      if (!mcContact.email) {
        return null;
      }

      const body = {
        method,
        path: contactWithExtras.mailchimp_subscriber_id
          ? `/lists/${config.listId}/members/${contactWithExtras.mailchimp_subscriber_id}`
          : `/lists/${config.listId}/members`,
        body: JSON.stringify({
          email_address: mcContact.email,
          status_if_new: 'subscribed',
          status: 'subscribed',
          merge_fields: mcContact.mergeFields,
          tags: mcContact.tags,
        }),
      };

      return body;
    }).filter(Boolean);

    if (operations.length === 0) {
      continue;
    }

    try {
      const batchResult = await mailchimpRequest(
        config,
        `/lists/${config.listId}`,
        'POST',
        { operations }
      );

      const updatedContacts = batch.map((contact: Contact, index: number) => {
        const operationResult = batchResult[index];
        if (operationResult?.error) {
          result.failed++;
          result.errors.push({
            email: contact.email || 'unknown',
            error: operationResult.error,
          });
          return contact;
        }

        result.synced++;
        const contactWithExtras = contact as Record<string, any>;
        return {
          ...contact,
          mailchimp_synced_at: new Date().toISOString(),
          mailchimp_subscriber_id: contactWithExtras.mailchimp_subscriber_id || operationResult?.id,
          mailchimp_sync_error: null,
        };
      });

      await Promise.all(
        updatedContacts.map((contact: any) =>
          (supabase as any)
            .from('contacts')
            .update({
              mailchimp_synced_at: contact.mailchimp_synced_at,
              mailchimp_subscriber_id: contact.mailchimp_subscriber_id,
              mailchimp_sync_error: contact.mailchimp_sync_error,
            })
            .eq('id', contact.id)
        )
      );
    } catch (error: any) {
      result.failed += batch.length;
      batch.forEach((contact: Contact) => {
        result.errors.push({
          email: contact.email || 'unknown',
          error: error.message,
        });
      });
    }
  }

  result.success = result.failed === 0;
  return result;
}

export async function getMailchimpLists(config: MailchimpConfig): Promise<any[]> {
  try {
    const result = await mailchimpRequest(config, '/lists', 'GET');
    return result.lists || [];
  } catch (error) {
    return [];
  }
}

export async function testMailchimpConnection(config: MailchimpConfig): Promise<boolean> {
  try {
    await mailchimpRequest(config, '/ping', 'GET');
    return true;
  } catch (error) {
    return false;
  }
}
