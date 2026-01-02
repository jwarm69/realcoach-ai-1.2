# CLAUDE.md - RealCoach AI 1.2

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

RealCoach AI 1.2 is an AI-powered real estate contact management and pipeline automation system. The application uses behavioral pattern recognition to automatically manage contacts, analyze conversations, and generate actionable insights for real estate agents.

## Project Vision

**Objective**: Build a complete MVP for RealCoach.ai - an AI-powered real estate contact management system with deep behavioral intelligence.

**Timeline**: 13 weeks (4 development phases)
**Current Status**: ~95% complete (Phase 1-3: 100%, Phase 4: 95%)
**Last Updated**: December 31, 2025

**Core Differentiator**: Behavioral pattern recognition that automatically stages contacts, prioritizes daily actions, and generates AI-powered recommendations using sophisticated multi-tier AI model routing.

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
- **OCR**: Tesseract.js (client-side text extraction from screenshots)
- **Conversation Analysis**: OpenAI GPT-4o
- **Pattern Detection**: Custom JavaScript/TypeScript algorithms

### Third-Party Integrations
- **Mailchimp**: Mailchimp API v3 (email marketing sync)
- **Google Contacts**: Google People API (contact import)
- **iPhone Contacts**: CardDAV protocol (contact import)

### Deployment
- **Hosting**: Vercel
- **Database**: Supabase Cloud
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics

## Core Behavioral Systems

### 1. AI Conversation Analysis System ✨
**Multi-tier model routing** for cost-optimized intelligence:

**Architecture**:
```
User Input → Conversation Analyzer (Orchestrator)
              ↓
    ┌─────────┼─────────┐
    ↓         ↓         ↓
Tier 1     Tier 2    Tier 3
Rule-based  Mini     GPT-4o
(Free)      ($0.15)  ($3.00)
    ↓         ↓         ↓
Patterns  Entities  Complex
          + Budget  Analysis
```

**Components**:
- `lib/ai/conversation-analyzer.ts` - Main orchestrator (335 lines)
- `lib/ai/model-router.ts` - Smart routing with cost tracking
- `lib/ai/pattern-detector.ts` - Rule-based pattern detection (free)
- `lib/ai/entity-extractor.ts` - GPT-4o-mini entity extraction
- `lib/ai/stage-detector.ts` - GPT-4o stage detection
- `lib/ai/action-generator.ts` - GPT-4o next action generation
- `lib/ai/reply-generator.ts` - GPT-4o reply draft generation

**Cost Optimization**:
- Tier 1 (Rule-based): FREE - Detects buying intent, urgency, showings
- Tier 2 (GPT-4o-mini): ~$0.03 per 100 conversations - Extracts entities
- Tier 3 (GPT-4o): ~$0.60 per 100 conversations - Complex reasoning

**API Endpoint**:
- `POST /api/analyze-conversation` - Full conversation analysis

### 2. Pipeline Progression Engine
Hardcoded business rules + AI pattern detection for stage transitions:
- Lead → New Opportunity: Motivation + Timeframe + Specific Property
- New Opportunity → Active Opportunity: Showings + 7-day activity
- Active Opportunity → Under Contract: Offer Accepted
- Under Contract → Closed: Closing Completed

### 2. Conversation Analysis System
Multi-pattern detection with confidence scoring:
- Buying/selling intent detection
- Motivation level extraction (High/Medium/Low)
- Timeframe detection (Immediate/1-3 months/3-6 months/6+ months)
- Property preference extraction
- Budget/pre-approval status detection

### 3. Daily Priority Algorithm
Multi-factor scoring (0-100 scale):
- Motivation level (30 points)
- Days since contact (25 points)
- Pipeline stage (20 points)
- New lead bonus (15 points)
- Timeframe urgency (10 points)
- 7-day rule flag (+10 priority boost)

### 4. Consistency Tracking System
Gamified 5-contacts/day goal:
- Daily target tracking (5 contacts)
- Rolling 7-day average
- Streak tracking with bonuses
- Zero-day penalties
- Visual feedback (green/yellow/red)

### 5. Next Action Recommendation
Stage-specific logic with scripts:
- Context-aware action types (Call/Text/Email/Meeting)
- Urgency scoring (1-10)
- Suggested scripts
- "Why it matters" behavioral rationale

