# Phase 3 Completion - Implementation Prompt

**Use this prompt when ready to complete the remaining Phase 3 features**

---

## Context

RealCoach AI 1.2 is currently 85% through Phase 3 (AI Pipeline Engine). The core AI systems are complete and functional:

✅ Multi-tier AI model routing  
✅ Conversation analysis (GPT-4o)  
✅ Pattern detection  
✅ Entity extraction  
✅ Stage detection  
✅ Priority scoring algorithm  
✅ 7-day rule monitoring  
✅ Consistency score system  
✅ Next action recommendations  
✅ Reply draft generation  

**What's Missing** (15% to complete Phase 3):
1. ⚠️ Automated daily action generation (cron job)
2. ⚠️ Push notification system

---

## Task: Complete Phase 3 - Automated Actions & Notifications

### Objective
Implement the final 2 features to complete Phase 3 of the RealCoach AI build plan, enabling automated daily action generation and push notifications for critical events.

---

## Feature 1: Automated Daily Action Generation

### Requirements

**What it should do**:
- Run automatically every day at 6:00 AM (user's timezone)
- Generate top 5-10 priority actions for each user
- Create `daily_actions` records in the database
- Send notifications to users about their daily actions
- Handle errors gracefully (API failures, database issues)
- Log execution results for monitoring

**Existing Infrastructure to Use**:
- `lib/engines/priority-calculator.ts` - Priority scoring algorithm (already complete)
- `lib/engines/seven-day-monitor.ts` - 7-day rule monitoring (already complete)
- `lib/services/contacts.ts` - Contact data access (already complete)
- `lib/services/stats.ts` - Dashboard stats (already complete)
- `lib/ai/action-generator.ts` - Next action generation (already complete)

**Database Table** (already exists):
```sql
CREATE TABLE daily_actions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  contact_id UUID REFERENCES contacts(id),
  action_date DATE DEFAULT CURRENT_DATE,
  action_type TEXT, -- 'Call', 'Text', 'Email', 'Send Listing', 'Follow-up', 'Meeting'
  priority_level INTEGER, -- 1-10
  reason TEXT,
  suggested_script TEXT,
  urgency_factor TEXT,
  behavioral_rationale TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Implementation Options**:

**Option A: Vercel Cron (Recommended)**
```typescript
// app/api/cron/daily-actions/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Generate actions for all users
  // Return results
}
```

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/daily-actions",
    "schedule": "0 6 * * *"
  }]
}
```

**Option B: Next.js API Route with External Scheduler**
```typescript
// app/api/generate-daily-actions/route.ts
// Call from external service like GitHub Actions, AWS EventBridge, etc.
```

**What to Build**:
1. Create API route: `/api/cron/daily-actions/route.ts`
2. Implement daily action generation logic:
   - Fetch all active users
   - For each user:
     - Get all their contacts
     - Calculate priority scores
     - Check 7-day rule violations
     - Generate top 5-10 actions
     - Create `daily_actions` records
     - Send notification (Feature 2)
3. Add error handling and logging
4. Add `vercel.json` cron configuration
5. Test with manual trigger endpoint

**Testing**:
- Create test route: `/api/cron/daily-actions/test` (no auth, for development)
- Verify actions generated correctly
- Check database records created
- Validate priority ordering
- Test error scenarios (API down, DB connection lost)

---

## Feature 2: Push Notification System

### Requirements

**What it should notify about**:
1. **Daily actions** (6:00 AM) - "You have 5 priority contacts today"
2. **7-day rule violations** (immediate) - "Sarah Johnson: No contact in 7 days"
3. **Consistency reminders** (5:00 PM) - "2 more contacts to hit your daily goal"
4. **Weekly summary** (Monday 9:00 AM) - "Your week ahead: 3 Active Opportunities need attention"

**Notification Methods** (choose based on preference):

**Option A: Email Notifications (Easiest, Recommended First)**
Using Resend (free tier: 3000 emails/month):
```bash
npm install resend
```

