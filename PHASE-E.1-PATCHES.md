# Phase E.1 — index.html patches

Two str_replace operations. Open `index.html` in your editor, find each `OLD` block exactly, replace with the corresponding `NEW` block. Both blocks live in the giant CSS template literal near the bottom. They appear exactly once each.

---

## Patch 1 — Fix the ripple geometry (the crossbow-aim fix)

The gradient stops are inverted: bright at 50% mark, transparent at center. As the element grows from 0×0 to 240×240, the bright stop's pixel-radius grows with it — so a *ring* expands outward from the tap point. No more hot-center reticle.

Also added `mix-blend-mode:screen` so the ring pops on dark backgrounds without looking like an overlay.

### OLD (find this block exactly)

```css
.d-ripple{position:fixed;width:0;height:0;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);border-radius:50%}
.d-ripple-hit{
  background:radial-gradient(circle,rgba(var(--atm1),0.65) 0%,rgba(var(--atm1),0.28) 25%,transparent 65%);
  animation:dRippleHit .50s cubic-bezier(.2,.8,.3,1) forwards;
}
.d-ripple-miss{
  background:radial-gradient(circle,rgba(var(--atm1),0.32) 0%,rgba(var(--atm1),0.10) 30%,transparent 70%);
  animation:dRippleMiss .85s cubic-bezier(.2,.6,.3,1) forwards;
}
@keyframes dRippleHit{0%{width:0;height:0;opacity:1}100%{width:220px;height:220px;opacity:0}}
@keyframes dRippleMiss{
  0%{width:0;height:0;opacity:0.9}
  60%{opacity:0.6}
  100%{width:280px;height:280px;opacity:0}
}
```

### NEW (replace with)

```css
.d-ripple{position:fixed;width:0;height:0;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);border-radius:50%;mix-blend-mode:screen}
/* Phase E.1: TRUE water ripple — hollow center, bright leading edge that
 * travels outward. The bright color stops sit at the 50–62% gradient marks,
 * so as the div width grows from 0 to 240px, the bright ring's pixel
 * radius grows with it. This is the geometric inverse of v5.0's gradient
 * (hot center fading out = scope reticle). Tested against "looks like a
 * crossbow aim" — fixed. */
.d-ripple-hit{
  background:radial-gradient(circle,
    transparent 0%,
    transparent 38%,
    rgba(var(--atm1),0.55) 50%,
    rgba(var(--atm1),0.20) 62%,
    transparent 78%);
  animation:dRippleHit .55s cubic-bezier(.2,.7,.3,1) forwards;
}
.d-ripple-miss{
  background:radial-gradient(circle,
    transparent 0%,
    transparent 40%,
    rgba(var(--atm1),0.32) 50%,
    rgba(var(--atm1),0.13) 60%,
    transparent 75%);
  animation:dRippleMiss .9s cubic-bezier(.2,.6,.3,1) forwards;
}
@keyframes dRippleHit{
  0%{width:0;height:0;opacity:0}
  18%{opacity:1}
  100%{width:240px;height:240px;opacity:0}
}
@keyframes dRippleMiss{
  0%{width:0;height:0;opacity:0}
  20%{opacity:0.85}
  100%{width:320px;height:320px;opacity:0}
}
```

---

## Patch 2 — Gate the element-anchored ripple

The `.rip::after` block was a *second* hot-center radial gradient drawn inside the tapped element, peaking at the click coordinates. Two scope reticles overlapping. The viewport-level water ripple from Patch 1 already shows where you tapped; the button's own `:active` styling confirms the action. We don't need a third layer.

I'm gating with `display:none` rather than removing the rule — keeps the JS untouched (still adds the `rip` class, harmlessly), keeps the diff small.

### OLD (find this block exactly)

```css
.rip::after{
  content:'';position:absolute;inset:0;
  background:radial-gradient(circle at var(--x,50%) var(--y,50%),rgba(var(--atm1),0.20) 0%,transparent 50%);
  border-radius:inherit;pointer-events:none;
  animation:elemRip .45s ease-out forwards;
}
@keyframes elemRip{0%{opacity:0}30%{opacity:1}100%{opacity:0}}
```

### NEW (replace with)

```css
/* Phase E.1: element-anchored ripple removed. The viewport-level water
 * ripple already marks the tap point; doubling it inside the element
 * produced a second hot-center gradient that read as a scope reticle. */
.rip::after{display:none}
@keyframes elemRip{0%{opacity:0}100%{opacity:0}}
```

---

## Patch 3 — Bump the in-app version string

Already at `5.0.0`. Bump to `5.0.1` so you can confirm at a glance that the Phase E.1 build is what's actually running (the header subtitle shows `v5.0.1` once cache cycles).

### OLD

```js
const JARVIS_VERSION = '5.0.0';
const JARVIS_BUILD = 'PRESENCE';
```

### NEW

```js
const JARVIS_VERSION = '5.0.1';
const JARVIS_BUILD = 'PRESENCE';
```

---

## After patching

1. Commit + push both files (`index.html` + `sw.js`) to your repo.
2. GitHub Pages takes ~30–60s to redeploy.
3. Open the PWA. The first launch after redeploy will fire the auto-update toast (`Jarvis updated — reloading`) — this is the new SW activating, deleting the jarvis-v7 cache, and pulling the Phase E shell fresh.
4. After reload, header subtitle should read `v5.0.1`. If it still reads `v4.8.x` → the SW didn't cycle; force-clear PWA storage (long-press app icon → App info → Storage → Clear cache) and reopen.
