// ===========================================
// RealCoach AI 1.2 - Database Types
// ===========================================
// These types match the Supabase database schema

export type PipelineStage =
  | 'Lead'
  | 'New Opportunity'
  | 'Active Opportunity'
  | 'Under Contract'
  | 'Closed';

export type MotivationLevel = 'High' | 'Medium' | 'Low';

export type Timeframe =
  | 'Immediate'
  | '1-3 months'
  | '3-6 months'
  | '6+ months';

export type LeadSource =
  | 'Referral'
  | 'Zillow'
  | 'Website'
  | 'Cold Call'
  | 'Open House'
  | 'Social Media'
  | 'Other';

export type TouchType =
  | 'Call'
  | 'Text'
  | 'Email'
  | 'Meeting'
  | 'Screenshot'
  | 'Voice Note';

export type InputType = 'screenshot' | 'voice' | 'text';

export type ActionType =
  | 'Call'
  | 'Text'
  | 'Email'
  | 'Send Listing'
  | 'Follow-up'
  | 'Meeting';

export type UrgencyFactor =
  | 'New Lead'
  | '7-Day Rule'
  | 'Timeframe'
  | 'Streak Maintenance'
  | 'High Motivation';

export interface PropertyPreferences {
  location?: string;
  priceRange?: string;
  propertyType?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  features?: string[];
}

export interface ExtractedEntities {
  properties?: string[];
  prices?: string[];
  dates?: string[];
  addresses?: string[];
  names?: string[];
}

