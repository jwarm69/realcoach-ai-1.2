# Real Agent AI - Technical Architecture

## System Overview

RealCoach.ai is a modern, AI-powered real estate contact management and pipeline automation system built with a serverless architecture optimized for rapid development and scalability.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│                     (Next.js 14 App Router)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Pages      │  │  Components  │  │    Hooks     │         │
│  │              │  │              │  │              │         │
│  │ /dashboard   │  │ ContactCard  │  │ useContacts  │         │
│  │ /contacts    │  │ ActionCard   │  │ useDailyAct  │         │
│  │ /pipeline    │  │ UploadScreen │  │ usePipeline  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Route Hdlrs │  │  Middleware  │  │     Auth     │         │
│  │              │  │              │  │              │         │
│  │ /api/contacts│  │  Error Hdlng │  │  Supabase    │         │
│  │ /api/upload  │  │   Logging    │  │  Auth Helper │         │
│  │ /api/ai      │  │   Rate Lim   │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Services    │  │   Engines    │  │  Integrations│         │
│  │              │  │              │  │              │         │
│  │ContactServ   │  │PipelineEng   │  │MailchimpSvc  │         │
│  │ConversationS │  │PriorityEng   │  │GoogleContacts│         │
│  │ActionService │  │ConsistencyE  │  │TesseractOCR  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Supabase    │  │    OpenAI    │  │  External    │         │
│  │              │  │              │  │              │         │
│  │ PostgreSQL   │  │   GPT-4o     │  │  Mailchimp   │         │
│  │  Auth        │  │   Vision API │  │   Google     │         │
│  │  Storage     │  │              │  │   APIs       │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: React Hooks + Context API
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js (via Next.js API Routes)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **API**: RESTful (Next.js API Routes)

### AI/ML Services
- **OCR**: Tesseract.js (client-side text extraction)
- **Conversation Analysis**: OpenAI GPT-4o
- **Pattern Detection**: Custom JavaScript/TypeScript algorithms

### Third-Party Integrations
- **Mailchimp**: Mailchimp API v3
- **Google Contacts**: Google People API
- **iPhone Contacts**: CardDAV protocol

### Deployment
- **Hosting**: Vercel
- **Database**: Supabase Cloud
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics

---

## Component Architecture

### Frontend Components

```
/app
├── /dashboard
│   ├── page.tsx              # Main dashboard
│   ├── /sales
│   │   └── page.tsx          # Sales dashboard
│   └── /behavior
│       └── page.tsx          # Behavior dashboard
├── /contacts
│   ├── page.tsx              # Contact list
│   ├── [id]
│   │   └── page.tsx          # Contact detail
│   └── /new
│       └── page.tsx          # Create contact
├── /pipeline
│   └── page.tsx              # Pipeline view
└── /settings
    └── page.tsx              # User settings

/components
├── /ui                       # shadcn/ui components
├── /contacts
│   ├── ContactCard.tsx
│   ├── ContactForm.tsx
│   ├── ContactList.tsx
│   └── ContactDetail.tsx
├── /dashboard
│   ├── ActionCard.tsx
│   ├── ConsistencyCard.tsx
│   ├── PipelineFunnel.tsx
│   └── MetricCard.tsx
├── /inputs
│   ├── VoiceInput.tsx
│   ├── TextInput.tsx
│   └── ScreenshotUpload.tsx
└── /layout
    ├── Header.tsx
    ├── Sidebar.tsx
    └── BottomNav.tsx

/lib
├── /hooks
│   ├── useContacts.ts
│   ├── useDailyActions.ts
│   ├── usePipeline.ts
│   └── useConsistency.ts
├── /services
│   ├── contactService.ts
│   ├── conversationService.ts
│   ├── actionService.ts
│   └── mailchimpService.ts
├── /ai
│   ├── pipelineEngine.ts
│   ├── priorityEngine.ts
│   ├── consistencyEngine.ts
│   ├── patternDetection.ts
│   └── replyGenerator.ts
└── /utils
    ├── validation.ts
    ├── formatting.ts
    └── constants.ts
```

---

## Data Flow

### 1. Contact Import Flow

