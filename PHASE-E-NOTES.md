# Phase E — Presence · Change Notes

**Version:** `5.0.0` · **Build:** `PRESENCE`

This is a full visual rebuild, not a fix-pack. Phases D and D.1 were calibration attempts; this is a commitment.

I'm calling it **Presence** because the goal is no longer "looks designed" — it's "Jarvis is actually present in the device". The single most important moment is when you open the app and *stop* for half a second before doing anything. That stop is the success metric.

---

## Why this is different from D and D.1

D and D.1 were subtle. You told me twice they didn't land. I was treating "mature design" and "calm restraint" as the goal, when the goal you actually asked for was **presence** — something that feels alive without performing, something that announces itself the moment you see it.

The mistake was timidity. v4.7 was loud and toy-like. v4.8.0 was so quiet it was invisible. v5.0 commits to a position: refined-luxury industrial, with real materials, deliberate typography, and a hero element (the reactor) that actually carries weight.

The theme picker is gone. I added it because I wasn't confident in my call, and that was the wrong reason to ship a feature. One palette, fully realized, beats three half-tuned ones.

---

## What you'll see

### 1. The reactor

The single biggest change. From a 26px decoration to a 38px multi-layer instrument:

- **Outer halo** — breathes warmly on a 4.2-second cycle, the slow-inhale-exhale of a person at rest
- **Ring 1** — gold, rotating clockwise on 6.5s. Not a solid circle but a *masked conic gradient* — light traveling around the rim
- **Ring 2** — ice cyan, counter-clockwise on 4.2s. Smaller, faster, ghostly
- **Hot core** — bright white center fading through cream → amber → bronze, with a layered shadow that makes it actually glow (not just look glowy)
- **Filaments** — six radial light streaks rotating slowly on 14s, blurred so they read as "light through fog" rather than spokes

State responses:
- **Default**: slow breath, calm rotation
- **Overdue items**: faster breath (1.6s), warmer crimson tone, faster ring rotation
- **Speaking** (when voice is reading the briefing): rapid pulse, intensified core

This is the element that makes the app feel like Jarvis is *here*. Look at it for ten seconds before you do anything.

### 2. The committed palette

**Single theme, no picker.** Three voices used distinctly:

| Voice | Color | Job | Where you'll see it |
|---|---|---|---|
| **Amber** `#e89a3a` | Action / attention | Buttons, headers, primary chrome, FAB |
| **Crimson** `#b8392c` | Warning / urgency | Overdue indicators, urgent mail, errors |
| **Ice cyan** `#5fb8d4` | DATA — every number | Time, FX rates, stock prices, percentages, timestamps |

The ice voice is what was missing. v4.8 *defined* it but never *deployed* it. Now it's everywhere numbers appear:

- Time in the header → ice
- "LIVE" indicator dot → ice
- Temperature reading → ice degree symbol
- H/L/Wind values → ice
- Stock price values → ice
- FX rates → ice
- Task due-date labels → ice
- Section counters → ice

Open the app and your eye will immediately separate "data" from "everything else" without you having to think about it.

### 3. Four-font typography

This is the silent differentiator. Most dark-mode AI dashboards use one sans serif. Yours uses four fonts, each with a job:

| Font | Job | Where |
|---|---|---|
| **Cormorant Garamond** (serif, italic) | Display / character | "Good morning, *Sir.*" greeting, tab titles, the wordmark |
| **Inter Tight** (refined sans) | Body | Task titles, mail subjects, descriptions |
| **Rajdhani** (technical caps) | HUD labels | "URGENT MAIL", "TODAY'S PRIORITIES" |
| **JetBrains Mono** | Data | Numbers, timestamps, IDs |

The greeting at the top of Brief now reads in italic serif: "Good morning, *Sir.*" — that single change is more identity than the previous five phases combined. You will know within 0.5 seconds you are not looking at the same app.

### 4. Atmospheric layer that's actually visible

Three things added together:

**Strong light pools.** Top-left gold pool, bottom-right crimson pool, faint ice pool below the fold. Opacities pushed to `0.22 / 0.16 / 0.09`. Blurred `2px`. These are *visible*, not subliminal — you can point at them.

**Caustics.** Two slow-rotating conic gradients (one anchored top-left amber, one anchored bottom-right red) blurred 28px and rotating 38s. The result reads like underwater light moving on a pool floor. Genuine "alive" without literal neurons.

**Warm noise.** SVG turbulence at 0.55 opacity in `mix-blend-mode: overlay`. Breaks up flat color so the screen feels like material rather than pixels.

When the cards have something to blur against, the glass effect actually reads as glass.

### 5. Glass cards that actually float

Three changes compounded:

