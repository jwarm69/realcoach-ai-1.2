# AGENTS.md - Parallel Development Workflow for RealCoach AI 1.2

## Overview

This document defines the parallel development workflow for RealCoach AI 1.2, enabling multiple specialized agents to work simultaneously on different aspects of the project while maintaining coordination and avoiding conflicts.

## Agent Architecture

RealCoach AI 1.2 uses a specialized agent system where each agent has specific responsibilities, expertise areas, and coordination protocols. This enables true parallel development with minimal conflicts.

---

## Specialized Agents

### 1. Frontend Agent

**Responsibilities:**
- Next.js App Router pages and layouts
- React components (presentational and container)
- shadcn/ui component integration
- Tailwind CSS styling
- Responsive design
- Client-side state management
- Form handling (React Hook Form + Zod)

**File Ownership:**
```
/app/**/*.tsx
/components/**/*.tsx
/lib/hooks/**/*.ts
```

**Coordination Points:**
- API route contracts with Backend Agent
- TypeScript type definitions shared with Backend Agent
- Component props defined with Backend Agent
- UI requirements from AI Engine Agent

**Example Tasks:**
- Create contact list page with filtering
- Build contact detail view
- Implement dashboard layouts
- Create form components for contact editing
- Build responsive navigation

---

### 2. Backend Agent

**Responsibilities:**
- Next.js API routes
- Supabase database operations
- Authentication and authorization
- Data validation and sanitization
- API response formatting
- Error handling
- Row Level Security (RLS) policies

**File Ownership:**
```
/app/api/**/*.ts
/lib/services/**/*.ts
/lib/database.types.ts
```

**Coordination Points:**
- API contracts with Frontend Agent
- Database schema with Data Model specifications
- TypeScript type definitions shared with Frontend Agent
- AI engine integration with AI Engine Agent

**Example Tasks:**
- Create contact CRUD API routes
- Implement authentication endpoints
- Build file upload handling
- Create data validation schemas
- Implement pagination logic

---

### 3. AI Engine Agent

**Responsibilities:**
- Pipeline progression engine
- Conversation pattern detection
- Priority scoring algorithm
- Consistency score calculation
- Next action recommendation system
- Reply draft generation
- Activity monitoring system

**File Ownership:**
```
/lib/ai/**/*.ts
/lib/engines/**/*.ts
/lib/analysis/**/*.ts
```

**Coordination Points:**
- API integration with Backend Agent
- UI requirements for Frontend Agent
- Testing validation with QA Agent
- OCR integration with Integration Agent

**Example Tasks:**
- Implement pipeline stage progression rules
- Build conversation pattern detection
- Create priority scoring algorithm
- Implement consistency score calculation
- Generate next action recommendations
- Build reply draft generation system

---

### 4. Integration Agent

**Responsibilities:**
- Mailchimp API integration
- Google Contacts API integration
- iPhone Contacts (CardDAV) integration
- Tesseract.js OCR implementation
- Third-party service authentication
- Webhook handling
- External service monitoring

**File Ownership:**
```
/lib/integrations/**/*.ts
/lib/ocr/**/*.ts
/lib/mailchimp/**/*.ts
/lib/google/**/*.ts
```

**Coordination Points:**
- Data models with Backend Agent
- UI components with Frontend Agent
- AI analysis integration with AI Engine Agent
- Error handling with Backend Agent

**Example Tasks:**
- Implement Mailchimp sync functionality
- Build Google Contacts OAuth flow
- Create CSV import/export
- Integrate Tesseract.js for OCR
- Handle webhook callbacks
- Implement retry logic for external APIs

---

### 5. QA Agent

**Responsibilities:**
- Unit testing
- Integration testing
- E2E testing
- Test data generation
- Performance testing
- Accessibility testing
- Bug verification and regression testing

**File Ownership:**
```
tests/**/*.test.ts
tests/**/*.spec.ts
tests/**/*.e2e.ts
```

**Coordination Points:**
- Test requirements from all agents
- Bug reporting to appropriate agents
- Test coverage monitoring
- Performance benchmarking

**Example Tasks:**
- Write unit tests for AI engine functions
- Create integration tests for API routes
- Build E2E tests for user workflows
- Generate test data for all scenarios
- Monitor test coverage
- Verify bug fixes

---

## Parallel Development Workflow

### Phase-Based Parallel Execution

#### Phase 1: Foundation (Weeks 1-3)

