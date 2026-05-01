# Phase F.1 — Responsive · Fix-Pack Notes

**Version:** `5.1.1` · **Build:** `RESPONSIVE` (Phase F.1 fix-pack)

Targeted fix for the residual dark-bar-after-keyboard-opens bug Felix reported after Phase F deployed.

---

## What was wrong

Phase F removed the auto-focus on chat tab mount, which fixed the "going to chat shifts everything up" symptom. But manually tapping the input still produced a dark bar at the bottom of the screen above the keyboard.

**The dark bar was the bottom navigation.** With the Phase F `100svh` workaround, the layout didn't resize when the keyboard opened — but the nav element was still rendered in the flex column, getting visually squeezed into the gap between the chat input and the top of the keyboard.

---

## What changed

### 1. `interactive-widget=resizes-content` viewport hint

Tells modern Chrome that when the virtual keyboard opens, the layout viewport should shrink to fit above the keyboard. With this, `dvh` units track correctly and flex layouts reflow naturally.

### 2. `.app` height reverted to `100dvh`

Now that `interactive-widget=resizes-content` is set, `dvh` does the right thing on its own. The Phase F `svh` workaround is no longer needed.

### 3. visualViewport keyboard-open detector

A new `useEffect` in the Jarvis component watches `visualViewport.height` and toggles `body.keyboard-open` when the height drops by more than 120px from baseline (which excludes URL-bar transitions but catches every virtual keyboard).

### 4. CSS · nav slides out while keyboard is open

`body.keyboard-open .nav { transform: translateY(100%) }`. Smooth 220ms transition. When you dismiss the keyboard, nav slides back up.

---

## Test

1. Apply the 5 patches, drop the new sw.js (cache v10), push.
2. PWA auto-updates. Header should read `v5.1.1`.
3. Chat tab → tap the message input.
4. Keyboard opens. The bottom nav should **slide down out of view** as the keyboard rises.
5. The chat input should sit directly above the keyboard. No dark bar between them.
6. Dismiss the keyboard (tap outside, or back button). Nav slides back up.
7. Try the same in Brief tab quick-capture: tapping the qc input should also hide the nav while typing.

---

## If it still doesn't work

Two scenarios:

**A. Dark bar still visible exactly as before.** Means `body.keyboard-open` isn't being set. Possible causes: visualViewport not supported on Felix's specific Chrome build (very unlikely on a recent S21), or the threshold is wrong. If you can open Chrome DevTools while connected to the device (chrome://inspect on desktop), we can confirm with `document.body.classList.contains('keyboard-open')` while keyboard is open.

**B. Different bar / different bug.** Tell me what color, what height, and which tab. The fix would be different.

In either case, the fix is small once the cause is confirmed. Don't suffer through it — flag immediately.

---

## After this is verified

Phase G is locked. Once you confirm F.1 works:

1. **Cloudflare Worker backend** for always-on push notifications
2. **Capacitor Android wrap** + Play Store internal testing track
3. **iOS PWA verification** for Mélanie
4. **GitHub repo public** + README (portfolio piece, optional Sponsors button)

~1.5-2 weeks of focused work. All free infrastructure.