```typescript
// lib/notifications/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDailyActionsEmail(
  user: User,
  actions: DailyAction[]
) {
  await resend.emails.send({
    from: 'RealCoach AI <noreply@realcoach.ai>',
    to: user.email,
    subject: `Your ${actions.length} Priority Contacts for Today`,
    html: renderDailyActionsEmail(actions)
  });
}
```

**Option B: Web Push Notifications (More Advanced)**
Using `web-push` library:
```bash
npm install web-push
```

```typescript
// lib/notifications/push.ts
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function sendPushNotification(
  subscription: PushSubscription,
  notification: {
    title: string;
    body: string;
    icon?: string;
    data?: any;
  }
) {
  await webpush.sendNotification(
    subscription,
    JSON.stringify(notification)
  );
}
```

**Option C: SMS Notifications (Most Expensive)**
Using Twilio:
```bash
npm install twilio
```

**What to Build**:

### Part 1: Email Notifications (Start Here)
1. Install Resend: `npm install resend`
2. Create notification service: `lib/notifications/email.ts`
3. Create email templates:
   - Daily actions email
   - 7-day violation alert
   - Consistency reminder
   - Weekly summary
4. Integrate with cron job (Feature 1)
5. Add notification preferences to user settings

### Part 2: Notification Preferences (Database)
Add to users table or create new table:
```sql
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  daily_actions_enabled BOOLEAN DEFAULT TRUE,
  seven_day_alerts_enabled BOOLEAN DEFAULT TRUE,
  consistency_reminders_enabled BOOLEAN DEFAULT TRUE,
  weekly_summary_enabled BOOLEAN DEFAULT TRUE,
  notification_method TEXT DEFAULT 'email', -- 'email', 'push', 'sms', 'none'
  daily_actions_time TIME DEFAULT '06:00',
  consistency_reminder_time TIME DEFAULT '17:00',
  timezone TEXT DEFAULT 'America/New_York'
);
```

### Part 3: UI for Notification Settings
Add settings page: `app/(dashboard)/settings/notifications/page.tsx`
- Toggle notifications on/off
- Set notification times
- Choose notification method
- Test notification button

**Testing**:
- Send test email to yourself
- Verify all template variables render correctly
- Test with no actions (edge case)
- Test with 10+ actions (ensure formatting works)
- Verify unsubscribe link works

---

## Deliverables

### Feature 1: Automated Daily Actions
- [ ] `/api/cron/daily-actions/route.ts` - Cron endpoint
- [ ] `/api/cron/daily-actions/test/route.ts` - Test endpoint
- [ ] `vercel.json` - Cron configuration
- [ ] Update `lib/services/actions.ts` with batch generation logic
- [ ] Error handling and logging
- [ ] Documentation in code comments

### Feature 2: Push Notifications
- [ ] `lib/notifications/email.ts` - Email service
- [ ] `lib/notifications/templates/` - Email templates
  - [ ] `daily-actions.tsx` (React Email component)
  - [ ] `seven-day-alert.tsx`
  - [ ] `consistency-reminder.tsx`
  - [ ] `weekly-summary.tsx`
- [ ] Migration for `notification_preferences` table
- [ ] `/app/(dashboard)/settings/notifications/page.tsx` - Settings UI
- [ ] Integration with cron job
- [ ] Test endpoint: `/api/notifications/test/route.ts`

### Documentation
- [ ] Update `WEEK_7-10_COMPLETION_SUMMARY.md` - Mark features complete
- [ ] Update `README.md` - Phase 3 now 100% complete
- [ ] Update `CLAUDE.md` - Remove "in progress" status
- [ ] Create `NOTIFICATIONS_GUIDE.md` - How to use notifications
- [ ] Add environment variables to `.env.example`

### Testing
- [ ] Manual test of cron job
- [ ] Test email delivery
- [ ] Test with 0, 1, 5, 10+ actions
- [ ] Test error scenarios
- [ ] Test notification preferences
- [ ] Verify timezone handling

---

## Environment Variables Needed

