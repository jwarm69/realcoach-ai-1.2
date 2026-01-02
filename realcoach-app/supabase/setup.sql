-- ===========================================
-- RealCoach AI - Database Setup
-- Run this in your Supabase SQL Editor
-- https://uxctdjdhyxzfdogxtwux.supabase.co
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- Contacts Table
-- ===========================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Basic Info
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,

  -- Pipeline & Scoring
  pipeline_stage TEXT NOT NULL DEFAULT 'Lead' CHECK (pipeline_stage IN ('Lead', 'New Opportunity', 'Active Opportunity', 'Under Contract', 'Closed')),
  lead_source TEXT,
  motivation_level TEXT CHECK (motivation_level IN ('High', 'Medium', 'Low')),
  timeframe TEXT,
  property_preferences JSONB,
  budget_range TEXT,
  preapproval_status BOOLEAN DEFAULT false,

  -- Behavioral Tracking
  last_interaction_date DATE,
  last_touch_type TEXT,
  interaction_frequency INTEGER DEFAULT 0,
  consistency_score INTEGER DEFAULT 0,
  priority_score INTEGER DEFAULT 0,
  days_since_contact INTEGER DEFAULT 0,
  seven_day_rule_flag BOOLEAN DEFAULT false,
  last_activity_date DATE,
  inactive_days INTEGER DEFAULT 0,

  -- Notes & Sync
  notes TEXT,
  mailchimp_synced BOOLEAN DEFAULT false,
  mailchimp_synced_at TIMESTAMPTZ,
  mailchimp_subscriber_id TEXT,
  mailchimp_sync_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_pipeline_stage ON contacts(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_contacts_priority_score ON contacts(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_seven_day_flag ON contacts(seven_day_rule_flag)
  WHERE seven_day_rule_flag = true;

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own contacts"
  ON contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
  ON contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Conversations Table
-- ===========================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,

  input_type TEXT NOT NULL CHECK (input_type IN ('text', 'voice', 'screenshot')),
  content TEXT NOT NULL,
  raw_url TEXT, -- For screenshot uploads

  -- AI Analysis Results
  ai_analysis JSONB,
  detected_stage TEXT,
  detected_motivation TEXT,
  detected_timeframe TEXT,
  suggested_action TEXT,
  action_generated BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_contact_id ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM contacts WHERE id = conversations.contact_id));

CREATE POLICY "Users can insert conversations for their contacts"
  ON conversations FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM contacts WHERE id = conversations.contact_id)
  );

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Notification Preferences
-- ===========================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Email Settings
  email_enabled BOOLEAN DEFAULT true,
  email_daily_actions BOOLEAN DEFAULT false,
  email_seven_day_alerts BOOLEAN DEFAULT true,
  email_consistency_reminders BOOLEAN DEFAULT true,
  email_weekly_summary BOOLEAN DEFAULT true,

  -- Push Settings
  push_enabled BOOLEAN DEFAULT false,
  push_daily_actions BOOLEAN DEFAULT false,
  push_seven_day_alerts BOOLEAN DEFAULT true,
  push_consistency_reminders BOOLEAN DEFAULT true,
  push_weekly_summary BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Sales Conversations (4 Conversations Tracking)
-- ===========================================
CREATE TABLE IF NOT EXISTS sales_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

  conversation_type TEXT NOT NULL CHECK (conversation_type IN ('appointment', 'listing', 'closing', 'gci')),
  amount DECIMAL(12,2),
  conversation_date DATE NOT NULL,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_amount CHECK (amount IS NULL OR amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_conversation_date ON sales_conversations(conversation_date DESC);

ALTER TABLE sales_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sales conversations"
  ON sales_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales conversations"
  ON sales_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales conversations"
  ON sales_conversations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_sales_conversations_updated_at
  BEFORE UPDATE ON sales_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Cron Logs
-- ===========================================
CREATE TABLE IF NOT EXISTS cron_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cron_logs_job_name ON cron_logs(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_logs_created_at ON cron_logs(created_at DESC);

ALTER TABLE cron_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert cron logs"
  ON cron_logs FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can view cron logs"
  ON cron_logs FOR SELECT
  USING (auth.role() = 'service_role');

-- ===========================================
-- Push Subscriptions
-- ===========================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Pipeline Stage History
-- ===========================================
CREATE TABLE IF NOT EXISTS pipeline_stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  old_stage TEXT,
  new_stage TEXT NOT NULL,
  change_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_history_contact_id ON pipeline_stage_history(contact_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_history_created_at ON pipeline_stage_history(created_at DESC);

ALTER TABLE pipeline_stage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pipeline history"
  ON pipeline_stage_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pipeline history"
  ON pipeline_stage_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- Complete!
-- ===========================================
-- You should now see these tables in your Supabase database:
-- - contacts
-- - conversations
-- - notification_preferences
-- - sales_conversations
-- - cron_logs
-- - push_subscriptions
-- - pipeline_stage_history
