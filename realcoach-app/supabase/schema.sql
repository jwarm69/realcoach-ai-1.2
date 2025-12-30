-- ===========================================
-- RealCoach AI 1.2 - Database Schema
-- ===========================================
-- Run this in your Supabase SQL Editor to create the database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- ENUM TYPES
-- ===========================================

CREATE TYPE pipeline_stage AS ENUM (
  'Lead',
  'New Opportunity',
  'Active Opportunity',
  'Under Contract',
  'Closed'
);

CREATE TYPE motivation_level AS ENUM ('High', 'Medium', 'Low');

CREATE TYPE timeframe AS ENUM (
  'Immediate',
  '1-3 months',
  '3-6 months',
  '6+ months'
);

CREATE TYPE lead_source AS ENUM (
  'Referral',
  'Zillow',
  'Website',
  'Cold Call',
  'Open House',
  'Social Media',
  'Other'
);

CREATE TYPE touch_type AS ENUM (
  'Call',
  'Text',
  'Email',
  'Meeting',
  'Screenshot',
  'Voice Note'
);

CREATE TYPE input_type AS ENUM ('screenshot', 'voice', 'text');

CREATE TYPE action_type AS ENUM (
  'Call',
  'Text',
  'Email',
  'Send Listing',
  'Follow-up',
  'Meeting'
);

CREATE TYPE urgency_factor AS ENUM (
  'New Lead',
  '7-Day Rule',
  'Timeframe',
  'Streak Maintenance',
  'High Motivation'
);

-- ===========================================
-- CONTACTS TABLE
-- ===========================================

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Basic Info
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,

  -- Pipeline Fields
  pipeline_stage pipeline_stage DEFAULT 'Lead',
  lead_source lead_source,

  -- Behavioral Intelligence
  motivation_level motivation_level,
  timeframe timeframe,
  property_preferences JSONB DEFAULT '{}',
  budget_range TEXT,
  preapproval_status BOOLEAN DEFAULT FALSE,

  -- Activity Tracking
  last_interaction_date DATE,
  last_touch_type touch_type,
  interaction_frequency INTEGER DEFAULT 0,
  consistency_score INTEGER DEFAULT 0,

  -- Priority Scoring
  priority_score INTEGER DEFAULT 0,
  days_since_contact INTEGER DEFAULT 0,

  -- Behavioral Flags
  seven_day_rule_flag BOOLEAN DEFAULT FALSE,
  last_activity_date DATE,
  inactive_days INTEGER DEFAULT 0,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  mailchimp_synced BOOLEAN DEFAULT FALSE,

  -- Constraints
  CONSTRAINT valid_priority_score CHECK (priority_score >= 0 AND priority_score <= 100),
  CONSTRAINT valid_consistency_score CHECK (consistency_score >= 0 AND consistency_score <= 100)
);

-- Index for faster queries
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_pipeline_stage ON contacts(pipeline_stage);
CREATE INDEX idx_contacts_priority_score ON contacts(priority_score DESC);
CREATE INDEX idx_contacts_last_interaction ON contacts(last_interaction_date);
CREATE INDEX idx_contacts_seven_day_flag ON contacts(seven_day_rule_flag) WHERE seven_day_rule_flag = TRUE;

