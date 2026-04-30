# Phase D.1 — Atelier+ · Change Notes

**Version:** `4.8.1` · **Build:** `ATELIER+`

A targeted fix-pack responding to your three observations on Phase D:

> 1. The aim/dot in the middle of the click looks bad
> 2. Color change isn't visible enough — almost no blue
> 3. Cards still look flat, expected something more floating

Each got a real fix. Plus a theme picker so you can A/B/C the look on your actual device with your actual content, instead of relying on my taste.

---

## What changed

### 1. The dot is gone

The `·` rising up on empty taps is removed entirely. You read it as a target reticle, not as acknowledgement — fair point. In its place, the **empty-tap ripple is now bigger, slower, and visibly different from the interactive ripple**:

- **Tap a button**: tight bright ripple, ~220px, ~500ms — confirms action
- **Tap empty space**: wider softer ripple, ~280px, ~850ms — confirms presence

Same physics metaphor, no target. Pebble on stone (sharp, immediate splash) vs. pebble in still water (wider, slower spread). Both ripples, two characters.

The haptic stays — `navigator.vibrate(6)` on empty taps.

### 2. Three themes you can swap instantly

Settings → top of panel → **Theme** picker. Three swatches:

- **Atelier** (default, current) — refined gold/red/ice. Calm, mature.
- **Mark III** — burnt amber `#e89a3a` + deep crimson `#a8312a` + cyan `#5fb8d4`. Cinematic Iron Man helmet. More saturated, more presence.
- **JARVIS Classic** — cyan `#3fbcd4` + steel-blue + amber accents. The original films Jarvis. Cooler, more "AI butler".

Each swatch shows the three primary colors as illuminated dots so you can preview before picking. Tap one — the entire app re-themes instantly with an 800ms cross-fade. Saved to localStorage; survives reload.

The picker swatches always show their theme's true colors regardless of which theme you're currently viewing — so you always know what you're switching to.

**Why this approach over me picking blindly:** colors look very different on different screens (Samsung AMOLED reads warmer than my screen, ambient light changes everything). You'll know within 30 seconds of switching which one is right *for your eyes, on your device, in your environment*.

### 3. Cards now actually float

Three changes added together:

**A. Brighter atmospheric layer.** The previous `0.08`/`0.06`/`0.025` opacities were below perceptual threshold on most screens — the backdrop-filter on cards had nothing to chew on. Bumped to themed values that range from `0.14` (Atelier) up to `0.18` (Mark III). The light spots are now visible if you stare at the background; more importantly, they're *visible enough that the cards' frosted-glass effect actually reads as glass*.

**B. Heavier blur on cards.** Was `14px`, now `18px`. With brighter background and stronger blur, you see the spread halo around the card edges — that's what makes glass read as glass.

**C. More aggressive shadow + rim.** Cards now have:
- A bright top-edge highlight line (the "glass edge catching light")
- A subtle bottom-edge gold/cyan rim
- A 2-stop drop shadow (12px ambient + 4px contact) instead of a single soft shadow
- Less translucent fill so atmospheric light bleeds through

Together: cards visibly hover above the background. Should look like floating panels rather than rectangles glued onto a wall.

### 4. Color tokens propagated everywhere

Phase D had ice blue defined but never wired into actual UI. The `--atm1`, `--atm2`, `--atm3` color triplets in CSS now flow through to:

- The atmospheric background (different theme = different ambient light)
- The card top-edge rim (different theme = different glass-edge color)
- Both ripple types (different theme = different ripple color)
- Ambient breathe pulses (cards glow in the theme's primary color)

Switching theme shouldn't just change a few accent colors — it should re-light the whole room. Now it does.

### 5. Bonus: theme even works on first paint

The theme is read from localStorage and applied to `<body>` *before* React mounts. So you don't see a flash of Atelier when the app boots into Mark III — first paint is already correct.

---

## What's in the box

- `index.html` — main app, **+200 lines** vs Phase D. Two new theme classes (`body.theme-mark3`, `body.theme-jarvis`), the `ThemePicker` component, the rewritten ripple system, brighter atmosphere, beefier cards. Plus all 64 existing color references continue to use CSS variables, so they automatically follow whichever theme is active.
- `sw.js` — **unchanged**. Still v7. Drop it anyway to refresh cache hash.

Drop both into your repo. The auto-update logic from Phase A reloads the page when the new SW takes over.

---

## How to test (5 min)

### 1. The ripple test
- Tap a button → small bright ripple ✓
- Tap empty space (e.g. the gap between two cards on Brief) → larger, softer, slower ripple, no dot ✓
- Should feel like two different surfaces — solid vs. liquid. Empty tap reads as "the surface noticed" not "I missed".

### 2. The theme test
- Settings → scroll to Theme (top of panel)
- Tap **Mark III** → entire UI shifts to amber/crimson/cyan, atmosphere visibly warmer
- Tap **JARVIS Classic** → entire UI shifts to cyan/steel-blue with amber accents
- Tap **Atelier** → back to refined gold/rust
- Each switch should be smooth (~800ms cross-fade) with no flash, no broken elements
- Live with each one for **at least 5 minutes** before deciding. The first impression of a new color scheme always lies — it takes a few minutes for the eye to settle.

### 3. The "cards floating" test
- Look at the Brief tab. The cards (weather, schedule, markets, FX) should feel like they're slightly *above* the background, with visible warm light bleeding around them.
- If they still look flat, try Mark III theme — its higher atmospheric opacity makes the float more obvious.
- Compare any card edge to the background — you should see a slight tonal break.

### 4. Regression test
- Notifications self-test still works (Settings → Notifications → Test)
- Voice toggle still works (Settings → Voice → Test)
- Tasks tab filters/sort still work
- Mail viewer still works
- Quick capture in Brief still works

---

## What I'm not yet doing (and why)

- **More theme options** (monochrome, deep blue, white-on-black). You haven't asked for them, and adding more options dilutes the picker. If after a week none of these three feel right, I'll add candidates.
- **Per-section theme** (e.g. blue for data tabs, gold for action tabs). Coherence beats variety; one theme app-wide reads more designed.
- **Dark/light mode**. The app is committed to dark; light would need a different design language entirely.

---

## Honest expectations

The two things you said weren't visible enough — color change and card floating — should now be obvious. If they still aren't, the issue is likely caching: force-quit the PWA, reopen, confirm the header reads `v4.8.1`. If it does and they still look the same, that's diagnostic information I need.

The dot fix is the simplest of the three. You should see it (well, *not* see it) immediately.

---

## After you've tried each theme

When you have a verdict, tell me which one you picked and I'll lock it in as the default for the next phase. If "all three feel like compromises", say so — I'll propose more candidates or design a fourth.
