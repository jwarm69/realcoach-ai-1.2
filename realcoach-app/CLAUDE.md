# CLAUDE.md - RealCoach AI 1.2

> AI Assistant context for Claude Code (claude.ai/code) when working with this repository.

## Project Overview

**RealCoach AI 1.2** is an AI-powered real estate contact management and pipeline automation system. It uses behavioral pattern recognition to automatically manage contacts, analyze conversations, and generate actionable insights for real estate agents.

**Status**: Feature-complete and ready for deployment. Build succeeds without errors.

**Location**: `/Users/jackwarman/realcoach-ai-1.2/realcoach-app`

---

## Current Status (January 2026)

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1: Foundation | ✅ 100% | Auth, contacts, database schema |
| Phase 2: Contact Intelligence | ✅ 83% | CSV import, OCR, Google Contacts, Voice input UI |
| Phase 3: AI Pipeline Engine | ✅ 100% | Multi-tier AI routing, priority scoring, 7-day monitoring |
| Phase 4: Dashboards & Integrations | ✅ 95% | Analytics, Sales dashboard, Mailchimp, push notifications |
| Phase 5: Frontend Redesign | ✅ 100% | Dark theme UI, 6 pages, horizontal nav, AI sidebar |

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State**: React Hooks + Context API
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + Google OAuth
- **File Storage**: Supabase Storage
- **API**: RESTful (Next.js API Routes)

### AI/ML Services
- **OCR**: Tesseract.js (client-side)
- **Conversation Analysis**: OpenAI GPT-4o, GPT-4o-mini
- **Pattern Detection**: Custom algorithms (free)

### Third-Party Integrations
- **Email**: Resend API
- **Push**: Web Push API (VAPID)
- **Mailchimp**: Mailchimp API v3
- **Google Contacts**: Google People API

### Deployment
- **Hosting**: Vercel
- **Database**: Supabase Cloud
- **Monitoring**: Vercel Analytics

---

## Core Behavioral Systems

### 1. AI Conversation Analysis (Multi-tier Routing)

Located in: `lib/ai/conversation-analyzer.ts`

Three-tier cost optimization:
- **Tier 1 (Free)**: Rule-based pattern detection
- **Tier 2 (~$0.03/100)**: GPT-4o-mini for entities
- **Tier 3 (~$0.60/100)**: GPT-4o for complex reasoning

### 2. Pipeline Progression Engine

Located in: `lib/ai/pipeline-engine.ts`

Hardcoded business rules for stage transitions:
- Lead → New Opportunity: Motivation + Timeframe + Property
- New Opportunity → Active: Showings + 7-day activity
- Active → Under Contract: Offer Accepted
- Under Contract → Closed: Closing Completed

### 3. Priority Scoring (0-100)

Located in: `lib/engines/priority-calculator.ts`

Multi-factor scoring:
- Motivation level (30 points)
- Days since contact (25 points)
- Pipeline stage (20 points)
- New lead bonus (15 points)
- Timeframe urgency (10 points)
- 7-day rule flag (+10 priority boost)

### 4. 7-Day Rule Monitoring

Located in: `lib/engines/seven-day-monitor.ts`

Monitors Active Opportunities for 7+ day inactivity and automatically flags them.

### 5. Consistency Tracking

Located in: `lib/engines/consistency-scoring.ts`

Gamified 5-contacts/day goal with streaks and bonuses.

---

## New Pages (Post-Redesign)

| Page | Route | File | Description |
|------|-------|------|-------------|
| Ignition | `/` | `app/(dashboard)/page.tsx` | Main landing with centered AI input |
| Goals & Actions | `/goals` | `app/(dashboard)/goals/page.tsx` | Yearly GCI targets, daily actions |
| Business Plan | `/business-plan` | `app/(dashboard)/business-plan/page.tsx` | 3-column strategic planning |
| Pipeline | `/pipeline` | `app/(dashboard)/pipeline/page.tsx` | Lead table with metrics |
| Production Dashboard | `/production` | `app/(dashboard)/production/page.tsx` | Goal alignment, revenue chart |
| Database | `/database` | `app/(dashboard)/database/page.tsx` | Contact management |

### Layout Components (Post-Redesign)

- `components/layout/realcoach-navigation.tsx` - Horizontal top navigation
- `components/layout/ai-sidebar.tsx` - AI chat sidebar (appears on all pages)
- Legacy: `components/layout/sidebar.tsx` - Previous vertical sidebar (deprecated)

---

## Design System (Post-Redesign)

### Color Palette (oklch)

```css
--background: oklch(0.15 0 0)      /* #121212 */
--card: oklch(0.18 0 0)            /* #1E1E1E */
--accent: oklch(0.85 0.15 145)     /* #00FF7F green */
--foreground: oklch(1 0 0)         /* White */
--muted-foreground: oklch(0.7 0 0) /* #AAAAAA */
--border: oklch(0.25 0 0)          /* #333333 */
```

### Layout Pattern

```
┌─────────────────────────────────────────────────────────────┐
│  Horizontal Navigation (Logo + 6 menu items)                │
├──────────────────────────────────────────┬──────────────────┤
│  Main Content (Left, ~70%)               │  AI Sidebar       │
│  - Cards, tables, charts                 │  (Right, ~30%)    │
│                                          │  - Avatar         │
│                                          │  - Chat messages  │
│                                          │  - Input field    │
└──────────────────────────────────────────┴──────────────────┘
```

