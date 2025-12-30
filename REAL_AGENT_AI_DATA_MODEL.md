# Real Agent AI - Data Model Specification

## Overview

This document provides a comprehensive specification of the RealCoach.ai data model, including all tables, fields, relationships, constraints, and indexes.

---

## Database Schema

### Primary Tables

#### 1. contacts

**Purpose**: Store all contact information and behavioral intelligence

```sql
CREATE TABLE contacts (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Information
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT UNIQUE,
  address TEXT,

  -- Pipeline Fields
  pipeline_stage TEXT NOT NULL DEFAULT 'Lead' CHECK (pipeline_stage IN ('Lead', 'New Opportunity', 'Active Opportunity', 'Under Contract', 'Closed')),
  lead_source TEXT CHECK (lead_source IN ('Referral', 'Zillow', 'Website', 'Cold Call', 'Open House', 'Social Media', 'Other')),

  -- Behavioral Intelligence
  motivation_level TEXT CHECK (motivation_level IN ('High', 'Medium', 'Low')),
  timeframe TEXT CHECK (timeframe IN ('Immediate', '1-3 months', '3-6 months', '6+ months')),
  property_preferences JSONB DEFAULT '{}',
  budget_range TEXT,
  preapproval_status BOOLEAN DEFAULT FALSE,

  -- Activity Tracking
  last_interaction_date DATE,
  last_touch_type TEXT CHECK (last_touch_type IN ('Call', 'Text', 'Email', 'Meeting', 'Screenshot', 'Voice')),
  interaction_frequency INTEGER DEFAULT 0, -- Days between contacts
  consistency_score INTEGER DEFAULT 0 CHECK (consistency_score BETWEEN 0 AND 100),

  -- Priority Scoring
  priority_score INTEGER DEFAULT 0 CHECK (priority_score BETWEEN 0 AND 100),
  days_since_contact INTEGER DEFAULT 0,

  -- Behavioral Flags
  seven_day_rule_flag BOOLEAN DEFAULT FALSE,
  last_activity_date DATE,
  inactive_days INTEGER DEFAULT 0,

  -- Metadata
  notes TEXT,
  mailchimp_synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_pipeline_stage ON contacts(pipeline_stage);
CREATE INDEX idx_contacts_priority_score ON contacts(priority_score DESC);
CREATE INDEX idx_contacts_last_interaction ON contacts(last_interaction_date);
CREATE INDEX idx_contacts_email ON contacts(email);

-- Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contacts" ON contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts" ON contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" ON contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" ON contacts
  FOR DELETE USING (auth.uid() = user_id);
```

#### 2. conversations

**Purpose**: Store all conversation data and AI analysis results

```sql
CREATE TABLE conversations (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

  -- Input Method
  input_type TEXT NOT NULL CHECK (input_type IN ('screenshot', 'voice', 'text')),
  content TEXT NOT NULL,
  raw_url TEXT, -- Screenshot image URL or voice recording URL

  -- AI Analysis Results
  ai_detected_stage TEXT CHECK (ai_detected_stage IN ('Lead', 'New Opportunity', 'Active Opportunity', 'Under Contract', 'Closed')),
  ai_stage_confidence INTEGER DEFAULT 0 CHECK (ai_stage_confidence BETWEEN 0 AND 100),
  ai_detected_motivation TEXT CHECK (ai_detected_motivation IN ('High', 'Medium', 'Low')),
  ai_motivation_confidence INTEGER DEFAULT 0 CHECK (ai_motivation_confidence BETWEEN 0 AND 100),
  ai_detected_timeframe TEXT CHECK (ai_detected_timeframe IN ('Immediate', '1-3 months', '3-6 months', '6+ months')),
  ai_timeframe_confidence INTEGER DEFAULT 0 CHECK (ai_timeframe_confidence BETWEEN 0 AND 100),
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
  user_confirmed_stage BOOLEAN DEFAULT FALSE,
  user_edited_stage TEXT,
  user_edited_next_action TEXT,
  action_completed BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_contact_id ON conversations(contact_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_input_type ON conversations(input_type);
CREATE INDEX idx_conversations_ai_detected_stage ON conversations(ai_detected_stage);

-- Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations for their contacts" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = conversations.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert conversations for their contacts" ON conversations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = conversations.contact_id
      AND contacts.user_id = auth.uid()
    )
  );
```

