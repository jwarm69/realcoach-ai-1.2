# Real Agent AI (RealCoach.ai) - Complete Build Plan

## 🎯 Executive Summary

**Objective**: Build AI-powered real estate contact management with behavioral intelligence

**Timeline**: 13 weeks (4 phases)  
**Current Status**: Phase 1 (Weeks 1-3) ✅ completed; Phase 2 (Week 4) starting

**Tech Stack**:
- Next.js 14 (App Router)
- Supabase (PostgreSQL + Auth)
- Tesseract.js (OCR for computer-generated text)
- OpenAI GPT-4o (conversation analysis)
- shadcn/ui + Tailwind CSS
- Mailchimp API v3
- Vercel (deployment)

**Key Differentiator**: Deep behavioral pattern recognition with actionable intelligence

---

## 🧠 BEHAVIOR ENGINE ARCHITECTURE

### Core Behavioral Systems

#### 1. Pipeline Progression Engine
Hardcoded business rules + AI pattern detection for stage transitions

#### 2. Conversation Analysis System
Multi-pattern detection with confidence scoring for intent/motivation/property preferences

#### 3. Daily Priority Algorithm
Multi-factor scoring (0-100) ranking contacts by urgency & opportunity

#### 4. Consistency Tracking System
Gamified 5-contacts/day goal with streaks & visual feedback

#### 5. Next Action Recommendation
Stage-specific logic with scripts & "why it matters" context

#### 6. Reply Draft Generation
AI-powered response suggestions based on conversation context

#### 7. Activity Monitoring System
7-day rule enforcement with inactivity alerts

#### 8. Manual Override System
User control over all AI decisions with confidence thresholds

---

## 📊 Enhanced Data Model

### Contacts Table
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),

  -- Basic Info
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT UNIQUE,
  address TEXT,

  -- Pipeline Fields
  pipeline_stage TEXT DEFAULT 'Lead', -- 'Lead', 'New Opportunity', 'Active Opportunity', 'Under Contract', 'Closed'
  lead_source TEXT, -- 'Referral', 'Zillow', 'Website', 'Cold Call', 'Open House', etc.

  -- Behavioral Intelligence
  motivation_level TEXT, -- 'High', 'Medium', 'Low'
  timeframe TEXT, -- 'Immediate', '1-3 months', '3-6 months', '6+ months'
  property_preferences JSONB, -- {location, price_range, property_type, beds, baths}
  budget_range TEXT,
  preapproval_status BOOLEAN DEFAULT FALSE,

  -- Activity Tracking
  last_interaction_date DATE,
  last_touch_type TEXT, -- 'Call', 'Text', 'Email', 'Meeting', 'Screenshot'
  interaction_frequency INTEGER DEFAULT 0, -- Days between contacts
  consistency_score INTEGER DEFAULT 0, -- 0-100 scale

  -- Priority Scoring
  priority_score INTEGER DEFAULT 0, -- Calculated daily 0-100
  days_since_contact INTEGER DEFAULT 0,

  -- Behavioral Flags
  seven_day_rule_flag BOOLEAN DEFAULT FALSE,
  last_activity_date DATE,
  inactive_days INTEGER DEFAULT 0,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  mailchimp_synced BOOLEAN DEFAULT FALSE
);
```

### Conversations Table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,

  -- Input Method
  input_type TEXT, -- 'screenshot', 'voice', 'text'
  content TEXT, -- Transcribed text or OCR text
  raw_url TEXT, -- Screenshot image URL or voice recording URL

  -- AI Analysis Results
  ai_detected_stage TEXT,
  ai_stage_confidence INTEGER DEFAULT 0, -- 0-100
  ai_detected_motivation TEXT,
  ai_motivation_confidence INTEGER DEFAULT 0,
  ai_detected_timeframe TEXT,
  ai_timeframe_confidence INTEGER DEFAULT 0,
  ai_extracted_entities JSONB, -- {properties, prices, dates, addresses}
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
  user_edited_stage TEXT,
  user_edited_next_action TEXT,
  action_completed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW()
);
```

