# Phase F — Responsive · Change Notes

**Version:** `5.1.0` · **Build:** `RESPONSIVE`

Three real things shipped: the chat-tab layout bug is dead, voice input is fully wired in Brief and Chat with auto-submit, and recurring tasks are a first-class concept with multiple-times-per-day support (the meds use case). Plus a small but important latent bug-fix around dedup of done tasks.

---

## What changed

### 1. Chat tab no longer destroys itself on open

**Cause:** the chat tab auto-focused its input 100ms after mount. On Android Chrome that opens the soft keyboard, which collapses the dvh-sized layout and pulls the header off-screen. `preventScroll: true` is a hint, not a guarantee, and doesn't suppress the keyboard.

**Fix:** detect touch devices (`'ontouchstart' in window || navigator.maxTouchPoints > 0`) and skip the auto-focus on those. Desktop still gets it.

**Belt-and-suspenders:** `.app` switched from `height: 100dvh` to `100svh`. Same height in PWA standalone mode (no URL bar to vary), but in browser tab the layout no longer shrinks/grows when the keyboard opens. If you ever do tap the input manually, the layout stays put.

### 2. Voice input — wired everywhere, auto-submits

What was there: `useVoice` hook + a mic button in Chat that *concatenated* transcribed text into the input field, requiring you to tap send afterward.

What's new:

- **Brief quick-capture has a mic.** Tap the mic, speak, stop. Auto-submitted. The input briefly shows "Listening..." while active. The mic glows red and pulses while recording.
- **Chat voice now auto-submits too.** Speak, stop talking, message sends. No second tap.
- **Language preference in Settings.** `AUTO` (uses `navigator.language`) / `EN-GB` / `FR-FR`. The default is AUTO. If your S21 reports `en-US` for some reason and your French isn't being recognized, switch the chip to `FR-FR` and try again.

The "800ms silence" auto-submit isn't something I built — it's the Web Speech API's built-in end-of-speech detection. Setting `interimResults: false` and `continuous: false` on the recognizer means `onresult` only fires once the recognizer has decided you're done talking. So "speak, stop, send" is just hooking submit into `onresult`.

**Honest limitations:**

- Web Speech API on Chrome Android is good but not perfect. Background noise hurts it. French recognition is meaningfully worse than English in my experience.
- iOS Safari's Web Speech API is flakier — but you're on Android primarily, so this matters in Phase G when we wrap for iOS.
- There's no manual "stop" UI for chat — once you tap the mic, you're committed. If you start talking and want to bail, just say nothing for 2-3 seconds and the recognizer gives up. I considered adding a stop button, opted against it; one less control.

### 3. Recurring tasks — proper first-class concept

The schema gained one optional field on every task:

```js
recur: {
  type: 'daily' | 'weekdays' | 'weekly' | 'monthly',
  days: ['mon','wed','fri'],     // only used for type='weekly'
  times: ['08:00','20:00'],      // 0+ times-of-day
  endDate: 'YYYY-MM-DD' | null,  // optional, not yet wired into UI
} | null
```

**How it works (template-spawns-instances):**

1. You create a task with `recur` set. The task is stored as one regular instance.
2. When you mark it done, `completeTask` checks for `recur` and calls `spawnNextRecur`.
3. `spawnNextRecur` computes the next occurrence and creates a new task carrying the same `recur` block.
4. So the chain continues forward indefinitely, one instance at a time. No upfront calendar pollution.

**Multi-time-per-day** (your meds case): if `recur.times = ['08:00','20:00']`, then:
- Mark 8am instance done → 8pm same-day spawned
- Mark 8pm instance done → 8am tomorrow spawned
- Chain continues every day at 8am and 8pm

**Edit panel UI** (open any task with long-press, or hit the FAB to create a new one):

- New "Repeat" chip row: `Once / Daily / Weekdays / Weekly / Monthly`
- If Weekly: a 7-chip day-of-week picker shows up
- If anything other than Once: a "Times" stack appears, with `+ ADD TIME` to add another time-of-day input

**Edge cases I'm explicitly handling:**

- **Skipped instances.** If you don't mark today's 8am instance done by 8pm, both will be in your list. They're just regular tasks with priority and overdue states. When you finally mark one done, it spawns the *next* one in the cycle — no auto-catchup for missed instances. Misses are misses.
- **Editing recur on an existing instance.** Edits to title/priority/notes apply to the current instance only. The next spawned instance carries forward whatever the recur block looked like at completion time. Practically that means: if you edit a recurring task and change its recurrence, the change takes effect on the *next* spawn after you mark the current one done.
- **Deleting a recurring task.** Currently this just deletes the current instance. Future spawns will still happen via the chain. To stop the recurrence entirely, edit and switch to "Once" before deleting (or just snooze it forever). I'll add a "Delete this and stop recurring" option in a follow-up if you find this annoying.

### 4. Latent bug fixed: dedup against done tasks

The 60-second-dedup-by-title in `addTask` was matching against ALL tasks regardless of status. So if you marked a recurring task done within 60s of its creation (testing scenario, but also the multi-time-per-day same-day spawn), the new instance would be silently rejected as a duplicate.

Fix: dedup only checks against `open` and `snoozed` tasks. Done tasks no longer block.

This is a general improvement, not a recur-specific hack — even before recurring, this was technically wrong if you happened to recreate a just-completed task with the same title.

---

## Cache version bumped (v8 → v9)

Per the standing rule logged after Phase E.1: any phase that changes index.html bumps the SW cache version. `sw.js` is otherwise unchanged.

---

## What did NOT change