```
User Uploads CSV
       │
       ▼
Parse CSV (PapaParse)
       │
       ▼
Validate Data (Zod)
       │
       ▼
Detect Duplicates
       │
       ▼
Insert to Supabase
       │
       ▼
Sync to Mailchimp
```

### 2. Screenshot Analysis Flow

```
User Uploads Screenshot
       │
       ▼
Store in Supabase Storage
       │
       ▼
Extract Text (Tesseract.js OCR)
       │
       ▼
Clean & Format Text
       │
       ▼
Detect Patterns (Custom Engine)
       │
       ▼
Analyze with GPT-4o
       │
       ▼
Extract Entities & Update Contact
       │
       ▼
Generate Suggested Actions
       │
       ▼
Update Pipeline Stage (if confident)
```

### 3. Daily Action Generation Flow

```
Cron Job (Daily 6 AM)
       │
       ▼
Fetch All User Contacts
       │
       ▼
Calculate Priority Scores
       │
       ▼
Sort by Priority (Top 5-10)
       │
       ▼
Generate Action Suggestions
       │
       ▼
Create Daily Action Records
       │
       ▼
Notify User (Push/Email)
```

### 4. Pipeline Progression Flow

```
New Conversation/Activity
       │
       ▼
Extract Text Content
       │
       ▼
Detect Behavioral Patterns
       │
       ▼
Calculate Stage Change Probability
       │
       ▼
If Confidence >= 90%:
    Auto-Confirm Stage Change
       │
       ▼
Else If Confidence >= 70%:
    Suggest Stage Change
       │
       ▼
Else:
    Log Low Confidence Detection
       │
       ▼
Update Contact Record
       │
       ▼
Notify User of Change
```

---

## Database Schema

### Tables