#### 3. daily_actions

**Purpose**: Store daily action recommendations for users

```sql
CREATE TABLE daily_actions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

  -- Action Details
  action_date DATE NOT NULL DEFAULT CURRENT_DATE,
  action_type TEXT NOT NULL CHECK (action_type IN ('Call', 'Text', 'Email', 'Send Listing', 'Follow-up', 'Meeting')),
  priority_level INTEGER NOT NULL CHECK (priority_level BETWEEN 1 AND 10),
  reason TEXT NOT NULL,
  suggested_script TEXT NOT NULL,

  -- Behavioral Context
  urgency_factor TEXT CHECK (urgency_factor IN ('New Lead', '7-Day Rule', 'Timeframe', 'Streak Maintenance', 'Normal')),
  behavioral_rationale TEXT,

  -- Completion Status
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_daily_actions_user_id ON daily_actions(user_id);
CREATE INDEX idx_daily_actions_contact_id ON daily_actions(contact_id);
CREATE INDEX idx_daily_actions_action_date ON daily_actions(action_date);
CREATE INDEX idx_daily_actions_priority_level ON daily_actions(priority_level DESC);
CREATE INDEX idx_daily_actions_completed ON daily_actions(completed);

-- Compound index for efficient querying
CREATE INDEX idx_daily_actions_user_date_priority ON daily_actions(user_id, action_date, priority_level DESC);

-- Row Level Security
ALTER TABLE daily_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily actions" ON daily_actions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily actions" ON daily_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily actions" ON daily_actions
  FOR UPDATE USING (auth.uid() = user_id);
```

---

### Supporting Tables

#### 4. activity_logs

**Purpose**: Track all user activities for analytics and consistency scoring

```sql
CREATE TABLE activity_logs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

  -- Activity Details
  activity_type TEXT NOT NULL CHECK (activity_type IN ('Call', 'Text', 'Email', 'Meeting', 'Screenshot', 'Voice')),
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_contact_id ON activity_logs(contact_id);
CREATE INDEX idx_activity_logs_activity_date ON activity_logs(activity_date);
CREATE INDEX idx_activity_logs_user_date ON activity_logs(user_id, activity_date);

-- Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity logs" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs" ON activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### 5. pipeline_history

**Purpose**: Track pipeline stage changes over time

```sql
CREATE TABLE pipeline_history (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stage Change Details
  from_stage TEXT NOT NULL,
  to_stage TEXT NOT NULL,
  change_reason TEXT,
  change_source TEXT CHECK (change_source IN ('AI', 'User', 'System')),
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),

  -- Metadata
  changed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pipeline_history_contact_id ON pipeline_history(contact_id);
CREATE INDEX idx_pipeline_history_user_id ON pipeline_history(user_id);
CREATE INDEX idx_pipeline_history_changed_at ON pipeline_history(changed_at DESC);

-- Row Level Security
ALTER TABLE pipeline_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pipeline history for their contacts" ON pipeline_history
  FOR SELECT USING (auth.uid() = user_id);
```

#### 6. mailchimp_sync_logs

**Purpose**: Track Mailchimp synchronization activities

```sql
CREATE TABLE mailchimp_sync_logs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

  -- Sync Details
  sync_type TEXT NOT NULL CHECK (sync_type IN ('create', 'update', 'delete', 'error')),
  sync_status TEXT NOT NULL CHECK (sync_status IN ('success', 'failed', 'pending')),
  mailchimp_id TEXT,
  error_message TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mailchimp_sync_logs_user_id ON mailchimp_sync_logs(user_id);
CREATE INDEX idx_mailchimp_sync_logs_contact_id ON mailchimp_sync_logs(contact_id);
CREATE INDEX idx_mailchimp_sync_logs_created_at ON mailchimp_sync_logs(created_at DESC);

-- Row Level Security
ALTER TABLE mailchimp_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mailchimp sync logs" ON mailchimp_sync_logs
  FOR SELECT USING (auth.uid() = user_id);
