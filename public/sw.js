// Service Worker for PWA
// Update version to force cache refresh on all installed PWAs
const CACHE_VERSION = '3';
const CACHE_NAME = `tracktrip-radio-v${CACHE_VERSION}`;
const urlsToCache = [
  '/radio',
  '/images/logo.png',
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, then cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other protocols
  if (!event.request.url.startsWith('http')) return;

  // Network first strategy for API calls and audio streams
  if (event.request.url.includes('/api/') ||
      event.request.url.includes('asurahosting.com') ||
      event.request.url.includes('.mp3')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache first for static assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          // Don't cache if not a success response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Background sync for offline actions (optional future feature)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-likes') {
    // Could sync likes when back online
  }
});

// Push notifications (optional future feature)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/images/logo.png',
      badge: '/images/logo.png',
      vibrate: [200, 100, 200],
      tag: 'radio-notification',
      data: { url: '/radio' }
    });
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/radio')
  );
});