#### contacts
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- name (TEXT)
- phone (TEXT)
- email (TEXT, UNIQUE)
- address (TEXT)
- pipeline_stage (TEXT)
- lead_source (TEXT)
- motivation_level (TEXT)
- timeframe (TEXT)
- property_preferences (JSONB)
- budget_range (TEXT)
- preapproval_status (BOOLEAN)
- last_interaction_date (DATE)
- last_touch_type (TEXT)
- interaction_frequency (INTEGER)
- consistency_score (INTEGER)
- priority_score (INTEGER)
- days_since_contact (INTEGER)
- seven_day_rule_flag (BOOLEAN)
- last_activity_date (DATE)
- inactive_days (INTEGER)
- notes (TEXT)
- mailchimp_synced (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### conversations
```sql
- id (UUID, PK)
- contact_id (UUID, FK)
- input_type (TEXT)
- content (TEXT)
- raw_url (TEXT)
- ai_detected_stage (TEXT)
- ai_stage_confidence (INTEGER)
- ai_detected_motivation (TEXT)
- ai_motivation_confidence (INTEGER)
- ai_detected_timeframe (TEXT)
- ai_timeframe_confidence (INTEGER)
- ai_extracted_entities (JSONB)
- ai_suggested_next_action (TEXT)
- ai_suggested_reply (TEXT)
- triggers_buying_intent (BOOLEAN)
- triggers_selling_intent (BOOLEAN)
- triggers_urgency (BOOLEAN)
- triggers_specific_property (BOOLEAN)
- triggers_preapproval (BOOLEAN)
- triggers_showings (BOOLEAN)
- triggers_offer_accepted (BOOLEAN)
- triggers_closing (BOOLEAN)
- user_confirmed_stage (BOOLEAN)
- user_edited_stage (TEXT)
- user_edited_next_action (TEXT)
- action_completed (BOOLEAN)
- created_at (TIMESTAMP)
```

#### daily_actions
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- contact_id (UUID, FK)
- action_date (DATE)
- action_type (TEXT)
- priority_level (INTEGER)
- reason (TEXT)
- suggested_script (TEXT)
- urgency_factor (TEXT)
- behavioral_rationale (TEXT)
- completed (BOOLEAN)
- completed_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

---

## API Routes

### Contact Management
```
GET    /api/contacts              # List contacts
POST   /api/contacts              # Create contact
GET    /api/contacts/[id]         # Get contact
PUT    /api/contacts/[id]         # Update contact
DELETE /api/contacts/[id]         # Delete contact
```

### Import/Export
```
POST   /api/contacts/import/csv   # Import CSV
POST   /api/contacts/import/google # Import Google Contacts
POST   /api/contacts/import/iphone # Import iPhone Contacts
```

### Conversations
```
POST   /api/conversations         # Create conversation (screenshot/voice/text)
GET    /api/conversations/[id]    # Get conversation
PUT    /api/conversations/[id]    # Update conversation
```

### Daily Actions
```
GET    /api/actions/daily         # Get today's actions
POST   /api/actions/[id]/complete # Mark action complete
```

### Pipeline
```
GET    /api/pipeline/snapshot     # Get pipeline snapshot
PUT    /api/contacts/[id]/stage   # Update pipeline stage
```

### AI Services
```
POST   /api/ai/analyze            # Analyze conversation
POST   /api/ai/reply              # Generate reply draft
POST   /api/ai/actions            # Generate action suggestions
```

---

## Security Architecture

### Authentication
- Supabase Auth (email/password + OAuth)
- JWT tokens for API authentication
- Row Level Security (RLS) on all database tables

### Authorization
- User-based data isolation
- Role-based access control (RBAC)
- API route protection with middleware

### Data Protection
- Encryption at rest (Supabase)
- Encryption in transit (HTTPS)
- PII data masking in logs
- Secure file upload validation

### API Security
- Rate limiting per user
- Request validation with Zod
- SQL injection prevention (parameterized queries)
- XSS protection (React escaping)

---

## Performance Optimization

### Frontend Optimization
- Code splitting with Next.js dynamic imports
- Image optimization with next/image
- Lazy loading for components
- Memoization with React.memo
- Virtual scrolling for long lists

### Backend Optimization
- Database query optimization
- Connection pooling (Supabase)
- Caching strategy (Redis/Vercel KV)
- API response compression
- Background job processing

### AI Service Optimization
- Request batching for OpenAI API
- Response caching for similar queries
- Fallback mechanisms for API failures
- Cost monitoring and limits

---

## Scalability Considerations

### Database
- Indexed columns for frequently queried fields
- Partitioning for large tables (conversations)
- Read replicas for analytics queries

### File Storage
- CDN delivery (Supabase Storage)
- Image optimization and compression
- Automatic cleanup of temporary files

### API
- Serverless function scaling (Vercel)
- Horizontal scaling capability
- Load balancing (Vercel Edge)

---

## Monitoring & Logging

### Application Monitoring
- Vercel Analytics
- Error tracking (Sentry)
- Performance monitoring (Web Vitals)

### Business Metrics
- User engagement tracking
- Feature usage analytics
- Pipeline conversion rates
- AI accuracy metrics

### Logging Strategy
- Structured logging (JSON format)
- Log levels (error, warn, info, debug)
- Log aggregation (Vercel logs)
- Alert thresholds for critical issues

---

## Deployment Architecture

### Environments
```
Development (localhost)
       │
       ▼
Staging (vercel.staging)
       │
       ▼
Production (vercel.production)
```

### CI/CD Pipeline
```
Git Push (main branch)
       │
       ▼
Run Tests (Jest)
       │
       ▼
Build Application (Next.js)
       │
       ▼
Deploy to Vercel
       │
       ▼
Run Database Migrations
       │
       ▼
Smoke Tests
       │
       ▼
Production Live
```

---

## Disaster Recovery

### Backup Strategy
- Daily automated database backups (Supabase)
- Point-in-time recovery (7 days)
- File storage replication

### Recovery Procedures
1. Database restoration from backup
2. Application redeployment from Vercel
3. DNS failover (if needed)

---

## Cost Optimization

### Supabase
- Free tier: 500MB database, 1GB storage
- Pro tier: $25/month for scaling

### OpenAI API
- Estimated costs:
  - GPT-4o: ~$0.01 per conversation analysis
  - Volume discounts for high usage

### Vercel
- Free tier: 100GB bandwidth
- Pro tier: $20/month for scaling

### Mailchimp
- Free tier: Up to 500 contacts
- Standard tier: Starting at $13/month

---

*This technical architecture provides the foundation for building a scalable, maintainable RealCoach.ai application.*
