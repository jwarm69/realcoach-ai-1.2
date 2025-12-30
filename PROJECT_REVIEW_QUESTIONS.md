# RealCoach AI 1.2 - Project Review Questions

**Date**: December 30, 2025
**Purpose**: Clarification questions for client review before proceeding with implementation

---

## Project Status Summary

The project currently has:
- ✅ **Comprehensive documentation** (9 detailed specification files)
- ✅ **UI prototype** (functional chat interface with mock data)
- ❌ **No backend implementation** (no API routes, database, or services)
- ❌ **No AI integration** (no OpenAI, OCR, or pattern detection)
- ❌ **No third-party integrations** (no Supabase, Google Contacts, Mailchimp)

**Reality Check**: The README shows all 4 phases as "completed" but this refers to documentation only. Actual implementation is ~5% complete (UI only).

---

## Critical Questions by Priority

### 🔴 HIGH PRIORITY - Blocking Development

#### 1. Supabase Project & Credentials

**Question**: Do you have an existing Supabase project for this application, or should we create a new one?

- [ ] Use existing project (please provide URL and keys)
- [ ] Create new project
- [ ] Need help deciding

**If existing**: Please provide:
- Supabase project URL
- Supabase anon key
- Supabase service role key (for backend operations)

---

#### 2. OpenAI API Access

**Question**: Do you have an OpenAI API key for the GPT-4o integration, and what are the usage budget constraints?

- [ ] Have existing API key
- [ ] Need to create one
- [ ] Have budget limitations (specify monthly cap: $_______)

**Note**: The conversation analysis, reply draft generation, and pattern detection all require OpenAI API calls. Understanding budget helps optimize API usage.

---

#### 3. Authentication Method Preference

**Question**: The documentation mentions email/password + Google OAuth. Which methods should be prioritized?

- [ ] Email/password only (simpler, faster to implement)
- [ ] Google OAuth only (better UX, no password management)
- [ ] Both (as documented)
- [ ] Other (specify): _______________

**Follow-up**: Should there be any admin/role-based access, or is this single-user per account?

---

#### 4. Target Users & Scale

**Question**: What is the expected user base and scale for the initial MVP?

- Number of users: _______________
- Contacts per user (average): _______________
- Conversations/screenshots per day (average): _______________

**Why this matters**: Affects database design, API rate limiting, and cost projections for Supabase and OpenAI.

---

### 🟡 MEDIUM PRIORITY - Important for Phase Planning

#### 5. Contact Import Priority

**Question**: The documentation lists 4 contact import methods. Which should be prioritized for MVP?

Rank in order of importance (1 = highest):
- [ ] _____ CSV Upload
- [ ] _____ Google Contacts API
- [ ] _____ iPhone Contacts (CardDAV)
- [ ] _____ Manual entry

**Follow-up**: Do you have sample CSV files showing the expected format from your target users?

---

#### 6. Screenshot OCR Source

**Question**: What type of screenshots will users typically upload?

- [ ] Text message conversations (iMessage, SMS)
- [ ] WhatsApp/Facebook Messenger
- [ ] Email threads
- [ ] CRM screenshots
- [ ] Other: _______________

**Why this matters**: Different sources have different layouts; knowing the primary use case helps optimize OCR accuracy.

---

#### 7. Mobile vs Desktop Priority

**Question**: What is the primary device your users will access the application from?

- [ ] Desktop primarily (60%+ desktop usage expected)
- [ ] Mobile primarily (60%+ mobile usage expected)
- [ ] Equal split (full responsive required from day 1)

**Why this matters**: Affects implementation priorities and testing focus.

---

#### 8. Mailchimp Integration Scope

**Question**: What specific Mailchimp features are needed?

- [ ] Export contacts to Mailchimp lists
- [ ] Sync contact updates bidirectionally
- [ ] Trigger automated email campaigns
- [ ] Track email engagement (opens, clicks)
- [ ] All of the above

**Follow-up**: Do you have an existing Mailchimp account with API credentials?

---

### 🟢 LOWER PRIORITY - Design Decisions

#### 9. Pipeline Stage Customization

**Question**: The documentation defines 5 fixed pipeline stages:
1. Lead
2. New Opportunity
3. Active Opportunity
4. Under Contract
5. Closed

Should users be able to:
- [ ] Use these stages as-is (no customization)
- [ ] Rename stages (keep same logic)
- [ ] Add custom stages (more complex)
- [ ] Fully customize pipeline (most complex)

---

#### 10. Consistency Score Visibility

**Question**: The gamified consistency scoring system (5 contacts/day goal) - should this be:

- [ ] Always visible (core feature, prominent in UI)
- [ ] Optional (can be turned off by user)
- [ ] Admin-controlled (for team deployments)