### Navigation Items

1. Ignition (/)
2. Goals & Actions (/goals)
3. Business Plan (/business-plan)
4. Pipeline (/pipeline)
5. Production Dashboard (/production)
6. Database (/database)

---

## File Organization

### Priority Files (Edit Frequently)
- `/app` - Next.js pages and API routes
- `/lib/ai` - AI engines
- `/lib/services` - API services
- `/lib/engines` - Calculation engines

### Key Directories
```
├── app/
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── page.tsx       # Ignition (main landing)
│   │   ├── goals/         # Goals & Actions
│   │   ├── business-plan/ # Business Plan
│   │   ├── pipeline/      # Pipeline management
│   │   ├── production/    # Production Dashboard
│   │   └── database/      # Database/Contacts
│   ├── api/               # API routes
│   ├── auth/              # Authentication
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── contacts/         # Contact components
│   └── layout/           # Layout components
│       ├── realcoach-navigation.tsx  # Horizontal navigation
│       └── ai-sidebar.tsx            # AI chat sidebar
├── lib/
│   ├── ai/               # AI engines
│   ├── engines/          # Calculation engines
│   ├── services/         # API services
│   ├── integrations/     # Third-party integrations
│   └── notifications/    # Push/email systems
├── supabase/             # Database setup
│   ├── setup.sql         # Complete database schema
│   └── migrations/       # Individual migrations
└── scripts/              # Utility scripts
```

---

## Development Commands

```bash
# Development
npm run dev                # Start dev server on :3000

# Building
npm run build              # Production build
npm start                  # Start production server

# Code Quality
npx tsc --noEmit           # Type check
npm run lint              # ESLint
npm test                  # Run tests

# Database
supabase status           # Check local Supabase
supabase db reset         # Reset local database

# Seed Data
npx tsx scripts/seed.ts <user-id>  # Populate test data
```

---

## Environment Variables

Required for development:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxx

# Resend
RESEND_API_KEY=re_xxxxx

# VAPID (Optional - for push notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BP_xxxxx
VAPID_PRIVATE_KEY=xxxxx

# Cron Security
CRON_SECRET=your-random-secret
```

See `.env.example` for full list.

---

## Build Status

✅ **Build succeeds** without errors

Known type assertion patterns used throughout:
- Supabase queries: `as Array<{...}> | null`
- Push notifications: `as BufferSource`
- VAPID: Graceful handling of missing keys (no build failure)

---

## Database Schema

### Core Tables
- `contacts` - Real estate contacts with behavioral data
- `conversations` - Conversation logs with AI analysis
- `sales_activities` - "4 Conversations" tracking
- `pipeline_stage_history` - Stage change history
- `push_subscriptions` - Push notification subscriptions
- `notification_preferences` - User notification settings
- `cron_logs` - Cron job execution logs

### Row Level Security (RLS)
RLS is enabled on all tables. Users can only access their own data.

---

## Common Tasks

### Adding a New API Endpoint
1. Create file in `app/api/` directory
2. Export `POST`/`GET`/`PUT`/`DELETE` functions
3. Use `createClient()` from `@/lib/supabase/server`
4. Check authentication: `const { data: { user } } = await supabase.auth.getUser()`

### Adding a New Page
1. Create file in `app/(dashboard)/` directory
2. Page is automatically protected by middleware
3. Use server components for data fetching
4. Use client components for interactivity

### Modifying AI Behavior
1. Update behavior in `lib/ai/` directory
2. For pattern detection: Edit `lib/ai/pattern-detector.ts`
3. For entity extraction: Edit `lib/ai/entity-extractor.ts`
4. For stage detection: Edit `lib/ai/stage-detector.ts`
5. Test with sample conversations

### Database Schema Changes
1. Create new migration in `supabase/migrations/`
2. Run migration in Supabase SQL Editor
3. Update TypeScript types if needed

---

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- priority-calculator.test.ts

# Watch mode
npm test -- --watch
```

---

## Deployment

**Live URL**: https://realcoach-9nm7589m9-jwarm69s-projects.vercel.app

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions to Vercel.

Quick deploy:
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Architecture Guidelines

### Component Structure
- Use TypeScript for all components
- Follow functional component pattern
- Implement proper error boundaries
- Use React Hook Form for forms
- Implement proper loading states

### Service Layer
- Separate business logic from UI
- Use async/await for API calls
- Implement proper error handling
- Use TypeScript interfaces for type safety

### AI Engine
- Modular, testable functions
- Clear input/output contracts
- Confidence scoring for all AI decisions
- Fallback mechanisms for API failures

---

## Security Best Practices

- Never commit secrets to git
- Use environment variables for sensitive data
- Implement proper authentication and authorization
- Validate and sanitize all user inputs
- Keep dependencies up to date
- Use Row Level Security (RLS) on all database tables
- Implement rate limiting on API routes

---

## Performance Standards

- Page load: <2 seconds
- API calls: <500ms
- Screenshot analysis: <15 seconds
- Daily action generation: <5 seconds

---

## Known Issues & Workarounds

1. **VAPID Build Error**: Fixed - `lib/notifications/vapid.ts` now handles missing keys gracefully
2. **Supabase Type Inference**: Use explicit type assertions for query results
3. **Push Notifications**: Requires user interaction to subscribe (browser limitation)

---

*RealCoach AI 1.2 | Behavioral Intelligence for Real Estate Professionals | Version 1.2.0 | Updated: January 2026*
