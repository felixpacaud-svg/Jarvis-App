# Phase C — Task Centre · Change Notes

**Version:** `4.7.0` · **Build:** `TASK-CENTRE`

This phase delivers the standalone Tasks tab you asked for: full-screen, filterable, sortable, groupable, searchable, with bulk select and inline edit. Brain moves out of the bottom nav into a header overflow menu — Tasks earns the slot because you'll touch it 20× a day, Brain twice a week.

I also fixed a stray-syntax bug from Phase B that was harmless in production but technically wrong (two orphan characters left over from the BriefTab rewrite). Caught it during Phase C audit; cleaned up.

---

## What's new

### 1. Tasks tab (the main event)

New bottom-nav slot between Brief and Mail. The layout, top to bottom:

**Sticky controls header** (stays at the top while you scroll):
- **Stat strip** — four big tappable cards: Open · Overdue · Today · Done 7d. Each tap sets the matching filter. Overdue glows red when non-zero.
- **Filter chips** — horizontally scrollable: Open · Overdue · Today · Week · Snoozed · Done · All. Each shows its count.
- **Tools row** — search input + group-toggle button + sort menu.

**The list itself**:
- Same `TaskRow` component as the Brief, so the look is consistent.
- Long-press any row → opens an inline edit panel right in the list (no modal).
- "Bulk select mode" button below the controls — once active, tap any row to toggle selection. A bottom action bar appears with **Done · Snooze · Del** plus a × to exit. (You can also enter bulk mode by long-pressing a row while *already* in bulk mode.)
- Empty states are friendly — *"Inbox zero on this filter, sir."*

**Floating Add button** — gold circle, bottom-right. Breathes subtly. Tap → an inline create panel appears at the top with title, priority chips, due date + time pickers, "today / tomorrow / +1 week / clear time" quick buttons, and notes.

**View persistence** — your last-used filter, sort, and group setting are saved in `localStorage` under `j_tasks_view`. Return to the tab tomorrow and your view is exactly how you left it.

**Search** — debounced text match across title and notes. Tap the × to clear instantly.

**Sort options** — Urgency (smart, default), Due date, Priority, Recently added, Title A→Z.

**Group view** (toggle with the funnel button) — splits the list into headed sections: Overdue → Today → Tomorrow → This week → Later → No date. Empty groups don't render. The Overdue header glows red.

### 2. Brain moves to a "More" overflow

A new ⋯ button in the header (next to ⚙️) opens a small sheet with Brain. Same component, same behaviour, just one tap deeper. Reasoning explained in the chat: Tasks earn the bottom-nav slot because they're the daily action surface; Brain is read-mostly and fine at one extra tap.

### 3. TaskRow gained powers

The same row component you've seen in the Brief now also supports:
- **Bulk mode** — tap toggles selection instead of marking done. The check turns gold instead of green.
- **Long-press** — 500ms hold triggers the edit panel (in TasksTab) or selection (in bulk mode). The row gives visual feedback while pressing (border highlights, box-shadow blooms).
- **Snoozed indicator** — snoozed tasks now show a "snoozed" tag in the meta row.

Brief uses the row in default mode (no bulk, no long-press) so behaviour there is unchanged.

### 4. Phase B leftover cleanup

Lines 3226–3227 of Phase B's `index.html` had two orphan characters (`)` `}`) left over from when I rewrote BriefTab — they were stray module-level expression statements that JavaScript silently evaluated to `undefined`. The app still worked but the file was technically malformed. Removed.

### 5. Same notification + AI behaviour

Nothing in the notification system, AI prompt, or chat handling changed. Phase A and Phase B work as before; this is purely UI + state-management on top of them.

---

## How to test (~10 min)

After deploy:

### 1. Tab nav check
Open the app. Bottom nav should show 8 buttons: **Chat · Brief · Tasks · Mail · News · Fin · Cal · Run**. No Brain icon. Header should now have a ⋯ button next to ⚙️.

### 2. Brain still reachable
Tap ⋯. A small panel slides in from the top right with **Brain** as the only entry. Tap it — you should land on the Brain tab and the panel closes. (Tap outside the panel or hit Escape on desktop to dismiss without picking.)

### 3. Empty state
Land on Tasks tab fresh. With nothing in the list (filtered to "open"), you should see the empty illustration + *"Inbox zero on this filter"* + *"Tap + to add the first one."*

### 4. Add a task via FAB
Tap the gold floating + in the bottom-right. The inline create panel appears at the top with the title input focused. Type *"Test priorities"*, leave priority Med, hit "Add task". Toast: *"Task added"*. The task appears in the list.