```

---

## TypeScript Types

### Contact Type

```typescript
interface Contact {
  id: string;
  user_id: string;

  // Basic Information
  name: string;
  phone?: string;
  email?: string;
  address?: string;

  // Pipeline Fields
  pipeline_stage: 'Lead' | 'New Opportunity' | 'Active Opportunity' | 'Under Contract' | 'Closed';
  lead_source?: 'Referral' | 'Zillow' | 'Website' | 'Cold Call' | 'Open House' | 'Social Media' | 'Other';

  // Behavioral Intelligence
  motivation_level?: 'High' | 'Medium' | 'Low';
  timeframe?: 'Immediate' | '1-3 months' | '3-6 months' | '6+ months';
  property_preferences: PropertyPreferences;
  budget_range?: string;
  preapproval_status: boolean;

  // Activity Tracking
  last_interaction_date?: Date;
  last_touch_type?: 'Call' | 'Text' | 'Email' | 'Meeting' | 'Screenshot' | 'Voice';
  interaction_frequency: number;
  consistency_score: number;

  // Priority Scoring
  priority_score: number;
  days_since_contact: number;

  // Behavioral Flags
  seven_day_rule_flag: boolean;
  last_activity_date?: Date;
  inactive_days: number;

  // Metadata
  notes?: string;
  mailchimp_synced: boolean;
  created_at: Date;
  updated_at: Date;
}

interface PropertyPreferences {
  location?: string;
  price_range?: string;
  property_type?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  features?: string[];
}
```

### Conversation Type

```typescript
interface Conversation {
  id: string;
  contact_id: string;

  // Input Method
  input_type: 'screenshot' | 'voice' | 'text';
  content: string;
  raw_url?: string;

  // AI Analysis Results
  ai_detected_stage?: 'Lead' | 'New Opportunity' | 'Active Opportunity' | 'Under Contract' | 'Closed';
  ai_stage_confidence: number;
  ai_detected_motivation?: 'High' | 'Medium' | 'Low';
  ai_motivation_confidence: number;
  ai_detected_timeframe?: 'Immediate' | '1-3 months' | '3-6 months' | '6+ months';
  ai_timeframe_confidence: number;
  ai_extracted_entities: ExtractedEntities;
  ai_suggested_next_action?: string;
  ai_suggested_reply?: string;

  // Behavioral Triggers Detected
  triggers_buying_intent: boolean;
  triggers_selling_intent: boolean;
  triggers_urgency: boolean;
  triggers_specific_property: boolean;
  triggers_preapproval: boolean;
  triggers_showings: boolean;
  triggers_offer_accepted: boolean;
  triggers_closing: boolean;

  // User Actions
  user_confirmed_stage: boolean;
  user_edited_stage?: string;
  user_edited_next_action?: string;
  action_completed: boolean;

  // Metadata
  created_at: Date;
}

interface ExtractedEntities {
  properties?: string[];
  prices?: string[];
  dates?: string[];
  addresses?: string[];
  names?: string[];
  phone_numbers?: string[];
  emails?: string[];
}
```

### Daily Action Type

```typescript
interface DailyAction {
  id: string;
  user_id: string;
  contact_id: string;

  // Action Details
  action_date: Date;
  action_type: 'Call' | 'Text' | 'Email' | 'Send Listing' | 'Follow-up' | 'Meeting';
  priority_level: number;
  reason: string;
  suggested_script: string;

  // Behavioral Context
  urgency_factor?: 'New Lead' | '7-Day Rule' | 'Timeframe' | 'Streak Maintenance' | 'Normal';
  behavioral_rationale?: string;

  // Completion Status
  completed: boolean;
  completed_at?: Date;

  // Metadata
  created_at: Date;
}
```

---

## Database Functions

### Calculate Days Since Contact

```sql
CREATE OR REPLACE FUNCTION calculate_days_since_contact()
RETURNS TRIGGER AS $$
BEGIN
  NEW.days_since_contact := EXTRACT(DAY FROM (CURRENT_DATE - NEW.last_interaction_date));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_days_since_contact
  BEFORE INSERT OR UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION calculate_days_since_contact();
