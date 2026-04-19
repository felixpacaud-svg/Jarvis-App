// ─── Jarvis Service Worker ─────────────────────────────────────
// Handles: PWA caching, push notifications, scheduled briefings

const CACHE_NAME = 'jarvis-v2';
const ASSETS = ['/', '/index.html', '/manifest.json', '/jarvis-icon.svg'];

// Install — cache shell
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('api.') || e.request.url.includes('googleapis.com') || e.request.url.includes('gnews.io') || e.request.url.includes('generativelanguage')) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const clone = r.clone();
      caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      return r;
    }).catch(() => caches.match(e.request))
  );
});

// Push notification from Firebase
self.addEventListener('push', (e) => {
  let data = { title: 'Jarvis Briefing', body: 'Your briefing is ready, sir.' };
  try { data = e.data.json(); } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title || 'Jarvis', {
      body: data.body || 'Tap to see your briefing.',
      icon: '/jarvis-icon.svg',
      badge: '/jarvis-icon.svg',
      tag: 'jarvis-briefing',
      data: { url: '/' },
      vibrate: [100, 50, 100],
      actions: [{ action: 'open', title: 'Open Jarvis' }]
    })
  );
});

// Notification click
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
      if (cls.length > 0) { cls[0].focus(); return cls[0].navigate('/'); }
      return clients.openWindow('/');
    })
  );
});

// Message from main app — scheduled local notifications
let notifTimers = [];
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SCHEDULE_NOTIFICATIONS') {
    notifTimers.forEach(t => clearTimeout(t));
    notifTimers = [];
    const { morning, evening, briefingData } = e.data;
    if (morning > 0) {
      notifTimers.push(setTimeout(() => {
        self.registration.showNotification('Good morning, sir.', {
          body: briefingData?.morning || 'Your morning briefing is ready. Tap to review.',
          icon: '/jarvis-icon.svg',
          badge: '/jarvis-icon.svg',
          tag: 'jarvis-morning',
          data: { url: '/' },
          vibrate: [100, 50, 100]
        });
      }, morning));
    }
    if (evening > 0) {
      notifTimers.push(setTimeout(() => {
        self.registration.showNotification('Good evening, sir.', {
          body: briefingData?.evening || 'Your evening briefing is ready. Tap to review.',
          icon: '/jarvis-icon.svg',
          badge: '/jarvis-icon.svg',
          tag: 'jarvis-evening',
          data: { url: '/' },
          vibrate: [100, 50, 100]
        });
      }, evening));
    }
  }
});
