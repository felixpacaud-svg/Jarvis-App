# Phase B — Actionable · Change Notes

**Version:** `4.6.0` · **Build:** `ACTIONABLE`

This is the product change. Phase A fixed the foundation; Phase B turns Jarvis from "second brain that stores stuff" into "second brain that pushes you to act".

---

## What's new, conceptually

### Tasks are now a first-class thing
Until now Jarvis only had **events** (calendar items with a precise time) and **brain notes** (free-text memory). Phase B adds **tasks**: things you need to *do* by some deadline, with a state machine.

| | Event | Task |
|---|---|---|
| **What it is** | A scheduled block on your day | A thing to do |
| **Time** | Precise (`19:30`) | Deadline (today, Friday, etc.) — time optional |
| **Has priority** | No | Yes (high / med / low) |
| **Has state** | No | Open → Done, can be snoozed |
| **Example** | "Dinner with Mélanie at 20:00" | "Reply to Christian about Q3" |

Tasks live in `localStorage` as `j_tasks`, separately from events. They survive across sessions, sync via the export/import backup, and are now part of every AI prompt.

### Brief is the action surface, not Chat
Default landing tab changed from Chat to Brief. The new Brief layout, top to bottom:

1. **Greeting** + live date
2. **Urgency banner** — *"Sir, 3 overdue tasks"* (red), *"2 due today"* (gold), or *"All clear, sir"* (green)
3. **Today's priorities** — top 5 open tasks, sorted overdue→due-today→priority→date
4. **Quick capture input** — see below
5. **Urgent mail** — top 3 urgent unread mails (only shown if any exist)
6. **Today's schedule** — events from Google Calendar + Jarvis-created
7. **Ambient cards** — weather, markets, FX, news (everything that was in the old Brief, now below the fold)

### Quick Capture
One input at the top of Today's Priorities. Type and hit Enter or tap the gold arrow.

- **Plain text** ("call dentist", "buy printer paper") → instant task with `priority: med, due: today`
- **Anything with a date/time hint** ("call dentist Thursday", "report by Friday 10am") → routed through the AI for proper parsing into either an event or a task with the right priority/deadline
- **AI down or offline** → falls back to a plain task. Input is never lost.

The heuristic recognizes English and French time words: today, tomorrow, monday-sunday, demain, lundi-dimanche, plus number-time patterns like `9pm`, `10:30`, `14h`.

### Urgency drives the UI
The whole app now reacts when you have outstanding work:

- **Bottom-nav badge** on the Brief tab — number of overdue + urgent unread mails. Visible from any screen.
- **`has-overdue` body class** when overdue items exist:
  - Reactor pulse speeds up from 3s → 1.2s
  - Reactor glows redder
  - Inset red vignette pulses around the viewport edges (subtle, every 3s)
- **Banner color** changes tone — red when overdue, gold when busy-but-OK, green when clear

This is what "alive" should mean: the UI reacts to *information*, not just decoration.

### Mail → Task in one tap
Open any mail in the in-app viewer → new gold button: **"CREATE TASK FROM THIS MAIL"**. It pre-fills:

- Title: `Reply: <subject>`
- Priority: maps from the AI mail classification (`urgent`→high, `important`→med, `low`→low)
- Due date: `urgent`→today, `important`→tomorrow, otherwise +3 days
- Notes: who it's from + the AI assessment highlight
- Source: `mail:<id>` (visible in the task row as "from email")

Closes the mail viewer automatically and shows a "Task created — see Brief" toast.

### Foreground notifications now cover tasks
The `setInterval(30s)` foreground tick from Phase A now also:

- Wakes snoozed tasks whose `snoozeUntil` has passed
- Fires a 10-min-before reminder for any open task with a `dueTime` today
- Fires a once-per-day digest at 9am: *"3 overdue — sir, your attention please."* (only if there are overdue items)

These run while the app is open or recently in the background. They use the same `showNow()` helper as event reminders.

### AI now knows about tasks
The system prompt was rewritten:

- Teaches the AI when to emit `[[TASK:...]]` vs `[[EVENT:...]]` vs `[[NOTE:...]]`
- Provides priority guidance (high = within 2 days / time-critical / money / boss; med = this week; low = errands)
- Gives 5 worked examples of the dispatch decision
- Explicitly forbids inventing tasks Felix didn't ask for ("Tasks must come from his explicit intent")
- Disables auto-creating tasks from auto-memory triggers (those still create NOTEs only)
- Top 8 open tasks (sorted by urgency) are now always in the AI's context, so it knows what's already on your plate when you chat