-- ===========================================
-- CONVERSATIONS TABLE
-- ===========================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,

  -- Input Method
  input_type input_type NOT NULL,
  content TEXT NOT NULL,
  raw_url TEXT,

  -- AI Analysis Results
  ai_detected_stage pipeline_stage,
  ai_stage_confidence INTEGER DEFAULT 0,
  ai_detected_motivation motivation_level,
  ai_motivation_confidence INTEGER DEFAULT 0,
  ai_detected_timeframe timeframe,
  ai_timeframe_confidence INTEGER DEFAULT 0,
  ai_extracted_entities JSONB DEFAULT '{}',
  ai_suggested_next_action TEXT,
  ai_suggested_reply TEXT,

  -- Behavioral Triggers Detected
  triggers_buying_intent BOOLEAN DEFAULT FALSE,
  triggers_selling_intent BOOLEAN DEFAULT FALSE,
  triggers_urgency BOOLEAN DEFAULT FALSE,
  triggers_specific_property BOOLEAN DEFAULT FALSE,
  triggers_preapproval BOOLEAN DEFAULT FALSE,
  triggers_showings BOOLEAN DEFAULT FALSE,
  triggers_offer_accepted BOOLEAN DEFAULT FALSE,
  triggers_closing BOOLEAN DEFAULT FALSE,

  -- User Actions
  user_confirmed_stage BOOLEAN,
  user_edited_stage pipeline_stage,
  user_edited_next_action TEXT,
  action_completed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_ai_confidence CHECK (
    ai_stage_confidence >= 0 AND ai_stage_confidence <= 100 AND
    ai_motivation_confidence >= 0 AND ai_motivation_confidence <= 100 AND
    ai_timeframe_confidence >= 0 AND ai_timeframe_confidence <= 100
  )
);

-- Index for faster queries
CREATE INDEX idx_conversations_contact_id ON conversations(contact_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

-- ===========================================
-- DAILY ACTIONS TABLE
-- ===========================================

CREATE TABLE daily_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,

  action_date DATE DEFAULT CURRENT_DATE,
  action_type action_type NOT NULL,
  priority_level INTEGER NOT NULL,
  reason TEXT NOT NULL,
  suggested_script TEXT,

  -- Behavioral Context
  urgency_factor urgency_factor,
  behavioral_rationale TEXT,

  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_priority_level CHECK (priority_level >= 1 AND priority_level <= 10)
);

-- Index for faster queries
CREATE INDEX idx_daily_actions_user_id ON daily_actions(user_id);
CREATE INDEX idx_daily_actions_date ON daily_actions(action_date);
CREATE INDEX idx_daily_actions_contact_id ON daily_actions(contact_id);
CREATE INDEX idx_daily_actions_completed ON daily_actions(completed);

-- ===========================================
-- USER STATS TABLE (for consistency tracking)
-- ===========================================

CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  date DATE DEFAULT CURRENT_DATE,
  contacts_touched INTEGER DEFAULT 0,
  daily_target INTEGER DEFAULT 5,
  streak_count INTEGER DEFAULT 0,
  consistency_score INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint for one record per user per day
  CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- Index for faster queries
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_stats_date ON user_stats(date DESC);

-- ===========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Contacts: Users can only access their own contacts
CREATE POLICY "Users can view their own contacts"
  ON contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
  ON contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON contacts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Conversations: Users can access conversations for their contacts
CREATE POLICY "Users can view conversations for their contacts"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = conversations.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert conversations for their contacts"
  ON conversations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = conversations.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update conversations for their contacts"
  ON conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = conversations.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete conversations for their contacts"
  ON conversations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = conversations.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

-- Daily Actions: Users can only access their own actions
CREATE POLICY "Users can view their own daily actions"
  ON daily_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily actions"
  ON daily_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily actions"
  ON daily_actions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily actions"
  ON daily_actions FOR DELETE
  USING (auth.uid() = user_id);

-- User Stats: Users can only access their own stats
CREATE POLICY "Users can view their own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- FUNCTIONS & TRIGGERS
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for contacts table
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate days since contact
CREATE OR REPLACE FUNCTION calculate_days_since_contact()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_interaction_date IS NOT NULL THEN
    NEW.days_since_contact = CURRENT_DATE - NEW.last_interaction_date;
    NEW.seven_day_rule_flag = NEW.days_since_contact >= 7;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate days since contact
CREATE TRIGGER calculate_contact_days
  BEFORE INSERT OR UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION calculate_days_since_contact();

-- ===========================================
-- STORAGE BUCKET FOR SCREENSHOTS
-- ===========================================

-- Note: Run this in the Supabase Dashboard under Storage
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('screenshots', 'screenshots', false);

-- CREATE POLICY "Users can upload their own screenshots"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view their own screenshots"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