### Daily Actions Table
```sql
CREATE TABLE daily_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  contact_id UUID REFERENCES contacts(id),

  action_date DATE DEFAULT CURRENT_DATE,
  action_type TEXT, -- 'Call', 'Text', 'Email', 'Send Listing', 'Follow-up'
  priority_level INTEGER, -- 1-10
  reason TEXT, -- 'Why it matters today'
  suggested_script TEXT,

  -- Behavioral Context
  urgency_factor TEXT, -- 'New Lead', '7-Day Rule', 'Timeframe', 'Streak Maintenance'
  behavioral_rationale TEXT,

  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Phase 1: Foundation (Weeks 1-3) — ✅ Completed

### Week 1: Setup & Authentication — ✅ Done

**Deliverables:**
- Next.js 14 project setup with App Router
- Supabase project creation + configuration
- User authentication (email/password + Google OAuth)
- Database schema implementation
- Basic UI shell with navigation

**Technical Tasks:**
```bash
# Project setup
npx create-next-app@latest realcoach --typescript --tailwind --app
cd realcoach
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install tesseract.js

# UI components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label select textarea
npx shadcn-ui@latest add dropdown-menu navigation-menu avatar badge
```

**Database Migration:**
```sql
-- Run schema migrations for contacts, conversations, daily_actions
-- Set up Row Level Security (RLS) policies
```

---

### Week 2: Contact Management Core — ✅ Done

**Deliverables:**
- Contact list page with filtering/sorting
- Contact detail page (full profile)
- Contact create/edit forms
- Pipeline stage management (5 stages)
- Basic search functionality

**Key Components:**
```
/app/contacts/page.tsx          # Contact list with filters
/app/contacts/[id]/page.tsx     # Contact detail view
/components/contacts/ContactCard.tsx
/components/contacts/ContactForm.tsx
/components/contacts/PipelineBadge.tsx
/lib/contacts.ts                # Contact CRUD operations
```

---

### Week 3: Behavioral Data Infrastructure — ✅ Done

**Deliverables:**
- Lead source tracking
- Motivation level selector
- Timeframe selector
- Property preferences form
- Budget/pre-approval status
- Activity timeline display

**Enhanced Form Fields:**
```typescript
interface ContactForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  leadSource: 'Referral' | 'Zillow' | 'Website' | 'Cold Call' | 'Open House' | 'Other';
  motivationLevel: 'High' | 'Medium' | 'Low';
  timeframe: 'Immediate' | '1-3 months' | '3-6 months' | '6+ months';
  propertyPreferences: {
    location: string;
    priceRange: string;
    propertyType: string;
    beds: number;
    baths: number;
  };
  budgetRange: string;
  preapprovalStatus: boolean;
  notes: string;
}
```

---

## 🤖 Phase 2: Contact Intelligence (Weeks 4-6) — 🔜 Starting

### Week 4: Contact Import Systems

**Deliverables:**
- CSV upload with parsing
- Google Contacts API integration
- iPhone Contacts integration (CardDAV)
- Import wizard UI
- Duplicate detection & merging

**CSV Upload Implementation:**
```typescript
// /components/contacts/CSVImport.tsx
import Papa from 'papaparse';

const handleCSVUpload = (file: File) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      const contacts = results.data;
      await importContacts(contacts);
    }
  });
};
```

---

### Week 5: Screenshot Upload & OCR

**Deliverables:**
- Screenshot upload UI (drag & drop)
- Image preprocessing
- Tesseract.js OCR text extraction (computer-generated text only)
- Text cleaning & formatting
- Conversation storage

**Screenshot Analysis Pipeline:**
```typescript
// /lib/ocr/screenshot-analysis.ts
import Tesseract from 'tesseract.js';
import OpenAI from 'openai';

