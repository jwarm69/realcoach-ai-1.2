# RealCoach AI 1.2

> Behavioral Intelligence for Real Estate Professionals

RealCoach AI is an AI-powered contact management and pipeline automation system that uses behavioral pattern recognition to automatically manage contacts, analyze conversations, and generate actionable insights.

## ✨ Features

- **Dark Theme UI** - Modern dark interface with green accent (#00FF7F)
- **AI Conversation Analysis** - Multi-tier model routing for cost-optimized intelligence
- **Pipeline Progression Engine** - Automated stage transitions based on behavioral rules
- **Daily Priority Scoring** - Multi-factor scoring (0-100 scale) for contact prioritization
- **7-Day Rule Monitoring** - Automatic inactivity alerts for active opportunities
- **Consistency Tracking** - Gamified 5-contacts/day goal with streaks
- **Next Action Recommendations** - Stage-specific action suggestions with scripts
- **Push & Email Notifications** - Daily actions, 7-day alerts, weekly summaries
- **Sales Dashboard** - 4 Conversations tracking with conversion analytics
- **Contact Import** - CSV, Google Contacts, and screenshot OCR (Tesseract.js)
- **AI Sidebar** - Real-time AI assistant on every page
- **6 Specialized Pages** - Ignition, Goals, Business Plan, Pipeline, Production, Database

## 📄 Pages

| Page | Route | Description |
|------|-------|-------------|
| Ignition | `/` | Main landing with AI chat input |
| Goals & Actions | `/goals` | Track yearly GCI targets and daily actions |
| Business Plan | `/business-plan` | Strategic planning with 3-pillar layout |
| Pipeline | `/pipeline` | Lead management with metrics table |
| Production Dashboard | `/production` | Goal alignment and revenue analytics |
| Database | `/database` | Contact management database |

## 🚀 Live Deployment

**Production**: https://realcoach-9nm7589m9-jwarm69s-projects.vercel.app

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: Node.js (Next.js API Routes)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + Google OAuth
- **AI**: OpenAI GPT-4o, GPT-4o-mini
- **Email**: Resend
- **Push**: Web Push API (VAPID)
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+
- npm, pnpm, or yarn
- Supabase account (free tier available)
- OpenAI API key ($5 minimum)

## Quick Start

```bash
# Clone and install
cd realcoach-app
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create `.env.local` with:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# OpenAI (Required)
OPENAI_API_KEY=sk-proj-xxxxx

# Resend Email (Required)
RESEND_API_KEY=re_xxxxx

# VAPID Push Notifications (Optional - for push notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BP_xxxxx
VAPID_PUBLIC_KEY=BP_xxxxx
VAPID_PRIVATE_KEY=xxxxx

# Google OAuth (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Security
CRON_SECRET=your-random-secret-string

# Mailchimp (Optional)
MAILCHIMP_API_KEY=xxxxx
MAILCHIMP_LIST_ID=xxxxx
MAILCHIMP_DC=usX
```

## Database Setup

1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor and run the migration files in order:
   - `supabase/migrations/20250101000000_sales_tracking.sql`
   - `supabase/migrations/20250101000001_cron_logs.sql`
   - `supabase/migrations/20250101000002_push_subscriptions.sql`
   - `supabase/migrations/20250131073754_pipeline_stage_history.sql`
   - `supabase/migrations/20250131100000_create_notification_preferences.sql`

3. Create a test user in Supabase Auth

## Seed Data (Optional)

Populate your database with sample contacts for testing:

```bash
# Install tsx if needed
npm install -g tsx

# Run seed script (use your Supabase user ID)
npx tsx scripts/seed.ts <your-user-id>
```

## Build

```bash
npm run build
```

The application builds successfully with TypeScript strict mode enabled.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── page.tsx       # Ignition (main landing)
│   │   ├── goals/         # Goals & Actions
│   │   ├── business-plan/ # Business Plan
│   │   ├── pipeline/      # Pipeline management
│   │   ├── production/    # Production Dashboard
│   │   └── database/      # Database/Contacts
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── contacts/         # Contact-specific components
│   └── layout/           # Layout components
│       ├── realcoach-navigation.tsx  # Horizontal navigation
│       └── ai-sidebar.tsx            # AI chat sidebar
├── lib/                   # Core business logic
│   ├── ai/               # AI engines (conversation analyzer, pattern detection)
│   ├── engines/          # Calculation engines (priority, 7-day monitor)
│   ├── services/         # API services (contacts, stats, analytics)
│   ├── integrations/     # Third-party integrations (CSV, Google, Mailchimp)
│   └── notifications/    # Push and email notification systems
├── supabase/             # Database setup
│   ├── setup.sql         # Complete database schema
│   └── migrations/       # Individual migrations
└── scripts/              # Utility scripts (seed.ts)
```

## Development Workflow

```bash
# Development
npm run dev

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Testing
npm test

# Build production
npm run build
```

## AI Cost Optimization

The conversation analyzer uses a three-tier routing system:

| Tier | Model | Cost | Purpose |
|------|-------|------|---------|
| 1 | Rule-based | FREE | Pattern detection (buying intent, urgency) |
| 2 | GPT-4o-mini | ~$0.03/100 convos | Entity extraction (budget, timeframe) |
| 3 | GPT-4o | ~$0.60/100 convos | Complex reasoning (stage detection) |

Average cost: ~$0.01-0.03 per 100 conversations analyzed.

## License

Copyright © 2025 RealCoach AI. All rights reserved.
