# Real Agent AI - Behavior Logic Implementation Guide

## Overview

This guide provides detailed implementation instructions for all behavioral systems in RealCoach.ai. Each behavioral system includes pattern detection logic, confidence scoring, and actionable outputs.

---

## 1. Pipeline Progression Engine

### Stage Transition Rules

#### Lead → New Opportunity

**Criteria:**
- ✅ Motivation level: High
- ✅ Timeframe provided (not "someday")
- ✅ Specific property interest mentioned

**Confidence Score:** 85%

**Required Patterns:**
```typescript
const leadToNewOpportunityPatterns = {
  motivation: {
    high: [
      "excited to buy",
      "ready to move",
      "serious about",
      "actively looking",
      "want to purchase soon"
    ]
  },
  timeframe: {
    immediate: ["asap", "immediately", "right now", "as soon as possible"],
    shortTerm: ["next few months", "this spring", "this summer", "in the next 3 months"]
  },
  specificProperty: [
    "in [area] neighborhood",
    "looking for 3 bedroom",
    "want a house with",
    "interested in properties under",
    "need at least"
  ]
};
```

**Detection Logic:**
```typescript
const detectLeadToNewOpportunity = (text: string, analysis: ConversationAnalysis): boolean => {
  const hasHighMotivation = analysis.motivation === 'High';
  const hasTimeframe = analysis.timeframe !== '6+ months' && analysis.timeframe !== null;
  const hasSpecificProperty = analysis.property_preferences &&
    (analysis.property_preferences.location ||
     analysis.property_preferences.price_range ||
     analysis.property_preferences.beds >= 1);

  return hasHighMotivation && hasTimeframe && hasSpecificProperty;
};
```

---

#### New Opportunity → Active Opportunity

**Criteria:**
- ✅ Home showings scheduled/completed
- ✅ Activity within last 7 days
- ✅ Engagement level maintained

**Confidence Score:** 90%

**Required Patterns:**
```typescript
const newToActiveOpportunityPatterns = {
  showings: [
    "saw 3 homes",
    "went to showing",
    "viewed property",
    "visited",
    "tour scheduled",
    "looking at homes"
  ],
  engagement: [
    "send more listings",
    "interested in",
    "want to see",
    "when can we",
    "schedule another"
  ]
};
```

**7-Day Activity Rule:**
```typescript
const checkSevenDayRule = async (contact: Contact): Promise<boolean> => {
  if (contact.pipeline_stage !== 'Active Opportunity') {
    return false;
  }

  const lastActivity = await getLastActivityDate(contact.id);
  const daysSince = calculateDaysSince(lastActivity);

  if (daysSince > 7) {
    // Flag for immediate attention
    await flagSevenDayViolation(contact.id, daysSince);
    return true;
  }

  return false;
};
```

---

#### Active Opportunity → Under Contract

**Criteria:**
- ✅ Offer accepted by seller
- ✅ Negotiations completed
- ✅ Property under contract

**Confidence Score:** 95%

**Required Patterns:**
```typescript
const activeToUnderContractPatterns = {
  offerAccepted: [
    "offer accepted",
    "seller accepted",
    "they accepted our offer",
    "under contract",
    "offer was accepted"
  ]
};
```

---

#### Under Contract → Closed

**Criteria:**
- ✅ Closing completed successfully
- ✅ Documents signed
- ✅ Funding complete

**Confidence Score:** 100%

**Required Patterns:**
```typescript
const underContractToClosedPatterns = {
  closed: [
    "closed yesterday",
    "closing complete",
    "got the keys",
    "funding complete",
    "documents signed",
    "at closing table",
    "closed on"
  ]
};
```

---

## 2. Conversation Pattern Detection

### Buying Intent Detection

**Patterns:**
```typescript
const buyingIntentPatterns = {
  primary: [
    "looking to buy",
    "want to purchase",
    "interested in buying",
    "thinking about buying",
    "considering purchasing"
  ],
  secondary: [
    "buyer's agent",
    "representing me",
    "working with buyer",
    "my buyer"
  ]
};
```

