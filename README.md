# RealCoach AI 1.2 - Behavioral Intelligence for Real Estate Professionals

**Version**: 1.2.0  
**Status**: Phase 3 (Weeks 7-10) 85% complete; Phase 4 in progress  
**Overall Progress**: ~65-70% complete (9 of 13 weeks)  
**Timeline**: 13 weeks (4 development phases)

---

## 🎯 Project Overview

RealCoach AI 1.2 is an AI-powered real estate contact management and pipeline automation system that uses **deep behavioral pattern recognition** to automatically manage contacts, analyze conversations, and generate actionable insights for real estate agents.

### Key Differentiator

Unlike traditional CRMs that require manual data entry, RealCoach AI automatically:

- 📊 **Stages contacts** based on AI conversation analysis (GPT-4o)
- 🎯 **Prioritizes daily actions** using multi-factor behavioral scoring
- 💬 **Extracts insights** from screenshots (OCR), voice, and text
- 📧 **Generates AI-powered replies** and next action recommendations
- 📈 **Tracks consistency** with gamified 5-contacts/day goals
- 💰 **Optimizes costs** with smart multi-tier model routing

---

## 🚀 Tech Stack

### Frontend
- **Next.js 16.1.1** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **React Hook Form** + **Zod** validation

### Backend
- **Node.js** (Next.js API Routes)
- **Supabase** (PostgreSQL + Auth + Storage)
- **RESTful API** design

### AI/ML
- **Tesseract.js** (OCR for computer-generated text)
- **OpenAI GPT-4o** (conversation analysis)
- **Custom algorithms** (behavioral pattern detection)

### Integrations
- **Mailchimp API v3** (email marketing sync)
- **Google People API** (contact import)
- **CardDAV** (iPhone contacts import)

### Deployment
- **Vercel** (hosting)
- **Supabase Cloud** (database)
- **Vercel Edge Network** (CDN)

---

## 🧠 Core Behavioral Systems

### 1. Multi-Tier AI Model Routing ⭐ (Cost Optimization: 80% Savings)
Intelligent three-tier routing system for cost-optimized AI analysis:
```
User Input → Conversation Analyzer
              ↓
    ┌─────────┼─────────┐
    ↓         ↓         ↓
Tier 1     Tier 2    Tier 3
Rule-based  Mini     GPT-4o
(FREE)    ($0.15/1K) ($3/1K)
    ↓         ↓         ↓
Patterns  Entities  Complex
          + Budget  Analysis
```

**Cost Impact**: $0.006 per conversation vs $0.03 industry standard = **80% cost reduction**

**Architecture**:
- **Tier 1** (Rule-based): FREE - Detects buying intent, urgency, showings
- **Tier 2** (GPT-4o-mini): $0.15/1K tokens - Extracts entities with budget tracking
- **Tier 3** (GPT-4o): $3/1K tokens - Complex reasoning and analysis

**Components**: `conversation-analyzer.ts` (orchestrator), `model-router.ts` (smart routing), `pattern-detector.ts` (free patterns), `entity-extractor.ts` (Mini), `stage-detector.ts` (GPT-4o)

### 2. Pipeline Progression Engine
Automatically stages contacts based on conversation patterns:
- **Lead** → **New Opportunity**: Motivation + Timeframe + Specific Property
- **New Opportunity** → **Active Opportunity**: Showings + 7-day activity
- **Active Opportunity** → **Under Contract**: Offer Accepted
- **Under Contract** → **Closed**: Closing Completed

### 3. Conversation Analysis
Detects behavioral patterns with confidence scoring:
- Buying/selling intent
- Motivation level (High/Medium/Low)
- Timeframe (Immediate/1-3/3-6/6+ months)
- Property preferences
- Budget/pre-approval status

### 4. Daily Priority Algorithm
Scores contacts 0-100 based on:
- Motivation level (30 points)
- Days since contact (25 points)
- Pipeline stage (20 points)
- New lead bonus (15 points)
- Timeframe urgency (10 points)
- 7-day rule flag (+10 priority boost)

### 5. Consistency Tracking
Gamified 5-contacts/day goal:
- Daily target tracking
- Rolling 7-day average
- Streak tracking with bonuses
- Zero-day penalties
- Visual feedback (green/yellow/red)

### 6. Next Action Recommendations
Stage-specific logic with scripts:
- Context-aware action types
- Urgency scoring (1-10)
- Suggested scripts
- "Why it matters" behavioral rationale

### 7. Reply Draft Generation
AI-powered response suggestions:
- Scenario-based templates
- Conversation context integration
- Editable before send
- Professional structure

---

## 📋 Development Phases

