import webpush from 'web-push';
import { configureWebPush } from './vapid';

/**
 * Push notification types
 */
export type PushNotificationType =
  | 'daily_actions'
  | 'seven_day_alert'
  | 'consistency_reminder'
  | 'weekly_summary'
  | 'test';

/**
 * Push notification payload
 */
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Push subscription from browser
 */
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Push subscription with user ID
 */
export interface UserPushSubscription extends PushSubscription {
  userId: string;
  id?: string;
  createdAt?: Date;
}

/**
 * Result of a push notification send operation
 */
export interface PushResult {
  success: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Configure web-push (must be called before sending)
 */
configureWebPush();

/**
 * Validate a push subscription object
 */
export function validatePushSubscription(subscription: PushSubscription): boolean {
  if (!subscription || typeof subscription !== 'object') {
    return false;
  }

  const { endpoint, keys } = subscription;

  if (!endpoint || typeof endpoint !== 'string') {
    return false;
  }

  if (!keys || typeof keys !== 'object') {
    return false;
  }

  if (!keys.p256dh || typeof keys.p256dh !== 'string') {
    return false;
  }

  if (!keys.auth || typeof keys.auth !== 'string') {
    return false;
  }

  return true;
}

/**
 * Convert stored subscription to web-push format
 */
function toWebPushSubscription(subscription: PushSubscription): webpush.PushSubscription {
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  };
}

/**
 * Send a push notification to a single subscription
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushNotificationPayload
): Promise<PushResult> {
  try {
    // Validate subscription
    if (!validatePushSubscription(subscription)) {
      return { success: false, error: 'Invalid push subscription' };
    }

    const webPushSub = toWebPushSubscription(subscription);

    // Send the notification
    const result = await webpush.sendNotification(
      webPushSub,
      JSON.stringify(payload),
      {
        urgency: 'normal',
        topic: payload.tag,
        TTL: 2419200, // 28 days in seconds
      }
    );

    return { success: true };
  } catch (error) {
    // Handle specific error codes
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode;

      // 410 Gone - subscription has expired
      if (statusCode === 410) {
        return {
          success: false,
          error: 'Subscription expired',
          statusCode: 410,
        };
      }

      // 404 Not Found - subscription doesn't exist
      if (statusCode === 404) {
        return {
          success: false,
          error: 'Subscription not found',
          statusCode: 404,
        };
      }

      return {
        success: false,
        error: error.message,
        statusCode,
      };
    }

    return { success: false, error: 'Unknown error' };
  }
}

/**
 * Send a push notification to a user by userId
 * This requires fetching subscriptions from the database
 */
export async function sendPushNotificationToUser(
  userId: string,
  payload: PushNotificationPayload,
  getSubscriptions: (userId: string) => Promise<PushSubscription[]>
): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  errors: string[];
}> {
  try {
    const subscriptions = await getSubscriptions(userId);

    if (subscriptions.length === 0) {
      return {
        success: false,
        sent: 0,
        failed: 0,
        errors: ['No push subscriptions found for user'],
      };
    }

    const results = await Promise.allSettled(
      subscriptions.map((sub) => sendPushNotification(sub, payload))
    );

    const sent = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - sent;
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        errors.push(`Subscription ${index}: ${result.reason}`);
      } else if (!result.value.success) {
        errors.push(`Subscription ${index}: ${result.value.error}`);
      }
    });

    return {
      success: sent > 0,
      sent,
      failed,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      sent: 0,
      failed: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Send bulk push notifications to multiple users
 */
export async function sendBulkPushNotifications(
  userIds: string[],
  payload: PushNotificationPayload,
  getSubscriptions: (userId: string) => Promise<PushSubscription[]>
): Promise<{
  totalSent: number;
  totalFailed: number;
  results: Map<string, { sent: number; failed: number }>;
}> {
  const results = new Map<string, { sent: number; failed: number }>();
  let totalSent = 0;
  let totalFailed = 0;

  await Promise.all(
    userIds.map(async (userId) => {
      const result = await sendPushNotificationToUser(userId, payload, getSubscriptions);
      results.set(userId, { sent: result.sent, failed: result.failed });
      totalSent += result.sent;
      totalFailed += result.failed;
    })
  );

  return {
    totalSent,
    totalFailed,
    results,
  };
}

/**
 * Create a push notification payload for different types
 */
export function createPushNotification(
  type: PushNotificationType,
  data: Record<string, unknown>
): PushNotificationPayload {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://realcoach.ai';

  switch (type) {
    case 'daily_actions':
      return {
        title: '☀️ Your Daily Priority Contacts',
        body: `You have ${(data.count as number | undefined) || 5} priority contacts to follow up with today.`,
        icon: `${baseUrl}/icons/icon-192.png`,
        badge: `${baseUrl}/icons/badge-72.png`,
        tag: `daily-actions-${data.date}`,
        data: {
          url: `${baseUrl}/actions`,
          type: 'daily_actions',
        },
      };

    case 'seven_day_alert':
      return {
        title: '⚠️ 7-Day Rule Alert',
        body: `${(data.count as number | undefined) || 1} contact${((data.count as number | undefined) || 1) > 1 ? 's are' : ' is'} at risk of going cold.`,
        icon: `${baseUrl}/icons/icon-192.png`,
        badge: `${baseUrl}/icons/badge-72.png`,
        tag: `seven-day-${data.date}`,
        requireInteraction: true,
        data: {
          url: `${baseUrl}/contacts`,
          type: 'seven_day_alert',
          contactIds: data.contactIds,
        },
        actions: [
          { action: 'view', title: 'View Contacts' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      };

    case 'consistency_reminder':
      return {
        title: data.complete
          ? '🎉 Daily Goal Complete!'
          : '📊 Keep Your Streak Alive!',
        body: data.complete
          ? 'You hit your daily target! Great job!'
          : `${(data.remaining as number | undefined) || 1} more contact${((data.remaining as number | undefined) || 1) > 1 ? 's' : ''} to reach your goal.`,
        icon: `${baseUrl}/icons/icon-192.png`,
        badge: `${baseUrl}/icons/badge-72.png`,
        tag: `consistency-${data.date}`,
        data: {
          url: `${baseUrl}/dashboard`,
          type: 'consistency_reminder',
        },
      };

    case 'weekly_summary':
      return {
        title: '📅 Your Weekly Summary',
        body: `You touched ${data.contactsTouched || 0} contacts this week. Your consistency score is ${data.consistencyScore || 0}%.`,
        icon: `${baseUrl}/icons/icon-192.png`,
        badge: `${baseUrl}/icons/badge-72.png`,
        tag: `weekly-${data.week}`,
        data: {
          url: `${baseUrl}/analytics`,
          type: 'weekly_summary',
        },
      };

    case 'test':
      return {
        title: '🔔 Test Notification',
        body: 'Push notifications are working!',
        icon: `${baseUrl}/icons/icon-192.png`,
        badge: `${baseUrl}/icons/badge-72.png`,
        tag: 'test',
        data: {
          url: `${baseUrl}/settings/notifications`,
          type: 'test',
        },
      };

    default:
      return {
        title: 'RealCoach AI',
        body: 'You have a new notification.',
        icon: `${baseUrl}/icons/icon-192.png`,
        badge: `${baseUrl}/icons/badge-72.png`,
      };
  }
}