export const analyzeScreenshot = async (imageUrl: string) => {
  // Step 1: Extract text using Tesseract.js
  const worker = await Tesseract.createWorker('eng', 1, {
    logger: m => console.log(m)
  });

  const { data: { text } } = await worker.recognize(imageUrl);
  await worker.terminate();

  // Step 2: Clean OCR text
  const cleanedText = cleanOCRText(text);

  // Step 3: Analyze with GPT-4o
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const analysis = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "system",
      content: `Analyze this real estate conversation and extract:
        1. Pipeline stage (Lead, New Opportunity, Active Opportunity, Under Contract, Closed)
        2. Motivation level (High, Medium, Low)
        3. Timeframe (Immediate, 1-3 months, 3-6 months, 6+ months)
        4. Property preferences
        5. Budget/pre-approval status
        6. Next suggested action
        7. Suggested reply draft

        Return ONLY valid JSON.`
    },
    {
      role: "user",
      content: cleanedText
    }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(analysis.choices[0].message.content);
};

const cleanOCRText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/(\r\n|\n|\r)/gm, ' ')
    .trim();
};
```

---

### Week 6: Voice & Text Input

**Deliverables:**
- Voice recording UI (Web Speech API)
- Text input form for conversations
- Transcription processing
- Unified AI analysis pipeline

**Voice Input Implementation:**
```typescript
// /components/inputs/VoiceInput.tsx
const VoiceInput = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startRecording = async () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript);
    };

    recognition.start();
    setIsRecording(true);
  };

  return (
    <div>
      <button onClick={startRecording}>
        {isRecording ? '🎤 Recording...' : '🎤 Start Recording'}
      </button>
      <p>{transcript}</p>
    </div>
  );
};
```

---

## 🧠 Phase 3: AI Pipeline Engine (Weeks 7-10)

### Week 7: Pipeline Progression Rules Engine

**Deliverables:**
- Hardcoded business rules for stage transitions
- 7-day activity monitoring system
- Conversation pattern detection
- Manual override capabilities
- Stage change history tracking

**Pipeline Progression Logic:**
```typescript
// /lib/pipeline/progression-engine.ts

interface PipelineAnalysis {
  currentStage: PipelineStage;
  hasTimeframe: boolean;
  hasSpecificProperty: boolean;
  motivation: 'High' | 'Medium' | 'Low';
  hasHomeShowings: boolean;
  daysSinceLastActivity: number;
  offerAccepted: boolean;
  closingCompleted: boolean;
}

export const determinePipelineStage = (
  analysis: PipelineAnalysis
): { newStage: PipelineStage; confidence: number; rationale: string } => {
  const { currentStage } = analysis;

  // Lead → New Opportunity
  if (currentStage === 'Lead') {
    if (analysis.hasTimeframe &&
        analysis.hasSpecificProperty &&
        analysis.motivation === 'High') {
      return {
        newStage: 'New Opportunity',
        confidence: 85,
        rationale: 'Meets criteria: High motivation + timeframe + specific property'
      };
    }
  }

  // New Opportunity → Active Opportunity
  if (currentStage === 'New Opportunity') {
    if (analysis.hasHomeShowings &&
        analysis.daysSinceLastActivity <= 7) {
      return {
        newStage: 'Active Opportunity',
        confidence: 90,
        rationale: 'Active showings + engagement within 7 days'
      };
    }
  }

  // Active Opportunity → Under Contract
  if (currentStage === 'Active Opportunity') {
    if (analysis.offerAccepted) {
      return {
        newStage: 'Under Contract',
        confidence: 95,
        rationale: 'Offer accepted by seller'
      };
    }
  }

  // Under Contract → Closed
  if (currentStage === 'Under Contract') {
    if (analysis.closingCompleted) {
      return {
        newStage: 'Closed',
        confidence: 100,
        rationale: 'Closing completed successfully'
      };
    }
  }

  return { newStage: currentStage, confidence: 0, rationale: 'No change' };
};
```

**Conversation Pattern Detection:**
```typescript
// /lib/ai/pattern-detection.ts

interface ConversationPatterns {
  buyingIntent: boolean;
  sellingIntent: boolean;
  urgency: boolean;
  specificProperty: boolean;
  preapproval: boolean;
  showings: boolean;
  offerAccepted: boolean;
  closing: boolean;
}

