# RealCoach AI 1.2 - API Documentation

**Version**: 1.2.0  
**Last Updated**: December 31, 2025  
**Base URL**: `http://localhost:3000` (development)

---

## Authentication

All API routes require authentication via Supabase Auth. Include the user's session token in requests.

```typescript
const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();

fetch('/api/contacts', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
});
```

---

## Contacts

### List Contacts
```
GET /api/contacts
```

**Query Parameters**:
- `stage` (optional): Filter by pipeline stage
- `search` (optional): Search by name, email, or phone
- `sortBy` (optional): Sort field (default: `priority_score`)
- `order` (optional): `asc` or `desc` (default: `desc`)

**Response**:
```json
{
  "contacts": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "pipeline_stage": "Active Opportunity",
      "motivation_level": "High",
      "timeframe": "1-3 months",
      "priority_score": 85,
      "days_since_contact": 2,
      "seven_day_rule_flag": false,
      "created_at": "2025-12-01T00:00:00Z"
    }
  ]
}
```

---

### Create Contact
```
POST /api/contacts
```

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "pipeline_stage": "Lead",
  "lead_source": "Referral",
  "motivation_level": "High",
  "timeframe": "1-3 months",
  "property_preferences": {
    "location": "Downtown",
    "priceRange": "$300k-$400k",
    "propertyType": "Single Family",
    "beds": 3,
    "baths": 2
  },
  "notes": "Referred by Sarah"
}
```

**Response**: Created contact object

---

### Get Contact
```
GET /api/contacts/[id]
```

**Response**: Single contact object with full details

---

### Update Contact
```
PATCH /api/contacts/[id]
```

**Request Body**: Partial contact object (only fields to update)

**Response**: Updated contact object

---

### Delete Contact
```
DELETE /api/contacts/[id]
```

**Response**: `{ "success": true }`

---

### Recalculate Priority Score
```
POST /api/contacts/[id]/recalculate
```

Recalculates the priority score for a contact based on current behavioral data.

**Response**: Updated contact with new `priority_score`

---

### Get Next Action
```
GET /api/contacts/[id]/next-action
```

Generates AI-powered next action recommendation for a contact.

**Response**:
```json
{
  "actionType": "Call",
  "urgency": 8,
  "script": "Follow up on mortgage pre-approval status...",
  "rationale": "Pre-approval required for offer submission",
  "behavioralContext": {
    "factor": "New Opportunity",
    "explanation": "Contact needs pre-approval to move forward"
  },
  "estimatedTimeframe": "Within 24 hours"
}
```

---

### Complete Action
```
POST /api/contacts/[id]/complete-action
```

Marks an action as complete and updates contact activity.

**Request Body**:
```json
{
  "actionType": "Call",
  "notes": "Discussed pre-approval timeline"
}
```

**Response**: Updated contact with new `last_interaction_date`

---

## Conversations

### List Conversations
```
GET /api/conversations?contactId=[id]
```

**Query Parameters**:
- `contactId`: Filter by contact ID
- `inputType`: Filter by input type (screenshot/voice/text)
- `limit`: Max results (default: 50)
- `offset`: Pagination offset

**Response**:
```json
{
  "conversations": [
    {
      "id": "uuid",
      "contact_id": "uuid",
      "input_type": "text",
      "content": "Hey! I saw 3 homes this weekend...",
      "ai_detected_stage": "Active Opportunity",
      "ai_stage_confidence": 95,
      "ai_detected_motivation": "High",
      "ai_suggested_next_action": "Schedule offer strategy call",
      "created_at": "2025-12-31T10:00:00Z"
    }
  ]
}
```

---

### Create Conversation
```
POST /api/conversations
```

**Request Body**:
```json
{
  "contact_id": "uuid",
  "input_type": "text",
  "content": "Conversation text here...",
  "raw_url": "https://..." // Optional for screenshots/voice
}
```

**Response**: Created conversation object

---

### Get Conversation
```
GET /api/conversations/[id]
```

**Response**: Single conversation object with AI analysis

---

### Update Conversation
```
PATCH /api/conversations/[id]
```

**Request Body**: Partial conversation object

**Response**: Updated conversation object

---

### Delete Conversation
```
DELETE /api/conversations/[id]
```

**Response**: `{ "success": true }`

---

## AI Analysis

### Analyze Conversation
```
POST /api/analyze-conversation
```

**Request Body**:
```json
{
  "conversation": "Hey! I saw 3 homes this weekend and I'm ready to make an offer...",
  "contactId": "uuid",
  "generateReply": true
}
```

**Response**:
```json
{
  "patterns": {
    "buyingIntent": true,
    "sellingIntent": false,
    "urgency": true,
    "specificProperty": false,
    "preapproval": false,
    "showings": true,
    "offerAccepted": false,
    "closing": false,
    "confidence": 92
  },
  "entities": {
    "motivation": {
      "level": "High",
      "confidence": 90,
      "indicators": ["ready to make an offer", "saw 3 homes"]
    },
    "timeframe": {
      "range": "Immediate",
      "confidence": 95,
      "indicators": ["this weekend", "ready"]
    },
    "propertyPreferences": {
      "location": null,
      "priceRange": null,
      "propertyType": null,
      "beds": null,
      "baths": null,
      "mustHaves": []
    },
    "budget": {
      "range": null,
      "preapproved": false,
      "mentioned": false
    }
  },
  "stage": {
    "currentStage": "Active Opportunity",
    "confidence": 95,
    "reasoning": "Contact has been viewing homes and is ready to make offers",
    "suggestedTransition": {
      "from": "New Opportunity",
      "to": "Active Opportunity",
      "confidence": 95
    },
    "transitionLevel": "auto"
  },
  "nextAction": {
    "actionType": "Call",
    "urgency": 9,
    "script": "Great! Let's schedule an offer strategy session to discuss pricing and terms...",
    "rationale": "Contact is ready to make offers - needs guidance on strategy",
    "behavioralContext": {
      "factor": "Active showing activity",
      "explanation": "Viewed multiple properties, ready to take action"
    },
    "estimatedTimeframe": "Within 24 hours"
  },
  "replyDraft": {
    "greeting": "Hi Sarah!",
    "acknowledgment": "That's exciting news that you saw 3 homes this weekend!",
    "valueProposition": "I'd love to discuss what you liked and help you craft a winning offer.",
    "nextStep": "Can we schedule a call tomorrow to go over strategy?",
    "closing": "Best, Alex",
    "fullReply": "Hi Sarah! That's exciting news that you saw 3 homes this weekend! I'd love to discuss what you liked and help you craft a winning offer. Can we schedule a call tomorrow to go over strategy? Best, Alex",
    "tone": "Friendly",
    "editSuggestions": ["Add specific property addresses", "Mention current market conditions"]
  },
  "analysisMetadata": {
    "totalEstimatedCost": 0.006,
    "modelUsage": {
      "ruleBased": true,
      "mini": true,
      "full": true
    },
    "processingTime": 2347,
    "confidence": 92
  }
}
```

---

## Import

### Import CSV
```
POST /api/contacts/import
```

**Request**: `multipart/form-data` with CSV file

**Response**:
```json
{
  "success": true,
  "imported": 50,
  "skipped": 5,
  "errors": []
}
```

---

### Import Google Contacts
```
POST /api/contacts/import/google
```

**Request Body**:
```json
{
  "accessToken": "google-oauth-token"
}
```

**Response**:
```json
{
  "success": true,
  "imported": 150,
  "skipped": 10,
  "errors": []
}
```

---

## Pipeline

### Override Pipeline Stage
```
POST /api/pipeline/override
```

Manually override AI-suggested pipeline stage changes.

**Request Body**:
```json
{
  "contactId": "uuid",
  "newStage": "Active Opportunity",
  "reason": "User manually promoted based on phone call"
}
```

**Response**: Updated contact with new stage

---

## Statistics

### Get Dashboard Stats
```
GET /api/stats
```

**Response**:
```json
{
  "totalContacts": 150,
  "activeOpportunities": 25,
  "todayActions": 5,
  "completedToday": 3,
  "currentStreak": 7,
  "sevenDayViolations": 2,
  "pipelineDistribution": {
    "Lead": 50,
    "New Opportunity": 40,
    "Active Opportunity": 25,
    "Under Contract": 10,
    "Closed": 25
  }
}
```

---

### Get Consistency Score
```
GET /api/stats/consistency
```

**Response**:
```json
{
  "score": 85,
  "streak": 7,
  "last7Days": [
    { "date": "2025-12-31", "count": 5, "target": 5, "metTarget": true },
    { "date": "2025-12-30", "count": 6, "target": 5, "metTarget": true },
    { "date": "2025-12-29", "count": 4, "target": 5, "metTarget": false }
  ],
  "rating": "Good",
  "todayProgress": {
    "completed": 3,
    "target": 5,
    "percentage": 60
  }
}
```

---

### Get Daily Priorities
```
GET /api/daily-priorities
```

**Response**:
```json
{
  "priorities": [
    {
      "contact": { /* full contact object */ },
      "priorityScore": 95,
      "priorityLevel": "Critical",
      "reason": "7-day rule violation - no contact in 8 days",
      "nextAction": {
        "actionType": "Call",
        "urgency": 10,
        "script": "Urgent re-engagement needed..."
      }
    }
  ]
}
```

---

## Authentication

### Google OAuth Callback
```
GET /api/auth/google/callback?code=[code]
```

Handles Google OAuth callback for Google Contacts integration.

**Query Parameters**:
- `code`: OAuth authorization code from Google

**Response**: Redirects to `/contacts` with auth token

---

### Supabase Auth Callback
```
GET /api/auth/callback?code=[code]
```

Handles Supabase authentication callback.

**Query Parameters**:
- `code`: OAuth authorization code

**Response**: Redirects to dashboard

---

## Error Responses

All API endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Common Error Codes**:
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (no access to resource)
- `404`: Not Found
- `400`: Bad Request (validation error)
- `500`: Internal Server Error

---

## Rate Limiting

Currently no rate limiting implemented. Planned for production:
- 100 requests per minute per user
- 1000 AI analysis requests per day per user

---

## Cost Tracking

AI analysis costs are tracked per request:

**Average Costs**:
- Pattern detection: $0.00 (free)
- Entity extraction: $0.0003 per conversation
- Full analysis: $0.006 per conversation

**Monthly Estimates** (100 users, 5 conversations/day):
- ~$90/month in OpenAI API costs

---

## Webhooks (Planned)

Future support for webhooks:
- Contact created
- Pipeline stage changed
- 7-day rule violation
- Daily actions generated

---

*RealCoach AI 1.2 | API Documentation | Version 1.0.0 | December 31, 2025*
