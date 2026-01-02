-- Push Subscriptions Table
-- Stores web push notification subscriptions for users

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one subscription per endpoint per user
  UNIQUE(user_id, endpoint)
);

-- Create index for fast lookups by user_id
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Create index for endpoint lookups (for cleanup)
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Add push_enabled column to notification_preferences if it doesn't exist
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT false;

-- Add push_enabled column to notification_preferences if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notification_preferences'
    AND column_name = 'push_daily_actions'
  ) THEN
    ALTER TABLE notification_preferences
    ADD COLUMN push_daily_actions BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notification_preferences'
    AND column_name = 'push_seven_day_alerts'
  ) THEN
    ALTER TABLE notification_preferences
    ADD COLUMN push_seven_day_alerts BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notification_preferences'
    AND column_name = 'push_consistency_reminders'
  ) THEN
    ALTER TABLE notification_preferences
    ADD COLUMN push_consistency_reminders BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notification_preferences'
    AND column_name = 'push_weekly_summary'
  ) THEN
    ALTER TABLE notification_preferences
    ADD COLUMN push_weekly_summary BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only read/write their own subscriptions
CREATE POLICY "Users can view own push subscriptions"
ON push_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push subscriptions"
ON push_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscriptions"
ON push_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
ON push_subscriptions
FOR DELETE
USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER push_subscriptions_updated_at
BEFORE UPDATE ON push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- Comments for documentation
COMMENT ON TABLE push_subscriptions IS 'Stores web push notification subscriptions for users';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'The push service endpoint URL';
COMMENT ON COLUMN push_subscriptions.keys_p256dh IS 'The P-256DH key (elliptic curve Diffie-Hellman public key)';
COMMENT ON COLUMN push_subscriptions.keys_auth IS 'The authentication secret';
COMMENT ON COLUMN push_subscriptions.user_agent IS 'Browser user agent for debugging';
COMMENT ON COLUMN notification_preferences.push_enabled IS 'Master toggle for push notifications';
COMMENT ON COLUMN notification_preferences.push_daily_actions IS 'Send daily action push notifications';
COMMENT ON COLUMN notification_preferences.push_seven_day_alerts IS 'Send 7-day rule violation push notifications';
COMMENT ON COLUMN notification_preferences.push_consistency_reminders IS 'Send consistency reminder push notifications';
COMMENT ON COLUMN notification_preferences.push_weekly_summary IS 'Send weekly summary push notifications';