Add to `.env.local`:
```bash
# Cron Job Security
CRON_SECRET=your-secret-key-here

# Email Notifications (Resend)
RESEND_API_KEY=re_your_api_key_here

# Optional: Web Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# Optional: SMS Notifications (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Implementation Order

### Day 1: Automated Actions (4-6 hours)
1. ✅ Create cron API route
2. ✅ Implement batch action generation
3. ✅ Add error handling
4. ✅ Configure `vercel.json`
5. ✅ Test manually
6. ✅ Deploy and verify

### Day 2: Email Notifications (4-6 hours)
1. ✅ Install Resend
2. ✅ Create email service
3. ✅ Build email templates (start with daily actions)
4. ✅ Integrate with cron job
5. ✅ Test email delivery
6. ✅ Add remaining templates (7-day alert, etc.)

### Day 3: Settings & Polish (2-4 hours)
1. ✅ Create notification preferences table
2. ✅ Build settings UI page
3. ✅ Add test notification endpoint
4. ✅ Update documentation
5. ✅ Mark Phase 3 complete

**Total Estimated Time**: 10-16 hours (1-2 days)

---

## Success Criteria

### Automated Actions
- ✅ Cron job runs daily at 6 AM
- ✅ Actions generated for all active users
- ✅ Top 5-10 contacts prioritized correctly
- ✅ Database records created successfully
- ✅ Errors logged and monitored
- ✅ No duplicate actions created

### Notifications
- ✅ Users receive daily action email at 6 AM
- ✅ 7-day violations trigger immediate alerts
- ✅ Consistency reminders sent at 5 PM
- ✅ Users can toggle notifications on/off
- ✅ Users can set preferred times
- ✅ Emails render correctly on all devices
- ✅ Unsubscribe link works

---

## Example Implementation Code

### Cron Job Structure
```typescript
// app/api/cron/daily-actions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculatePriorityScore } from '@/lib/engines/priority-calculator';
import { checkSevenDayRule } from '@/lib/engines/seven-day-monitor';
import { generateNextAction } from '@/lib/ai/action-generator';
import { sendDailyActionsEmail } from '@/lib/notifications/email';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // 1. Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const results = { success: 0, failed: 0, errors: [] };

  try {
    // 2. Get all active users
    const { data: users } = await supabase
      .from('profiles') // or auth.users
      .select('id, email')
      .eq('active', true);

    // 3. Process each user
    for (const user of users || []) {
      try {
        // Get user's contacts
        const { data: contacts } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', user.id)
          .neq('pipeline_stage', 'Closed');

        // Calculate priority scores
        const scoredContacts = contacts?.map(contact => ({
          ...contact,
          priorityScore: calculatePriorityScore({
            motivationLevel: contact.motivation_level,
            daysSinceContact: contact.days_since_contact,
            pipelineStage: contact.pipeline_stage,
            isNewLead: contact.days_since_contact <= 2,
            timeframe: contact.timeframe,
            sevenDayRuleViolation: contact.seven_day_rule_flag
          })
        })) || [];

        // Sort and take top 10
        const topContacts = scoredContacts
          .sort((a, b) => b.priorityScore - a.priorityScore)
          .slice(0, 10);

        // Generate actions
        const actions = await Promise.all(
          topContacts.map(async (contact) => {
            const nextAction = await generateNextAction(contact);
            return {
              user_id: user.id,
              contact_id: contact.id,
              action_date: new Date().toISOString().split('T')[0],
              action_type: nextAction.actionType,
              priority_level: nextAction.urgency,
              reason: nextAction.rationale,
              suggested_script: nextAction.script,
              urgency_factor: nextAction.behavioralContext.factor,
              behavioral_rationale: nextAction.behavioralContext.explanation
            };
          })
        );

        // Insert actions
        const { error: insertError } = await supabase
          .from('daily_actions')
          .insert(actions);

        if (insertError) throw insertError;

        // Send notification
        await sendDailyActionsEmail(user, actions);

        results.success++;
      } catch (userError) {
        results.failed++;
        results.errors.push({
          userId: user.id,
          error: userError.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.success + results.failed,
      successful: results.success,
      failed: results.failed,
      errors: results.errors
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
```

### Email Template Example
```typescript
// lib/notifications/templates/daily-actions.tsx
import { DailyAction, Contact } from '@/lib/database.types';

interface DailyActionsEmailProps {
  userName: string;
  actions: (DailyAction & { contact: Contact })[];
  date: string;
}

export function DailyActionsEmail({ 
  userName, 
  actions, 
  date 
}: DailyActionsEmailProps) {
  return (
    <html>
      <body style={{ fontFamily: 'sans-serif', padding: '20px' }}>
        <h1>Good morning, {userName}!</h1>
        <p>You have <strong>{actions.length} priority contacts</strong> for {date}:</p>
        
        {actions.map((action, i) => (
          <div key={action.id} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <h3 style={{ margin: '0 0 8px 0' }}>
              {i + 1}. {action.contact.name}
            </h3>
            <p style={{ color: '#6b7280', margin: '0 0 8px 0' }}>
              <strong>Priority:</strong> {action.priority_level}/10 | 
              <strong> Action:</strong> {action.action_type}
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Why it matters:</strong> {action.reason}
            </p>
            <p style={{
              backgroundColor: '#f3f4f6',
              padding: '12px',
              borderRadius: '4px',
              fontStyle: 'italic',
              margin: '0'
            }}>
              "{action.suggested_script}"
            </p>
          </div>
        ))}
        
        <p>
          <a href="https://realcoach.ai/dashboard" 
             style={{
               display: 'inline-block',
               backgroundColor: '#3b82f6',
               color: 'white',
               padding: '12px 24px',
               borderRadius: '6px',
               textDecoration: 'none'
             }}>
            View in Dashboard
          </a>
        </p>
        
        <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '32px' }}>
          <a href="https://realcoach.ai/settings/notifications">
            Manage notification preferences
          </a>
        </p>
      </body>
    </html>
  );
}
```

---

## Questions to Answer During Implementation

1. **Timezone Handling**: How do we handle users in different timezones?
   - Store user timezone in preferences
   - Convert 6 AM to UTC based on user timezone
   - Or: Run cron multiple times for different timezones

2. **Error Handling**: What if OpenAI API is down during action generation?
   - Fallback to rule-based action generation
   - Retry failed users later
   - Send admin alert if too many failures

3. **Performance**: What if we have 1000+ users?
   - Process in batches of 50 users
   - Use Promise.allSettled for parallel processing
   - Consider queue system (BullMQ, Inngest)

4. **Notification Spam**: What if user already saw their dashboard?
   - Add "mark as read" functionality
   - Only send if actions not viewed
   - Allow user to skip weekends

5. **Cost Optimization**: Minimize OpenAI API calls
   - Cache action suggestions for repeated patterns
   - Use quick analysis mode when possible
   - Batch API calls when feasible

---

## Resources

- **Vercel Cron**: https://vercel.com/docs/cron-jobs
- **Resend Docs**: https://resend.com/docs
- **React Email**: https://react.email (for better email templates)
- **Web Push**: https://web.dev/push-notifications/
- **Testing Cron Jobs**: Use `/api/cron/daily-actions/test` route

---

## After Completion

Once both features are complete:

1. ✅ Update all documentation files
2. ✅ Mark Phase 3 as 100% complete
3. ✅ Run full testing suite
4. ✅ Deploy to production
5. ✅ Monitor first week of cron executions
6. ✅ Gather user feedback on notifications
7. ✅ Begin Phase 4 (Dashboards & Integrations)

---

**Ready to implement? Use this prompt:**

> "Implement the remaining Phase 3 features for RealCoach AI: Automated daily action generation (cron job) and push notification system (email notifications). Follow the implementation plan in `PHASE_3_COMPLETION_PROMPT.md`. Start with the cron job for daily actions, then add email notifications using Resend. Include error handling, testing endpoints, and documentation updates. Focus on reliability and user experience."

---

*Phase 3 Completion Prompt | RealCoach AI 1.2 | December 31, 2025*