### 6. Reply Draft Generation
AI-powered response suggestions:
- Scenario-based templates
- Conversation context integration
- Editable before send
- Professional structure (greeting, acknowledgment, value, next step, closing)

### 7. Activity Monitoring System
7-day rule enforcement with inactivity alerts:
- Active Opportunity activity monitoring
- Automatic flagging for 7+ day inactivity
- Priority score boosting for urgent re-engagement

### 8. Manual Override System
User control over AI decisions:
- Confidence thresholds (90% auto-confirm, 70% review, 50% suggest)
- Stage change confirmation workflow
- Priority adjustment capabilities
- Action editing and customization

## Development Phases

### Phase 1: Foundation (Weeks 1-3)
- Setup & Authentication
- Contact Management Core
- Behavioral Data Infrastructure

**Key Deliverables:**
- Next.js 14 + Supabase + shadcn/ui setup
- User authentication (email/password + Google OAuth)
- Contact CRUD operations
- Pipeline stage management (5 stages)
- Enhanced contact fields (motivation, timeframe, property preferences)

### Phase 2: Contact Intelligence (Weeks 4-6) ✅ COMPLETE
- Contact Import Systems
- Screenshot Upload & OCR
- Voice & Text Input

**Key Deliverables:**
- ✅ CSV upload with parsing and auto-detection
- ✅ Google Contacts API integration (OAuth + People API)
- ⬜ iPhone Contacts integration (CardDAV) - DEFERRED to Phase 4
- ✅ Tesseract.js OCR for screenshot text extraction
- ✅ Voice recording UI (Web Speech API) - UI complete, backend pending
- ✅ Text input form for conversations (via log dialog)

### Phase 3: AI Pipeline Engine (Weeks 7-10) ✅ 100% COMPLETE
- Pipeline Progression Rules Engine
- AI Conversation Analysis
- Daily Action Engine
- Consistency Score System
- Next Action & Reply Systems

**Key Deliverables:**
- ✅ Hardcoded business rules for stage transitions (`lib/ai/pipeline-engine.ts`)
- ✅ **Multi-tier AI model routing** (cost optimization) (`lib/ai/model-router.ts`)
- ✅ **GPT-4o conversation analysis** (`lib/ai/conversation-analyzer.ts`)
- ✅ **Pattern detection** (rule-based, free) (`lib/ai/pattern-detector.ts`)
- ✅ **Entity extraction** (GPT-4o-mini) (`lib/ai/entity-extractor.ts`)
- ✅ **Stage detection** (GPT-4o) (`lib/ai/stage-detector.ts`)
- ✅ 7-day activity monitoring system (`lib/engines/seven-day-monitor.ts`)
- ✅ Priority scoring algorithm (0-100 scale) (`lib/engines/priority-calculator.ts`)
- ✅ Consistency score calculation (`lib/engines/consistency-scoring.ts`)
- ✅ Next action recommendation engine (`lib/engines/action-recommendation.ts`)
- ✅ Reply draft generation system (`lib/ai/reply-generator.ts`)
- ✅ **Automated daily action generation** (Vercel cron job) (`/api/cron/daily-actions`)
- ✅ **Email notification system** (Resend) (`lib/notifications/email.ts`)

**Advanced Features** (beyond original plan):
- ✅ **Smart cost optimization** - Three-tier routing system:
  - Tier 1: Rule-based pattern detection (free)
  - Tier 2: GPT-4o-mini for entity extraction ($0.00015/1K tokens)
  - Tier 3: GPT-4o for complex analysis ($0.003/1K tokens)
- ✅ **Model usage tracking** - Real-time cost monitoring
- ✅ **Confidence scoring** - Multi-factor analysis for all AI decisions
- ✅ **Fallback mechanisms** - Graceful degradation when APIs fail
- ✅ **Automated action generation** - Daily priority actions via cron
- ✅ **Email notifications** - Daily actions, 7-day alerts, consistency reminders, weekly summary
- ✅ **Notification preferences** - User control over notification timing and method

### Phase 4: Dashboards & Integrations (Weeks 11-13) ✅ 95% COMPLETE
- Behavior Dashboard
- Sales Dashboard & Analytics
- Mailchimp Integration & Polish

**Key Deliverables:**
- ✅ Behavior dashboard (`app/(dashboard)/page.tsx`)
  - Today's top priority contacts (with action buttons)
  - Pipeline distribution
  - 7-day rule violations
  - Consistency score display
  - Current streak tracking
