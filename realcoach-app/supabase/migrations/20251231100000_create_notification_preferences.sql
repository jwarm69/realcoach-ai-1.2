-- Migration: Create notification_preferences table
-- Created: December 31, 2025

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Daily Actions Notifications
  daily_actions_enabled BOOLEAN DEFAULT TRUE,
  daily_actions_time TIME DEFAULT '06:00',

  -- 7-Day Rule Alerts
  seven_day_alerts_enabled BOOLEAN DEFAULT TRUE,

  -- Consistency Reminders
  consistency_reminders_enabled BOOLEAN DEFAULT TRUE,
  consistency_reminder_time TIME DEFAULT '17:00',

  -- Weekly Summary
  weekly_summary_enabled BOOLEAN DEFAULT TRUE,
  weekly_summary_day INTEGER DEFAULT 1, -- 1 = Monday

  -- Notification Settings
  notification_method TEXT DEFAULT 'email', -- 'email', 'push', 'sms', 'none'
  timezone TEXT DEFAULT 'America/New_York',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_notification_method CHECK (notification_method IN ('email', 'push', 'sms', 'none')),
  CONSTRAINT valid_weekly_day CHECK (weekly_day >= 1 AND weekly_day <= 7)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Create default preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Add comments
COMMENT ON TABLE notification_preferences IS 'User preferences for notifications and alerts';
COMMENT ON COLUMN notification_preferences.daily_actions_enabled IS 'Enable daily priority actions email at 6 AM';
COMMENT ON COLUMN notification_preferences.seven_day_alerts_enabled IS 'Enable immediate alerts for 7-day rule violations';
COMMENT ON COLUMN notification_preferences.consistency_reminders_enabled IS 'Enable daily consistency goal reminder at 5 PM';
COMMENT ON COLUMN notification_preferences.weekly_summary_enabled IS 'Enable weekly summary email on Monday morning';