**Scoring:**
- Primary pattern detected: +50 points
- Secondary pattern detected: +30 points
- Both detected: +80 points

---

### Selling Intent Detection

**Patterns:**
```typescript
const sellingIntentPatterns = {
  primary: [
    "looking to sell",
    "want to sell",
    "thinking of selling",
    "considering selling"
  ],
  secondary: [
    "just listed",
    "going to list",
    "putting on market",
    "listing my home",
    "my house"
  ]
};
```

**Scoring:**
- Primary pattern detected: +50 points
- Secondary pattern detected: +30 points
- Both detected: +80 points

---

### Motivation Level Detection

**High Motivation (75-100 points):**
```typescript
const highMotivationPatterns = [
  "excited to",
  "ready to",
  "serious about",
  "urgent",
  "asap",
  "immediately",
  "can't wait to",
  "really need to"
];
```

**Medium Motivation (50-74 points):**
```typescript
const mediumMotivationPatterns = [
  "interested in",
  "thinking about",
  "considering",
  "looking at",
  "exploring options"
];
```

**Low Motivation (0-49 points):**
```typescript
const lowMotivationPatterns = [
  "someday",
  "eventually",
  "not in a rush",
  "no hurry",
  "just browsing",
  "curious about"
];
```

---

### Timeframe Detection

**Immediate (0-30 days):**
```typescript
const immediateTimeframePatterns = [
  "asap",
  "immediately",
  "right now",
  "this month",
  "as soon as possible",
  "urgently"
];
```

**Short-term (1-3 months):**
```typescript
const shortTermTimeframePatterns = [
  "next few months",
  "this spring",
  "this summer",
  "in the next 3 months",
  "coming months"
];
```

**Medium-term (3-6 months):**
```typescript
const mediumTermTimeframePatterns = [
  "next 6 months",
  "later this year",
  "in the next half year"
];
```

**Long-term (6+ months):**
```typescript
const longTermTimeframePatterns = [
  "someday",
  "eventually",
  "not sure when",
  "in the distant future",
  "no specific timeframe"
];
```

---

### Property Preference Extraction

**Location Patterns:**
```typescript
const locationPatterns = [
  /in (\w+(?:\s+\w+)*) area/i,
  /near (\w+(?:\s+\w+)*)/i,
  /(\w+(?:\s+\w+)*) neighborhood/i,
  /looking in (\w+(?:\s+\w+)*)/i
];
```

**Price Range Patterns:**
```typescript
const priceRangePatterns = [
  /under \$?(\d+(?:,\d{3})*)/i,
  /around \$?(\d+(?:,\d{3})*)/i,
  /between \$?(\d+(?:,\d{3})*) and \$?(\d+(?:,\d{3})*)/i,
  /max \$?(\d+(?:,\d{3})*)/i,
  /up to \$?(\d+(?:,\d{3})*)/i
];
```

**Property Type Patterns:**
```typescript
const propertyTypePatterns = {
  singleFamily: ["single family", "detached", "house", "home"],
  condo: ["condo", "condominium", "townhouse"],
  multiFamily: ["multi-family", "duplex", "triplex", "fourplex"]
};
```

**Specifications:**
```typescript
const specPatterns = {
  bedrooms: /(\d+)\s*(?:bed|bedroom|br)/i,
  bathrooms: /(\d+)\s*(?:bath|bathroom|ba)/i,
  sqft: /(\d+)\s*(?:sqft|square foot|sq ft)/i,
  garage: /garage/i,
  pool: /pool/i,
  yard: /yard/i
};
```

---

## 3. Daily Priority Scoring Algorithm

### Score Calculation (0-100 points)

#### Component 1: Motivation Level (0-30 points)
```typescript
const motivationScores = {
  'High': 30,
  'Medium': 20,
  'Low': 10,
  'Unknown': 5
};
```

#### Component 2: Days Since Contact (0-25 points)
```typescript
const daysSinceContactScores = {
  '0-1 days': 25,
  '2-3 days': 20,
  '4-7 days': 15,
  '8-14 days': 10,
  '15+ days': 5
};
```