- Card fill is more translucent (atmospheric light bleeds through)
- Blur is heavier (`20px` was `18px`)
- **Top-edge highlight is dramatically brighter** with its own glow — this is the "light catching the rim of glass"
- Bottom-edge has a subtle gold rim (the card's own light spilling)
- Layered shadow (12px ambient + 4px contact + a faint gold ground glow)

When you scroll, you should see the cards' edges clearly. They are not stuck to the background — they hover above it.

### 6. Boot animation upgraded

You see this 5-10 times a day. It now:

- Opens with a deep warm-charcoal radial gradient instead of pure black
- Reactor is bigger (120px) with deeper glow layers
- "Jarvis" displays in italic serif (Cormorant Garamond) with a multi-stop gold→red gradient
- Subtitle "SYSTEMS ONLINE" is now ice cyan
- Exit animation has a subtle blur on fade-out

The first 2.5 seconds of every session set the tone. They now read as "Jarvis coming online" instead of "loading screen".

### 7. Bottom nav refined

- Glass treatment with proper blur
- Active tab indicator: a bright gold strip with glow, not a thin line
- Active tab gets a soft radial uplight from below
- Top edge of nav has its own bright gold rim — reads as the bottom edge of the screen-mirror

### 8. Header is now an instrument

- Wordmark "Jarvis" in italic serif with multi-stop metal gradient (white-hot → gold → bronze → red)
- Time in the subtitle uses ice mono — separated from the date with proper visual hierarchy
- Live status dot stays in its color (red/green/amber) but pulses against an actual border

### 9. Urgency banner refined

- Glass-morphism treatment
- Top-edge highlight matching the banner's tone
- Stronger drop shadow with colored glow
- Italic body font for the message text (used to be technical caps)

### 10. Task rows refined

- Glass plates instead of flat panels
- Priority bar on the left is now a glowing gradient strip with a colored shadow, not just a border
- Due-date labels are ice cyan (data voice)
- Title font weight reduced to 500 from 600 — easier to read in volume

---

## The dot is gone (still)

You hated the rising "·" dot from D, I removed it in D.1, and it stays gone in E. Empty taps now produce a wider, slower ripple — distinct from the tighter, brighter interactive ripple. Same physics metaphor: pebble on stone vs. pebble in pond.

---

## What I'm explicitly NOT doing

- **No theme picker.** One palette, committed.
- **No animated page transitions.** They look impressive once, cost 200-400ms of perceived latency every tab switch. The cost outweighs the polish.
- **No sound design.** Slippery slope to "annoying app". Silent commitment.
- **No "neurons firing" particles.** The atmospheric layer + caustics + breathing reactor delivers "alive" without distraction.

---

## How to test

### 1. The first-impression test
Open the app fresh. Land on Brief. **Do not interact.** Look for ten seconds.

You should see:
- The reactor in the header genuinely *glowing*, not just "looking glowy" — multiple light layers, ring rotation visible
- The "Good morning, *Sir.*" greeting in italic serif — instantly different from any previous version
- Light pools in the background that you can actually see (top-left gold, bottom-right red)
- Cards that visibly hover above the background — you should see their top edges catching light

If any of these don't read, that's diagnostic information.

### 2. The data-voice test
Look at the Brief and find:
- The time in the header → should be **ice cyan**, monospace
- The temperature degree symbol → should be ice cyan
- "H 12° L 5° Wind 8 km/h" → values in ice cyan
- The FX rate values (1.0742, etc.) → ice cyan
- Stock price values → ice cyan
- Task due labels (today, tomorrow, 3d) → ice cyan

If you see gold where I described ice, that's a real bug — tell me.

### 3. The reactor-state test
Add an overdue task (or use DevTools to back-date one):
```js
const t = JSON.parse(localStorage.getItem('j_tasks'));
t[0].due = '2025-01-01';
localStorage.setItem('j_tasks', JSON.stringify(t));
location.reload();
```
The reactor should:
- Breathe faster (1.6s vs 4.2s default)
- Shift to a redder, more orange tone in the core
- Have a more aggressive halo

Mark it done — the reactor should slow back to its calm breath within a few seconds.

### 4. The font test
Open Brief. The greeting "*Good morning, Sir.*" — the "Sir" should be in italic serif, gold, with proper character. If it looks like the same Rajdhani-uppercase from before, the new font hasn't loaded.

### 5. Voice still works
Settings → Voice → Test. Should fire `"Online, sir. Voice systems nominal."` — voice output system from D.0 still functions.

### 6. Phase A/B/C regression
- Notifications self-test still works
- Tasks tab filters / sort / group / search / bulk all work
- Mail → Convert to task still works
- Quick capture in Brief still works
- Brain still accessible via the overflow ⋯ menu
- Bottom-nav badge still shows on Brief and Tasks

---

## Files

- `index.html` — main app, **5,656 lines** (+200 vs Phase D.1). The reactor rebuild is the largest single piece of new CSS. Theme picker fully removed (~100 lines reclaimed, then rebuilt elsewhere).
- `sw.js` — **unchanged**. Still v7. Drop it anyway to refresh cache hash and force the SW to cycle.

Drop both. Same 4-file deploy.

---

## What I want from you

After deploying:

1. **Tell me the first thing you noticed.** That's the most useful single piece of feedback. If you can't pinpoint anything, the rebuild didn't land and we need to talk about why.

2. **Tell me what looks wrong.** Inevitably some things will. Inline color values, spacing oddities, contrast issues at certain sun angles. I'd rather you list them than I guess.

3. **Tell me what's missing presence.** Some screens may still feel like the old visual layer because I focused effort on Brief, the header, and the nav. If Mail or Calendar or Settings feel like they belong to v4.8, say so — those are next.

I'm not asking you to be excited. I'm asking you to tell me whether this version *announces itself*. If it doesn't, we go again.