- Reactor, palette, glass cards, atmospheric layer — all Phase E.
- Notification stack — Phase A foundation, untouched.
- Mail, calendar, marathon, brain — untouched.
- AI providers (still Groq → Gemini fallback). Claude not added — explicit decision.

---

## How to test

### 1. The chat-tab fix (the one you reported)

- Open the PWA. Hit Chat.
- Header should stay visible. No black bar at the bottom (or whatever weirdness you saw).
- Tap inside the chat input. Keyboard opens. Layout should hold.
- Type something normally. Send works.

If the header still disappears or there's a black bar: stop and tell me. The fix is two changes (skip auto-focus on touch + svh) and if neither helped, there's a third cause we haven't identified.

### 2. Voice input on Brief

- Brief tab. Find the gold "+" arrow at the end of the quick-capture row.
- There's a new mic button left of it. Tap it.
- It glows red, the input placeholder changes to "Listening..."
- Say something simple: *"Pick up dry cleaning Saturday"*
- Stop talking. ~1 second later, the input fills with the transcript and submits automatically. You should see the busy spinner, then the task appears in priorities.

If recognition is way off, try the language chip in Settings → Voice → Recognition lang.

### 3. Voice input on Chat

- Chat tab. Tap the mic button next to the send arrow.
- Say something: *"What's on my plate today?"*
- Should auto-submit when you stop talking.

If you preferred the old "speak multiple times to build up a long message" behavior, tell me — easy to add a Settings toggle for that.

### 4. Recurring tasks — the meds test

- Tasks tab → tap the gold + FAB.
- Title: "Take pills"
- Repeat: tap **Daily**
- Times row appears. Set the first time to **08:00**, then `+ ADD TIME`, set second to **20:00**.
- Save.
- Find "Take pills" in Today's Priorities. Mark it done (tap the circle).
- A new "Take pills" instance should appear, due today 20:00.
- Mark that one done too.
- Now you should see "Take pills" tomorrow 08:00 in tomorrow-view (or in the Tasks list with `tomorrow` due-date).

### 5. Recurring tasks — weekly with day picker

- New task: "Long run"
- Repeat: Weekly. The day-of-week chips appear. Tap **MON**, **WED**, **FRI**.
- Times: 06:00.
- Save.
- Mark done. Next instance should be the next Mon/Wed/Fri after the current due date, at 06:00.

### 6. Recurring tasks — weekdays only

- New task: "Daily standup"
- Repeat: Weekdays. Time: 09:00.
- Save. Mark done.
- Next instance should be the next weekday at 09:00 (skipping Sat/Sun).

### 7. Phase A/B/C/D/E regression

- Notifications self-test still works.
- Mail viewer renders.
- Brief priorities + urgency banner update.
- Reactor still glows. Cards still float. Greeting still says "Sir" in italic serif.
- Tap-feedback ripple still expands outward (water, not crosshair).
- Nav badge still counts overdue + urgent mail.

---

## Files

- `index.html` — 17 patches (see `PHASE-F-PATCHES.md`).
- `sw.js` — cache version bumped v8 → v9. Otherwise unchanged.

Drop both. Auto-update reloads on next launch.

---

## What's queued for Phase G (Capacitor + distribute)

Per your stated goal of App Store + Play Store distribution. Not happening this phase, but the path is concrete:

1. **Set up Capacitor.** Install via npm in a separate working tree (the source codebase stays single-file). Capacitor wraps the PWA into a native iOS+Android shell. ~half a day.
2. **iOS native plugins.** Web Speech API works on iOS Safari but is flaky in WebView. Swap voice input to `@capacitor-community/speech-recognition` for the iOS build. Same JS interface, different backend. ~half a day.
3. **Push notifications.** Capacitor's `@capacitor/push-notifications` for the native side. Replaces the current Web Push (which we don't have) and TimestampTrigger fallback (Felix's S21 doesn't support). This is the "always-on, phone locked" feature you actually want. ~1 day.
4. **App Store + Play Store assets.** Icons, screenshots, descriptions, privacy policy, age rating. ~1 day each.
5. **Apple Developer account** ($99/yr) and **Google Play Console** ($25 one-time). Real money.
6. **Push certificate** (Apple) + **FCM setup** (Google). Half a day each.
7. **Beta test internally** before submission. TestFlight (iOS) and Internal Testing (Android). 2-7 days for review.

Total realistic effort: **~2 weeks of focused work**, plus 1-2 weeks of waiting for App Store review (Apple is slower).

The Phase F features all carry forward unchanged — they're built on web standards Capacitor preserves.

---

## Honest reflection on this phase

Three things I'm watching for:

1. **The chat-tab fix.** I've identified the cause (auto-focus → keyboard → layout collapse) and applied two defenses. If the bug persists, there's a third cause and I'll need to instrument with `visualViewport` listeners. ~70% confident the two changes here are sufficient.

2. **Voice in French.** Web Speech API French accuracy is meaningfully worse than English. Don't be surprised if `FR-FR` does poorly with quick spoken French. The `AUTO` setting + speaking English/franglais usually works better in my experience. If it's bad enough to be unusable, Phase G's native iOS plugin should be much better; Android's native plugin is similar quality to web.

3. **Recurring tasks UX with multi-time-per-day.** The model is correct (template spawns instances). The UX of "mark done at 8am to get the 8pm instance, then mark done at 8pm to get tomorrow's 8am" is logically clean but might feel clunky in practice. If after using it for a week you find yourself wishing for a different model, tell me — there's a "checkbox per time" alternative I rejected for being uglier but more immediate.
