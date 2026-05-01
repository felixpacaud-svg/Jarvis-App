# Phase F.2 — Responsive · Fix-Pack + Tweaks Notes

**Version:** `5.1.2` · **Build:** `RESPONSIVE` (Phase F.2 fix-pack)

---

## What shipped

Six things, ten patches, ~150 lines of net change. Bug fixes + small UI improvements you asked for. Nothing strategic — that's Phase G/H/I.

### 1. Keyboard nav reliably comes back (fixes the Phase F.1 regression)

Switched from `visualViewport.resize` (unreliable on Chrome Android close) to focus-event detection. When any input/textarea gets focus → `body.keyboard-open` is added, nav slides down. When focus leaves → after a 50ms tick, class removed, nav slides up. Plus a 1-second safety interval that fires `setOpen(false)` if the class is set but no input is focused — catches Chrome's back-button-quirk where keyboard dismisses without blurring the input.

### 2. News "Failed to Fetch" while online

Added retry logic inside `fetchNews`. If the direct GNews call throws (transient Wi-Fi flicker, brief DNS hiccup), we retry up to 2 more times with 400ms / 800ms backoff before giving up. If all three fail, the existing `keepOld` cache fallback runs and shows the stale banner — but this should now happen far less often.

If you still see the error consistently, it's not transient and either (a) GNews quota is hit (100/day on free tier), or (b) something is geo-blocking — both would need separate diagnosis.

### 3. Bigger, slower ripples

- Hit ripple: `380px` max diameter, `950ms` (was 240px / 550ms)
- Miss ripple: `520px` max diameter, `1400ms` (was 320px / 900ms)

The animation now has a midpoint at 55% where opacity drops from 1.0 → 0.7 (hit) or 0.85 → 0.5 (miss) — that's the "settling" behavior, the surface visibly returning to rest. Plus `mix-blend-mode: screen` from F.1 still applies, so on dark backgrounds the ring genuinely glows.

### 4. Reactor "looking around"

Added `.reactor-core::before` — a small inner highlight that drifts on an 11-second cycle through 6 keyframe positions, with subtle scale variance (1.0 ↔ 1.06). Reads as a mechanical eye that's tracking. Without being literal about "Jarvis is watching you" — it just looks alive on its own.

### 5. Brief layout · weather above urgent mail, below quick capture

The order is now:
1. Greeting
2. Urgency banner
3. Today's priorities + quick capture
4. **Weather** (lifted up)
5. Urgent mail
6. Today's schedule
7. Markets / FX / News (below the fold)

Same weather card, just relocated. Below-fold ambient cards (markets/FX/news) are unchanged in structure, just minus the weather they used to lead with.

### 6. Marathon tab removed

Bottom nav is now 7 buttons (Chat / Brief / Tasks / Mail / News / Fin / Cal). The `RunTab` component itself stays in the codebase — bringing marathon back later is reverting two patches. The hardcoded race date in the AI system prompt also stays (that's just informational context, not UI).

---

## SW cache bumped (v10 → v11)

Same standing rule.

---

## What's NOT in this drop (and why)

You asked for a lot. Here's what I deferred and the honest reasoning:

### Deferred to Phase H (medium features, real but bounded)
- **Calendar monthly grid view** — 1-2 days of work to build properly. Real component.
- **Swipe between tabs** — 1 day, plus design call about gesture conflicts on scrollable tabs.
- **Mail "ignore/noise" category + French accent fix** — 1 day total. Accent fix is probably half a day depending on what's wrong.
- **News headlines-only mode + thumbs up/down + delete** — 1-2 days. The feedback store and ranking adjustment are the real work.

### Deferred to Phase I (its own real phase)
- **Tasks as a pipeline tool** (comments, status stages, audit log, mail linkage) — this is genuinely "small Trello inside Jarvis", 3-5 days minimum. Not a tweak.

### Deferred to Phase J (heuristic learning, not real ML)
- **Mail learning** — pattern matching on senders + subject keywords. "If you've reclassified 3+ emails from sender X as noise, auto-classify future ones." This will feel smart in ~80% of cases. 2-3 days.

### Indefinitely deferred (real ML, not in scope without a backend + serious investment)
- **App-wide pattern learning** — "see how I use and replicate for future". To do this credibly requires embeddings, a vector store, training pipeline, retraining cycles, and a backend to host it. 3-6+ weeks of focused work. The free/no-backend version is rule-based heuristics — useful but not "learning".

I'm not refusing to build any of this — I'm refusing to bundle 20 things into one phase and then claim they all shipped. We did exactly that on Phase F (six things) and the keyboard fix alone needed two iterations. Discipline.

---

## Phase G is still up next

Capacitor wrap + Cloudflare Worker push + public GitHub. Same scope as before. Once you've used F.2 for a few days and confirmed nothing's broken, we start G.

---

## How to test

### 1. Header shows v5.1.2
After cache cycle. If you see v5.1.1 or earlier, force-clear PWA storage and reopen.

### 2. The keyboard fix (the actual one this time)
- Brief tab → tap quick-capture input → keyboard opens, nav slides down.
- Type a few characters.
- Tap outside the input (anywhere blank). Keyboard dismisses, nav slides back up cleanly.
- Repeat with the back-button dismissal. Nav still comes back.
- Same test in Chat tab.

If nav doesn't come back: tell me. The 1-second safety interval should catch it but if even that fails there's something Chrome-specific I'd need to debug live.

### 3. News retry
- News tab → tap refresh.
- Most of the time it should work first try.
- If you happen to be in a flaky network moment, the retries should cover it. If you still see the cached/stale banner often: report when, and we'll instrument for actual cause (could be quota, could be geo).

### 4. Ripple
- Tap anywhere. The ring should be noticeably wider than before and linger ~1 second.
- Tap an empty area between cards. Wider and slower still (~1.4s).

### 5. Reactor pupil
- Watch the reactor in the header for ~30 seconds without doing anything.
- You should see a subtle inner highlight drift. Not aggressive — subtle. If you can't see it, get closer to the screen; the motion is intentionally small (about 2-3px range).

### 6. Brief order
- Open Brief.
- Order from top: greeting → urgency banner → priorities/quick-capture → weather → (urgent mail if any) → today's schedule → markets/FX/news.

### 7. No more marathon
- Bottom nav has 7 buttons. Run/marathon icon gone.
- If you had a bookmark to `?tab=marathon`, it now redirects to Brief (the URL validator drops it).

### 8. Phase A-F regression
- Notifications, voice, recurring tasks, all unchanged. Confirm nothing broke.

---

## Files

- `index.html` — 10 patches (see `PHASE-F.2-PATCHES.md`).
- `sw.js` — cache v10 → v11.

Drop both. Auto-update reloads.
