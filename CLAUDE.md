# CLAUDE.md - RealCoach AI 1.2

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

RealCoach AI 1.2 is an AI-powered real estate contact management and pipeline automation system. The application uses behavioral pattern recognition to automatically manage contacts, analyze conversations, and generate actionable insights for real estate agents.

## Project Vision

**Objective**: Build a complete MVP for RealCoach.ai - an AI-powered real estate contact management system with deep behavioral intelligence.

**Timeline**: 13 weeks (4 development phases)

**Core Differentiator**: Behavioral pattern recognition that automatically stages contacts, prioritizes daily actions, and generates AI-powered recommendations.

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

### 1. Pipeline Progression Engine
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

### Phase 2: Contact Intelligence (Weeks 4-6)
- Contact Import Systems
- Screenshot Upload & OCR
- Voice & Text Input

**Key Deliverables:**
- CSV upload with parsing
- Google Contacts API integration
- iPhone Contacts integration (CardDAV)
- Tesseract.js OCR for screenshot text extraction
- Voice recording UI (Web Speech API)
- Text input form for conversations

### Phase 3: AI Pipeline Engine (Weeks 7-10)
- Pipeline Progression Rules Engine
- Daily Action Engine
- Consistency Score System
- Next Action & Reply Systems

**Key Deliverables:**
- Hardcoded business rules for stage transitions
- 7-day activity monitoring system
- Conversation pattern detection
- Priority scoring algorithm (0-100 scale)
- Consistency score calculation
- Next action recommendation engine
- Reply draft generation system

### Phase 4: Dashboards & Integrations (Weeks 11-13)
- Behavior Dashboard
- Sales Dashboard & Analytics
- Mailchimp Integration & Polish

**Key Deliverables:**
- Today's 5-10 most important contacts
- Weekly "411" priorities
- Pipeline snapshot visualization
- Consistency score display
- "4 Conversations" tracking (appointments, listings, closings, GCI)
- Conversion funnel visualization
- Lead source tracking
- Mailchimp API integration
- Mobile optimization

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
├── /inputs           # Input components (voice, text, screenshot)
└── /layout           # Layout components

/lib
├── /hooks           # Custom React hooks
├── /services        # API services
├── /ai              # AI engines (pipeline, priority, consistency)
├── /integrations    # Third-party integrations
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

*RealCoach AI 1.2 | Behavioral Intelligence for Real Estate Professionals | Version 1.2.0*
