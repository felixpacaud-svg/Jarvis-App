# Phase F.1 — index.html patches

Five str_replace operations. Apply in order. Each `OLD` matches exactly once in current `index.html` (after Phase F was applied).

---

## Patch 1 — Version bump

### OLD
```js
const JARVIS_VERSION = '5.1.0';
const JARVIS_BUILD = 'RESPONSIVE';
```

### NEW
```js
const JARVIS_VERSION = '5.1.1';
const JARVIS_BUILD = 'RESPONSIVE';
```

---

## Patch 2 — Viewport meta · add `interactive-widget=resizes-content`

Tells modern Chrome that when the virtual keyboard appears, the layout viewport (and therefore `dvh`) should shrink to fit above the keyboard. Default browser behavior varies and was the root of why our flex layout was misbehaving.

### OLD
```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

### NEW
```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content" />
```

---

## Patch 3 — Revert `.app` height to `100dvh`

With `interactive-widget=resizes-content` (Patch 2), `dvh` now correctly tracks the visible area when the keyboard opens. Reverting from the Phase F `svh` workaround.

### OLD
```css
.app{max-width:480px;margin:0 auto;height:100svh;display:flex;flex-direction:column;position:relative;overflow:hidden;background:var(--bg);transition:filter 1s ease-out}
```

### NEW
```css
.app{max-width:480px;margin:0 auto;height:100dvh;display:flex;flex-direction:column;position:relative;overflow:hidden;background:var(--bg);transition:filter 1s ease-out}
```

---

## Patch 4 — Add visualViewport keyboard detection

Detects when the virtual keyboard opens by watching `visualViewport.height` and toggles `body.keyboard-open`. Inserted right after the existing online/offline listener inside the Jarvis component.

### OLD
```js
  useEffect(() => {
    const on = () => { setOnline(true); toast('Network online', 'gn'); };
    const off = () => { setOnline(false); toast('Network offline', 'red'); };
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
```

### NEW
```js
  useEffect(() => {
    const on = () => { setOnline(true); toast('Network online', 'gn'); };
    const off = () => { setOnline(false); toast('Network offline', 'red'); };
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Phase F.1: detect virtual keyboard open via visualViewport. Toggles
  // body.keyboard-open which (via CSS) slides the bottom nav out of the
  // way so it doesn't sandwich between the chat input and the keyboard.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    // Capture resting height; refresh during the first 3s in case the
    // URL bar transitions on initial paint.
    let baseline = vv.height;
    const settle = setInterval(() => {
      if (vv.height > baseline) baseline = vv.height;
    }, 200);
    setTimeout(() => clearInterval(settle), 3000);

    const update = () => {
      // 120px threshold — bigger than URL-bar transitions (~60-100px),
      // smaller than any virtual keyboard.
      const isOpen = (baseline - vv.height) > 120;
      document.body.classList.toggle('keyboard-open', isOpen);
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      clearInterval(settle);
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      document.body.classList.remove('keyboard-open');
    };
  }, []);
```

---

## Patch 5 — CSS · slide nav out when keyboard is open

Inserted right after the `.nb.on::after` rule that closes the nav-button styling block.

### OLD
```css
.nb.on::after{
  content:'';position:absolute;inset:0;border-radius:8px;pointer-events:none;
  background:radial-gradient(ellipse 80% 60% at 50% 100%, rgba(232,154,58,0.10), transparent);
}
```

### NEW
```css
.nb.on::after{
  content:'';position:absolute;inset:0;border-radius:8px;pointer-events:none;
  background:radial-gradient(ellipse 80% 60% at 50% 100%, rgba(232,154,58,0.10), transparent);
}

/* Phase F.1: hide bottom nav while the virtual keyboard is open.
 * Without this, the nav renders as a dark bar between the chat
 * input and the top of the keyboard. body.keyboard-open is toggled
 * by the visualViewport listener in the Jarvis component. */
.nav{transition:transform .22s cubic-bezier(.2,.7,.3,1)}
body.keyboard-open .nav{
  transform:translateY(100%);
  pointer-events:none;
}
```

---

## Done

Save the file. Drop the new sw.js (cache v9 → v10). Push.

Test: Chat tab → tap input → keyboard opens → nav should slide out cleanly, leaving the chat input directly above the keyboard with no dark strip. Dismiss keyboard → nav slides back up.

If you still see the dark bar after this, it's a different element and I need to instrument live to identify which.
