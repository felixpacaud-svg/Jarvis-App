# Phase D — Atelier · Change Notes

**Version:** `4.8.0` · **Build:** `ATELIER`

This phase is a visual reset. The functionality from Phases A–C is unchanged; what changes is how it *feels* — the surface treatment, the colors, the way the app responds to your touch, and the way it lives in the background.

I'm calling it **Atelier** because the design language shifted from "tech demo" toward "instrument" — something you'd find on a Tony Stark workbench, not in a Counter-Strike menu.

---

## What changed and why

### 1. New palette — three voices instead of two

The old `#e63946` red + `#ffb400` gold were reading as 2010-era "tech UI" because both colors were fully saturated. Real Iron Man / mature dark-mode design lives at lower saturation. The new palette:

| Role | Old | New | Job |
|---|---|---|---|
| Action / attention | `#ffb400` | `#d9a441` (warm brass) | Buttons, headers, primary chrome |
| Warning / urgency | `#e63946` | `#c84a3a` (rust amber) | Overdue, errors, urgent mail |
| Data / readouts | (none) | `#7ad9ff` (ice blue) | FX rates, percentages, timestamps |
| Background base | `#0a0507` | `#0c0a0a` (warm charcoal) | App canvas |

Critically: **same variable names, new values**. So `--gold` still exists but it's now brass, not Crayola yellow. Every component using `var(--gold)` automatically inherits the refined tone. I also did a sweep of inline-styled hardcoded `rgba(255,180,0,…)` etc. and migrated 64 occurrences to the new color stops, so there's no clash.

The ice blue isn't used everywhere — it's reserved for live numerical data (already wired into a few spots; will spread into FinTab and elsewhere over time).

### 2. Atmospheric background

Replaced the old grid + top-radial-glow with two new layers:

- **Drifting light spots** — three soft, heavily-blurred radial gradients (one warm gold, one rust, one ice blue) that slowly migrate around the screen on a 28-second loop. Easier seen by feel than by looking.
- **Warm noise/grain** — an SVG turbulence filter overlaid at 50% opacity in `mix-blend-mode: overlay`. Breaks up flat color so the screen reads as material, not pixels.

Together, they make the background feel like a deep, lit space rather than a flat black canvas. You won't notice it consciously, but if you turn it off you'll notice the difference.

### 3. Glass-morphism cards

Every `.hud` card (which is most of the cards in the app) now uses:

- Translucent warm-tinted fill (`rgba(33,25,18,0.55)`)
- `backdrop-filter: blur(14px) saturate(1.05)` to frost what's behind
- A 1px inner highlight at the top of the card (the "edge of the glass")
- A soft drop-shadow for depth
- A near-invisible border (gone are the loud gold outlines)

The card top still gets a subtle gradient line, but it's now centered and indented from the edges, so it reads as light reflecting off the top of the glass rather than a UI border.

### 4. Tap acknowledgement — the crosshair is dead

The four-tick crosshair is gone. In its place, a two-layer system:

**On interactive elements** (buttons, cards, tabs, task rows):
- A soft warm-gold ripple radiates outward from your finger (~500ms).
- The element itself gets its existing press response (scale, color shift).
- That's it. The interaction reads cleaner because there's only one visual event, not two.

**On empty space** (any tap that hits nothing actionable):
- A *dimmer* warm-gold ripple still appears — so you know the system received your touch.
- A small `·` dot appears at the tap point and rises 12px while fading out (~700ms).
- A tiny haptic tick fires (`navigator.vibrate(8)`).

Together: you always feel *acknowledged* even when nothing happens. No silent ignored taps; no sense of "did this register?" The empty-tap behavior is what you specifically asked for.

### 5. Ambient warmth shift on overdue

When `j_tasks` contains overdue items, the entire app gets `filter: hue-rotate(-3deg) saturate(1.08) brightness(0.96)` applied at the app shell level. The effect is *very* subtle — you won't notice it as a single change, but the room feels imperceptibly warmer, slightly dimmer, slightly more saturated. Like dusk. When you mark everything done the filter releases and the room "lifts" again.

Combined with the existing red edge-vignette pulse from Phase B, overdue state now reads emotionally before it reads as a number.

### 6. Softer ambient motion

The Phase C "neuron pulse" — random cards briefly glowing gold — was good in concept but too aggressive in timing (every 3-6s). Renamed `breathe-now`, retuned to 5-9s intervals, and the animation is now a slower 1.8s warm inhale rather than a 1.1s hard glow. Reads as ambient breathing rather than firing neurons.

The corner brackets dropped from 1.5px to 1px borders and from 55% to 40% opacity. They're still there but they don't demand the eye anymore.

The scan sweep lines slowed from 11s/14s to 14s/18s and dropped opacity. They're now atmosphere, not animation.