```

### Update Consistency Score

```sql
CREATE OR REPLACE FUNCTION update_consistency_score(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  last_7_days DATE[];
  daily_counts INTEGER[];
  total_contacts INTEGER := 0;
  daily_target INTEGER := 5;
  target_total INTEGER := 35;
  base_score INTEGER := 0;
  streak INTEGER := 0;
  zero_days INTEGER := 0;
  final_score INTEGER := 0;
  current_date DATE := CURRENT_DATE;
  day_count INTEGER;
BEGIN
  -- Get last 7 days
  FOR i IN 0..6 LOOP
    last_7_days[i] := current_date - i;
  END LOOP;

  -- Count activities for each day
  FOR i IN 0..6 LOOP
    SELECT COUNT(*)
    INTO day_count
    FROM activity_logs
    WHERE user_id = user_id_param
    AND activity_date = last_7_days[i];

    daily_counts[i] := day_count;
    total_contacts := total_contacts + day_count;

    IF day_count = 0 THEN
      zero_days := zero_days + 1;
    END IF;
  END LOOP;

  -- Calculate base score
  base_score := LEAST((total_contacts::FLOAT / target_total) * 100, 100);

  -- Calculate streak
  current_date := CURRENT_DATE;
  WHILE TRUE LOOP
    SELECT COUNT(*)
    INTO day_count
    FROM activity_logs
    WHERE user_id = user_id_param
    AND activity_date = current_date;

    IF day_count >= 5 THEN
      streak := streak + 1;
      current_date := current_date - 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;

  -- Apply streak bonus
  IF streak >= 7 THEN
    base_score := base_score + 15;
  ELSIF streak >= 5 THEN
    base_score := base_score + 10;
  ELSIF streak >= 3 THEN
    base_score := base_score + 5;
  END IF;

  -- Apply zero-day penalty
  base_score := base_score - (zero_days * 5);

  -- Ensure score is between 0 and 100
  final_score := GREATEST(LEAST(base_score, 100), 0);

  -- Update contacts with new score
  UPDATE contacts
  SET consistency_score = final_score
  WHERE user_id = user_id_param;

  RETURN final_score;
END;
$$ LANGUAGE plpgsql;
```

### Check 7-Day Rule

```sql
CREATE OR REPLACE FUNCTION check_seven_day_rule()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pipeline_stage = 'Active Opportunity' THEN
    IF NEW.last_activity_date IS NULL OR
       EXTRACT(DAY FROM (CURRENT_DATE - NEW.last_activity_date)) > 7 THEN
      NEW.seven_day_rule_flag := TRUE;
      NEW.inactive_days := EXTRACT(DAY FROM (CURRENT_DATE - COALESCE(NEW.last_activity_date, CURRENT_DATE)));
    ELSE
      NEW.seven_day_rule_flag := FALSE;
      NEW.inactive_days := 0;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_seven_day_rule_trigger
  BEFORE INSERT OR UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION check_seven_day_rule();
```

---

## Data Validation Rules

### Email Validation

```typescript
const emailSchema = z.string().email('Invalid email address');
```

### Phone Validation

```typescript
const phoneSchema = z.string().regex(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/, 'Invalid phone number');
```

### Pipeline Stage Validation

```typescript
const pipelineStageSchema = z.enum(['Lead', 'New Opportunity', 'Active Opportunity', 'Under Contract', 'Closed']);
```

### Motivation Level Validation

```typescript
const motivationLevelSchema = z.enum(['High', 'Medium', 'Low']);
```

---

## Migration Strategy

### Initial Setup

1. Run schema creation scripts in order
2. Enable Row Level Security (RLS)
3. Create triggers and functions
4. Set up indexes
5. Insert seed data if needed

### Version Control

- Use Supabase migration files
- Version all schema changes
- Maintain rollback procedures
- Test migrations in staging first

---

## Backup and Recovery

### Backup Strategy

- Daily automated backups (Supabase)
- Point-in-time recovery (7 days)
- Export to external storage weekly

### Recovery Procedures

1. Identify the point of failure
2. Restore from backup
3. Replay transaction logs if needed
4. Verify data integrity
5. Update application if schema changed

---

*This data model specification provides complete details for implementing the RealCoach.ai database.*
