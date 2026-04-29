# Phase A — Stabilize · Change Notes

**Version:** `4.5.0` · **Build:** `STABILIZE-A`

This phase doesn't add features. It fixes the foundation so the rest of the work has something to stand on. The visible UI is almost identical; the engine is different.

---

## What changed

### 1. Mail body fetch no longer crashes
`fetchMailBody` was calling `decodeB64(...)` but only `decodeB64Url` was defined. Every body fetch threw a `ReferenceError` and you got nothing. Renamed to the correct symbol — fix is one character but unblocks the entire in-app mail viewer.

### 2. Mail HTML is now properly sanitized
Replaced the regex strip (which only removed `<script>` and `<style>`) with **DOMPurify**. The CDN is loaded in `<head>` and used in `fetchMailBody`. If the CDN ever fails to load, a hardened regex fallback runs that also strips `onerror`, `onload`, `javascript:`, `<iframe>`, etc. Realistically this closes every common mail-rendering attack vector.

### 3. Notifications rebuilt around what actually works
The old approach was `setTimeout` *inside the service worker* — but service workers are killed when idle, so any timer scheduled for hours later (e.g. a 7am briefing scheduled at midnight) was destroyed before it fired. **Briefings essentially never reached you, ever.**

The new system has four layers, all free, no backend:

- **L1 — Notification Triggers** (`TimestampTrigger`). On Chrome Android with the PWA installed, briefings and reminders are queued at the OS level and fire even when the app is fully closed. We schedule the next 7 days of 7am/7pm slots + a 10-min-before alert for every upcoming event.
- **L2 — Foreground tick.** `setInterval(30s)` running *in the page* checks for due reminders and fires them via `Notification`. Catches anything L1 missed (Firefox, desktop Safari, browsers without trigger support).
- **L3 — Catch-up on focus.** When you open or refocus the app, any briefing slot that's due-but-not-shown today fires immediately. Always works.
- **L4 — In-app urgency** is the safety net. (Will be visible in Phase B with the new Brief layout.)

Every layer is no-backend and no-cost. On your Galaxy S21 + Chrome PWA, L1 carries the weight; the rest exist so the app degrades gracefully on other browsers.

The old service worker message handlers (`SCHEDULE_NOTIFICATIONS`, `SCHEDULE_REMINDER`) are now no-ops — kept only so an old cached page doesn't error if it tries to post to the new SW during the first load after deploy.

### 4. Notification self-test in Settings
New button under Settings → Notifications. It:
- Fires an immediate notification (verifies permission + delivery).
- If `TimestampTrigger` is supported, also schedules a second one for 10 seconds later (verifies background scheduling actually fires).
- Reports the result inline with `● BACKGROUND OK` or `○ FOREGROUND ONLY` so you know exactly which capability your current browser+device combo gives you.

This is the diagnostic that tells you within 15 seconds whether everything works. Use it after every deploy.

### 5. Service worker bumped to `jarvis-v7`
Forces a clean cache update on next load. The auto-reload-on-update logic in `Jarvis()` already handles this — when the new SW activates, the page reloads automatically.

---

## How to test (5 minutes)

After you've forked + pushed the new files to GitHub Pages:

1. **Open the app on your phone.** It should reload itself once when the new SW takes over (you'll see the `Jarvis updated — reloading` toast).

2. **Tap ⚙️ → Notifications → "Run notification self-test".**
   - Within 1s you should see a notification: *"Online, sir. Background scheduling supported on this device."*
   - 10 seconds later you should see a second one: *"If you see this 10 seconds after the first one, background scheduling is working correctly."*
   - If both appear → L1 works, briefings will fire even when the app is closed.
   - If only the first appears → L2/L3 will still work, briefings fire when you open the app.

3. **Test event reminders.** Type into chat: *"meeting tomorrow at 9:30am"*. Open Settings → "Run notification self-test" again to confirm reminders are queued. (The 9:20am reminder will fire tomorrow.)

4. **Test mail body view.** Open the Mail tab. Tap any email. The body should now render (it always crashed silently before).

5. **Force-close the app.** Wait until 7pm. The evening briefing should arrive even though the app is fully closed. (This is the ultimate test of L1.)

---

## What's still missing — Phase B preview

Phase A only fixed what was broken. The actual product change ("push me to take action") needs:

- A **Tasks** store separate from Calendar Events (priority, due date without time, status, snooze).
- A **rebuilt Brief tab** as the home screen, leading with Today's Priorities → Urgent Mail → Today's Events → Quick Capture.
- **Default tab → Brief** instead of Chat.
- **Convert mail → Task** action in MailTab.
- **Urgency-driven aliveness** (reactor pulses faster on overdue, nav badge counts).

Phase A had to come first so we know notifications actually deliver before we wire them to tasks. When you've validated this build works, ping me to start Phase B.

---

## Files in this drop

- `index.html` — main app, +296 lines vs previous (notification system rewrite + self-test UI + DOMPurify integration + mail body fix).
- `sw.js` — rewritten, 89 lines. Cache + notificationclick only. No more broken scheduling.

That's it. Same 4 files in the repo (`index.html`, `sw.js`, `manifest.json`, `jarvis-icon.svg`); only the first two changed.
