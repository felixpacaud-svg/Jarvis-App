// ═══════════════════════════════════════════════════════════════
// J.A.R.V.I.S. Service Worker v19 — PERFORMANCE (Phase F.9)
//
// Phase F.9: precaches CDN scripts (React, ReactDOM, Babel, DOMPurify)
// so cold launches after the first one don't re-fetch ~250KB+ from the
// network. Per-URL .add() (not .addAll()) so a single CDN failure
// doesn't break the install of the same-origin shell.
//
// Phase F.8 (carry-over): chat-tab "black bar" bug fixed by scrolling
// only .ch-m via .scrollTo({top:scrollHeight}) instead of using
// .scrollIntoView() which walks every overflow:hidden ancestor.
// ═══════════════════════════════════════════════════════════════

const CACHE = 'jarvis-v19';

const CORE = [
  './',
  './index.html',
  './manifest.json',
  './jarvis-icon.svg'
];

// Cross-origin libraries — pinned versions so URLs are stable cache keys.
// Cached lazily on install with per-URL try/catch so one CDN miss does
// not break the rest of the install.
const CDN = [
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js',
];

// ─── Install ────────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // Same-origin shell — best-effort
    try { await c.addAll(CORE); } catch {}
    // Cross-origin CDN — individual failures ignored
    await Promise.all(CDN.map(u => c.add(u).catch(() => {})));
  })());
});

// ─── Activate ───────────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch (cache-first for shell + CDN, never cache API calls) ──
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
