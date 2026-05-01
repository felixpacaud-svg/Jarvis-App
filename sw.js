// ═══════════════════════════════════════════════════════════════
// J.A.R.V.I.S. Service Worker v16 — RESPONSIVE (Phase F.6)
//
// Phase F.6: Chat-tab black-bar bug persists after F.5's 100dvh→100svh.
// In Chrome Android standalone PWA, svh ≡ lvh ≡ dvh (no URL bar to
// hide), so that change was layout-equivalent to a no-op. This build
// ships a magenta diagnostic bar pinned at the bottom of the viewport
// showing live readouts of visualViewport.height, innerHeight,
// outerHeight, documentElement.clientHeight, .app rect height +
// scrollTop, window.scrollY, .content / .ch-w / .ch-m / .ch-i rect
// heights, body.keyboard-open class, and focused element tag — so we
// can read on first paint vs after a keyboard cycle which suspect is
// actually wrong (interactive-widget vs env(safe-area-inset) vs
// .ch-w height:100% redundancy).
//
// Also: ripple sizes shrunk a final 15% (153px hit / 208px miss;
// 530ms / 750ms durations).
// ═══════════════════════════════════════════════════════════════

const CACHE = 'jarvis-v16';
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
