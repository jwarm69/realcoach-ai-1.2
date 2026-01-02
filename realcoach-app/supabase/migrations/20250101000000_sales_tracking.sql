-- ===========================================
-- RealCoach AI 1.2 - Sales Tracking Migration
-- ===========================================
-- Adds sales_conversations table for tracking
-- the 4 Conversations: appointments, listings, closings, GCI

-- Create sales_conversations table
CREATE TABLE sales_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

  conversation_type TEXT NOT NULL CHECK (conversation_type IN ('appointment', 'listing', 'closing', 'gci')),
  amount DECIMAL(12,2),
  conversation_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_amount CHECK (amount IS NULL OR amount >= 0)
);

-- Indexes for performance
CREATE INDEX idx_sales_user_id ON sales_conversations(user_id);
CREATE INDEX idx_sales_contact_id ON sales_conversations(contact_id);
CREATE INDEX idx_sales_conversation_date ON sales_conversations(conversation_date DESC);
CREATE INDEX idx_sales_conversation_type ON sales_conversations(conversation_type);
CREATE INDEX idx_sales_user_date_type ON sales_conversations(user_id, conversation_date DESC, conversation_type);

-- Enable RLS
ALTER TABLE sales_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

CREATE POLICY "Users can delete their own sales conversations"
  ON sales_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_sales_conversations_updated_at
  BEFORE UPDATE ON sales_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add Mailchimp fields to contacts table
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS mailchimp_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS mailchimp_subscriber_id TEXT,
  ADD COLUMN IF NOT EXISTS mailchimp_sync_error TEXT;

-- Create index for mailchimp sync operations
CREATE INDEX IF NOT EXISTS idx_contacts_mailchimp_synced
  ON contacts(mailchimp_synced_at)
  WHERE mailchimp_synced_at IS NOT NULL;
