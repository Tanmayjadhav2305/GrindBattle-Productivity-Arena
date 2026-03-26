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
    badge: '/grind_battle_pwa_icon.png'
  };
  self.registration.showNotification(title, options);
});

// Handle Generic Push (for DevTools button and other sources)
self.addEventListener('push', (event) => {
  console.log('[sw.js] Manual Push event received');
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

const CACHE_NAME = 'grind-battle-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/grind_battle_pwa_icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
