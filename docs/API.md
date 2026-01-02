# RealCoach AI 1.2 - API Documentation

**Version**: 1.2.0
**Base URL**: `https://your-app.vercel.app/api`
**Last Updated**: December 31, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Contact Management APIs](#contact-management-apis)
4. [Conversation & Analysis APIs](#conversation--analysis-apis)
5. [Priorities & Consistency APIs](#priorities--consistency-apis)
6. [Pipeline Management APIs](#pipeline-management-apis)
7. [Sales Analytics APIs](#sales-analytics-apis)
8. [Integration APIs](#integration-apis)
9. [Cron Job APIs](#cron-job-apis)
10. [Health Check](#health-check)
11. [Error Responses](#error-responses)
12. [Rate Limiting & Performance](#rate-limiting--performance)

---

## Overview

RealCoach AI provides a comprehensive REST API for managing real estate contacts with AI-powered behavioral intelligence. All endpoints return JSON and follow RESTful conventions.

### Key Features
- **Authentication**: Supabase Auth with user-scoped data
- **AI Analysis**: Multi-tier conversation analysis with cost optimization
- **Behavioral Intelligence**: Priority scoring, 7-day rule monitoring, consistency tracking
- **Pipeline Automation**: Automatic stage progression based on behavioral patterns
- **Integration**: Google Contacts, Mailchimp, CSV import

---

## Authentication

### Method
All API endpoints (except `/api/health`) require authentication via **Supabase Auth**.

### Headers
```http
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json
```

### User Context
All operations are automatically scoped to the authenticated user's data through Row Level Security (RLS) policies in Supabase.

### Example
```javascript
// Frontend (using Supabase client)
const { data, error } = await supabase
  .from('contacts')
  .select('*')
  .order('priority_score', { ascending: false });

// Backend API route automatically validates JWT
const user = await supabase.auth.getUser();
// User context available for scoping queries
```

---

## Contact Management APIs

### GET /api/contacts

**Description**: List all contacts with filtering, sorting, and pagination

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | - | Search in name, email, phone fields |
| `stage` | PipelineStage | 'all' | Filter by pipeline stage |
| `sortBy` | string | 'priority_score' | Field to sort by |
| `sortOrder` | 'asc'\|'desc' | 'desc' | Sort direction |
| `limit` | number | 50 | Results per page |
| `offset` | number | 0 | Offset for pagination |

**Pipeline Stages**: `Lead`, `New Opportunity`, `Active Opportunity`, `Under Contract`, `Closed`

**Response** (200 OK):
```json
{
  "contacts": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Sarah Johnson",
      "email": "sarah@example.com",
      "phone": "+1-555-0123",
      "address": "123 Main St, Anytown USA",
      "pipeline_stage": "Active Opportunity",
      "motivation_level": "High",
      "timeframe": "Immediate",
      "priority_score": 87,
      "last_interaction_date": "2025-12-30",
      "lead_source": "Zillow",
      "property_preferences": {
        "bedrooms": 3,
        "bathrooms": 2,
        "location": "downtown",
        "price_range": "$300-400k"
      },
      "budget_range": "$350-400k",
      "preapproval_status": true,
      "created_at": "2025-12-15T10:30:00Z",
      "updated_at": "2025-12-30T14:22:00Z"
    }
  ],
  "total": 42,
  "hasMore": true
}
```

**Error Responses**:
- `401 Unauthorized` - Invalid or missing auth token
- `500 Internal Server Error` - Database error

---

### POST /api/contacts

**Description**: Create a new contact

**Request Body**:
```json
{
  "name": "John Smith (required)",
  "email": "john@example.com",
  "phone": "+1-555-0456",
  "address": "456 Oak Ave",
  "pipeline_stage": "Lead",
  "lead_source": "Realtor.com",
  "motivation_level": "Medium",
  "timeframe": "3-6 months",
  "property_preferences": {
    "bedrooms": "4+",
    "bathrooms": "3+",
    "location": "suburbs",
    "must_haves": ["garage", "backyard"]
  },
  "budget_range": "$400-500k",
  "preapproval_status": false,
  "notes": "Referred by past client"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "name": "John Smith",
  "email": "john@example.com",
  "pipeline_stage": "Lead",
  "priority_score": 45,
  "created_at": "2025-12-31T10:00:00Z"
}
```

**Validation**:
- `name` is required
- `email` must be valid format if provided
- `pipeline_stage` must be valid stage

---

### GET /api/contacts/[id]

**Description**: Get a single contact by ID

**URL Parameter**: `id` (UUID) - Contact ID

**Response** (200 OK): Single contact object (same format as POST response)

**Error Responses**:
- `404 Not Found` - Contact doesn't exist or user doesn't have access
- `401 Unauthorized`

---

### PATCH /api/contacts/[id]

**Description**: Update a contact (partial update)

**URL Parameter**: `id` (UUID) - Contact ID

**Request Body**: Any contact fields to update
```json
{
  "pipeline_stage": "New Opportunity",
  "motivation_level": "High",
  "timeframe": "1-3 months"
}
```

**Response** (200 OK): Updated contact object

**Note**: Triggers automatic priority score recalculation

---

### DELETE /api/contacts/[id]

**Description**: Delete a contact

**URL Parameter**: `id` (UUID) - Contact ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

---

### POST /api/contacts/import

**Description**: Import contacts from CSV or array

**Request Body**:
```json
{
  "contacts": [
    {
      "name": "Jane Doe (required)",
      "email": "jane@example.com",
      "phone": "+1-555-0789",
      "pipeline_stage": "Lead"
    }
  ],
  "options": {
    "skipDuplicates": true,
    "duplicateField": "email"
  }
}
```

**Response** (200 OK):
```json
{
  "created": 45,
  "skipped": 5,
  "errors": [
    "Row 23: Missing required field 'name'"
  ],
  "total": 50
}
```

---

### POST /api/contacts/import/google

**Description**: Import Google Contacts (requires Google OAuth)

**Request Body**: Array of Google contact objects
```json
{
  "contacts": [
    {
      "names": [{ displayName: "Mike Smith" }],
      "emailAddresses": [{ value: "mike@gmail.com" }],
      "phoneNumbers": [{ value: "+1-555-0345" }]
    }
  ]
}
```

**Response**: Same as `/api/contacts/import`

**Note**: Automatically maps Google contact fields to RealCoach schema

---

### POST /api/contacts/[id]/recalculate

**Description**: Manually trigger priority score recalculation for a contact

**URL Parameter**: `id` (UUID) - Contact ID

**Response** (200 OK):
```json
{
  "contact": { /* contact object */ },
  "oldScore": 62,
  "newScore": 78,
  "change": "+16"
}
```

**Use Case**: After manual behavioral data updates

---

### GET /api/contacts/[id]/next-action

**Description**: Get AI-recommended next action for a contact

**URL Parameter**: `id` (UUID) - Contact ID

**Response** (200 OK):
```json
{
  "contactId": "uuid",
  "contactName": "Sarah Johnson",
  "pipelineStage": "Active Opportunity",
  "priorityScore": 87,
  "nextAction": {
    "type": "Call",
    "icon": "Phone",
    "urgency": 8,
    "urgencyLevel": "High",
    "urgencyColor": "orange",
    "script": "Hi Sarah! Great chatting yesterday. I found 2 more homes that match what you're looking for. When would be a good time to schedule showings?",
    "rationale": "Active opportunities require rapid follow-up to maintain momentum",
    "estimatedTimeframe": "5 minutes"
  },
  "behavioralFactors": [
    "High motivation",
    "Immediate timeframe",
    "Active opportunity stage"
  ],
  "sevenDayRule": {
    "isViolated": false,
    "daysSinceContact": 2,
    "reason": null
  }
}
```

**Action Types**: `Call`, `Text`, `Email`, `Meeting`, `Send Listing`, `Follow-up`

---

### POST /api/contacts/[id]/complete-action

**Description**: Mark an action as completed for a contact

**URL Parameter**: `id` (UUID) - Contact ID

**Request Body**:
```json
{
  "actionType": "Call",
  "notes": "Left voicemail, sent follow-up text"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Action completed successfully",
  "contactId": "uuid",
  "actionType": "Call",
  "completedAt": "2025-12-31T15:30:00Z",
  "consistencyScore": {
    "today": 4,
    "goal": 5,
    "streak": 5
  }
}
```

**Side Effects**:
- Updates `last_contacted_at` timestamp
- Updates consistency score
- May trigger priority recalculation

---

### POST /api/contacts/[id]/conversations

**Description**: Add a conversation log to a contact (with optional AI analysis)

**URL Parameter**: `id` (UUID) - Contact ID

**Request Body**:
```json
{
  "input_type": "text",
  "content": "Sarah said she's pre-approved for $400k and wants to see homes in the downtown area ASAP. She's very motivated.",
  "raw_url": null,
  "ai_detected_motivation": "High",
  "ai_detected_timeframe": "Immediate",
  "ai_extracted_entities": {
    "budget": "$400k",
    "location": "downtown",
    "preapproval": true
  },
  "ai_suggested_next_action": "Schedule downtown showings this weekend",
  "ai_suggested_reply": "Hi Sarah, congratulations on your pre-approval! I'd love to show you some great downtown homes this weekend. What time works best for you?"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "contact_id": "uuid",
  "input_type": "text",
  "content": "...",
  "created_at": "2025-12-31T15:35:00Z",
  "pipeline_update": {
    "previous_stage": "New Opportunity",
    "new_stage": "Active Opportunity",
    "reason": "Motivation + Timeframe + Showing Request detected"
  }
}
```

**Note**: Automatically triggers pipeline stage progression if behavioral criteria met

---

## Conversation & Analysis APIs

### GET /api/conversations

**Description**: List all conversations with filtering

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `contactId` | string | - | Filter by contact ID |
| `inputType` | string | - | Filter by type (text, voice, screenshot) |
| `limit` | number | 50 | Results per page |
| `offset` | number | 0 | Pagination offset |

**Response** (200 OK): Array of conversation objects

---

### POST /api/conversations

**Description**: Create a new conversation log (standalone, not tied to contact initially)

**Request Body**: Same as `/api/contacts/[id]/conversations`

**Response** (201 Created): Conversation object

---

### GET /api/conversations/[id]

**Description**: Get a single conversation by ID

**URL Parameter**: `id` (UUID) - Conversation ID

**Response** (200 OK): Conversation object with full details

---

### PATCH /api/conversations/[id]

**Description**: Update conversation fields (user corrections/confirmations)

**URL Parameter**: `id` (UUID) - Conversation ID

**Allowed Fields**:
```json
{
  "user_confirmed_stage": "Active Opportunity",
  "user_edited_stage": true,
  "user_edited_next_action": "Schedule showing for Saturday",
  "action_completed": true
}
```

**Response** (200 OK): Updated conversation object

**Use Case**: User feedback on AI suggestions

---

### DELETE /api/conversations/[id]

**Description**: Delete a conversation

**URL Parameter**: `id` (UUID) - Conversation ID

**Response** (200 OK):
```json
{
  "success": true
}
```

---

### POST /api/analyze-conversation

**Description**: AI-powered conversation analysis using multi-tier routing

**Request Body**:
```json
{
  "conversation": "Sarah is looking for a 3-bedroom home in downtown for under $400k. She's pre-approved and wants to move immediately.",
  "contactId": "uuid (required)",
  "generateReply": true
}
```

**Response** (200 OK):
```json
{
  "patterns": {
    "buyingIntent": true,
    "sellingIntent": false,
    "urgency": "immediate",
    "showingRequested": false,
    "confidence": 95
  },
  "entities": {
    "motivation": "High",
    "timeframe": "Immediate",
    "property_preferences": {
      "bedrooms": 3,
      "location": "downtown",
      "price_range": "under $400k"
    },
    "budget": "$400k",
    "preapproval": true,
    "confidence": 92
  },
  "stage": {
    "detected": "Active Opportunity",
    "confidence": 88,
    "rationale": "Motivation (High) + Timeframe (Immediate) + Pre-approval detected"
  },
  "nextAction": {
    "type": "Call",
    "urgency": 9,
    "script": "Hi Sarah, I'd love to help you find a 3-bedroom downtown home! Given that you're pre-approved and ready to move immediately, let's schedule showings for this weekend. What time works best?",
    "rationale": "High motivation + immediate urgency = rapid follow-up critical"
  },
  "replyDraft": "Hi Sarah, thanks for reaching out! Congratulations on your pre-approval - that puts you in a great position. I'd love to help you find the perfect 3-bedroom home in downtown under $400k. Given your timeline, let's prioritize showings this weekend. Are you available Saturday or Sunday afternoon?",
  "cost": {
    "tier1Used": true,
    "tier2Used": true,
    "tier3Used": true,
    "totalCost": 0.003
  }
}
```

**Multi-Tier Routing**:
- **Tier 1** (Pattern Detection): FREE - Always runs
- **Tier 2** (Entity Extraction): $0.00015 - Runs if budget allows
- **Tier 3** (Complex Analysis): $0.003 - Runs if stage detection or reply generation needed

**Cost**: ~$0.006 per conversation vs $0.03 industry standard (**80% savings**)

---

## Priorities & Consistency APIs

### GET /api/daily-priorities

**Description**: Get today's top prioritized contacts with recommended actions

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 10 | Top N priorities to return |
| `minPriority` | number | 0 | Minimum priority score |

**Response** (200 OK):
```json
{
  "priorities": [
    {
      "id": "uuid",
      "name": "Sarah Johnson",
      "email": "sarah@example.com",
      "phone": "+1-555-0123",
      "pipeline_stage": "Active Opportunity",
      "priority_score": 92,
      "priority_level": "Critical",
      "priority_color": "red",
      "last_contacted_at": "2025-12-29",
      "days_since_contact": 2,
      "next_action": {
        "type": "Call",
        "icon": "Phone",
        "urgency": 9,
        "urgency_level": "Critical",
        "urgency_color": "red",
        "script": "Hi Sarah! Following up on our conversation...",
        "rationale": "High motivation + immediate timeframe",
        "estimated_timeframe": "5 min"
      },
      "behavioral_factors": [
        "High motivation (High)",
        "Immediate timeframe",
        "Pre-approved",
        "Active opportunity stage"
      ],
      "seven_day_flag": false,
      "seven_day_reason": null
    }
  ],
  "summary": {
    "total_contacts": 42,
    "prioritized_contacts": 10,
    "critical_count": 3,
    "high_count": 5,
    "seven_day_violations": 2,
    "avg_priority_score": 76
  },
  "date": "2025-12-31"
}
```

**Priority Levels**:
- **Critical** (90-100): Immediate action required
- **High** (75-89): Action recommended today
- **Medium** (60-74): Action this week
- **Low** (<60): Normal follow-up

---

### GET /api/stats/consistency

**Description**: Get consistency score and streak tracking (gamified 5-contacts/day)

**Response** (200 OK):
```json
{
  "score": 85,
  "current_streak": 5,
  "last_7_days": [
    { "date": "2025-12-25", "completed": true, "count": 6 },
    { "date": "2025-12-26", "completed": true, "count": 5 },
    { "date": "2025-12-27", "completed": true, "count": 7 },
    { "date": "2025-12-28", "completed": true, "count": 5 },
    { "date": "2025-12-29", "completed": true, "count": 6 },
    { "date": "2025-12-30", "completed": true, "count": 5 },
    { "date": "2025-12-31", "completed": false, "count": 3 }
  ],
  "rating": "Good",
  "ui": {
    "color": "green",
    "emoji": "🔥",
    "message": "5-day streak! Keep it up!",
    "recommendations": [
      "Contact 2 more people today to reach your 5-contact goal",
      "Focus on high-priority contacts first (Sarah Johnson, Mike Smith)"
    ]
  },
  "total_actions": 37,
  "completed_actions": 37,
  "goal": 5,
  "today": 3
}
```

**Consistency Ratings**:
- **Excellent** (90-100): 5+/5 contacts for 7+ days
- **Good** (70-89): 4-5/5 contacts, consistent
- **Needs Improvement** (50-69): Inconsistent
- **Poor** (<50): Rarely meets goal

---

## Pipeline Management APIs

### POST /api/pipeline/override

**Description**: Manually override pipeline stage (user control over AI)

**Request Body**:
```json
{
  "contact_id": "uuid",
  "new_stage": "Active Opportunity",
  "reason": "Client confirmed offer accepted"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "contact_id": "uuid",
  "previous_stage": "New Opportunity",
  "new_stage": "Active Opportunity",
  "reason": "Client confirmed offer accepted",
  "overridden_at": "2025-12-31T16:00:00Z"
}
```

**Note**: Manual override takes precedence over AI stage detection

---

## Sales Analytics APIs

### GET /api/sales/metrics

**Description**: Get sales metrics for time periods (appointments, listings, closings, GCI)

**Query Parameters**:
- `period`: 'day' | 'week' | 'month' | 'quarter' | 'year' (default: 'month')

**Response** (200 OK):
```json
{
  "period": "month",
  "start_date": "2025-12-01",
  "end_date": "2025-12-31",
  "metrics": {
    "appointments": {
      "current": 24,
      "previous": 18,
      "change": "+6",
      "change_percent": "+33.3%"
    },
    "listings": {
      "current": 8,
      "previous": 5,
      "change": "+3",
      "change_percent": "+60%"
    },
    "closings": {
      "current": 3,
      "previous": 2,
      "change": "+1",
      "change_percent": "+50%"
    },
    "gci": {
      "current": 45000,
      "previous": 28000,
      "change": "+17000",
      "change_percent": "+60.7%"
    }
  },
  "projected": {
    "appointments": 28,
    "listings": 10,
    "closings": 4,
    "gci": 52000
  }
}
```

**Caching**: 5-minute cache on this endpoint

---

### GET /api/sales/funnel

**Description**: Get conversion funnel data by pipeline stage

**Response** (200 OK):
```json
{
  "funnel": [
    {
      "stage": "Lead",
      "count": 120,
      "conversion_rate": null,
      "drop_off": 0
    },
    {
      "stage": "New Opportunity",
      "count": 85,
      "conversion_rate": 70.8,
      "drop_off": 35
    },
    {
      "stage": "Active Opportunity",
      "count": 52,
      "conversion_rate": 61.2,
      "drop_off": 33
    },
    {
      "stage": "Under Contract",
      "count": 18,
      "conversion_rate": 34.6,
      "drop_off": 34
    },
    {
      "stage": "Closed",
      "count": 12,
      "conversion_rate": 66.7,
      "drop_off": 6
    }
  ],
  "overall_conversion_rate": 10.0,
  "total_leads": 120,
  "total_closed": 12
}
```

**Conversion Rate**: % of contacts that moved to previous stage → this stage

---

### GET /api/sales/leads

**Description**: Get lead source distribution

**Query Parameters**:
- `period`: 'day' | 'week' | 'month' | 'quarter' | 'year'

**Response** (200 OK):
```json
{
  "sources": [
    {
      "source": "Zillow",
      "count": 45,
      "percentage": 37.5,
      "conversion_rate": 12.5
    },
    {
      "source": "Realtor.com",
      "count": 32,
      "percentage": 26.7,
      "conversion_rate": 15.6
    },
    {
      "source": "Referral",
      "count": 28,
      "percentage": 23.3,
      "conversion_rate": 35.7
    },
    {
      "source": "Website",
      "count": 10,
      "percentage": 8.3,
      "conversion_rate": 10.0
    },
    {
      "source": "Other",
      "count": 5,
      "percentage": 4.2,
      "conversion_rate": 0
    }
  ],
  "total": 120
}
```

---

### GET /api/sales/conversations

**Description**: Manage sales conversations (appointments, listings, closings)

**Query Parameters**:
- `type`: 'appointment' | 'listing' | 'closing' | 'GCI'
- `limit`: number (default: 20)

**Methods**: GET, POST, DELETE

**POST Request Body** (e.g., appointment):
```json
{
  "type": "appointment",
  "contact_id": "uuid",
  "date": "2025-12-31",
  "notes": "Showing downtown properties",
  "outcome": "Scheduled"
}
```

---

## Integration APIs

### POST /api/mailchimp/sync

**Description**: Sync contacts to Mailchimp with segmentation

**Request Body**:
```json
{
  "apiKey": "usX.xxxxxxxxxxxxx",
  "listId": "abc123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "synced": 118,
  "errors": 2,
  "error_details": [
    {
      "email": "invalid@example",
      "error": "Invalid email format"
    }
  ],
  "duration_seconds": 12.5
}
```

**Segmentation** (Tags):
- Pipeline stage tags
- Motivation level tags
- Lead source tags
- 7-day violation tag

---

### GET /api/mailchimp/status

**Description**: Check Mailchimp sync status

**Response** (200 OK):
```json
{
  "last_sync": "2025-12-31T06:00:00Z",
  "total_synced": 118,
  "total_with_error": 2,
  "next_scheduled": "2026-01-01T06:00:00Z"
}
```

---

### POST /api/notifications/test

**Description**: Test email notifications (daily actions, 7-day alerts, weekly summary)

**Request Body**:
```json
{
  "type": "daily_actions"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Test email sent to user@example.com",
  "email_type": "daily_actions"
}
```

**Email Types**:
- `daily_actions`: Top 5 priority contacts
- `seven_day_alert`: 7-day rule violations
- `weekly_summary`: Weekly consistency report
- `pipeline_update`: Pipeline stage changes

---

## Cron Job APIs

### GET /api/cron/daily-actions

**Description**: Cron job to generate daily actions for all users

**Security**: Requires `CRON_SECRET` query parameter
**Status**: **Internal use only** - Not for public API access

**Query Parameters**:
- `secret`: string (from environment variable)

**Response** (200 OK):
```json
{
  "success": true,
  "processed_users": 15,
  "generated_actions": 75,
  "duration_seconds": 45.2
}
```

**Logic**:
1. Fetch all active users
2. For each user:
   - Recalculate all priority scores
   - Check 7-day rule violations
   - Generate top 5 daily actions
   - Store in `daily_actions` table
   - Update consistency score
   - Send email notification

**Schedule**: Daily at 6 AM local time (Vercel Cron Jobs)

---

### GET /api/cron/daily-actions/test

**Description**: Test daily action generation for current user (development)

**Query Parameters**:
- `date`: string (YYYY-MM-DD, default: today)

**Response** (200 OK):
```json
{
  "date": "2025-12-31",
  "actions": [
    {
      "contact_id": "uuid",
      "contact_name": "Sarah Johnson",
      "priority_score": 92,
      "next_action": {
        "type": "Call",
        "urgency": 9,
        "script": "..."
      }
    }
  ],
  "summary": {
    "total": 5,
    "critical": 2,
    "high": 2,
    "medium": 1
  }
}
```

---

### GET /api/cron/mailchimp

**Description**: Cron job for Mailchimp sync

**Security**: Requires `CRON_SECRET` query parameter
**Status**: **Internal use only**

**Query Parameters**:
- `secret`: string

**Response** (200 OK):
```json
{
  "success": true,
  "processed_users": 12,
  "total_synced": 1420,
  "total_errors": 15,
  "duration_seconds": 180.5
}
```

**Schedule**: Daily at 7 AM local time

---

## Health Check

### GET /api/health

**Description**: Health check for services (no authentication required)

**Response** (200 OK - Healthy):
```json
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "pass",
      "latency_ms": 12
    },
    "cron": {
      "status": "pass",
      "last_run": "2025-12-31T06:00:00Z"
    }
  },
  "timestamp": "2025-12-31T16:30:00Z"
}
```

**Response** (503 - Unhealthy):
```json
{
  "status": "unhealthy",
  "checks": {
    "database": {
      "status": "fail",
      "error": "Connection timeout"
    },
    "cron": {
      "status": "skip",
      "reason": "Database check failed"
    }
  },
  "timestamp": "2025-12-31T16:30:00Z"
}
```

**Status Codes**:
- `200` - Healthy or Degraded (partial functionality)
- `503` - Unhealthy (critical services down)

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation errors) |
| `401` | Unauthorized (missing/invalid token) |
| `404` | Not Found |
| `500` | Internal Server Error |
| `503` | Service Unavailable (health check only) |

### Common Errors

**401 Unauthorized**:
```json
{
  "error": "Invalid authorization token"
}
```

**400 Bad Request** (validation):
```json
{
  "error": "Validation failed: 'name' field is required"
}
```

**404 Not Found**:
```json
{
  "error": "Contact not found"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Database connection failed"
}
```

---

## Rate Limiting & Performance

### Rate Limiting
No explicit rate limiting is currently implemented. However:
- API responses are cached where appropriate
- Database queries are optimized with proper indexing
- Large operations use batch processing

### Caching Strategy
- **Sales endpoints**: 5-minute cache
- **Daily priorities**: Cached until next action completed
- **Stats consistency**: Cached until midnight

### Performance Benchmarks

| Endpoint | P95 Response Time |
|----------|-------------------|
| GET /api/contacts | <500ms |
| POST /api/contacts | <300ms |
| POST /api/analyze-conversation | <7s (AI processing) |
| GET /api/daily-priorities | <200ms (cached) |
| POST /api/contacts/import | <2s (100 contacts) |

### Best Practices

1. **Pagination**: Use `limit` and `offset` for large datasets
2. **Filtering**: Use `stage` and `search` params to reduce payload
3. **Caching**: Leverage cached endpoints where possible
4. **Batching**: Use import endpoints for bulk operations
5. **Webhook**: Set up Mailchimp webhook for real-time sync (future)

---

## Summary

RealCoach AI provides a comprehensive REST API with 23 endpoints covering:

✅ **Contact Management**: CRUD, import, export
✅ **AI Analysis**: Multi-tier conversation analysis with 80% cost savings
✅ **Behavioral Intelligence**: Priority scoring, 7-day rule, consistency tracking
✅ **Pipeline Automation**: Stage progression, manual overrides
✅ **Sales Analytics**: Metrics, funnels, lead sources
✅ **Integrations**: Google Contacts, Mailchimp, CSV import
✅ **Automation**: Cron jobs for daily actions and notifications

All endpoints require authentication via Supabase Auth and automatically scope data to the authenticated user. The API follows RESTful conventions with consistent error handling and response formatting.

---

*RealCoach AI 1.2 | API Documentation | Version 1.2.0 | December 31, 2025*
