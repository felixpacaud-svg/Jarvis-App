// ═══════════════════════════════════════════════════════════════
// J.A.R.V.I.S. Service Worker v6
// Handles: offline caching, briefing notifications, reminders
// ═══════════════════════════════════════════════════════════════

const CACHE = 'jarvis-v6';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './jarvis-icon.svg'
];

// ─── Install ────────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE).catch(() => {}))
  );
});

// ─── Activate ───────────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch (network-first for API calls, cache-first for shell) ─
self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Never cache API calls
  const isAPI = /generativelanguage|gnews\.io|alphavantage|frankfurter|open-meteo|er-api|googleapis|accounts\.google/.test(url.hostname);
  if (isAPI) return;
  // Shell: cache-first
  e.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(resp => {
      if (resp.ok && url.origin === location.origin) {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(request, clone));
      }
      return resp;
    }).catch(() => cached))
  );
});

// ─── Scheduled timeouts for local notifications ─────────────────
const timers = new Map();
const clearAll = () => { timers.forEach(id => clearTimeout(id)); timers.clear(); };

self.addEventListener('message', (e) => {
  const d = e.data;
  if (!d || !d.type) return;

  if (d.type === 'SCHEDULE_NOTIFICATIONS') {
    clearAll();
    const { morning, evening, briefingData } = d;
    if (morning > 0) {
      const id = setTimeout(() => {
        self.registration.showNotification('J.A.R.V.I.S. · Morning Briefing', {
          body: briefingData?.morning || 'Good morning, sir. Systems online.',
          icon: './jarvis-icon.svg',
          badge: './jarvis-icon.svg',
          tag: 'briefing-morning',
          vibrate: [120, 60, 120],
          requireInteraction: false,
          data: { url: './' }
        });
      }, morning);
      timers.set('morning', id);
    }
    if (evening > 0) {
      const id = setTimeout(() => {
        self.registration.showNotification('J.A.R.V.I.S. · Evening Summary', {
          body: briefingData?.evening || 'Evening summary ready, sir.',
          icon: './jarvis-icon.svg',
          badge: './jarvis-icon.svg',
          tag: 'briefing-evening',
          vibrate: [120, 60, 120],
          requireInteraction: false,
          data: { url: './' }
        });
      }, evening);
      timers.set('evening', id);
    }
  }

  if (d.type === 'SCHEDULE_REMINDER') {
    // { id, delay, title, body }
    if (d.delay > 0 && d.delay < 2147483647) {
      const tid = setTimeout(() => {
        self.registration.showNotification(d.title || 'J.A.R.V.I.S. Reminder', {
          body: d.body || '',
          icon: './jarvis-icon.svg',
          badge: './jarvis-icon.svg',
          tag: 'reminder-' + d.id,
          vibrate: [200, 80, 200, 80, 200],
          requireInteraction: true,
          data: { url: './' }
        });
        timers.delete('rem-' + d.id);
      }, d.delay);
      timers.set('rem-' + d.id, tid);
    }
  }

  if (d.type === 'CANCEL_REMINDER') {
    const tid = timers.get('rem-' + d.id);
    if (tid) { clearTimeout(tid); timers.delete('rem-' + d.id); }
  }

  if (d.type === 'CANCEL_ALL') clearAll();
});

// ─── Notification click → open app ──────────────────────────────
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const targetUrl = e.notification.data?.url || './';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if ('focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
