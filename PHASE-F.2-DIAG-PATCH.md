# Phase F.2-DIAG — diagnostic build

Two failed keyboard fixes. Stop guessing, start measuring.

This adds a small on-screen readout (top-right corner, faint) that shows live:
- `vv.h` — visualViewport height
- `inn.h` — innerHeight
- `doc.scrollY` — page scroll position
- `app.scrollTop` — .app element scroll position
- `kb` — whether `body.keyboard-open` is set
- `focus` — currently focused element tag

You reproduce the bug, screenshot the readout, send it to me. Then I know exactly what's happening on your S21 and can fix it in one shot.

ONE patch. Inserted right after the existing keyboard-detection useEffect (the one we just built in F.2).

---

## Patch — Add diagnostic readout

### OLD
```js
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const setOpen = (v) => document.body.classList.toggle('keyboard-open', v);
    const isInputEl = (el) => {
      if (!el) return false;
      const t = el.tagName;
      return t === 'INPUT' || t === 'TEXTAREA' || el.isContentEditable;
    };
    const onFocusIn = (e) => { if (isInputEl(e.target)) setOpen(true); };
    const onFocusOut = () => {
      // Defer so document.activeElement updates after focus moves
      setTimeout(() => {
        if (!isInputEl(document.activeElement)) setOpen(false);
      }, 50);
    };
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    // Safety: if no input is focused but the class lingered, drop it.
    // Catches Chrome's back-button-dismisses-keyboard-without-blur quirk.
    const safety = setInterval(() => {
      if (!isInputEl(document.activeElement) &&
          document.body.classList.contains('keyboard-open')) {
        setOpen(false);
      }
    }, 1000);
    // Tab visibility change → also a clean place to reset
    const onVis = () => { if (document.hidden) setOpen(false); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('visibilitychange', onVis);
      clearInterval(safety);
      document.body.classList.remove('keyboard-open');
    };
  }, []);
```

### NEW
```js
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const setOpen = (v) => document.body.classList.toggle('keyboard-open', v);
    const isInputEl = (el) => {
      if (!el) return false;
      const t = el.tagName;
      return t === 'INPUT' || t === 'TEXTAREA' || el.isContentEditable;
    };
    const onFocusIn = (e) => { if (isInputEl(e.target)) setOpen(true); };
    const onFocusOut = () => {
      // Defer so document.activeElement updates after focus moves
      setTimeout(() => {
        if (!isInputEl(document.activeElement)) setOpen(false);
      }, 50);
    };
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    // Safety: if no input is focused but the class lingered, drop it.
    // Catches Chrome's back-button-dismisses-keyboard-without-blur quirk.
    const safety = setInterval(() => {
      if (!isInputEl(document.activeElement) &&
          document.body.classList.contains('keyboard-open')) {
        setOpen(false);
      }
    }, 1000);
    // Tab visibility change → also a clean place to reset
    const onVis = () => { if (document.hidden) setOpen(false); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('visibilitychange', onVis);
      clearInterval(safety);
      document.body.classList.remove('keyboard-open');
    };
  }, []);

  // ───────────────────────────────────────────────────────────────
  // PHASE F.2-DIAG · keyboard bug instrumentation. REMOVE AFTER FIX.
  // Mounts a tiny live readout in the top-right corner showing the
  // values of every variable relevant to the bug. Felix reproduces the
  // bug, screenshots, sends me the values. Then I patch in one shot.
  // ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const dbg = document.createElement('div');
    dbg.id = 'kb-diag';
    dbg.style.cssText = [
      'position:fixed', 'top:env(safe-area-inset-top,0)', 'right:4px',
      'z-index:99999', 'pointer-events:none',
      'font-family:monospace', 'font-size:9px', 'line-height:1.3',
      'color:#ffd27a', 'background:rgba(0,0,0,.62)',
      'padding:4px 6px', 'border-radius:4px',
      'border:1px solid rgba(232,154,58,.4)',
      'max-width:140px', 'text-align:right',
      'opacity:.85'
    ].join(';');
    document.body.appendChild(dbg);
    let raf;
    const tick = () => {
      const vv = window.visualViewport;
      const app = document.querySelector('.app');
      const ae = document.activeElement;
      const aeTag = ae && ae !== document.body ? ae.tagName.toLowerCase() : '—';
      const kbOpen = document.body.classList.contains('keyboard-open') ? 'YES' : 'no';
      dbg.innerHTML = [
        `vv.h ${vv ? Math.round(vv.height) : '?'}`,
        `inn.h ${Math.round(window.innerHeight)}`,
        `doc.scrollY ${Math.round(window.scrollY)}`,
        `app.scrTop ${app ? Math.round(app.scrollTop) : '?'}`,
        `kb ${kbOpen}`,
        `focus ${aeTag}`,
      ].join('<br>');
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      dbg.remove();
    };
  }, []);
  // ───────────────────────────────────────────────────────────────
```

---

## What to do

1. Apply this single patch. Save. Push.
2. Wait for the auto-update.
3. You should now see a small faint orange readout in the top-right corner with 6 values updating live.
4. **Reproduce the bug:**
   - Go to Brief tab. Tap the quick-capture input. Keyboard appears.
   - Note the values of `vv.h`, `inn.h`, `doc.scrollY`, `app.scrTop`, `kb`, `focus`.
   - Type one character.
   - Dismiss the keyboard (whichever way you usually do — back button, tap outside, or system gesture).
   - **Once the keyboard is gone but the bug is showing (black bar, can't scroll up):** screenshot the diagnostic readout.
5. Also screenshot the bug visually so I can see exactly what you're calling "shifts up" and "black line".
6. Send me both screenshots.

That gives me ground truth: where the viewport is, whether the page itself is scrolled, whether the keyboard-open class is stuck, and what's focused. With those numbers I can fix it in one patch.

---

## Why I'm doing it this way

Because guessing twice was already too many. The right move when a bug doesn't match your mental model is to instrument, not iterate. F.1 and F.2 were both built on assumptions about what was happening — they fixed real things, just not your thing. With actual numbers from your device, the fix is mechanical.

I'm not bumping the version or the cache for this — it's a temporary instrumentation drop, not a release. Once we have data, we ship the actual fix as F.3.