export const detectConversationPatterns = (text: string): ConversationPatterns => {
  const patterns: ConversationPatterns = {
    buyingIntent: false,
    sellingIntent: false,
    urgency: false,
    specificProperty: false,
    preapproval: false,
    showings: false,
    offerAccepted: false,
    closing: false
  };

  const lowerText = text.toLowerCase();

  // Buying intent patterns
  patterns.buyingIntent = /looking to buy|want to purchase|interested in buying|buyer's agent|representing me/.test(lowerText);

  // Selling intent patterns
  patterns.sellingIntent = /looking to sell|want to sell|thinking of selling|just listed|going to list|my home|my house/.test(lowerText);

  // Urgency patterns
  patterns.urgency = /asap|immediately|right now|urgent|as soon as possible/.test(lowerText);

  // Specific property patterns
  patterns.specificProperty = /in \w+ area|near|bedroom|bathroom|sqft|square foot|pool|garage|yard/.test(lowerText);

  // Pre-approval patterns
  patterns.preapproval = /pre-approval|pre-qualified|mortgage approval|lender|loan officer|pre-approved/.test(lowerText);

  // Showings patterns
  patterns.showings = /saw \d+ home|showing|viewed|visited|tour|looking at homes|went to see/.test(lowerText);

  // Offer accepted patterns
  patterns.offerAccepted = /offer accepted|under contract|seller accepted|they accepted/.test(lowerText);

  // Closing patterns
  patterns.closing = /closed|closing complete|got the keys|funding|documents signed|closing table/.test(lowerText);

  return patterns;
};
```

---

### Week 8: Daily Action Engine

**Deliverables:**
- Priority scoring algorithm
- Daily contact selection (top 5-10)
- Action type recommendation
- Suggested scripts
- "Why it matters" context

**Priority Scoring Algorithm:**
```typescript
// /lib/ai/daily-priority-scoring.ts

interface PriorityFactors {
  motivationLevel: 'High' | 'Medium' | 'Low';
  daysSinceContact: number;
  pipelineStage: PipelineStage;
  isNewLead: boolean;
  timeframe: string;
  sevenDayRuleViolation: boolean;
}

export const calculatePriorityScore = (factors: PriorityFactors): number => {
  let score = 0;

  // Motivation level (0-30 points)
  const motivationScores = { 'High': 30, 'Medium': 20, 'Low': 10 };
  score += motivationScores[factors.motivationLevel] || 5;

  // Days since contact (0-25 points)
  if (factors.daysSinceContact <= 1) score += 25;
  else if (factors.daysSinceContact <= 3) score += 20;
  else if (factors.daysSinceContact <= 7) score += 15;
  else if (factors.daysSinceContact <= 14) score += 10;
  else score += 5;

  // Pipeline stage (0-20 points)
  const stageScores = {
    'Lead': 5,
    'New Opportunity': 15,
    'Active Opportunity': 20,
    'Under Contract': 10,
    'Closed': 0
  };
  score += stageScores[factors.pipelineStage] || 5;

  // New lead bonus (0-15 points)
  if (factors.isNewLead && factors.motivationLevel === 'High') {
    score += 15;
  }

  // Timeframe urgency (0-10 points)
  if (factors.timeframe === 'Immediate') score += 10;
  else if (factors.timeframe === '1-3 months') score += 7;
  else if (factors.timeframe === '3-6 months') score += 5;

  // 7-day rule violation (increases priority)
  if (factors.sevenDayRuleViolation) {
    score += 10;
  }

  return Math.min(score, 100);
};

export const generateDailyActions = async (userId: string): Promise<DailyAction[]> => {
  const contacts = await getUserContacts(userId);

  const scoredContacts = contacts.map(contact => {
    const sevenDayViolation = await checkSevenDayRule(contact);

    return {
      ...contact,
      priorityScore: calculatePriorityScore({
        motivationLevel: contact.motivation_level,
        daysSinceContact: contact.days_since_contact,
        pipelineStage: contact.pipeline_stage,
        isNewLead: contact.days_since_contact <= 2 && contact.pipeline_stage === 'Lead',
        timeframe: contact.timeframe,
        sevenDayRuleViolation: sevenDayViolation
      })
    };
  });

  // Sort and take top 5-10
  const topContacts = scoredContacts
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 10);

  // Generate action suggestions for each
  const dailyActions = await Promise.all(
    topContacts.map(contact => generateActionSuggestion(contact))
  );

  return dailyActions;
};
```

---

### Week 9: Consistency Score System

**Deliverables:**
- Daily target tracking (5 contacts)
- Rolling 7-day average
- Streak tracking
- Visual feedback system
- Achievement notifications

**Consistency Score Algorithm:**
```typescript
// /lib/ai/consistency-scoring.ts