#### Component 3: Pipeline Stage (0-20 points)
```typescript
const pipelineStageScores = {
  'Active Opportunity': 20,
  'New Opportunity': 15,
  'Under Contract': 10,
  'Lead': 5,
  'Closed': 0
};
```

#### Component 4: New Lead Bonus (0-15 points)
```typescript
const newLeadBonus = (contact: Contact): number => {
  const isNewLead = contact.days_since_contact <= 2 && contact.pipeline_stage === 'Lead';
  const hasHighMotivation = contact.motivation_level === 'High';

  if (isNewLead && hasHighMotivation) {
    return 15;
  }
  return 0;
};
```

#### Component 5: Timeframe Urgency (0-10 points)
```typescript
const timeframeUrgencyScores = {
  'Immediate': 10,
  '1-3 months': 7,
  '3-6 months': 5,
  '6+ months': 0
};
```

#### Component 6: 7-Day Rule Flag (+10 priority boost)
```typescript
const sevenDayRuleBoost = async (contact: Contact): Promise<number> => {
  const isViolation = await checkSevenDayRule(contact);

  if (isViolation) {
    return 10; // Increases priority to flag urgency
  }
  return 0;
};
```

---

## 4. Consistency Score System

### Daily Goal: 5 Contacts

#### Base Score Calculation (0-100 points)
```typescript
const calculateBaseScore = (last7DaysCounts: number[]): number => {
  const dailyTarget = 5;
  const totalContacts = last7DaysCounts.reduce((sum, count) => sum + count, 0);
  const targetTotal = dailyTarget * 7;

  return Math.min((totalContacts / targetTotal) * 100, 100);
};
```

#### Streak Bonus (0-15 points)
```typescript
const streakBonus = (streak: number): number => {
  if (streak >= 7) return 15;
  if (streak >= 5) return 10;
  if (streak >= 3) return 5;
  return 0;
};
```

#### Zero-Day Penalty (-5 points per zero day)
```typescript
const zeroDayPenalty = (last7DaysCounts: number[]): number => {
  const zeroDays = last7DaysCounts.filter(count => count === 0).length;
  return zeroDays * -5;
};
```

#### Final Score
```typescript
const finalScore = baseScore + streakBonus + zeroDayPenalty;
```

#### Rating System
```typescript
const getRating = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Critical';
};
```

---

## 5. Next Action Recommendation System

### Stage-Specific Action Logic

#### Lead Stage Actions

**No timeframe established:**
```typescript
{
  actionType: 'Call',
  urgency: 6,
  script: 'Determine specific buying/selling timeframe and motivation level.',
  rationale: 'Qualification needed: No timeframe established'
}
```

**7+ days since contact:**
```typescript
{
  actionType: 'Call',
  urgency: 9,
  script: `Re-engaging after ${daysSinceContact} days. Check if still interested in ${timeframe}.`,
  rationale: 'Urgent: 7+ days since contact with new lead'
}
```

**Low motivation:**
```typescript
{
  actionType: 'Email',
  urgency: 4,
  script: 'Send market stats and success stories to build interest.',
  rationale: 'Nurture: Build motivation with market information'
}
```

---

#### New Opportunity Stage Actions

**Not pre-approved:**
```typescript
{
  actionType: 'Call',
  urgency: 8,
  script: 'Follow up on mortgage pre-approval status. This is critical for making strong offers.',
  rationale: 'Pre-approval required for offer submission'
}
```

**Has timeframe but no showings:**
```typescript
{
  actionType: 'Call',
  urgency: 7,
  script: 'Schedule first home showing tour to get started.',
  rationale: 'Action needed: First showing required to advance pipeline'
}
```

**Mentioned specific areas:**
```typescript
{
  actionType: 'Email',
  urgency: 6,
  script: `Send active listings in ${area} matching their criteria.`,
  rationale: 'Engagement: Provide relevant inventory'
}
```

---

#### Active Opportunity Stage Actions

**Recently viewed homes:**
```typescript
{
  actionType: 'Text',
  urgency: 5,
  script: 'Great seeing you today! What did you think of the properties? Ready to make an offer on any?',
  rationale: 'Follow-up: Capture showing feedback and momentum'
}
```

