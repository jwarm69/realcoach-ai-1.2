#!/usr/bin/env tsx
/**
 * Seed data script for RealCoach AI
 * Run with: npx tsx scripts/seed.ts
 *
 * This script creates sample data for testing:
 * - Sample contacts with various pipeline stages
 * - Sample conversations
 * - Sample action completions
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Get user ID from command line or use first user found
const userId = process.argv[2];

interface SampleContact {
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  pipeline_stage: string;
  motivation_level?: string;
  timeframe?: string;
  lead_source?: string;
  priority_score: number;
  days_since_contact: number;
  last_interaction_date?: string;
  last_touch_type?: string;
  budget_range?: string;
  preapproval_status?: boolean;
  notes?: string;
  property_preferences?: {
    location?: string;
    propertyType?: string;
    beds?: number;
    baths?: number;
  };
  seven_day_rule_flag?: boolean;
  consistency_score?: number;
}

const sampleContacts: SampleContact[] = [
  {
    user_id: '',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '555-0101',
    pipeline_stage: 'Lead',
    motivation_level: 'High',
    timeframe: '1-3 months',
    lead_source: 'Zillow',
    priority_score: 75,
    days_since_contact: 3,
    last_interaction_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    last_touch_type: 'Call',
    budget_range: '$400k - $500k',
    preapproval_status: false,
    notes: 'Looking for a 3-bedroom house in the suburbs. Prequalified but not pre-approved.',
    property_preferences: {
      location: 'Westchester County',
      propertyType: 'Single Family',
      beds: 3,
      baths: 2,
    },
    seven_day_rule_flag: false,
    consistency_score: 65,
  },
  {
    user_id: '',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '555-0102',
    pipeline_stage: 'Active Opportunity',
    motivation_level: 'High',
    timeframe: 'Immediate',
    lead_source: 'Referral',
    priority_score: 90,
    days_since_contact: 1,
    last_interaction_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_touch_type: 'In Person',
    budget_range: '$600k - $800k',
    preapproval_status: true,
    notes: 'Seen 5 properties so far. Loves the Victorian in downtown. Ready to make an offer.',
    property_preferences: {
      location: 'Downtown',
      propertyType: 'Single Family',
      beds: 4,
      baths: 3,
    },
    seven_day_rule_flag: false,
    consistency_score: 88,
  },
  {
    user_id: '',
    name: 'Michael Chen',
    email: 'mchen@example.com',
    phone: '555-0103',
    pipeline_stage: 'New Opportunity',
    motivation_level: 'Medium',
    timeframe: '3-6 months',
    lead_source: 'Open House',
    priority_score: 60,
    days_since_contact: 5,
    last_interaction_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    last_touch_type: 'Text',
    budget_range: '$500k - $650k',
    preapproval_status: false,
    notes: 'First-time homebuyer. Still researching neighborhoods.',
    property_preferences: {
      location: 'Suburbs',
      propertyType: 'Condo',
      beds: 2,
      baths: 2,
    },
    seven_day_rule_flag: false,
    consistency_score: 50,
  },
  {
    user_id: '',
    name: 'Emily Rodriguez',
    email: 'emily.r@example.com',
    phone: '555-0104',
    pipeline_stage: 'Active Opportunity',
    motivation_level: 'High',
    timeframe: 'Immediate',
    lead_source: 'Website',
    priority_score: 85,
    days_since_contact: 2,
    last_interaction_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    last_touch_type: 'Email',
    budget_range: '$350k - $450k',
    preapproval_status: true,
    notes: 'Looking for investment property. Has pre-approval letter.',
    property_preferences: {
      location: 'University District',
      propertyType: 'Multi-family',
      beds: 4,
      baths: 2,
    },
    seven_day_rule_flag: false,
    consistency_score: 78,
  },
  {
    user_id: '',
    name: 'David Thompson',
    email: 'dthompson@example.com',
    phone: '555-0105',
    pipeline_stage: 'Under Contract',
    motivation_level: 'High',
    timeframe: 'Immediate',
    lead_source: 'Referral',
    priority_score: 95,
    days_since_contact: 0,
    last_interaction_date: new Date().toISOString(),
    last_touch_type: 'In Person',
    budget_range: '$700k - $900k',
    preapproval_status: true,
    notes: 'Offer accepted on Colonial property. Closing in 30 days.',
    property_preferences: {
      location: 'Eastside',
      propertyType: 'Single Family',
      beds: 4,
      baths: 3,
    },
    seven_day_rule_flag: false,
    consistency_score: 92,
  },
  {
    user_id: '',
    name: 'Jessica Williams',
    email: 'jwilliams@example.com',
    phone: '555-0106',
    pipeline_stage: 'Lead',
    motivation_level: 'Low',
    timeframe: '6+ months',
    lead_source: 'Facebook',
    priority_score: 35,
    days_since_contact: 14,
    last_interaction_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    last_touch_type: 'Email',
    budget_range: '$300k - $400k',
    preapproval_status: false,
    notes: 'Just starting to look. Not in a hurry.',
    property_preferences: {
      location: 'Undecided',
      propertyType: 'Undecided',
      beds: 2,
      baths: 1,
    },
    seven_day_rule_flag: true,
    consistency_score: 30,
  },
  {
    user_id: '',
    name: 'Robert Martinez',
    email: 'rmartinez@example.com',
    phone: '555-0107',
    pipeline_stage: 'Closed',
    motivation_level: 'High',
    timeframe: 'Immediate',
    lead_source: 'Past Client',
    priority_score: 100,
    days_since_contact: 0,
    last_interaction_date: new Date().toISOString(),
    last_touch_type: 'In Person',
    budget_range: '$500k - $600k',
    preapproval_status: true,
    notes: 'Closed on condo last week. Very satisfied client.',
    property_preferences: {
      location: 'Downtown',
      propertyType: 'Condo',
      beds: 2,
      baths: 2,
    },
    seven_day_rule_flag: false,
    consistency_score: 100,
  },
  {
    user_id: '',
    name: 'Amanda Foster',
    email: 'afoster@example.com',
    phone: '555-0108',
    pipeline_stage: 'Active Opportunity',
    motivation_level: 'Medium',
    timeframe: '3-6 months',
    lead_source: 'Zillow',
    priority_score: 55,
    days_since_contact: 8,
    last_interaction_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    last_touch_type: 'Call',
    budget_range: '$450k - $550k',
    preapproval_status: true,
    notes: 'Looking for a home with office space. Works remotely.',
    property_preferences: {
      location: 'Suburbs with good schools',
      propertyType: 'Single Family',
      beds: 3,
      baths: 2,
    },
    seven_day_rule_flag: true,
    consistency_score: 45,
  },
];

async function getUserId(): Promise<string> {
  if (userId) {
    return userId;
  }

  // Get first user from auth
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('❌ Failed to fetch users:', error.message);
    process.exit(1);
  }

  if (!data.users || data.users.length === 0) {
    console.error('❌ No users found in the system. Please create a user first.');
    process.exit(1);
  }

  const firstUser = data.users[0];
  console.log(`\n👤 Using user: ${firstUser.email} (${firstUser.id})`);
  return firstUser.id;
}

async function seedContacts(targetUserId: string) {
  console.log('\n📝 Seeding contacts...');

  // Check if contacts already exist for this user
  const { data: existing } = await supabase
    .from('contacts')
    .select('id')
    .eq('user_id', targetUserId)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log('⚠️  Contacts already exist for this user. Skipping contact seeding.');
    return;
  }

  // Prepare contacts with user ID
  const contactsToInsert = sampleContacts.map(contact => ({
    ...contact,
    user_id: targetUserId,
  }));

  const { data, error } = await supabase
    .from('contacts')
    .insert(contactsToInsert)
    .select();

  if (error) {
    console.error('❌ Failed to seed contacts:', error.message);
    process.exit(1);
  }

  console.log(`✅ Created ${data?.length || 0} contacts`);

  // Create some sample conversations for a few contacts
  if (data && data.length > 0) {
    await seedConversations(targetUserId, data.slice(0, 4).map(c => c.id));
  }
}

async function seedConversations(userId: string, contactIds: string[]) {
  console.log('\n💬 Seeding conversations...');

  const conversations = [
    {
      user_id: userId,
      contact_id: contactIds[0],
      content: "Had a great call with John. He's very interested in the Westchester area. His budget is around $450k and he needs at least 3 bedrooms. He mentioned he's pre-qualified for a mortgage but hasn't completed the full application yet. I should follow up with him in a few days about getting pre-approved.",
      raw_text: "Had a great call with John. He's very interested in the Westchester area.",
      source: 'manual',
      analysis_result: {
        motivation_level: 'High',
        timeframe: '1-3 months',
        budget: '$400k - $500k',
        next_action: 'Follow up on pre-approval',
      },
    },
    {
      user_id: userId,
      contact_id: contactIds[1],
      content: "Sarah saw the Victorian downtown property today. She loved it! We discussed making an offer. She's pre-approved and ready to move forward. I'm preparing the offer paperwork now. She wants to close within 60 days if possible.",
      raw_text: "Sarah saw the Victorian downtown property today. She loved it!",
      source: 'manual',
      analysis_result: {
        motivation_level: 'High',
        timeframe: 'Immediate',
        next_action: 'Prepare offer paperwork',
      },
    },
    {
      user_id: userId,
      contact_id: contactIds[3],
      content: "Emily is looking for an investment property near the university. She wants a multi-family with at least 4 bedrooms. She has her pre-approval letter and is ready to make offers on the right properties. We're seeing 2 more properties this weekend.",
      raw_text: "Emily is looking for an investment property near the university.",
      source: 'manual',
      analysis_result: {
        motivation_level: 'High',
        timeframe: 'Immediate',
        next_action: 'Schedule weekend showings',
      },
    },
  ];

  const { data, error } = await supabase
    .from('conversations')
    .insert(conversations)
    .select();

  if (error) {
    console.error('❌ Failed to seed conversations:', error.message);
    return;
  }

  console.log(`✅ Created ${(data as any)?.length || 0} conversations`);
}

async function seedNotificationPreferences(userId: string) {
  console.log('\n🔔 Seeding notification preferences...');

  const preferences = {
    user_id: userId,
    push_enabled: false,
    push_daily_actions: true,
    push_seven_day_alerts: true,
    push_consistency_reminders: true,
    push_weekly_summary: true,
    email_enabled: true,
    email_daily_actions: false,
    email_seven_day_alerts: true,
    email_consistency_reminders: true,
    email_weekly_summary: true,
  };

  const { error } = await supabase
    .from('notification_preferences')
    .insert(preferences)
    // @ts-ignore - onConflict exists at runtime
    .onConflict('user_id')
    .ignore();

  if (error) {
    console.error('❌ Failed to seed notification preferences:', error.message);
    return;
  }

  console.log('✅ Created notification preferences');
}

async function main() {
  console.log('🌱 RealCoach AI Seed Data Script\n');
  console.log('=================================');

  const targetUserId = await getUserId();

  await seedContacts(targetUserId);
  await seedNotificationPreferences(targetUserId);

  console.log('\n✨ Seed data created successfully!');
  console.log('\nYou can now log in and see sample data in your dashboard.');
}

main().catch(console.error);