export const calculateConsistencyScore = async (userId: string): Promise<{
  score: number;
  streak: number;
  last7Days: number[];
  rating: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical';
}> => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  });

  const dailyCounts = await Promise.all(
    last7Days.map(date => getCompletedActionsCount(userId, date))
  );

  // Base score
  const dailyTarget = 5;
  const totalContacts = dailyCounts.reduce((sum, count) => sum + count, 0);
  const targetTotal = dailyTarget * 7;
  let score = Math.min((totalContacts / targetTotal) * 100, 100);

  // Streak bonus
  const streak = await calculateCurrentStreak(userId);
  if (streak >= 7) score += 15;
  else if (streak >= 5) score += 10;
  else if (streak >= 3) score += 5;

  // Penalty for zero days
  const zeroDays = dailyCounts.filter(count => count === 0).length;
  score -= zeroDays * 5;

  // Rating
  let rating: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical';
  if (score >= 90) rating = 'Excellent';
  else if (score >= 70) rating = 'Good';
  else if (score >= 50) rating = 'Needs Improvement';
  else rating = 'Critical';

  return {
    score: Math.max(score, 0),
    streak,
    last7Days: dailyCounts,
    rating
  };
};

const calculateCurrentStreak = async (userId: string): Promise<number> => {
  let streak = 0;
  let currentDate = new Date();

  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const count = await getCompletedActionsCount(userId, dateStr);

    if (count >= 5) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};
```

---

### Week 10: Next Action & Reply Systems

**Deliverables:**
- Next action recommendation engine
- AI-generated response suggestions
- Context-aware templates
- One-copy approval workflow

**Next Action Generator:**
```typescript
// /lib/ai/next-action-generator.ts

export const generateNextAction = async (contact: Contact): Promise<{
  actionType: string;
  urgency: number;
  script: string;
  rationale: string;
}> => {
  const { pipeline_stage, motivation_level, days_since_contact, timeframe } = contact;

  // Stage-specific logic
  switch (pipeline_stage) {
    case 'Lead':
      if (days_since_contact >= 7) {
        return {
          actionType: 'Call',
          urgency: 9,
          script: `Re-engaging after ${days_since_contact} days. Check if still interested in ${timeframe?.toLowerCase() || 'buying/selling'}.`,
          rationale: 'Urgent: 7+ days since contact with new lead'
        };
      }
      if (!timeframe || timeframe === '6+ months') {
        return {
          actionType: 'Call',
          urgency: 6,
          script: 'Determine specific buying/selling timeframe and motivation level.',
          rationale: 'Qualification needed: No timeframe established'
        };
      }
      break;

    case 'New Opportunity':
      if (!contact.preapproval_status) {
        return {
          actionType: 'Call',
          urgency: 8,
          script: 'Follow up on mortgage pre-approval status. This is critical for making strong offers.',
          rationale: 'Pre-approval required for offer submission'
        };
      }
      break;

    case 'Active Opportunity':
      const sevenDayViolation = await checkSevenDayRule(contact);
      if (sevenDayViolation) {
        return {
          actionType: 'Call',
          urgency: 10,
          script: `Hi [name], I want to ensure I'm providing the best service. With the market changing weekly, should I send you fresh listings or schedule another showing tour?`,
          rationale: 'CRITICAL: 7-day rule violation - immediate re-engagement required'
        };
      }
      break;

    case 'Under Contract':
      return {
        actionType: 'Text',
        urgency: 5,
        script: 'Checking in on your closing progress. Any questions or updates from the lender?',
        rationale: 'Maintain contact during under contract period'
      };

    case 'Closed':
      if (days_since_contact <= 30) {
        return {
          actionType: 'Email',
          urgency: 4,
          script: 'Thank you again for choosing me as your agent. Would you be willing to share a brief review of your experience?',
          rationale: 'Post-closing: Request testimonial while experience is fresh'
        };
      }
      break;
  }

  // Default action
  return {
    actionType: 'Call',
    urgency: 5,
    script: `Check in with ${contact.name} regarding their ${pipeline_stage} status.`,
    rationale: 'Regular contact maintenance'
  };
};
```

**Reply Draft Generator:**
```typescript
// /lib/ai/reply-draft-generator.ts