**7-day rule violation:**
```typescript
{
  actionType: 'Call',
  urgency: 10,
  script: 'Hi [name], I want to ensure I\'m providing the best service. With the market changing weekly, should I send you fresh listings or schedule another showing tour?',
  rationale: 'CRITICAL: 7-day rule violation - immediate re-engagement required'
}
```

**Pre-approved but no offers:**
```typescript
{
  actionType: 'Call',
  urgency: 7,
  script: 'Let\'s schedule an offer strategy session. We\'ll discuss pricing, terms, and how to make your offer stand out.',
  rationale: 'Strategy: Move from showings to offer phase'
}
```

---

#### Under Contract Stage Actions

**Inspection period:**
```typescript
{
  actionType: 'Text',
  urgency: 5,
  script: 'Checking in on your inspection status. Any questions or concerns?',
  rationale: 'Support: Maintain contact during contingency period'
}
```

**Waiting on appraisal:**
```typescript
{
  actionType: 'Text',
  urgency: 4,
  script: 'Following up on appraisal timeline. Any updates from the lender?',
  rationale: 'Monitoring: Track closing progress'
}
```

**Near closing:**
```typescript
{
  actionType: 'Email',
  urgency: 5,
  script: 'Send closing checklist and timeline. Let me know if you have any questions!',
  rationale: 'Preparation: Ensure smooth closing process'
}
```

---

#### Closed Stage Actions

**Within 30 days:**
```typescript
{
  actionType: 'Email',
  urgency: 4,
  script: 'Thank you again for choosing me as your agent. Would you be willing to share a brief review of your experience?',
  rationale: 'Testimonial: Request review while experience is fresh'
}
```

**Within 90 days:**
```typescript
{
  actionType: 'Email',
  urgency: 3,
  script: 'Checking in - how are you enjoying your new home? If you know anyone looking to buy/sell, I\'d appreciate the referral!',
  rationale: 'Referral: Leverage satisfaction for referrals'
}
```

**Annually:**
```typescript
{
  actionType: 'Card/Email',
  urgency: 2,
  script: 'Happy home anniversary! Here\'s your current market update. Let me know if you have any questions!',
  rationale: 'Maintenance: Annual check-in for referrals and repeat business'
}
```

---

## 6. Reply Draft Generation

### Reply Structure

All AI-generated replies should follow this structure:

1. **Personalized Greeting** (1 line)
2. **Acknowledge Specific Comment** (1-2 lines)
3. **Provide Value/Answer** (1-2 lines)
4. **Clear Next Step** (1 line)
5. **Professional Closing** (1 line)

**Total length: Under 150 words**

---

### Scenario-Based Templates

#### New Lead - Initial Response
```typescript
{
  template: `Thanks for reaching out, [name]! I'd love to help you find your perfect home. What's your ideal timeline and must-haves? This will help me identify the best opportunities for you. Best, [agent name]`,
  context: 'new_lead_inquiry'
}
```