**Week 1:**
- **Frontend Agent**: Set up Next.js, routing, auth UI
- **Backend Agent**: Database schema, auth API, RLS policies
- **QA Agent**: Test environment setup, test framework

**Week 2:**
- **Frontend Agent**: Contact pages, CRUD UI
- **Backend Agent**: Contact API routes, validation
- **QA Agent**: Unit tests for CRUD operations

**Week 3:**
- **Frontend Agent**: Enhanced contact forms, filters
- **Backend Agent**: Advanced queries, search functionality
- **QA Agent**: Integration tests for contact management

#### Phase 2: Contact Intelligence (Weeks 4-6)

**Week 4:**
- **Frontend Agent**: Import wizard UI
- **Integration Agent**: CSV parsing, Google Contacts, iPhone Contacts
- **Backend Agent**: Import API routes, duplicate detection
- **QA Agent**: Import testing with various file formats

**Week 5:**
- **Frontend Agent**: Screenshot upload UI
- **Integration Agent**: Tesseract.js integration
- **Backend Agent**: File upload handling, storage
- **QA Agent**: OCR accuracy testing

**Week 6:**
- **Frontend Agent**: Voice/text input components
- **Integration Agent**: Web Speech API, text processing
- **AI Engine Agent**: Initial conversation analysis setup
- **QA Agent**: Input method testing

#### Phase 3: AI Pipeline Engine (Weeks 7-10)

**Week 7:**
- **AI Engine Agent**: Pipeline progression rules, pattern detection
- **Backend Agent**: Pipeline state management API
- **Frontend Agent**: Pipeline visualization UI
- **QA Agent**: Pipeline logic testing

**Week 8:**
- **AI Engine Agent**: Priority scoring algorithm, daily action generation
- **Backend Agent**: Action scheduling API
- **Frontend Agent**: Daily actions display
- **QA Agent**: Priority scoring validation

**Week 9:**
- **AI Engine Agent**: Consistency score calculation
- **Backend Agent**: Activity tracking API
- **Frontend Agent**: Consistency score visualization
- **QA Agent**: Score accuracy testing

**Week 10:**
- **AI Engine Agent**: Next action recommendations, reply drafts
- **Backend Agent**: Suggestion API routes
- **Frontend Agent**: Action completion UI, reply editing
- **QA Agent**: Recommendation relevance testing

#### Phase 4: Dashboards & Integrations (Weeks 11-13)

**Week 11:**
- **Frontend Agent**: Behavior dashboard, priority display
- **AI Engine Agent**: Dashboard data aggregation
- **Backend Agent**: Analytics API
- **QA Agent**: Dashboard functionality testing

**Week 12:**
- **Frontend Agent**: Sales dashboard, charts/graphs
- **Backend Agent**: Sales metrics calculation
- **QA Agent**: Analytics accuracy testing

**Week 13:**
- **Integration Agent**: Mailchimp sync, email recommendations
- **Frontend Agent**: Mobile optimization
- **Backend Agent**: Performance optimization
- **QA Agent**: Full E2E testing, bug fixes

---

## Agent Coordination Protocols

### Communication Channels

**Daily Standup (Async):**
- Each agent posts daily progress
- Blockers identified and escalated
- Coordination needs highlighted

**Weekly Planning:**
- Review previous week's progress
- Plan upcoming week's parallel tasks
- Identify interdependencies
- Adjust timeline as needed

**Blocker Resolution:**
- Immediate escalation for critical blockers
- Agent-to-agent direct communication
- Mediation via project coordinator if needed

### Handoff Protocols

**Frontend → Backend Handoff:**
1. Frontend defines UI requirements
2. Backend proposes API contract
3. Both agree on TypeScript interfaces
4. Backend implements API
5. Frontend integrates with tests
6. QA validates integration

**Backend → AI Engine Handoff:**
1. Backend provides data access patterns
2. AI Engine defines analysis requirements
3. Backend creates necessary endpoints
4. AI Engine implements algorithms
5. Backend integrates into API
6. QA validates accuracy

**Integration Agent → All Agents:**
1. Integration Agent provides service interfaces
2. Other agents define requirements
3. Integration Agent implements
4. Other agents integrate
5. QA validates end-to-end

### Conflict Resolution

**File-Level Conflicts:**
- Clear file ownership minimizes conflicts
- Git handles merge conflicts
- Agent-to-agent communication for resolution

