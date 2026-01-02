import { Resend } from 'resend';

const getResend = () => {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
};

const FROM_EMAIL = 'RealCoach AI <noreply@realcoach.ai>';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://realcoach.ai';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendDailyActionsEmail(
  userEmail: string,
  userName: string,
  actions: Array<{
    id: string;
    contact: {
      id: string;
      name: string;
      phone: string | null;
      email: string | null;
    };
    action_type: string;
    priority_level: number;
    reason: string;
    suggested_script: string;
  }>
): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email');
    return { success: false, error: 'Email not configured' };
  }

  const actionsHtml = actions.map((action, index) => `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: #ffffff;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="background: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${action.contact.name}</h3>
      </div>
      <div style="display: flex; gap: 12px; margin-bottom: 8px; font-size: 13px; color: #6b7280;">
        <span><strong>Priority:</strong> ${action.priority_level}/10</span>
        <span><strong>Action:</strong> ${action.action_type}</span>
      </div>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;"><strong>Why it matters:</strong> ${action.reason}</p>
      <div style="background: #f3f4f6; padding: 12px; border-radius: 4px; border-left: 3px solid #3b82f6;">
        <p style="margin: 0; font-size: 13px; color: #4b5563; font-style: italic;">"${action.suggested_script}"</p>
      </div>
      <div style="margin-top: 12px; display: flex; gap: 8px;">
        ${action.contact.phone ? `<a href="tel:${action.contact.phone}" style="display: inline-block; padding: 8px 16px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-size: 13px;">📞 Call</a>` : ''}
        ${action.contact.email ? `<a href="mailto:${action.contact.email}" style="display: inline-block; padding: 8px 16px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 13px;">✉️ Email</a>` : ''}
        <a href="${BASE_URL}/contacts/${action.contact.id}" style="display: inline-block; padding: 8px 16px; background: #6b7280; color: white; text-decoration: none; border-radius: 6px; font-size: 13px;">View Contact</a>
      </div>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Daily Priority Contacts</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin-bottom: 24px; text-align: center; color: white;">
          <h1 style="margin: 0 0 8px 0; font-size: 28px;">☀️ Good Morning, ${userName}!</h1>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">You have <strong>${actions.length} priority contacts</strong> for today</p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          ${actionsHtml}

          <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <a href="${BASE_URL}/dashboard" style="display: inline-block; padding: 14px 28px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Open Dashboard</a>
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px; padding: 16px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0 0 8px 0;">Powered by <a href="${BASE_URL}" style="color: #6b7280; text-decoration: none;">RealCoach AI</a></p>
          <a href="${BASE_URL}/settings/notifications" style="color: #9ca3af; text-decoration: none;">Manage notification preferences</a>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const resend = getResend();
    if (!resend) {
      return { success: false, error: 'Email not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `Your ${actions.length} Priority Contacts for Today`,
      html
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email send exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendSevenDayAlertEmail(
  userEmail: string,
  userName: string,
  violations: Array<{
    contactId: string;
    contactName: string;
    inactiveDays: number;
    pipelineStage: string;
  }>
): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'Email not configured' };
  }

  const violationsHtml = violations.map(violation => `
    <div style="border-left: 4px solid #ef4444; background: #fef2f2; padding: 16px; border-radius: 6px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${violation.contactName}</h3>
        <span style="background: #ef4444; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">${violation.inactiveDays} days</span>
      </div>
      <p style="margin: 0; font-size: 13px; color: #7f1d1d;">Stage: ${violation.pipelineStage}</p>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #ef4444; padding: 30px; border-radius: 12px; margin-bottom: 24px; text-align: center; color: white;">
          <h1 style="margin: 0 0 8px 0; font-size: 28px;">⚠️ 7-Day Rule Alert</h1>
          <p style="margin: 0; font-size: 16px;">${violations.length} contact${violations.length > 1 ? 's are' : ' is'} at risk of going cold</p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <p style="margin: 0 0 20px 0; font-size: 15px; color: #374151;">Hi ${userName}, the following contacts haven't been touched in 7+ days and need immediate attention:</p>
          ${violationsHtml}
          <div style="text-align: center; margin-top: 20px;">
            <a href="${BASE_URL}/dashboard" style="display: inline-block; padding: 14px 28px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Take Action Now</a>
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px; padding: 16px; color: #9ca3af; font-size: 12px;">
          <a href="${BASE_URL}/settings/notifications" style="color: #9ca3af; text-decoration: none;">Manage notification preferences</a>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const resend = getResend();
    if (!resend) {
      return { success: false, error: 'Email not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `⚠️ 7-Day Rule Alert: ${violations.length} Contact${violations.length > 1 ? 's' : ''} Need Attention`,
      html
    });

    if (error) return { success: false, error: error.message };
    return { success: true, messageId: data?.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendConsistencyReminderEmail(
  userEmail: string,
  userName: string,
  contactsTouched: number,
  dailyTarget: number,
  remaining: number
): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'Email not configured' };
  }

  const isComplete = contactsTouched >= dailyTarget;
  const progressPercent = Math.min(Math.round((contactsTouched / dailyTarget) * 100), 100);

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${isComplete ? '#10b981' : '#f59e0b'}; padding: 30px; border-radius: 12px; margin-bottom: 24px; text-align: center; color: white;">
          <h1 style="margin: 0 0 8px 0; font-size: 28px;">${isComplete ? '🎉 Goal Complete!' : '📊 Daily Progress Check'}</h1>
          <p style="margin: 0; font-size: 16px;">${isComplete ? 'You hit your daily target!' : `${remaining} more contact${remaining > 1 ? 's' : ''} to reach your goal`}</p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #6b7280;">
              <span>Today's Progress</span>
              <span>${contactsTouched}/${dailyTarget} contacts</span>
            </div>
            <div style="background: #e5e7eb; border-radius: 8px; height: 24px; overflow: hidden;">
              <div style="background: ${isComplete ? '#10b981' : '#3b82f6'}; height: 100%; width: ${progressPercent}%; transition: width 0.3s;"></div>
            </div>
          </div>

          ${!isComplete ? `
            <p style="margin: 0 0 20px 0; font-size: 15px; color: #374151;">Keep the momentum going, ${userName}! You're almost there.</p>
            <div style="text-align: center;">
              <a href="${BASE_URL}/dashboard" style="display: inline-block; padding: 14px 28px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">View Priority Contacts</a>
            </div>
          ` : `
            <p style="margin: 0; font-size: 15px; color: #374151;">Excellent work maintaining your consistency streak!</p>
          `}
        </div>

        <div style="text-align: center; margin-top: 24px; padding: 16px; color: #9ca3af; font-size: 12px;">
          <a href="${BASE_URL}/settings/notifications" style="color: #9ca3af; text-decoration: none;">Manage notification preferences</a>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const resend = getResend();
    if (!resend) {
      return { success: false, error: 'Email not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: isComplete ? '🎉 Daily Goal Complete!' : `📊 ${remaining} More to Hit Your Daily Goal`,
      html
    });

    if (error) return { success: false, error: error.message };
    return { success: true, messageId: data?.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendWeeklySummaryEmail(
  userEmail: string,
  userName: string,
  stats: {
    totalContacts: number;
    activeOpportunities: number;
    newLeads: number;
    contactsTouched: number;
    consistencyScore: number;
  }
): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'Email not configured' };
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin-bottom: 24px; text-align: center; color: white;">
          <h1 style="margin: 0 0 8px 0; font-size: 28px;">📅 Your Week Ahead</h1>
          <p style="margin: 0; font-size: 16px;">Weekly summary for ${userName}</p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: 700; color: #3b82f6;">${stats.totalContacts}</div>
              <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">Total Contacts</div>
            </div>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: 700; color: #10b981;">${stats.activeOpportunities}</div>
              <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">Active Opportunities</div>
            </div>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: 700; color: #f59e0b;">${stats.newLeads}</div>
              <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">New This Week</div>
            </div>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: 700; color: #8b5cf6;">${stats.consistencyScore}%</div>
              <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">Consistency Score</div>
            </div>
          </div>

          <p style="margin: 0 0 20px 0; font-size: 15px; color: #374151;">Focus on your ${stats.activeOpportunities} active opportunities this week. Consistency is key to closing deals!</p>

          <div style="text-align: center;">
            <a href="${BASE_URL}/dashboard" style="display: inline-block; padding: 14px 28px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Open Dashboard</a>
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px; padding: 16px; color: #9ca3af; font-size: 12px;">
          <a href="${BASE_URL}/settings/notifications" style="color: #9ca3af; text-decoration: none;">Manage notification preferences</a>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const resend = getResend();
    if (!resend) {
      return { success: false, error: 'Email not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: '📅 Your Weekly Summary & Week Ahead',
      html
    });

    if (error) return { success: false, error: error.message };
    return { success: true, messageId: data?.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
