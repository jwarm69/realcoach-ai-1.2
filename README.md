# RealCoach AI 1.2 - Behavioral Intelligence for Real Estate Professionals

**Version**: 1.2.0
**Status**: Planning & Development Phase
**Timeline**: 13 weeks (4 development phases)

---

## 🎯 Project Overview

RealCoach AI 1.2 is an AI-powered real estate contact management and pipeline automation system that uses **deep behavioral pattern recognition** to automatically manage contacts, analyze conversations, and generate actionable insights for real estate agents.

### Key Differentiator

Unlike traditional CRMs that require manual data entry, RealCoach AI automatically:

- 📊 **Stages contacts** based on conversation analysis
- 🎯 **Prioritizes daily actions** using behavioral intelligence
- 💬 **Extracts insights** from screenshots, voice, and text
- 📧 **Generates AI-powered replies** and recommendations
- 📈 **Tracks consistency** with gamified goals

---

## 🚀 Tech Stack

### Frontend
- **Next.js 14** (App Router)
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

### 1. Pipeline Progression Engine
Automatically stages contacts based on conversation patterns:
- **Lead** → **New Opportunity**: Motivation + Timeframe + Specific Property
- **New Opportunity** → **Active Opportunity**: Showings + 7-day activity
- **Active Opportunity** → **Under Contract**: Offer Accepted
- **Under Contract** → **Closed**: Closing Completed

### 2. Conversation Analysis
Detects behavioral patterns with confidence scoring:
- Buying/selling intent
- Motivation level (High/Medium/Low)
- Timeframe (Immediate/1-3/3-6/6+ months)
- Property preferences
- Budget/pre-approval status

### 3. Daily Priority Algorithm
Scores contacts 0-100 based on:
- Motivation level (30 points)
- Days since contact (25 points)
- Pipeline stage (20 points)
- New lead bonus (15 points)
- Timeframe urgency (10 points)
- 7-day rule flag (+10 priority boost)

### 4. Consistency Tracking
Gamified 5-contacts/day goal:
- Daily target tracking
- Rolling 7-day average
- Streak tracking with bonuses
- Zero-day penalties
- Visual feedback (green/yellow/red)

### 5. Next Action Recommendations
Stage-specific logic with scripts:
- Context-aware action types
- Urgency scoring (1-10)
- Suggested scripts
- "Why it matters" behavioral rationale

### 6. Reply Draft Generation
AI-powered response suggestions:
- Scenario-based templates
- Conversation context integration
- Editable before send
- Professional structure

---

## 📋 Development Phases

### Phase 1: Foundation (Weeks 1-3)
- ✅ Setup & Authentication
- ✅ Contact Management Core
- ✅ Behavioral Data Infrastructure

### Phase 2: Contact Intelligence (Weeks 4-6)
- ✅ Contact Import Systems (CSV, Google, iPhone)
- ✅ Screenshot Upload & OCR (Tesseract.js)
- ✅ Voice & Text Input

### Phase 3: AI Pipeline Engine (Weeks 7-10)
- ✅ Pipeline Progression Rules Engine
- ✅ Daily Action Engine
- ✅ Consistency Score System
- ✅ Next Action & Reply Systems

### Phase 4: Dashboards & Integrations (Weeks 11-13)
- ✅ Behavior Dashboard
- ✅ Sales Dashboard & Analytics
- ✅ Mailchimp Integration & Polish

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

**Phase**: Planning Complete
**Next Steps**: Initialize Next.js application

### Completed ✅
- Comprehensive documentation suite
- Behavioral logic specification
- Technical architecture design
- Data model specification
- Development workflow definition
- Parallel development framework

### In Progress 🚧
- Next.js application initialization
- Database schema setup
- Authentication implementation

### Upcoming 📋
- Phase 1: Foundation (Weeks 1-3)
- Phase 2: Contact Intelligence (Weeks 4-6)
- Phase 3: AI Pipeline Engine (Weeks 7-10)
- Phase 4: Dashboards & Integrations (Weeks 11-13)

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
