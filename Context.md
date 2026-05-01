# Jarvis — Project Context

> Living document. Update at the end of each phase.

**Last updated:** End of Phase E.1 (v5.0.1 / PRESENCE)

---

## What this is

Personal AI assistant PWA for Felix Pacaud. Single-file `index.html` 
(~5,650 lines) + `sw.js` (~95 lines). Deployed via GitHub Pages at 
`https://felixpacaud-svg.github.io/Jarvis-App/`. No backend. No npm. 
React + Babel transpiled in the browser. State in `localStorage`.

Eight tabs in the bottom nav: Chat · Brief · Tasks · Mail · News · Fin · 
Cal · Run. Brain accessible via the ⋯ overflow menu in the header.

---

## Current state

- **v5.0.1 / PRESENCE** (Phase E + E.1). Single committed palette: 
  amber (action) / crimson (warning) / ice cyan (data — every number). 
  Multi-layer reactor (38px, gold + ice rings + hot core + filaments). 
  Italic serif greeting in Brief ("Good morning, *Sir.*" in Cormorant). 
  Glass cards with 20px blur and visible top-edge highlight. True water 
  ripple on tap (hollow center, bright leading edge expanding outward).
- Phase E.1 fix-pack delivered: SW cache bump (v7→v8) so the Phase E 
  shell actually loads, and ripple gradient inverted so the click 
  feedback no longer reads as a sniper-scope reticle.

## What works

- Notification stack: TimestampTrigger (Chrome Android only; verified not 
  available on Felix's device) + foreground tick + catch-up on focus + 
  in-app urgency surface. The bottom three layers do all the actual work.
- Tasks: full CRUD, snooze, bulk select, filters, sort, group, search, 
  inline edit, mail-to-task conversion. Tasks Centre tab.
- AI chat: Groq Llama 3.3 70B primary → Llama 3.1 8B → Gemini Flash 
  fallback. System prompt includes Felix's open tasks for context.
- Mail: AI-classified urgency with manual override, in-app viewer with 
  DOMPurify-sanitized HTML body rendering, "Convert to Task" action.
- Brief tab: today's priorities, urgent mail, today's events, ambient 
  weather/markets/FX/news. Default landing tab.
- Tap feedback: viewport water ripple (bright ring expanding outward) 
  + element :active styling. No more scope reticle.

## What's deferred

- **Always-on background push** — would require Cloudflare Worker + 
  Web Push API. Free but ~30 min setup. Felix opted for "Phase B first, 
  add later if missed" in Phase A discussion. Still deferred.
- **Mail upgrade** — sort by sender/priority, bulk archive, markdown 
  export. Promised in Phase B notes, not yet built.
- **Recurring tasks** — `rrule` field. Out of scope so far.
- **Voice input** — only voice output exists. Would let Felix dictate 
  quick-capture into Brief.
- **File restructure** — single-file remains manageable through Phase E. 
  Defer until feature velocity drops.
- **Phase E coverage in Mail/Calendar/Settings** — Phase E focused 
  budget on Brief, header, nav, reactor, task rows. Mail viewer, 
  calendar grid, and settings panel still wear visual layer from D.1.

## Bugs / debt to remember

- **Cache bump must accompany every shell-changing phase.** Phase E 
  shipped without bumping `CACHE` in sw.js — the activate handler keys 
  off that constant, so re-uploading the same v7 file did nothing and 
  the Phase E shell never reached existing PWA installs. Phase E.1 
  fixed it (v7 → v8). Going forward: bump cache version on every phase 
  that changes index.html, even if sw.js itself is unchanged.
- **Geometry vs. naming.** Renaming an effect ≠ fixing it. Phases D, 
  D.1 and E all renamed the click reticle without changing its shape. 
  Phase E.1 inverted the gradient (transparent center, bright outer 
  ring) — that was the actual fix the whole time.
- The Phase B BriefTab rewrite left two orphan characters (`)` `}`) at 
  the end of the function. Caught and fixed during Phase C audit. The 
  file parsed and ran correctly, but lint warnings would have shown it.
- Babel-in-browser cost: ~250KB JSX parsed on every load. Acceptable on 
  Felix's S21 but not free. Migration to `htm` (3KB tagged templates) 
  is a future option.
- No DOMPurify fallback path tested in production — if the CDN fails, 
  the regex stripper kicks in but it's untested with real malicious mail.
- iOS Safari has occasional service-worker cache quirks; mitigated by 
  cachebuster but not eliminated.

## Architecture quick reference

- State stores: `j_events`, `j_tasks`, `j_brain`, `j_chat`, `j_portfolio`,
  `j_mail_cache`, `j_mail_class`, `j_mail_bodies`, `j_news_*`, 
  `j_weather`, `j_fx_cache`, `j_prices`, `j_notif_state`, `j_tasks_view`, 
  `j_voice_pref`. All localStorage-backed via the `sto` helper + `bus` 
  pub/sub.
- AI parses three structured-action tags: `[[EVENT:{...}]]`, 
  `[[TASK:{...}]]`, `[[NOTE:{...}]]`. The `stripTags` helper removes 
  them from the visible reply.
- `useStore(key, loader)` hook subscribes a component to a 
  localStorage key and re-renders on bus emit.
- Notification scheduling lives in the page (not the SW), since SW 
  setTimeouts get killed when the worker idles.
- Tap feedback: pointerdown handler in JS adds `.rip` class to interactive 
  elements (now no-op CSS) and spawns a viewport-level `.d-ripple` div. 
  The viewport ripple has bright-edge / transparent-center gradient 
  (Phase E.1) — true water ripple geometry, not scope reticle.

## Phase history

- **v4.0** — original multi-agent architecture (deprecated).
- **v4.1–4.4** — mail tab, in-app viewer, Groq integration, vibrant HUD.
- **v4.5 / Phase A — STABILIZE-A** — fixed `decodeB64` mail crash, 
  rebuilt notifications around what actually works, DOMPurify, self-test.
- **v4.6 / Phase B — ACTIONABLE** — Tasks data model, system prompt 
  rewrite, Brief tab rebuilt as action surface, urgency-driven UI, 
  mail-to-task conversion.
- **v4.7 / Phase C — TASK-CENTRE** — standalone Tasks tab with filters, 
  sort, group, search, bulk select, inline edit, More overflow.
- **v4.8 / Phase D — ATELIER** — visual reset: refined palette, glass 
  cards, atmospheric background, ripple feedback (bright-center, 
  scope-shaped — Felix flagged it).
- **v4.8.1 / Phase D.1 — ATELIER+** — three-theme picker, brighter 
  atmosphere, "fixed" the ripple (still bright-center).
- **v5.0.0 / Phase E — PRESENCE** — committed single palette, 
  multi-layer reactor, italic serif typography, ice-cyan data voice, 
  visible glass cards. Theme picker removed. **Cache version not bumped 
  → existing PWAs never saw any of it.**
- **v5.0.1 / Phase E.1** — sw.js cache `v7→v8` so Phase E actually 
  reaches devices. Ripple gradient inverted to true water-ripple 
  geometry (hollow center, bright leading edge). Element-anchored 
  `.rip::after` gated.

## Working agreement summary

Audit before changes. Diagnose before building. Ask Felix when there's 
a real choice. Patch, don't rewrite. Ship with notes. Test checklist 
mandatory. No flattery. Push back when wrong. **Bump SW cache on every 
shell-changing phase.**
