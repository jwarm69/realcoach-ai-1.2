import webpush from 'web-push';

/**
 * VAPID key management for Web Push notifications
 *
 * VAPID (Voluntary Application Server Identification) is used to identify
 * the application server to push services and authenticate requests.
 */

export interface VAPIDKeys {
  publicKey: string;
  privateKey: string;
}

/**
 * Get VAPID keys from environment variables
 * In production, these should be set in .env.local
 */
export function getVAPIDKeys(): VAPIDKeys {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error(
      'VAPID keys not configured. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.\n' +
      'You can generate keys using the webpush.generateVAPIDKeys() function.'
    );
  }

  return { publicKey, privateKey };
}

/**
 * Get the public VAPID key for client-side use
 * This is safe to expose to the browser
 * Returns empty string if not configured (callers should check)
 */
export function getPublicVAPIDKey(): string {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || '';
  return publicKey;
}

/**
 * Generate new VAPID keys for development/testing
 * In production, you should generate these once and store them securely
 *
 * Usage:
 * ```bash
 * node -e "console.log(require('webpush').generateVAPIDKeys())"
 * ```
 */
export function generateVAPIDKeys(): VAPIDKeys {
  return webpush.generateVAPIDKeys();
}

/**
 * Configure web-push with VAPID keys
 * This must be called before sending any push notifications
 * Does not throw error if keys are missing - logs a warning instead
 */
export function configureWebPush(): void {
  try {
    const { publicKey, privateKey } = getVAPIDKeys();
    webpush.setVapidDetails(
      `mailto:${process.env.VAPID_SUBJECT || 'noreply@realcoach.ai'}`,
      publicKey,
      privateKey
    );
  } catch (error) {
    // Don't throw - just log a warning during build
    // The actual send functions will check isVAPIDConfigured() before sending
    if (process.env.NODE_ENV === 'production') {
      console.error('Failed to configure web-push:', error);
    }
    // In development/build, silently skip to allow build to succeed
  }
}

/**
 * Validate if VAPID keys are properly configured
 */
export function isVAPIDConfigured(): boolean {
  try {
    getVAPIDKeys();
    return true;
  } catch {
    return false;
  }
}