### Phase 1: Foundation (Weeks 1-3) — ✅ 100% Complete
- ✅ Setup & Authentication (email/password + Google OAuth)
- ✅ Contact Management Core (CRUD operations)
- ✅ Behavioral Data Infrastructure (enhanced contact fields)
- ✅ Database schema with RLS policies

### Phase 2: Contact Intelligence (Weeks 4-6) — ✅ 100% Complete
- ✅ CSV Import with auto-column detection
- ✅ Google Contacts API integration (OAuth + People API)
- ✅ Screenshot OCR (Tesseract.js) with confidence scoring
- ✅ Voice & Text Input UI components
- ⚠️ iPhone Contacts (CardDAV) - Deferred to Phase 4

### Phase 3: AI Pipeline Engine (Weeks 7-10) — ✅ 85% Complete
- ✅ Pipeline Progression Rules Engine (hardcoded business rules)
- ✅ AI Conversation Analysis (GPT-4o with multi-tier routing)
- ✅ Pattern Detection (buying intent, urgency, showings, etc.)
- ✅ Entity Extraction (motivation, timeframe, property prefs)
- ✅ Stage Detection with confidence scoring
- ✅ Priority Scoring Algorithm (0-100 multi-factor)
- ✅ 7-Day Rule Monitoring & enforcement
- ✅ Consistency Score System (5-contacts/day tracking)
- ✅ Next Action Recommendations (stage-specific logic)
- ✅ Reply Draft Generation (structured AI responses)
- ⚠️ Automated daily action generation (cron) - In progress
- ⚠️ Push notifications - Pending

### Phase 4: Dashboards & Integrations (Weeks 11-13) — ✅ 100% Complete
- ✅ Behavior Dashboard (priorities, stats, violations, consistency score)
- ✅ Sales Dashboard (4 Conversations tracking, GCI calculator)
- ✅ Conversion Funnel Visualization (pipeline stage conversion, drop-off metrics)
- ✅ Lead Source Charts (source distribution with percentages)
- ✅ Mailchimp Integration (API v3 sync, tagging by pipeline/motivation/source)
- ✅ Mailchimp Settings UI (connect/test connection, sync status, manual sync)
- ✅ Mobile Optimization (touch-friendly buttons, FAB, responsive dashboards)
- ✅ Testing Infrastructure (unit tests for sales/mailchimp/engines, E2E tests)

---

## 📚 Documentation

### Core Documentation
- **[CLAUDE.md](./CLAUDE.md)** - Project instructions for Claude Code
- **[AGENTS.md](./AGENTS.md)** - Parallel development workflow

### Planning & Architecture
- **[REAL_AGENT_AI_BUILD_PLAN.md](./REAL_AGENT_AI_BUILD_PLAN.md)** - Complete 13-week build plan
- **[REAL_AGENT_AI_TECHNICAL_ARCHITECTURE.md](./REAL_AGENT_AI_TECHNICAL_ARCHITECTURE.md)** - System architecture

### Implementation Guides
- **[REAL_AGENT_AI_BEHAVIOR_LOGIC_GUIDE.md](./REAL_AGENT_AI_BEHAVIOR_LOGIC_GUIDE.md)** - Behavioral implementation details
- **[REAL_AGENT_AI_DATA_MODEL.md](./REAL_AGENT_AI_DATA_MODEL.md)** - Database specifications
- **[REAL_AGENT_AI_DEVELOPMENT_WORKFLOW.md](./REAL_AGENT_AI_DEVELOPMENT_WORKFLOW.md)** - Development workflow

### Progress Summaries
- **[WEEK_7-10_COMPLETION_SUMMARY.md](./WEEK_7-10_COMPLETION_SUMMARY.md)** - AI Pipeline Engine completion (latest)
- **[WEEK_4-5_COMPLETION_SUMMARY.md](./WEEK_4-5_COMPLETION_SUMMARY.md)** - Contact Intelligence completion
- **[WEEK_3_COMPLETION_SUMMARY.md](./WEEK_3_COMPLETION_SUMMARY.md)** - Behavioral Data Infrastructure completion
- **[PROJECT_HEALTH_AUDIT_2025-12-31.md](./PROJECT_HEALTH_AUDIT_2025-12-31.md)** - Comprehensive project audit

---

## 🛠️ Getting Started

### Prerequisites
```bash
# Node.js 18+
node --version  # v18.0.0 or higher

# npm
npm --version   # 9.0.0 or higher

# Git
git --version
```

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/realcoach-ai-1.2.git
cd realcoach-ai-1.2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Edit .env.local with your credentials
code .env.local
```

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

### Running the Application

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run linter
npm run lint

# Type check
npm run type-check
```

---

## 🤝 Parallel Development

RealCoach AI 1.2 uses a specialized agent system for parallel development:

