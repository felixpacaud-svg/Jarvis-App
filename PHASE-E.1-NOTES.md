# Phase E.1 — Presence · Cache Bump + Ripple Fix

**Version:** `5.0.1` · **Build:** `PRESENCE` (Phase E.1 fix-pack)

This is a fix-pack, not a new phase. Two real bugs from Phase E:

1. **Phase E never visually landed** because I claimed in the notes that "dropping sw.js anyway" would refresh the cache. It wouldn't — I didn't bump the cache version. Your PWA kept serving the cached Phase D.1 shell. The Phase E reactor, ice-cyan numbers, italic serif greeting, glass cards — all in the file, none on screen.
2. **The "ripple" still looked like a crossbow scope.** I moved the design from "rising dot" (Phase D) to "tight bright ripple" (D.1/E) and called the problem solved. Felix told me twice it didn't read as a ripple, and I kept renaming geometry instead of fixing it. The gradient was bright at 0% and faded to transparent at 65% — that's a scope reticle by definition. I should have inverted the gradient the first time.

---

## What changed

### 1. SW cache bumped v7 → v8

`sw.js` line 26: `const CACHE = 'jarvis-v7'` → `'jarvis-v8'`. The activate handler already deletes any cache that doesn't match `CACHE`, so changing the constant is the *only* thing required to invalidate the old shell. On your next PWA launch, the new SW installs, activates, deletes `jarvis-v7`, and refetches `index.html` from origin.

The auto-update logic in `Jarvis()` already handles the reload — you'll see the *"Jarvis updated — reloading"* toast.

### 2. Ripple geometry inverted (the real fix)

The radial gradient stops are now:

```
transparent 0%
transparent 38%
bright color 50%        ← bright RING at the 50% mark
dim color 62%
transparent 78%
```

When the ripple element grows from 0×0 to 240×240 over 550ms, the bright stop's pixel radius grows from 0 to ~120px. The bright stop is *a ring expanding outward*, not a hot center fading. That is the actual geometry of a water ripple.

Empty taps use the same pattern, slower and dimmer (320px max diameter, 900ms duration).

`mix-blend-mode: screen` added so the ring pops on dark backgrounds without looking like a flat overlay.

### 3. Element-anchored `.rip::after` killed

The Phase D ripple system also drew a *second* radial gradient inside the tapped element, centered at the click point (`var(--x, --y)`). Two hot-center gradients overlapping — that's what made it read as "target acquired" so strongly.

Gated with `display:none`. The JS that adds the `rip` class on tap is untouched (it's harmless now). Two-layer feedback going forward: viewport-level water ripple + the element's own `:active` styling. Clean.

### 4. Version string bumped 5.0.0 → 5.0.1

So you can confirm at a glance that the new shell is running. Header subtitle on every screen reads `v5.0.1` once cache cycles.

---

## What did NOT change

- React component tree
- Tasks, mail, brief, calendar, marathon — all data behaviour identical
- Notification stack — identical
- The reactor (multi-layer build), italic serif greeting, ice-cyan data voice, glass cards — all already in the file from Phase E. The cache bump just lets you actually see them.

If after deploying this fix-pack you *still* don't see a multi-layer reactor / italic serif greeting / ice cyan numbers / floating glass cards, that's a separate problem and I need to dig into individual rules.

---

## How to test

### 1. Confirm the cache cycled

Open the PWA. Header subtitle should read `v5.0.1`. If you see `v4.8.x` or `v5.0.0`, the SW didn't update. Force the cycle: long-press app icon → App info → Storage → Clear cache, reopen. (Or in Chrome desktop: DevTools → Application → Service Workers → Unregister, then Application → Clear storage → Clear site data.)

### 2. Confirm Phase E actually landed (the four things you said weren't visible)

These should now all be obvious within ten seconds of looking at Brief:

- **Reactor** in the header is ~38px (was 26px). You should see *two rings* — gold rotating clockwise, ice cyan rotating counter-clockwise, plus a bright hot core and faint radial filaments. Not a single glow dot.
- **Greeting** at top of Brief reads "Good morning, *Sir.*" with "Sir" in italic serif (Cormorant Garamond), 34px. Visibly different typography from the rest of the app.
- **Cards** (weather, schedule, FX) have a visible bright top edge — the "glass catching light" rim. Compare any card edge to the background; you should see a clear tonal break.
- **Numbers** are ice cyan: time in header, FX rates, FX update timestamp, task due labels (today/tomorrow/3d), event times in Brief.

If even one of these four still doesn't read after cache is confirmed cycled (`v5.0.1` showing), tell me which one. That's a real code bug and I'll patch it directly.

### 3. The ripple test (the crossbow-aim fix)

- Tap a button → you should see a bright **ring** expanding outward from the tap point. The center stays transparent. ~240px max diameter, ~550ms.
- Tap empty space (between cards) → same shape, larger and dimmer, slower (~320px, 900ms).
- The geometry should read as "drop on water" — the energy travels *outward*, the impact point is empty. NOT "scope locks on target".

If it still looks like a target reticle: tell me. Either the patch didn't apply or the gradient still isn't right and I'll re-tune the stops.

### 4. Regression check (5 sec)

- Tap a task: completes. ✓
- Long-press a task: opens edit panel. ✓
- Switch tabs: nav badge still updates, no errors.

---

## Files

- `sw.js` — cache constant `v7 → v8`. Comment header updated. Otherwise byte-for-byte identical to the v7 original.
- `index.html` — three str_replace patches (see `PHASE-E.1-PATCHES.md` in this drop).

Drop both. Phase E.1 ships as `v5.0.1 / PRESENCE`.

---

## Lesson logged

For Phase D and Phase E both: I treated "rename the effect" as equivalent to "fix the design". When you said the dot felt like a target, I made the dot a ripple but kept the bright-center geometry. When you said it still felt like an aim, I made the ripple "wider and softer" but kept the bright-center geometry. Three iterations in, the shape was still scope-shaped and that was the actual problem the whole time. Inverting the gradient the first time would have saved two phases of churn.

Cache invalidation: I owned the rule that re-uploading sw.js without changing it doesn't cycle. The Phase E note instructed dropping the same file as if that did something. It didn't. Adding cache-version-bump to the Phase ship checklist going forward.
