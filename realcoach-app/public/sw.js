/**
 * Service Worker for RealCoach AI
 *
 * Handles:
 * - Push notifications
 * - Notification click handling
 * - Background sync
 * - Caching strategies (for future PWA support)
 */

const CACHE_NAME = 'realcoach-v1';
const urlsToCache = [];

/**
 * Install event - Cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

/**
 * Activate event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all pages immediately
  return self.clients.claim();
});

/**
 * Fetch event - Network first, fall back to cache strategy
 * For now, just pass through (caching to be implemented later)
 */
self.addEventListener('fetch', (event) => {
  // For API calls, always use network
  if (event.request.url.includes('/api/')) {
    return;
  }

  // For static assets, use cache first strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response for caching
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

/**
 * Push event - Handle incoming push notifications
 */
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');

  let notificationData = {
    title: 'RealCoach AI',
    body: 'You have a new notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: 'default',
    data: {},
  };

  // Parse the push data
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
      };
    } catch (e) {
      console.error('[Service Worker] Failed to parse push data:', e);
    }
  }

  // Show the notification
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data || {},
    requireInteraction: notificationData.requireInteraction || false,
    actions: notificationData.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

/**
 * Notification click event - Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');

  event.notification.close();

  // Get the action from the notification click
  const action = event.action;

  // Handle default click (no action button clicked)
  if (action === 'dismiss') {
    return;
  }

  // Get the URL from notification data or default to dashboard
  const url = event.notification.data?.url || '/dashboard';

  // Open or focus the app
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Look for an existing window that matches the URL
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

/**
 * Push subscription change event - Handle subscription changes
 */
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[Service Worker] Push subscription changed');

  event.waitUntil(
    (async () => {
      try {
        const oldSubscription = event.oldSubscription;
        const newSubscription = event.newSubscription;

        // If subscription was removed, notify the server
        if (!newSubscription && oldSubscription) {
          await fetch('/api/notifications/unsubscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subscription: oldSubscription,
            }),
          });
          return;
        }

        // If subscription was renewed/updated, notify the server
        if (newSubscription) {
          const subscriptionData = newSubscription.toJSON();
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              subscription: subscriptionData,
            }),
          });
        }
      } catch (error) {
        console.error('[Service Worker] Failed to handle subscription change:', error);
      }
    })()
  );
});

/**
 * Message event - Handle messages from the main thread
 */
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  // Handle different message types
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