#### Follow-up After Showing
```typescript
{
  template: `Great seeing you today, [name]! You mentioned loving the [feature] at [property]. I'm sending 3 similar listings tonight. Would you like to schedule a second visit to [property] this weekend? Best, [agent name]`,
  context: 'showing_followup'
}
```

#### Price Negotiation
```typescript
{
  template: `I understand your budget concerns, [name]. Based on recent comps in [area], homes are selling for [range]. Let's discuss strategy - would you like me to present a competitive offer that stands out? Best, [agent name]`,
  context: 'price_negotiation'
}
```

#### Motivation Re-engagement
```typescript
{
  template: `Hi [name], it's been a few weeks since we connected. With the current market [trend], homes in your price range are moving [fast/slow]. Should we revisit your search criteria or schedule time to talk? Best, [agent name]`,
  context: 're_engage'
}
```

#### Pre-approval Follow-up
```typescript
{
  template: `Following up on your mortgage pre-approval, [name]. Once we have that in hand, you'll be in a strong position to make offers. Any questions on the lender's requirements? Best, [agent name]`,
  context: 'preapproval_followup'
}
```

#### 7-Day Rule Re-engagement (Active Opportunity)
```typescript
{
  template: `Hi [name], I want to ensure I'm providing the best service. With the market changing weekly, should I send you fresh listings or schedule another showing tour? Your preferences may have evolved since we last talked. Best, [agent name]`,
  context: 'seven_day_re_engage'
}
```

#### Under Contract Updates
```typescript
{
  template: `Great news, [name]! Your offer was accepted. Here's what happens next: [timeline]. I'll keep you updated at each milestone. Let me know if you have any questions! Best, [agent name]`,
  context: 'under_contract_update'
}
```

---

## 7. Activity Monitoring System

### 7-Day Rule Implementation

```typescript
const monitorSevenDayRule = async () => {
  const activeOpportunities = await getContactsByStage('Active Opportunity');

  for (const contact of activeOpportunities) {
    const lastActivity = await getLastActivityDate(contact.id);
    const daysSince = calculateDaysSince(lastActivity);

    if (daysSince >= 7) {
      // Flag for immediate attention
      await flagSevenDayViolation(contact.id, daysSince);

      // Boost priority score
      await boostContactPriority(contact.id, 10);

      // Create urgent action
      await createUrgentAction({
        contact_id: contact.id,
        action_type: 'Call',
        urgency: 10,
        rationale: `CRITICAL: ${daysSince} days since last activity with Active Opportunity`,
        script: getSevenDayReEngagementScript(contact)
      });
    }
  }
};
```

---

### Inactivity Alerts

```typescript
const checkInactivityAlerts = async () => {
  const contacts = await getAllContacts();

  for (const contact of contacts) {
    const daysSince = contact.days_since_contact;

    // Alert thresholds by stage
    const alertThresholds = {
      'Lead': 14,
      'New Opportunity': 10,
      'Active Opportunity': 7,
      'Under Contract': 5,
      'Closed': null
    };

    const threshold = alertThresholds[contact.pipeline_stage];

    if (threshold && daysSince >= threshold) {
      await sendInactivityAlert(contact, daysSince);
    }
  }
};
```

---

## 8. Manual Override System

### Confidence Thresholds

```typescript
const confidenceThresholds = {
  autoConfirm: 90,      // Automatically confirm if confidence >= 90
  requireReview: 70,    // Require review if confidence >= 70 and < 90
  suggestWithLowConfidence: 50  // Suggest but flag low confidence if >= 50 and < 70
};
```

### Override Workflow

```typescript
const handleAISuggestion = async (
  suggestion: AISuggestion,
  userAction: 'confirm' | 'edit' | 'reject'
): Promise<void> => {
  switch (userAction) {
    case 'confirm':
      await confirmAISuggestion(suggestion.id);
      await updateContactFromSuggestion(suggestion);
      break;

    case 'edit':
      await openEditDialog(suggestion);
      const editedValues = await getUserEdits();
      await updateContactFromSuggestion({
        ...suggestion,
        ...editedValues
      });
      break;

    case 'reject':
      await rejectAISuggestion(suggestion.id);
      await logRejectionReason(suggestion.id, 'user_rejected');
      break;
  }
};
```

---

## Testing Behavioral Systems

### Unit Testing Framework

```typescript
describe('Pipeline Progression Engine', () => {
  test('Lead → New Opportunity with high confidence', () => {
    const analysis = {
      currentStage: 'Lead',
      hasTimeframe: true,
      hasSpecificProperty: true,
      motivation: 'High'
    };

    const result = determinePipelineStage(analysis);

    expect(result.newStage).toBe('New Opportunity');
    expect(result.confidence).toBeGreaterThanOrEqual(85);
  });

  test('7-day rule flagging', async () => {
    const contact = await createTestContact({
      pipeline_stage: 'Active Opportunity',
      last_activity_date: '8 days ago'
    });

    const isViolation = await checkSevenDayRule(contact);

    expect(isViolation).toBe(true);
    expect(contact.seven_day_rule_flag).toBe(true);
  });
});
```

---

*This behavior logic guide provides complete implementation details for all behavioral systems in RealCoach.ai.*