### 5. Long-press to edit
Hold any task for ~500ms. You'll feel a haptic pulse, the row highlights as you press, then expands into the edit panel. Change priority to High by tapping the chip. Hit "Save changes". The chip should turn red.

### 6. Search
Type *"prio"* into the search box. Only tasks whose title or notes contain "prio" should remain. Tap the × in the search box to clear.

### 7. Filter by stat-card
Tap the **Overdue** stat card at the top. The list should filter to overdue only. The chip "Overdue" should also light up gold (the stat card and the chip are mirroring the same view state).

### 8. Group view
Add 3-4 tasks with different due dates: today, tomorrow, +3 days, no date. Tap the funnel icon. The list should rearrange into headed sections (Overdue → Today → Tomorrow → This week → No date). The funnel button itself stays gold while group view is on.

### 9. Sort menu
Tap the sort icon (three lines). A small popover appears below with five options. Pick *"Title (A→Z)"*. The list resorts alphabetically. Tap somewhere outside to dismiss the menu. Tap sort again, return to *"Urgency (smart)"*.

### 10. Bulk mode
Below the controls section, tap *"Bulk select mode"* (only shown when there are 2+ tasks). The FAB disappears. Tap two tasks — gold checkmarks appear, badges fill in. A bottom action bar slides up showing *"2 selected"* with **Done / Snooze / Del / ×** buttons.
- Tap **Done** — toast *"2 marked done"*, bulk mode exits, FAB returns.
- Repeat with two more tasks, this time tap **Snooze** — they should disappear from the open list and show *"Snoozed until tomorrow 9am"* toast.
- Repeat with **Del** — confirm in toast *"2 deleted"*.

### 11. Quick due-date buttons
Open the create panel. Click the *"Tomorrow"* quick button. The date picker should jump to tomorrow's date. Click *"+1 week"* — picker jumps a week ahead. Click *"Clear time"* — the time picker empties.

### 12. View persists across reload
Set filter to "Today", group view on, sort by Priority. Refresh the page (or close & reopen the PWA). Open Tasks tab — you should land in exactly the same view.

### 13. Brief still works the same
Switch to Brief. Tasks should still appear there, same layout as Phase B, with the same complete/snooze/delete buttons. The bottom-nav badge logic is unchanged: badge on Brief shows total attention (overdue + urgent mail), and a red badge on Tasks now shows overdue count too.

### 14. Convert mail → task still routes correctly
Open Mail tab → tap a mail → tap "Create task from this mail". The task should appear in both Brief priorities and the Tasks tab, with priority + due date based on the mail's classification.

### 15. Chat tasks still appear
Type in chat: *"remind me to renew car insurance Friday, important"*. Confirmation toast says "1 task added". Switch to Tasks tab — the new task should be there with priority Med (or High depending on AI judgment), due Friday.

---

## What I deliberately did not build

- **Drag-to-reorder.** Useful but adds noticeable complexity and most users settle for sort + filter. Defer until you say you miss it.
- **Recurring tasks.** Same reasoning. We can add an `rrule` field later.
- **Subtasks / checklists.** Out of scope for a tasks app at this size. Use notes for now.
- **Calendar integration.** Tasks with a `dueTime` already trigger the foreground reminder system from Phase B. We could extend this to write tasks into Google Calendar as 15-minute blocks if you want, but it muddles the events/tasks distinction we just established.

---

## Files

- `index.html` — main app, **~650 lines added** vs Phase B. New: `TaskEdit`, `TasksTab`, `MoreSheet` components; CSS for the entire Tasks UI; nav reshuffle; long-press support in `TaskRow`. Cleanup: removed Phase B orphan syntax.
- `sw.js` — **unchanged** from Phase A/B. Still v7.

Drop both into your repo. Same 4-file deploy as before.

---

## Where Phase D goes

Now that Tasks works as a proper management surface, the next-most-impactful work in priority order is probably:

1. **Mail upgrade** — sort, bulk archive/mark-read, markdown export, sender grouping. The next tab that becomes high-friction once Tasks is solid.
2. **Voice output** — Jarvis speaking the morning briefing aloud via Web Speech Synthesis. Closer to the Iron Man feel.
3. **Cloudflare Worker push** — the only real path to truly always-on 7am/7pm pushes.

But you tell me. Live with Phase C for a bit; what's now annoying or missing will tell us better than my guesswork.