// Database Tables
export interface Database {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          pipeline_stage: PipelineStage;
          lead_source: LeadSource | null;
          motivation_level: MotivationLevel | null;
          timeframe: Timeframe | null;
          property_preferences: PropertyPreferences | null;
          budget_range: string | null;
          preapproval_status: boolean;
          last_interaction_date: string | null;
          last_touch_type: TouchType | null;
          interaction_frequency: number;
          consistency_score: number;
          priority_score: number;
          days_since_contact: number;
          seven_day_rule_flag: boolean;
          last_activity_date: string | null;
          inactive_days: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
          mailchimp_synced: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          pipeline_stage?: PipelineStage;
          lead_source?: LeadSource | null;
          motivation_level?: MotivationLevel | null;
          timeframe?: Timeframe | null;
          property_preferences?: PropertyPreferences | null;
          budget_range?: string | null;
          preapproval_status?: boolean;
          last_interaction_date?: string | null;
          last_touch_type?: TouchType | null;
          interaction_frequency?: number;
          consistency_score?: number;
          priority_score?: number;
          days_since_contact?: number;
          seven_day_rule_flag?: boolean;
          last_activity_date?: string | null;
          inactive_days?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          mailchimp_synced?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          pipeline_stage?: PipelineStage;
          lead_source?: LeadSource | null;
          motivation_level?: MotivationLevel | null;
          timeframe?: Timeframe | null;
          property_preferences?: PropertyPreferences | null;
          budget_range?: string | null;
          preapproval_status?: boolean;
          last_interaction_date?: string | null;
          last_touch_type?: TouchType | null;
          interaction_frequency?: number;
          consistency_score?: number;
          priority_score?: number;
          days_since_contact?: number;
          seven_day_rule_flag?: boolean;
          last_activity_date?: string | null;
          inactive_days?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          mailchimp_synced?: boolean;
        };
      };
      conversations: {
        Row: {
          id: string;
          contact_id: string;
          input_type: InputType;
          content: string;
          raw_url: string | null;
          ai_detected_stage: PipelineStage | null;
          ai_stage_confidence: number;
          ai_detected_motivation: MotivationLevel | null;
          ai_motivation_confidence: number;
          ai_detected_timeframe: Timeframe | null;
          ai_timeframe_confidence: number;
          ai_extracted_entities: ExtractedEntities | null;
          ai_suggested_next_action: string | null;
          ai_suggested_reply: string | null;
          triggers_buying_intent: boolean;
          triggers_selling_intent: boolean;
          triggers_urgency: boolean;
          triggers_specific_property: boolean;
          triggers_preapproval: boolean;
          triggers_showings: boolean;
          triggers_offer_accepted: boolean;
          triggers_closing: boolean;
          user_confirmed_stage: boolean | null;
          user_edited_stage: PipelineStage | null;
          user_edited_next_action: string | null;
          action_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          contact_id: string;
          input_type: InputType;
          content: string;
          raw_url?: string | null;
          ai_detected_stage?: PipelineStage | null;
          ai_stage_confidence?: number;
          ai_detected_motivation?: MotivationLevel | null;
          ai_motivation_confidence?: number;
          ai_detected_timeframe?: Timeframe | null;
          ai_timeframe_confidence?: number;
          ai_extracted_entities?: ExtractedEntities | null;
          ai_suggested_next_action?: string | null;
          ai_suggested_reply?: string | null;
          triggers_buying_intent?: boolean;
          triggers_selling_intent?: boolean;
          triggers_urgency?: boolean;
          triggers_specific_property?: boolean;
          triggers_preapproval?: boolean;
          triggers_showings?: boolean;
          triggers_offer_accepted?: boolean;
          triggers_closing?: boolean;
          user_confirmed_stage?: boolean | null;
          user_edited_stage?: PipelineStage | null;
          user_edited_next_action?: string | null;
          action_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string;
          input_type?: InputType;
          content?: string;
          raw_url?: string | null;
          ai_detected_stage?: PipelineStage | null;
          ai_stage_confidence?: number;
          ai_detected_motivation?: MotivationLevel | null;
          ai_motivation_confidence?: number;
          ai_detected_timeframe?: Timeframe | null;
          ai_timeframe_confidence?: number;
          ai_extracted_entities?: ExtractedEntities | null;
          ai_suggested_next_action?: string | null;
          ai_suggested_reply?: string | null;
          triggers_buying_intent?: boolean;
          triggers_selling_intent?: boolean;
          triggers_urgency?: boolean;
          triggers_specific_property?: boolean;
          triggers_preapproval?: boolean;
          triggers_showings?: boolean;
          triggers_offer_accepted?: boolean;
          triggers_closing?: boolean;
          user_confirmed_stage?: boolean | null;
          user_edited_stage?: PipelineStage | null;
          user_edited_next_action?: string | null;
          action_completed?: boolean;
          created_at?: string;
        };
      };
      daily_actions: {
        Row: {
          id: string;
          user_id: string;
          contact_id: string;
          action_date: string;
          action_type: ActionType;
          priority_level: number;
          reason: string;
          suggested_script: string | null;
          urgency_factor: UrgencyFactor | null;
          behavioral_rationale: string | null;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          contact_id: string;
          action_date?: string;
          action_type: ActionType;
          priority_level: number;
          reason: string;
          suggested_script?: string | null;
          urgency_factor?: UrgencyFactor | null;
          behavioral_rationale?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          contact_id?: string;
          action_date?: string;
          action_type?: ActionType;
          priority_level?: number;
          reason?: string;
          suggested_script?: string | null;
          urgency_factor?: UrgencyFactor | null;
          behavioral_rationale?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          contacts_touched: number;
          daily_target: number;
          streak_count: number;
          consistency_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          contacts_touched?: number;
          daily_target?: number;
          streak_count?: number;
          consistency_score?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          contacts_touched?: number;
          daily_target?: number;
          streak_count?: number;
          consistency_score?: number;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      pipeline_stage: PipelineStage;
      motivation_level: MotivationLevel;
      timeframe: Timeframe;
      lead_source: LeadSource;
      touch_type: TouchType;
      input_type: InputType;
      action_type: ActionType;
      urgency_factor: UrgencyFactor;
    };
  };
}

// Helper types for easier usage
export type Contact = Database['public']['Tables']['contacts']['Row'];
export type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
export type ContactUpdate = Database['public']['Tables']['contacts']['Update'];

export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update'];

export type DailyAction = Database['public']['Tables']['daily_actions']['Row'];
export type DailyActionInsert = Database['public']['Tables']['daily_actions']['Insert'];
export type DailyActionUpdate = Database['public']['Tables']['daily_actions']['Update'];

export type UserStats = Database['public']['Tables']['user_stats']['Row'];
export type UserStatsInsert = Database['public']['Tables']['user_stats']['Insert'];
export type UserStatsUpdate = Database['public']['Tables']['user_stats']['Update'];
