// ═══════════════════════════════════════════════════════════════
// J.A.R.V.I.S. Service Worker v8 — PRESENCE (Phase E.1 cache bump)
//
// The Phase E drop incorrectly claimed that re-uploading the same
// v7 file would force the SW to cycle. It did not — cache invalidation
// keys off the CACHE constant below. v7 stayed cached, the Phase E
// shell never loaded for users on the existing PWA. Bumping to v8
// triggers the activate handler to delete jarvis-v7 and refetch.
//
// Responsibilities:
//   1. Offline shell caching (cache-first for app, never cache API).
//   2. Notification click handling (focuses app or opens it).
//
// What we no longer do:
//   - Scheduling notifications via setTimeout. Service workers are
//     killed when idle (~30-60s), so any timer set for hours later
//     is destroyed long before it fires. Scheduling now lives in
//     index.html and uses the Notification Triggers API
//     (TimestampTrigger) for reliable OS-level queuing on Chrome
//     Android, plus a foreground tick + catch-up-on-focus fallback.
// ═══════════════════════════════════════════════════════════════

const CACHE = 'jarvis-v8';
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
// Old versions of the page may still post these on first load,
// before the new bundle takes over. We silently ignore — the
// page-level scheduler in index.html is now the source of truth.
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