export const generateReplyDraft = async (
  contact: Contact,
  conversation: string
): Promise<string> => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Generate a professional, friendly reply for a real estate agent.

        Structure:
        1. Personalized greeting
        2. Acknowledge their specific question/comment
        3. Provide helpful information
        4. Clear next step
        5. Professional closing

        Keep it under 150 words.`
      },
      {
        role: "user",
        content: `Contact: ${contact.name}
        Stage: ${contact.pipeline_stage}
        Motivation: ${contact.motivation_level}

        Their last message:
        ${conversation}`
      }
    ],
    temperature: 0.7,
    max_tokens: 200
  });

  return response.choices[0].message.content;
};
```

---

## 📊 Phase 4: Dashboards & Integrations (Weeks 11-13)

### Week 11: Behavior Dashboard

**Deliverables:**
- Today's 5-10 most important contacts
- Weekly "411" priorities
- Pipeline snapshot (funnel visualization)
- Consistency score display
- Activity heatmap

**Dashboard Component:**
```typescript
// /app/dashboard/page.tsx

const BehaviorDashboard = () => {
  const { data: dailyActions } = useDailyActions();
  const { data: consistency } = useConsistencyScore();
  const { data: pipelineSnapshot } = usePipelineSnapshot();

  return (
    <div className="dashboard">
      {/* Today's Priorities */}
      <section className="priorities">
        <h2>Today's Top Contacts</h2>
        {dailyActions?.slice(0, 5).map(action => (
          <ActionCard
            key={action.id}
            action={action}
            behavioralRationale={action.behavioral_rationale}
          />
        ))}
      </section>

      {/* Consistency Score */}
      <section className="consistency">
        <ConsistencyCard
          score={consistency.score}
          streak={consistency.streak}
          rating={consistency.rating}
          last7Days={consistency.last7Days}
        />
      </section>

      {/* Pipeline Snapshot */}
      <section className="pipeline">
        <PipelineFunnel data={pipelineSnapshot} />
      </section>
    </div>
  );
};
```

---

### Week 12: Sales Dashboard & Analytics

**Deliverables:**
- "4 Conversations" tracking
- GCI (Gross Commission Income) calculator
- Conversion funnel visualization
- Lead source pie chart
- Performance trends

**Sales Dashboard Component:**
```typescript
// /app/dashboard/sales/page.tsx

const SalesDashboard = () => {
  const { data: metrics } = useSalesMetrics();

  return (
    <div className="sales-dashboard">
      {/* The 4 Conversations */}
      <section className="four-conversations">
        <MetricCard
          title="Appointments This Month"
          value={metrics.appointments}
          target={metrics.appointmentsTarget}
          trend={metrics.appointmentsTrend}
        />
        <MetricCard
          title="Listings Signed"
          value={metrics.listingsSigned}
          target={metrics.listingsTarget}
          trend={metrics.listingsTrend}
        />
        <MetricCard
          title="Closings This Month"
          value={metrics.closings}
          target={metrics.closingsTarget}
          trend={metrics.closingsTrend}
        />
        <MetricCard
          title="GCI"
          value={`$${metrics.gci.toLocaleString()}`}
          target={`$${metrics.gciTarget.toLocaleString()}`}
          trend={metrics.gciTrend}
        />
      </section>

      {/* Conversion Funnel */}
      <section className="funnel">
        <ConversionFunnel
          data={{
            lead: metrics.leadCount,
            newOpportunity: metrics.newOpportunityCount,
            activeOpportunity: metrics.activeOpportunityCount,
            underContract: metrics.underContractCount,
            closed: metrics.closedCount
          }}
        />
      </section>

      {/* Lead Sources */}
      <section className="sources">
        <PieChart data={metrics.leadSources} />
      </section>
    </div>
  );
};
```