### Snooze + Done + Delete
Each task row has:

- **Circle on the left** → tap to mark done. Re-tap (or tap again on a done task) to reopen.
- **× icon** → snooze until tomorrow 9am. (Snoozed tasks reappear automatically when their time arrives.)
- **🗑 icon** → tap once to arm, tap again within 3s to confirm delete (prevents fat-finger).

Toasts confirm every action.

---

## Testing checklist

After deploy (drop both files into your repo, GitHub Pages auto-redeploys, app auto-reloads):

### 1. Default landing
Open the app fresh. You should land on **Brief**, not Chat. The header should say *v4.6.0*.

### 2. Empty state looks right
With no tasks yet, the urgency banner should be green (*"All clear, sir"*) and the Priorities section should say *"Nothing to do, sir. Add something below."*

### 3. Quick capture — instant path
Type `buy milk` in the quick-capture box, hit Enter. A task should appear instantly above the input with a gold "MED" priority chip and "today" due label. No AI call needed.

### 4. Quick capture — AI path
Type `call dentist tomorrow at 10am`. Should briefly show a loading dots animation, then create a task with `due: tomorrow, dueTime: 10:00`. Or, if Jarvis decides it's better as an event, create that instead — both are valid.

### 5. Complete a task
Tap the empty circle on the left of any task. It should turn green with a checkmark, the title should strike through, and the row should fade. Toast: *"Done · <title>"*.

### 6. Snooze
Tap the × icon on an open task. The task should disappear from Today's Priorities. Toast: *"Snoozed until tomorrow 9am"*. Tomorrow morning at 9am it should reappear.

### 7. Delete
Tap the trash icon once — nothing happens (just arms it). Tap again within 3s — task deletes.

### 8. Make something overdue
Type a task in quick capture (instant path), then in DevTools console run:
```js
const t = JSON.parse(localStorage.getItem('j_tasks'));
t[0].due = '2025-01-01';
localStorage.setItem('j_tasks', JSON.stringify(t));
location.reload();
```
You should see:
- Banner turns **red**: *"Sir, 1 overdue task"*
- Bottom-nav badge shows **1** on the Brief tab (visible from any screen — try switching to Chat, the badge stays)
- Reactor in the header pulses faster + redder
- Subtle red glow pulses around the viewport edges
- The task row has a red left border + amber background tint
- The "today" label becomes "1d overdue" in red

Move it back to today's date or mark it done — all the urgency UI returns to normal.

### 9. Convert mail → task
Mail tab → tap any mail → tap **"CREATE TASK FROM THIS MAIL"**. The viewer should close, a toast says *"Task created — see Brief"*, and the new task appears in Brief Priorities with the title `Reply: <original subject>` and a "from email" badge.

### 10. AI awareness
Switch to Chat. Type *"what's on my plate?"* — Jarvis should mention your open tasks by name, since they're now in the system prompt context.

### 11. Chat-created task
Type in chat: *"I need to send the Q3 report by Friday"*. Jarvis should reply confirming and the task should appear in Brief with priority `high` and due date matching this Friday's ISO date.

### 12. Backup
Settings → Export Data. The downloaded JSON should now include a `tasks` array.

### 13. Notifications still work
Settings → "Run notification self-test" — same as Phase A. Should still report whichever capability your browser supports.

---

## What's still in place from Phase A

Nothing was removed. The four-layer notification stack, DOMPurify mail sanitization, the `decodeB64` fix, the self-test button — all still there and unchanged. Phase B builds on top.

---

## What's deliberately NOT in this drop

- **Standalone Tasks tab** — for now, tasks live in Brief only. If you want a dedicated full-screen tasks view later, we'll add it.
- **Bulk select / bulk done** — Phase C territory.
- **Recurring tasks** — not yet. If you want a daily/weekly recurring task, type it manually each time. We can add this if you find you need it.
- **Reminder time edit** — to change a task's due date or priority you currently delete and re-add. Inline edit is a small follow-up.
- **Phase D restructure** — single file still. Will revisit when feature velocity slows.

---

## Files in this drop

- `index.html` — main app, **+800 lines** vs Phase A. Adds tasks store, system prompt rewrite, Brief rebuild, TaskRow component, mail→task action, urgency-driven UI, foreground tick task handling.
- `sw.js` — **unchanged** from Phase A (still v7). Redeploy it anyway to keep cache hashes consistent.

Drop both into your repo root. Same 4-file deploy. The app's auto-update will reload the page when the new SW activates.
