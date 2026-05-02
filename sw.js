// ═══════════════════════════════════════════════════════════════
// J.A.R.V.I.S. Service Worker v18 — RESPONSIVE (Phase F.8)
//
// Phase F.8: Chat-tab "black bar" bug FIXED.
//
// Diagnosis from F.6/F.7 magenta diag bar (Felix's S21):
//   Brief tab: app:758@scr:0  hdr:81@0    ← correct
//   Chat tab:  app:758@scr:80 hdr:81@-80  ← bug
//
// vv/inn/dE all 758 → viewport honest. interactive-widget not the bug.
// chw=ct=621 → flex chain perfect. .ch-w height:100% not the bug.
// app.scrollTop=80, hdr.top=-80 → .app itself was being scrolled.
//
// Cause: the chat scroll-to-bottom effect used
//   er.current?.scrollIntoView({ behavior: 'smooth' })
// which walks every scrollable ancestor. Per the CSSOM-View spec,
// overflow:hidden ancestors ARE scroll containers for the purposes
// of scrollIntoView (overflow:hidden only blocks USER scroll, not
// programmatic). So .app was getting scrolled by ~80px, hiding the
// header and exposing dead space at bottom = the "black bar". The
// keyboard-close handler reset .app.scrollTop=0, which is why a
// keyboard cycle "fixed" it once.
//
// Fix: scroll only .ch-m via .scrollTo({top:scrollHeight}). Source-
// level fix only — no JS safety net, no overflow:clip defense.
// Felix's call: if a future regression re-introduces an .app scroll,
// it will be visible immediately rather than masked.
//
// Magenta diagnostic bar (F.6/F.7) removed.
// ═══════════════════════════════════════════════════════════════

const CACHE = 'jarvis-v18';
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
