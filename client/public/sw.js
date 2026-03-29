// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  messagingSenderId: "729787413309"
});

const messaging = firebase.messaging();

// Handle Background Messages (from Firebase)
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Background message ', payload);
  const title = payload.notification?.title || '⚔️ Arena Update';
  const options = {
    body: payload.notification?.body || 'New activity logged!',
    icon: '/grind_battle_pwa_icon.png',
    badge: '/grind_battle_pwa_icon.png',
    tag: 'arena-update',
    renotify: true
  };
  self.registration.showNotification(title, options);
});

// Handle Generic Push
self.addEventListener('push', (event) => {
  let data = { title: '⚔️ Arena Update', body: 'New activity in the battlefield!' };
  if (event.data) {
    try {
      data = event.data.json().notification || event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/grind_battle_pwa_icon.png',
    badge: '/grind_battle_pwa_icon.png',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now() }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '⚔️ Arena Update', options)
  );
});

// Handle Notification Clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// --- PWA Caching Logic ---

const CACHE_NAME = 'dueltrack-v2'; // Increment version to clear v1
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/grind_battle_pwa_icon.png'
];

self.addEventListener('install', event => {
  // Use skipWaiting to take over immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', event => {
  // Claim clients immediately
  event.waitUntil(clients.claim());
  
  // Force delete old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[sw] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip caching for API and Sockets
  if (url.pathname.includes('/api/') || url.pathname.includes('socket.io')) {
    return;
  }

  // 2. NETWORK-FIRST for Navigation (index.html)
  // This prevents white screens when hashed assets change.
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(request.clone())
        .catch(() => caches.match('/index.html')) // Fallback to cache ONLY if offline
    );
    return;
  }

  // 3. CACHE-FIRST for Static Assets (Images, Icons)
  // Hashed assets (JS/CSS) will also fall through here if not in navigate mode
  event.respondWith(
    caches.match(request)
      .then(response => {
        // Return cached if present, otherwise fetch and cache
        return response || fetch(request).then(networkResponse => {
          // Don't cache everything, just safe assets
          if (request.url.includes('.png') || request.url.includes('.json')) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      })
  );
});
