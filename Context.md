# Jarvis — Project Context

> Living document. Update at the end of each phase.

**Last updated:** End of Phase F (v5.1.0 / RESPONSIVE)

---

## What this is

Personal AI assistant PWA for Felix Pacaud. Single-file `index.html` 
(~5,800 lines) + `sw.js` (~95 lines). Deployed via GitHub Pages at 
`https://felixpacaud-svg.github.io/Jarvis-App/`. No backend. No npm. 
React + Babel transpiled in the browser. State in `localStorage`.

Eight tabs in the bottom nav: Chat · Brief · Tasks · Mail · News · Fin · 
Cal · Run. Brain accessible via the ⋯ overflow menu in the header.

Phase G plan: Capacitor wrap + iOS/Android distribution via App Store + 
Play Store. Phase F's features all carry forward. Native push and native 
speech recognition swap in for their web equivalents.

---

## Current state

- **v5.1.0 / RESPONSIVE** (Phase F). Voice input fully wired in Brief 
  and Chat with auto-submit. Recurring tasks (template-spawns-instances 
  model) with multi-time-per-day support. Chat-tab layout bug fixed.
- Three voices used distinctly: amber (action) / crimson (warning) / 
  ice cyan (data — every number).
- Multi-layer reactor (38px, gold + ice rings + hot core + filaments). 
  Italic serif greeting. Glass cards with visible top-edge highlight. 
  True water ripple on tap.

## What works

- **Notifications:** TimestampTrigger (Chrome Android only; not on Felix's 
  S21) + foreground tick + catch-up on focus + in-app urgency surface.
- **Tasks:** full CRUD, snooze, bulk select, filters, sort, group, search, 
  inline edit, mail-to-task conversion, **recurring with multi-time-per-day**.
- **AI chat:** Groq Llama 3.3 70B primary → Llama 3.1 8B → Gemini Flash 
  fallback. System prompt includes Felix's open tasks for context.
- **Mail:** AI-classified urgency with manual override, in-app viewer with 
  DOMPurify-sanitized HTML body rendering, "Convert to Task" action.
- **Brief tab:** today's priorities, urgent mail, today's events, ambient 
  weather/markets/FX/news. Default landing tab. **Voice quick-capture.**
- **Chat:** voice input auto-submits on natural silence detection.
- **Voice input language preference** in Settings (auto/EN-GB/FR-FR).
- **Tap feedback:** viewport water ripple, no scope reticle.

## What's deferred

- **Always-on background push** — requires backend. Deferred to Phase G+.
- **Mail upgrade** — sort by sender/priority, bulk archive, markdown export. 
  Promised in Phase B notes, still not built.
- **iOS support** — Phase G via Capacitor wrap.
- **Cross-device sync** — requires backend. Phase H or later.
- **Claude as 4th AI provider** — explicit decision to skip; not 
  capability-changing for current use cases.
- **Recurring task end-date UI** — schema supports `endDate`, no editor 
  for it yet. Add when needed.
- **"Delete this and stop recurring" option** — currently deletion 
  removes the current instance only; chain continues. Add if Felix 
  finds the workaround (edit to "Once" first) annoying.
- **File restructure** — single-file remains manageable. Defer.

## Bugs / debt to remember

- **Cache bump must accompany every shell-changing phase.** Logged in 
  Phase E.1; rule held in Phase F (v8 → v9).
- **Geometry vs. naming.** Renaming an effect ≠ fixing it (Phases D/D.1/E 
  ripple issue).
- **Web Speech API French recognition** is meaningfully worse than English 
  in Chrome. The Phase F Settings language chip lets Felix override, but 
  if accuracy is poor, native speech recognition (Phase G) will help on 
  iOS at least; Android native is similar quality.
- **Recurring task UX.** The template-spawns-instances model is logically 
  clean but the "mark done sequentially through the day" pattern may feel 
  clunky for multi-time-per-day. Watching for feedback before committing 
  to alternative checkbox-per-time UI.