- ✅ Dashboard statistics service (`lib/services/stats.ts`)
- ✅ Sales dashboard (`app/(dashboard)/sales/page.tsx`)
  - "4 Conversations" tracking (appointments, listings, closings, GCI)
  - Time-based filtering (today, week, month, quarter, year)
  - Trend indicators vs previous period
  - Conversion funnel visualization with drop-off metrics
  - Lead source distribution chart
- ✅ Sales analytics service (`lib/services/sales.ts`)
- ✅ Sales API endpoints (`/api/sales/*`)
- ✅ Mailchimp API integration (`lib/integrations/mailchimp.ts`)
  - Contact sync with segmentation (tags for pipeline, motivation, source)
  - Batch operations with error handling
  - Settings UI (`app/(dashboard)/settings/integrations/page.tsx`)
  - Cron job for automated sync (`/api/cron/mailchimp`)
- ✅ Testing baseline (Jest + Playwright)
  - Unit tests for priority calculator, stats service, 7-day monitor
  - E2E tests for contacts, dashboards, AI analysis
- ✅ Performance optimizations (API caching, database indexes)
- ✅ Error tracking & health checks (`/api/health`, `lib/observability/logger.ts`)
- ✅ Mobile optimization (responsive dashboards, touch-friendly UI)

## Architecture Guidelines

### Component Architecture

**File Structure:**
```
/app
├── /dashboard           # Main dashboard pages
├── /contacts           # Contact management pages
├── /pipeline           # Pipeline visualization
└── /api               # API routes

/components
├── /ui                # shadcn/ui components
├── /contacts          # Contact-specific components
├── /dashboard         # Dashboard components
├── /imports           # Import components (CSV, Google, Screenshot) ✨ NEW
├── /inputs           # Input components (voice, text, screenshot)
└── /layout           # Layout components

/lib
├── /hooks           # Custom React hooks
├── /services        # API services (OCR, conversations, stats, contacts, sales)
├── /engines         # Calculation engines (priority, 7-day monitor)
├── /integrations    # Third-party integrations (CSV, Google Contacts, Mailchimp)
├── /ai              # AI engines (conversation analyzer, pattern detection)
├── /observability   # Logging, health checks
├── /__tests__       # Unit tests (Jest)
└── /utils           # Helper functions
```

### Code Organization Principles

**Component Structure:**
- Use TypeScript for all components
- Follow functional component pattern
- Implement proper error boundaries
- Use React Hook Form for forms
- Implement proper loading states

**Service Layer:**
- Separate business logic from UI components
- Use async/await for API calls
- Implement proper error handling
- Use TypeScript interfaces for type safety

**AI Engine Organization:**
- Modular, testable functions
- Clear input/output contracts
- Confidence scoring for all AI decisions
- Fallback mechanisms for API failures

## Development Priorities

### 1. Foundation First (Phase 1)
- Authentication and authorization
- Database schema with behavioral fields
- Contact CRUD operations
- Pipeline stage management

### 2. Intelligence Layer (Phase 2)
- All contact import methods working
- Screenshot analysis functional
- Voice/text input operational

### 3. AI Engine Core (Phase 3)
- Pipeline progression rules implemented
- Daily action generation working
- Consistency scoring accurate
- Reply drafts generating

### 4. Visualization & Integration (Phase 4)
- Behavior dashboard complete
- Sales dashboard functional
- Mailchimp integration working
- Mobile-responsive and polished

## Common Development Tasks

### Adding a New Feature

1. **Read the relevant documentation:**
   - Build plan for phase context
   - Behavior logic guide for behavioral requirements
   - Data model for database schema

2. **Follow the development workflow:**
   - Create feature branch
   - Implement feature with tests
   - Test locally
   - Submit PR for review

3. **Ensure behavioral integration:**
   - Check if feature affects pipeline stages
   - Verify impact on priority scoring
   - Update consistency tracking if needed
   - Document behavioral triggers

### Modifying AI Behavior

1. **Update the behavior logic guide:**
   - Document new patterns/triggers
   - Specify confidence thresholds
   - Include example scenarios

2. **Implement in AI engine:**
   - Add pattern detection rules
   - Implement confidence scoring
   - Add fallback mechanisms

3. **Test thoroughly:**
   - Unit tests for new behavior
   - Integration tests for workflows
   - Manual testing with real scenarios