---

#### 11. AI Decision Transparency

**Question**: When the AI makes recommendations (stage changes, priority scores, next actions):

- [ ] Show detailed reasoning (why the AI made this decision)
- [ ] Show simple confidence score only
- [ ] Hide AI logic (just show recommendations)

---

#### 12. Data Retention & Privacy

**Question**: How long should conversation data and screenshots be retained?

- [ ] Indefinitely
- [ ] 1 year
- [ ] 90 days
- [ ] 30 days
- [ ] User-configurable

**Follow-up**: Any specific compliance requirements (GDPR, CCPA, etc.)?

---

#### 13. Voice Recording Implementation

**Question**: The documentation mentions voice recording for contact notes. Is this:

- [ ] Critical for MVP (users expect this)
- [ ] Nice to have (can defer to post-MVP)
- [ ] Not needed (remove from scope)

**If critical**: Should recordings be:
- Transcribed and stored as text only
- Stored as audio files + transcription
- Processed but not stored (privacy)

---

#### 14. Offline Capability

**Question**: Should the app work offline?

- [ ] No (always online required)
- [ ] Read-only offline (view contacts, no sync)
- [ ] Full offline with sync (complex, requires service worker)

---

### 📋 Technical Clarifications

#### 15. Domain & Deployment

**Question**: For Vercel deployment, do you have:

- [ ] Existing Vercel account
- [ ] Custom domain for the app
- [ ] Specific region preferences for hosting

**Domain**: _______________

---

#### 16. Development Environment

**Question**: Should we set up:

- [ ] Local development only (no shared staging)
- [ ] Staging environment + Production
- [ ] Dev + Staging + Production (full pipeline)

---

#### 17. Analytics & Monitoring

**Question**: Beyond Vercel Analytics (mentioned in docs), are there specific tracking needs?

- [ ] Vercel Analytics is sufficient
- [ ] Need detailed user behavior tracking (Mixpanel, Amplitude, etc.)
- [ ] Need error monitoring (Sentry, etc.)
- [ ] Need custom business metrics dashboard

---

#### 18. Testing Expectations

**Question**: What level of automated testing is expected for MVP?

- [ ] Manual testing only (fastest delivery)
- [ ] Unit tests for critical paths (AI engines, scoring)
- [ ] Integration tests for API routes
- [ ] Full E2E tests (comprehensive but slower)

---

### 🎯 Business Clarifications

#### 19. MVP Definition

**Question**: What is the absolute minimum feature set needed to launch?

Please mark as Essential (E), Important (I), or Deferrable (D):

| Feature | E/I/D |
|---------|-------|
| Contact management (CRUD) | |
| Pipeline visualization | |
| Conversation screenshot upload + OCR | |
| AI conversation analysis | |
| Priority scoring | |
| Daily action recommendations | |
| Consistency score tracking | |
| Reply draft generation | |
| Google Contacts import | |
| Mailchimp sync | |
| Dashboard analytics | |
| Mobile-responsive design | |

---

#### 20. Launch Timeline

**Question**: The documentation mentions a 13-week development plan. Is this still the target?

- [ ] Yes, 13 weeks from today (target: ~April 2025)
- [ ] Accelerated (target: ______________)
- [ ] Flexible (quality over speed)
- [ ] Phased launch (release features incrementally)

**If phased**: What features must be in the first release?

---

#### 21. Existing User Data

**Question**: Are there existing users/contacts that need to be migrated?

- [ ] No, starting fresh
- [ ] Yes, from spreadsheets (provide sample)
- [ ] Yes, from another CRM (which one?: _______________)
- [ ] Yes, from existing database (provide schema)

---

#### 22. Competitive Differentiation

**Question**: What's the most critical differentiator that must work perfectly at launch?

Rank top 3:
- [ ] Behavioral pattern recognition
- [ ] Screenshot OCR analysis
- [ ] Priority scoring algorithm
- [ ] Consistency gamification
- [ ] AI reply drafts
- [ ] 7-day activity monitoring
- [ ] Other: _______________

---

## Next Steps After Clarification

Once these questions are answered, we can:

1. **Set up development infrastructure** (Supabase, environment variables)
2. **Prioritize the feature backlog** based on your MVP definition
3. **Create a realistic implementation timeline** based on scope
4. **Begin Phase 1 implementation** (Foundation)

---

## How to Respond

Please review each question and provide answers. For complex questions, feel free to:
- Schedule a call to discuss
- Provide partial answers now, details later
- Ask for clarification on any question

**Contact**: Reply with answers or schedule a discussion to walk through these together.

---

*Document generated during project review - December 30, 2025*
