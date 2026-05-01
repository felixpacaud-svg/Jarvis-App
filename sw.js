// ═══════════════════════════════════════════════════════════════
// J.A.R.V.I.S. Service Worker v13 — RESPONSIVE (Phase F.3)
//
// Phase F.3: keyboard fix takes 3, plus smaller ripples per feedback.
// Combines focus events AND visualViewport height to detect keyboard
// (focus alone gave false positives), and restores .app.scrollTop on
// keyboard close (Chrome scrolls to bring input into view, never back).
// ═══════════════════════════════════════════════════════════════

const CACHE = 'jarvis-v13';
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

// ─── Fetch (cache-first for shell, never cache API calls) ───────
self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const isAPI = /generativelanguage|gnews\.io|alphavantage|frankfurter|open-meteo|er-api|googleapis|accounts\.google|groq\.com/.test(url.hostname);
  if (isAPI) return;
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

// ─── Legacy message handlers (no-op, kept for safety) ───────────
self.addEventListener('message', (e) => {
  const t = e.data?.type;
  if (t === 'SCHEDULE_NOTIFICATIONS' || t === 'SCHEDULE_REMINDER' ||
      t === 'CANCEL_REMINDER' || t === 'CANCEL_ALL') {
    // intentionally no-op
  }
});

// ─── Notification click → focus or open the app ─────────────────
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const targetUrl = e.notification.data?.url || './';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if ('focus' in c) {
          if ('navigate' in c && targetUrl !== './') {
            try { c.navigate(targetUrl); } catch {}
          }
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