### Database Schema Changes

1. **Update data model:**
   - Modify REAL_AGENT_AI_DATA_MODEL.md
   - Create migration script
   - Update TypeScript types

2. **Test migration:**
   - Run in development first
   - Verify data integrity
   - Test rollback procedure

3. **Deploy carefully:**
   - Backup production database
   - Run migration during low-traffic period
   - Monitor for issues

## Performance Standards

### Response Times
- Page load: <2 seconds
- API calls: <500ms
- Screenshot analysis: <15 seconds
- Daily action generation: <5 seconds
- Mailchimp sync (500 contacts): <30 seconds
- Email delivery: <10 seconds

### Accuracy Targets
- OCR accuracy: >95% (computer-generated text)
- Pipeline stage detection: >85% accuracy
- Priority scoring: >80% user satisfaction
- Reply draft relevance: >75% acceptance rate
- 7-day rule flagging: >90% accuracy

## File Organization

### Priority Files (Edit Frequently)
- `/app` - Next.js pages and API routes
- `/components` - React components
- `/lib/ai` - AI engine implementations
- `/lib/services` - API service layer

### Configuration Files
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `.env.local` - Environment variables (not committed)
- `package.json` - Dependencies and scripts

### Environment Variables Template
```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth (for Google Contacts integration)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI API (for AI conversation analysis) ✅ REQUIRED
OPENAI_API_KEY=your-openai-api-key

# Mailchimp (Phase 4 - optional for now)
MAILCHIMP_API_KEY=your-mailchimp-api-key
MAILCHIMP_LIST_ID=your-list-id
MAILCHIMP_DC=usX
```

### Documentation Files
- `CLAUDE.md` - This file (project instructions)
- `AGENTS.md` - Parallel development workflow
- `REAL_AGENT_AI_BUILD_PLAN.md` - Complete 13-week build plan
- `REAL_AGENT_AI_BEHAVIOR_LOGIC_GUIDE.md` - Behavioral implementation details
- `REAL_AGENT_AI_TECHNICAL_ARCHITECTURE.md` - System architecture
- `REAL_AGENT_AI_DATA_MODEL.md` - Database specifications
- `REAL_AGENT_AI_DEVELOPMENT_WORKFLOW.md` - Development workflow

## Common Issues & Solutions

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues
```bash
# Check Supabase status
supabase status

# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
```