- The Phase B BriefTab rewrite left two orphan characters (`)` `}`) at 
  the end of the function. Caught and fixed during Phase C audit.
- Babel-in-browser cost: ~250KB JSX parsed on every load. Acceptable on 
  S21 but not free. Migration to `htm` is a future option.
- No DOMPurify fallback path tested in production.
- iOS Safari has occasional service-worker cache quirks; mitigated by 
  cachebuster.

## Architecture quick reference

- State stores: `j_events`, `j_tasks` (now with `recur` field), 
  `j_brain`, `j_chat`, `j_portfolio`, `j_mail_cache`, `j_mail_class`, 
  `j_mail_bodies`, `j_news_*`, `j_weather`, `j_fx_cache`, `j_prices`, 
  `j_notif_state`, `j_tasks_view`, `j_voice_pref`, **`j_voice_lang`**. 
  All localStorage-backed via `sto` + `bus` pub/sub.
- AI parses three structured-action tags: `[[EVENT:{...}]]`, 
  `[[TASK:{...}]]`, `[[NOTE:{...}]]`. The `stripTags` helper removes 
  them from the visible reply.
- `useStore(key, loader)` hook subscribes a component to a 
  localStorage key and re-renders on bus emit.
- Notification scheduling lives in the page (not the SW).
- Tap feedback: viewport `.d-ripple` div with bright-edge / 
  transparent-center gradient.
- **Recurring tasks: template-spawns-instances.** A recurring task is a 
  regular task with a `recur` block. When marked done, `completeTask` 
  fires `spawnNextRecur(task)` which computes the next due date/time and 
  calls `addTask` with the same recur block. Multi-time-per-day: if the 
  current time isn't the last in `recur.times`, spawn same-day at the 
  next time; otherwise advance the date and use the first time.
- **Voice: `useVoice(onResult)`** hook returns `{ listening, start, stop, 
  supported }`. `onResult(transcript)` fires after Web Speech API detects 
  natural silence (~800ms). Used in Brief and Chat with auto-submit 
  semantics. Language read from `j_voice_lang` (auto/en-GB/fr-FR).

## Phase history

- **v4.0** — original multi-agent architecture (deprecated).
- **v4.1–4.4** — mail tab, in-app viewer, Groq integration, vibrant HUD.
- **v4.5 / Phase A — STABILIZE-A** — fixed `decodeB64` mail crash, 
  rebuilt notifications around what actually works, DOMPurify, self-test.
- **v4.6 / Phase B — ACTIONABLE** — Tasks data model, Brief as action 
  surface, urgency-driven UI, mail-to-task conversion.
- **v4.7 / Phase C — TASK-CENTRE** — standalone Tasks tab.
- **v4.8 / Phase D — ATELIER** — visual reset attempt #1.
- **v4.8.1 / Phase D.1 — ATELIER+** — three-theme picker (later removed), 
  brighter atmosphere, "fixed" the ripple.
- **v5.0.0 / Phase E — PRESENCE** — committed single palette, multi-layer 
  reactor, italic serif typography, ice-cyan data voice, glass cards. 
  Theme picker removed. Cache version not bumped → existing PWAs missed it.
- **v5.0.1 / Phase E.1** — sw.js cache `v7→v8`, ripple gradient inverted 
  to true water-ripple geometry.
- **v5.1.0 / Phase F — RESPONSIVE** — chat-tab layout fix, voice input 
  expanded to Brief with auto-submit, recurring tasks with multi-time-
  per-day support, dedup-vs-done bug fix, voice language preference. 
  Cache `v8→v9`.

## Working agreement summary

Audit before changes. Diagnose before building. Ask Felix when there's 
a real choice. Patch, don't rewrite. Ship with notes. Test checklist 
mandatory. No flattery. Push back when wrong. Bump SW cache on every 
shell-changing phase. Renaming ≠ fixing.