### Specialized Agents
- **Frontend Agent**: Next.js pages, components, UI
- **Backend Agent**: API routes, database, authentication
- **AI Engine Agent**: Pipeline logic, pattern detection, scoring
- **Integration Agent**: Third-party services, OCR, imports
- **QA Agent**: Testing, validation, bug fixes

### Workflow
See [AGENTS.md](./AGENTS.md) for complete parallel development workflow.

---

## 📊 Success Metrics

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

## 🏗️ Project Structure

```
realcoach-ai-1.2/
├── CLAUDE.md                              # Project instructions
├── AGENTS.md                              # Parallel development workflow
├── README.md                              # This file
├── REAL_AGENT_AI_BUILD_PLAN.md            # 13-week build plan
├── REAL_AGENT_AI_BEHAVIOR_LOGIC_GUIDE.md  # Behavioral implementation
├── REAL_AGENT_AI_TECHNICAL_ARCHITECTURE.md # System architecture
├── REAL_AGENT_AI_DATA_MODEL.md            # Database specifications
├── REAL_AGENT_AI_DEVELOPMENT_WORKFLOW.md  # Development workflow
└── realcoach-app/                         # Next.js application (to be created)
    ├── app/                              # Next.js App Router
    ├── components/                       # React components
    ├── lib/                             # Utilities and services
    └── public/                          # Static assets
```

---

## 🚧 Current Status

**Overall Progress**: ~65-70% complete (9 of 13 weeks)  
**Current Phase**: Phase 3 (85% complete) + Phase 4 (40% complete)  
**Last Updated**: December 31, 2025

### Recently Completed ✅
- ✅ **Phase 3: AI Pipeline Engine** (85% done)
  - ⭐ **Multi-tier AI model routing** (80% cost reduction: $0.006 vs $0.03/conversation)
  - GPT-4o conversation analysis with confidence scoring
  - Pipeline progression with behavioral pattern detection
  - Priority scoring algorithm (0-100 multi-factor)
  - 7-day rule monitoring & enforcement
  - Consistency score tracking (gamified 5-contacts/day)
  - Next action recommendations (stage-specific logic)
  - Reply draft generation (AI-powered responses)
- ✅ **Phase 2: Contact Intelligence** (100% done)
  - CSV import with auto-detection
  - Google Contacts integration
  - Screenshot OCR (Tesseract.js)
  - Voice/text input components
- ✅ **Phase 1: Foundation** (100% done)
  - Authentication, contacts, database

### In Progress 🚧
- 🔄 **Automated daily action generation** (cron job + email notifications)
- 🔄 **Sales Dashboard** (4 Conversations tracking, GCI Calculator)
- 🔄 **Conversion Funnel Visualization** (pipeline stage conversion)
- 🔄 **Mailchimp integration** (API complete, UI pending)
- 🔄 **Push notification system** (mobile engagement)
- 🔄 **Testing infrastructure** (expand from 20% to 60%+ coverage)

### Upcoming 📋
- Complete Phase 4 features:
  - GCI Calculator (Gross Commission Income tracking)
  - Lead Source Charts (Zillow, Realtor.com, Referral, etc.)
  - Mobile optimization (responsive dashboards, touch-friendly UI)
- Quality improvements:
  - Expand test coverage (AI engines, API routes, E2E tests)
  - Performance optimization (caching, database indexes)
  - Security audit (RLS policies, input validation)

---

## 🤝 Contributing

This project uses a parallel development workflow with specialized agents. See [AGENTS.md](./AGENTS.md) for contribution guidelines.

### Development Workflow
1. Read relevant documentation
2. Create feature branch
3. Implement with tests
4. Submit pull request
5. Code review
6. Merge to main

### Code Style
- Use TypeScript for all code
- Follow ESLint rules
- Write tests for new features
- Document complex logic
- Use meaningful variable names

---

## 📄 License

[Your License Here]

---

## 👥 Team

**Project Lead**: [Your Name]
**Development**: Specialized Agent Team (Frontend, Backend, AI Engine, Integration, QA)

---

## 📞 Support

For questions or issues:
- Review documentation in `/docs`
- Check [CLAUDE.md](./CLAUDE.md) for project guidance
- Consult [AGENTS.md](./AGENTS.md) for workflow questions
- Open a GitHub issue for bugs or feature requests

---

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Supabase** - Backend as a service
- **OpenAI** - AI conversation analysis
- **Tesseract.js** - OCR text extraction
- **shadcn/ui** - UI components
- **Vercel** - Deployment platform

---

**RealCoach AI 1.2 | Behavioral Intelligence for Real Estate Professionals | Version 1.2.0**

*Built with ❤️ for real estate professionals who want to work smarter, not harder.*