### OpenAI API Errors
```bash
# Verify API key
echo $OPENAI_API_KEY

# Test API connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Type Errors
```bash
# Regenerate database types
supabase gen types typescript --local > lib/database.types.ts
```

## Installed Dependencies

### Phase 2 Dependencies ✨
- `papaparse@^5.5.3` - CSV parsing with auto-detection
- `tesseract.js@^7.0.0` - OCR text extraction from screenshots
- `openai@^6.15.0` - AI conversation analysis (installed for Phase 3)

### UI Components
- All shadcn/ui components via `@radix-ui/*`
- `lucide-react` - Icon library
- `sonner` - Toast notifications

### Forms & Validation
- `react-hook-form@^7.69.0` - Form management
- `@hookform/resolvers@^5.2.2` - Form validation integration
- `zod@^4.2.1` - Schema validation

## Security Best Practices

- Never commit secrets to git
- Use environment variables for sensitive data
- Implement proper authentication and authorization
- Validate and sanitize all user inputs
- Keep dependencies up to date
- Use Row Level Security (RLS) on all database tables
- Implement rate limiting on API routes

## Testing Strategy

### Unit Tests
- Test all AI engine functions
- Test service layer functions
- Test utility functions
- Aim for >80% code coverage

### Integration Tests
- Test API routes
- Test database operations
- Test third-party integrations

### E2E Tests
- Test critical user workflows
- Test dashboard functionality
- Test contact import flows
- Test screenshot analysis flow
- Test daily action generation
- Test notification delivery

## Deployment

### Staging
```bash
# Deploy to Vercel staging
vercel --env staging
```

### Production
```bash
# Deploy to Vercel production
vercel --prod
```

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Type checking successful
- [ ] Linting successful
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Performance benchmarks met
- [ ] Security review completed

## Project Assessment Command

### `/assess` - Periodic Progress Assessment

Run a comprehensive assessment of project implementation status:

```bash
# From the realcoach-app directory
npm run assess           # Full assessment with detailed report
npm run assess:json      # Output as JSON (for CI/CD)
npm run assess:md        # Output as Markdown (for documentation)
```

**What it checks:**
- ✅ Feature completeness vs. build plan requirements
- ✅ Dependency installation status
- ✅ Phase-by-phase progress tracking
- ✅ Behavioral systems implementation
- ✅ Critical gaps and next priorities
- ✅ Overall project grade (A-F scale)

**Assessment Categories:**
1. **Phase 1: Foundation** (Weeks 1-3) - Auth, contacts, database
2. **Phase 2: Contact Intelligence** (Weeks 4-6) - Imports, OCR, inputs
3. **Phase 3: AI Pipeline Engine** (Weeks 7-10) - Behavioral systems
4. **Phase 4: Dashboards & Integrations** (Weeks 11-13) - Analytics, Mailchimp

**Recommended Usage:**
- Run **weekly** during active development
- Run **before** each sprint planning
- Run **after** completing major features
- Save reports to track progress over time

**Example Output (UPDATED - Phase 3 Complete):**
```
╔═══════════════════════════════════════════════════════════════╗
║  OVERALL GRADE:                                           A  ║
║  Overall Score:                                        90%  ║
║  Feature Complete:                                      75%  ║
╚═══════════════════════════════════════════════════════════════╝

Phase 1: Foundation (Weeks 1-3)
  ✅ 7/7 features (100%)
  [████████████████████████████████████████]

Phase 2: Contact Intelligence (Weeks 4-6)
  ✅ 5/6 features (83%)
  - CSV Import System ✅
  - Screenshot OCR System ✅
  - Google Contacts Integration ✅
  - Voice/Text Input UI ✅
  - iPhone Contacts (CardDAV) ⚠️  (deferred)
  [██████████████████████████████████░░░░░░]

Phase 3: AI Pipeline Engine (Weeks 7-10)
  ✅ 11/11 features (100%)
  - Multi-tier AI routing ✅
  - Conversation analysis ✅
  - Pattern detection ✅
  - Entity extraction ✅
  - Stage detection ✅
  - Priority scoring ✅
  - 7-day monitoring ✅
  - Consistency tracking ✅
  - Next action recommendations ✅
  - Reply generation ✅
  - Automated daily actions ✅
  - Email notifications ✅
  [████████████████████████████████████████]

Phase 4: Dashboards & Integrations (Weeks 11-13)
  ✅ 2/5 features (40%)
  - Behavior Dashboard ✅
  - Dashboard Stats ✅
  - Sales Dashboard ⚠️
  - Mailchimp Integration ⚠️
  - Mobile Optimization ⚠️
  [████████████████░░░░░░░░░░░░░░░░░░░░░░░░]

⚠️  CRITICAL GAPS
  • No testing infrastructure (unit/integration/E2E)
  • Sales dashboard (4 Conversations tracking)
  • Mailchimp integration

🎯 NEXT PRIORITIES
  1. Build Sales Dashboard (Phase 4)
  2. Implement Mailchimp integration
  3. Add testing infrastructure (Jest/Playwright)
  4. Mobile optimization and performance tuning
```

**Tracking Progress Over Time:**
```bash
# Save assessment reports to track progress
npm run assess > reports/assessment-$(date +%Y%m%d).txt
npm run assess:md > reports/assessment-$(date +%Y%m%d).md
```

## Success Metrics

### User Engagement
- Daily active users
- Contacts imported per user
- Screenshot analyses per day
- Daily actions completed

### Behavioral Accuracy
- Pipeline stage detection accuracy
- Priority scoring user satisfaction
- Reply draft acceptance rate
- 7-day rule flagging accuracy

### Technical Performance
- Page load times
- API response times
- Screenshot analysis speed
- Uptime and reliability

---

## Important Notes

- **Always reference the behavior logic guide** when implementing behavioral features
- **Test AI decisions thoroughly** before deploying to production
- **Monitor user feedback** on AI suggestions to improve accuracy
- **Keep the manual override system** functional - users should always have control
- **Document behavioral changes** in the behavior logic guide
- **Use parallel development workflow** defined in AGENTS.md for team coordination

---

*RealCoach AI 1.2 | Behavioral Intelligence for Real Estate Professionals | Version 1.2.0 | Updated: December 29, 2025 (Phase 2 Complete)*