---

### Week 13: Mailchimp Integration & Polish

**Deliverables:**
- Mailchimp API v3 integration
- Bidirectional contact sync
- Audience segment creation
- Email recommendation engine
- Mobile optimization
- Performance optimization
- Testing & QA

**Mailchimp Integration:**
```typescript
// /lib/integrations/mailchimp.ts

const syncContactToMailchimp = async (contact: Contact) => {
  const mailchimp = new MailchimpAPI(process.env.MAILCHIMP_API_KEY);
  const listId = process.env.MAILCHIMP_LIST_ID;

  // Map pipeline stage to segment
  const segment = mapPipelineToSegment(contact.pipeline_stage);
  const tags = [segment];

  // Add motivation tag
  if (contact.motivation_level) {
    tags.push(contact.motivation_level);
  }

  // Upsert contact
  await mailchimp.lists.setListMember(listId, contact.email, {
    email_address: contact.email,
    status_if_new: 'subscribed',
    merge_fields: {
      FNAME: contact.name.split(' ')[0],
      LNAME: contact.name.split(' ').slice(1).join(' '),
      PIPELINE: contact.pipeline_stage,
      MOTIVATION: contact.motivation_level,
      SOURCE: contact.lead_source
    },
    tags: tags
  });

  await updateContact(contact.id, { mailchimp_synced: true });
};

const recommendEmailRecipients = async (userId: string): Promise<Contact[]> => {
  const contacts = await getUserContacts(userId);

  const recommendations = contacts.filter(contact => {
    // High motivation + no contact in 3+ days
    if (contact.motivation_level === 'High' &&
        contact.days_since_contact >= 3) {
      return true;
    }

    // Active opportunities with updates
    if (contact.pipeline_stage === 'Active Opportunity' &&
        contact.days_since_contact >= 2) {
      return true;
    }

    // New leads needing introduction
    if (contact.pipeline_stage === 'Lead' &&
        contact.days_since_contact <= 1) {
      return true;
    }

    return false;
  });

  return recommendations.slice(0, 20);
};
```

---

## 🔧 Technical Implementation Details

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Google Contacts
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Mailchimp
MAILCHIMP_API_KEY=your_mailchimp_api_key
MAILCHIMP_LIST_ID=your_mailchimp_list_id
MAILCHIMP_DC=usX

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Key Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "openai": "^4.0.0",
    "tesseract.js": "^5.0.0",
    "papaparse": "^5.4.0",
    "googleapis": "^128.0.0",
    "@mailchimp/mailchimp_marketing": "^3.0.80",
    "recharts": "^2.10.0",
    "date-fns": "^2.30.0"
  }
}
```

---

## 📈 Success Metrics

### Performance Benchmarks
- Contact import (100 contacts): <2 minutes
- Screenshot OCR (Tesseract.js): <15 seconds
- Daily action generation: <5 seconds
- Page load time: <2 seconds
- Mailchimp sync (500 contacts): <30 seconds

### Accuracy Targets
- OCR accuracy: >95% (computer-generated text)
- Pipeline stage detection: >85% accuracy
- Priority scoring: >80% user satisfaction
- Reply draft relevance: >75% acceptance rate
- 7-day rule flagging: >90% accuracy

---

## 🎯 Final Deliverable Checklist

✅ User can import contacts from 3 sources (CSV, Google, iPhone)
✅ Tesseract.js OCR extracts text from screenshots (computer-generated)
✅ AI analyzes extracted text for pipeline intelligence
✅ Pipeline stages auto-update based on conversation analysis
✅ Daily action plan generates top 5-10 contacts with scripts
✅ Consistency score tracks 5-contacts-per-day goal
✅ Reply drafts generate from conversations
✅ Behavior dashboard shows priorities + pipeline snapshot
✅ Sales dashboard tracks 4 conversations + GCI
✅ Mailchimp syncs contacts + recommends email recipients
✅ Mobile-responsive + production-ready

---

*This build plan fully integrates all behavioral logic from the specification with explicit implementation details.*