**API Contract Conflicts:**
- Backend Agent owns API contracts
- Frontend Agent requests changes
- Mutual agreement required

**Feature Priority Conflicts:**
- Project coordinator decides priority
- Timeline adjustments made if needed
- Agents reprioritize accordingly

---

## Parallel Execution Examples

### Example 1: Contact Import Feature

**Simultaneous Work:**
- **Frontend Agent**: Builds import wizard UI (2 days)
- **Integration Agent**: Implements Google Contacts API (2 days)
- **Backend Agent**: Creates import API routes (1 day)
- **QA Agent**: Writes import tests (1 day)

**Sequential Dependencies:**
1. Integration Agent completes API
2. Backend Agent creates import endpoints
3. Frontend Agent connects UI to API
4. QA Agent validates end-to-end

**Time Savings**: 2 days (parallel) vs 6 days (sequential)

### Example 2: Screenshot Analysis

**Simultaneous Work:**
- **Frontend Agent**: Builds upload UI (1 day)
- **Integration Agent**: Implements Tesseract.js OCR (2 days)
- **AI Engine Agent**: Creates analysis engine (2 days)
- **Backend Agent**: Handles file storage (1 day)
- **QA Agent**: Tests OCR accuracy (1 day)

**Sequential Dependencies:**
1. Integration Agent completes OCR
2. AI Engine Agent builds analysis on top
3. Backend Agent stores results
4. Frontend Agent displays results
5. QA Agent validates entire flow

**Time Savings**: 2 days (parallel) vs 7 days (sequential)

---

## Agent Best Practices

### Frontend Agent
- Start UI development before backend is ready (use mock data)
- Create reusable components in shadcn/ui style
- Implement proper loading and error states
- Test responsive design early
- Coordinate API contracts with Backend Agent

### Backend Agent
- Design API contracts with Frontend Agent
- Implement proper error handling and validation
- Use TypeScript for type safety
- Document API endpoints
- Coordinate data models with AI Engine Agent

### AI Engine Agent
- Implement algorithms as pure functions
- Include confidence scores for all decisions
- Create comprehensive unit tests
- Document behavioral logic clearly
- Coordinate requirements with Frontend Agent

### Integration Agent
- Handle external API failures gracefully
- Implement retry logic with exponential backoff
- Cache responses when appropriate
- Monitor API usage and costs
- Coordinate data formats with Backend Agent

### QA Agent
- Write tests alongside development (TDD when possible)
- Maintain high test coverage (>80%)
- Test edge cases and error scenarios
- Monitor performance benchmarks
- Communicate bugs clearly to appropriate agents

---

## Tooling for Parallel Development

### Version Control
```bash
# Feature branches per agent
git checkout -b frontend/contact-list
git checkout -b backend/contact-api
git checkout -b ai/pipeline-engine
git checkout -b integration/mailchimp-sync
git checkout -qa/import-tests
```

### Continuous Integration
```yaml
# Parallel test execution
jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps: [frontend tests]

  test-backend:
    runs-on: ubuntu-latest
    steps: [backend tests]

  test-ai:
    runs-on: ubuntu-latest
    steps: [AI engine tests]
```

### Communication
- GitHub Issues for task tracking
- Pull Requests for code review
- Discord/Slack for daily communication
- Weekly planning meetings

---

## Success Metrics

### Development Velocity
- Features completed per week
- Bugs fixed per week
- Test coverage percentage
- Code review turnaround time

### Quality Metrics
- Test pass rate
- Bug escape rate to production
- Performance benchmark compliance
- User satisfaction with AI recommendations

### Coordination Metrics
- Inter-agent blocking time
- Merge conflict resolution time
- Handoff efficiency
- Parallel task utilization percentage

---

## Escalation Path

1. **Agent-Level**: Agent resolves independently
2. **Peer-Level**: Consult with another agent
3. **Project Coordinator**: Escalate for priority/decision
4. **Team Meeting**: Discuss blockers collectively

---

## Conclusion

This parallel development workflow enables RealCoach AI 1.2 to be built efficiently by leveraging specialized agents working simultaneously. Clear ownership, coordination protocols, and handoff procedures minimize conflicts while maximizing development velocity.

**Key Benefits:**
- Faster development through parallelization
- Higher quality through specialized expertise
- Better code organization through clear ownership
- Reduced conflicts through coordination protocols
- Scalable to larger teams

---

*RealCoach AI 1.2 | Parallel Development Workflow | Version 1.0*