The device-tilt parallax got its magnitude cut in half. Still adds depth, but doesn't shake the whole UI when you breathe on the phone.

### 7. Voice output

Jarvis now speaks the morning briefing, evening summary, and overdue digest aloud — *if you turn it on* (Settings → Voice). Off by default.

The voice picker tries hard to find a British male voice (preferred order: en-GB male → en-GB any → en male → en any → first available). Speech rate slightly slow, pitch slightly low, volume capped at 0.7 so it doesn't dominate ambient audio.

There's a Test button next to the toggle — fires *"Online, sir. Voice systems nominal."* immediately so you can hear which voice your device gives you.

iOS Safari note: speech requires a user gesture before the first `speak()` will produce sound. The first time you tap *anywhere* in the app, voice gets primed silently. So the first morning briefing will work as long as you've opened the app at least once that day.

---

## Things that were considered but cut

- **Animated page transitions** — would have added 200-400ms of perceived latency to every tab switch. Ratio of effort to value was wrong. Kept the existing fast crossfade.
- **Sound design (UI clicks, swooshes)** — slippery slope to "annoying app". If you decide you want it later, it's a small addition.
- **Visible "neurons firing" particle system** — looks great in screenshots, distracting in daily use. The new atmospheric layer + breathe + scan-sweeps deliver the same "alive" feeling without competing for attention.

---

## How to test (5 min)

After deploy:

### 1. The first impression test
Open the app. Land on Brief. Look — without doing anything — for 10 seconds.
- The background should feel *deep* rather than flat black.
- You should see the soft drifting light spots if you stare. (If you don't, the atmospheric layer probably isn't rendering — let me know.)
- The cards should look like frosted glass panels, not flat rectangles with borders.
- The corner brackets should be present but quiet.

### 2. The tap test
- Tap a button. **Soft warm-gold ripple radiates outward, no crosshair.** ✓
- Tap empty space (e.g. the gap between cards). **Dimmer ripple + small `·` dot rises and fades + tiny haptic tick.** ✓
- The empty-tap feedback should feel like the system *acknowledged you but had nothing to do*, not like nothing happened.

### 3. The color test
The whole UI should feel like *warm metals*, not Crayola. If anything still looks too red or too yellow-gold, tell me which element — I may have missed an inline style.

### 4. The overdue test
With at least one overdue task, the app should feel *imperceptibly* warmer. Mark it done — the room should "lift" slightly. The change is subtle by design; if it's too subtle let me know and I'll make it more pronounced.

### 5. The voice test
Settings → scroll to Voice → toggle on → hit Test. Should hear *"Online, sir. Voice systems nominal."* in a British male voice if available. If it's a robotic American female, your device just doesn't have UK voices installed (Android: Settings → Language → Text-to-speech → Install more voices). The app does the best it can with what's available.

Now mark something overdue and wait until 9am tomorrow. The overdue digest should fire visually + speak aloud (if voice is on).

### 6. The Phase A/B/C regression test
Everything from Phases A–C should still work identically:
- Notifications self-test still works (Settings → Notifications → Run self-test)
- Tasks tab filters/sort/group/search/bulk all work
- Mail → Convert to task still works
- Quick capture in Brief still works
- Bottom-nav badge still shows on Brief and Tasks

If anything regressed, tell me what.

---

## What's likely to feel "off" the first day

Honest preview: the new palette is going to feel **less exciting** than the old one for the first few hours. The old gold/red was Vegas-bright; the new brass/rust is mature. Your eyes will adjust within a day, and going back will feel cartoonish — but the first impression is "this is more subtle than I remember it."

This is the trade-off you accepted with "Open to a more radical change". The app is now meant to be lived in, not gawked at.

---

## Files

- `index.html` — main app, **+220 lines** vs Phase C. Two big additions: the rewritten interaction layer (ripple + ack + breathe replacing crosshair + pulse), and the voice output system. CSS palette tokens completely rewritten; 64 inline style colors migrated.
- `sw.js` — **unchanged** from Phase A. Still v7.

Drop both into your repo. Same 4-file deploy.

---

## Phase E candidates

Live with this for a few days before deciding. The visual reset is the kind of thing that needs daylight, dim morning light, and 7pm darkness to evaluate fairly. A few directions ready when you want them:

1. **Mail upgrade** — sort by sender/priority, bulk archive, markdown export. Promised in Phase B but never built.
2. **Cloudflare Worker push** — real always-on briefings, free, ~30 min setup.
3. **Recurring tasks** — `rrule` field on tasks for daily/weekly recurrence.
4. **Voice input** — speak a quick-capture into the Brief tab.
5. **Custom theme picker** — lets you toggle between Atelier (current), Mark III (more saturated for those who want it back), and JARVIS Classic (cyan).

Tell me what's still annoying after a week of Atelier.
