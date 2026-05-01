# Phase F.2 — index.html patches

10 sequential `str_replace` operations. Apply in order. Each `OLD` matches exactly once.

After applying everything, drop the new sw.js (cache v10 → v11), commit, push.

---

## Patch 1 — Version bump

### OLD
```js
const JARVIS_VERSION = '5.1.1';
const JARVIS_BUILD = 'RESPONSIVE';
```

### NEW
```js
const JARVIS_VERSION = '5.1.2';
const JARVIS_BUILD = 'RESPONSIVE';
```

---

## Patch 2 — Keyboard detector v2 (replaces the F.1 visualViewport approach)

The F.1 detector relied on `visualViewport.resize` firing reliably for both keyboard open AND close. On Chrome Android the close event is unreliable, especially with back-button dismissal. Switching to focus-event detection (primary) with a 1-second safety interval (so if Chrome forgets to blur the input we still recover).

### OLD
```js
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

### NEW
```js
  // Phase F.2: keyboard detection via focus events (primary) + safety
  // interval (recovery). The F.1 visualViewport approach didn't fire
  // reliably on keyboard CLOSE on Chrome Android — so the nav stayed
  // hidden after dismissal. Focus events fire predictably both ways.
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

---

## Patch 3 — News fetch retry

The "Failed to Fetch" while online is almost certainly a transient network blip (Wi-Fi switching, brief DNS hiccup). Adds 2 retries with backoff before giving up. If all three attempts fail, the existing `keepOld` fallback kicks in.

### OLD
```js
  try {
    const url = searchQuery
      ? `https://gnews.io/api/v4/search?q=${encodeURIComponent(searchQuery)}&lang=en&max=10&sortby=publishedAt&apikey=${key}`
      : `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=10&apikey=${key}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.status === 401) return keepOld('Invalid GNews key');
```

### NEW
```js
  try {
    const url = searchQuery
      ? `https://gnews.io/api/v4/search?q=${encodeURIComponent(searchQuery)}&lang=en&max=10&sortby=publishedAt&apikey=${key}`
      : `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=10&apikey=${key}`;
    // Phase F.2: retry transient network failures (Wi-Fi switching,
    // brief DNS hiccups). Throws after 3 attempts; caller's catch
    // falls back to cached articles via keepOld.
    let res;
    let lastErr;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        res = await fetch(url, { cache: 'no-store' });
        lastErr = null;
        break;
      } catch (e) {
        lastErr = e;
        if (attempt < 2) await new Promise(r => setTimeout(r, 400 * (attempt + 1)));
      }
    }
    if (lastErr) throw lastErr;
    if (res.status === 401) return keepOld('Invalid GNews key');
```

---

## Patch 4 — Bigger, slower ripples (CSS animation timing)

Tap feedback that lingers longer with a soft fade-out — more "I disturbed something physical".

### OLD
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

### NEW
```css
.d-ripple{position:fixed;width:0;height:0;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);border-radius:50%;mix-blend-mode:screen}
/* Phase F.2: bigger and slower than F.1. The ring expands to 380/520px
 * instead of 240/320px, takes 950ms/1400ms instead of 550ms/900ms. The
 * brightness peaks early and fades over the back half — gives the
 * "surface settling back to normal" feel. Tap = 3D system disturbed. */
.d-ripple-hit{
  background:radial-gradient(circle,
    transparent 0%,
    transparent 38%,
    rgba(var(--atm1),0.55) 50%,
    rgba(var(--atm1),0.20) 62%,
    transparent 78%);
  animation:dRippleHit .95s cubic-bezier(.2,.7,.3,1) forwards;
}
.d-ripple-miss{
  background:radial-gradient(circle,
    transparent 0%,
    transparent 40%,
    rgba(var(--atm1),0.32) 50%,
    rgba(var(--atm1),0.13) 60%,
    transparent 75%);
  animation:dRippleMiss 1.4s cubic-bezier(.2,.6,.3,1) forwards;
}
@keyframes dRippleHit{
  0%{width:0;height:0;opacity:0}
  14%{opacity:1}
  55%{opacity:0.7}
  100%{width:380px;height:380px;opacity:0}
}
@keyframes dRippleMiss{
  0%{width:0;height:0;opacity:0}
  16%{opacity:0.85}
  55%{opacity:0.5}
  100%{width:520px;height:520px;opacity:0}
}
```

---

## Patch 5 — Bigger ripples · JS timeout match

The setTimeout that removes the ripple element from the DOM has to outlive the animation, otherwise the ripple gets cut short.

### OLD
```js
    document.body.appendChild(r);
    // Miss ripples linger longer because they have nothing else to confirm them
    setTimeout(() => r.remove(), kind === 'miss' ? 900 : 520);
  };
```

### NEW
```js
    document.body.appendChild(r);
    // Phase F.2: match the longer animations (950ms hit / 1400ms miss).
    setTimeout(() => r.remove(), kind === 'miss' ? 1400 : 950);
  };
```

---

## Patch 6 — Reactor "looking around" pupil

A subtle inner light that translates and breathes on a long loop, giving the reactor's core a mechanical-eye feel. CSS-only, no DOM change.

### OLD
```css
@keyframes reactorBreath{
  0%,100%{box-shadow:0 0 0 0 rgba(232,154,58,0)}
  50%{box-shadow:0 0 18px 2px rgba(232,154,58,0.18)}
}
```

### NEW
```css
@keyframes reactorBreath{
  0%,100%{box-shadow:0 0 0 0 rgba(232,154,58,0)}
  50%{box-shadow:0 0 18px 2px rgba(232,154,58,0.18)}
}
/* Phase F.2: mechanical-eye pupil. A small inner highlight that drifts
 * around the core on an 11-second loop, with subtle scale variance.
 * Reads as "Jarvis is aware" without being literal. */
.reactor-core::before{
  content:'';position:absolute;inset:30%;border-radius:50%;
  background:radial-gradient(circle,
    rgba(255,255,255,0.95) 0%,
    rgba(255,248,230,0.75) 32%,
    rgba(255,200,120,0.30) 70%,
    transparent 100%);
  filter:blur(0.5px);
  animation:reactorLook 11s ease-in-out infinite;
  pointer-events:none;
}
@keyframes reactorLook{
  0%,100%{transform:translate(0, 0) scale(1)}
  14%{transform:translate(1.6px, -1.4px) scale(1.06)}
  28%{transform:translate(2.2px, 0.2px) scale(1.00)}
  42%{transform:translate(1.6px, 1.4px) scale(1.06)}
  56%{transform:translate(-1.4px, 1.4px) scale(1.00)}
  70%{transform:translate(-2.2px, 0.2px) scale(1.06)}
  84%{transform:translate(-1.4px, -1.4px) scale(1.00)}
}
```

---

## Patch 7 — Brief reorder · insert weather block before urgent mail

This is the bigger of the two reorder patches. Inserting the full weather block (lifted from later in the file) right after the quick-capture closes.

### OLD
```jsx
          <button className="qc-go" onClick={() => submitQuickCapture()} disabled={!qc.trim() || qcBusy} aria-label="Add">
            {qcBusy ? <div className="dp"><span/><span/><span/></div> : <IPlus size={16} color="#1a0e08" sw={3}/>}
          </button>
        </div>
      </div>

      {/* ── URGENT MAIL ── */}
```

### NEW
```jsx
          <button className="qc-go" onClick={() => submitQuickCapture()} disabled={!qc.trim() || qcBusy} aria-label="Add">
            {qcBusy ? <div className="dp"><span/><span/><span/></div> : <IPlus size={16} color="#1a0e08" sw={3}/>}
          </button>
        </div>
      </div>

      {/* ── WEATHER (Phase F.2: lifted up from below the fold) ── */}
      <div className="hud hud-red-bdr scan glow-red" style={{ padding:16, marginBottom:14, position:'relative' }}>
        <div className="particles"><span/><span/><span/><span/><span/></div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', position:'relative', zIndex:1 }}>
          <div>
            <div style={{ fontFamily:'var(--mn)', fontSize:9, color:'var(--gold)', letterSpacing:'.16em', fontWeight:700 }}>{(w?.city || 'LOCATION').toUpperCase()} · LIVE</div>
            <div style={{ fontFamily:'var(--display)', fontSize:52, fontWeight:300, lineHeight:0.95, marginTop:6, color:'var(--hi)', letterSpacing:'-0.02em' }}>
              {w ? <>{w.temp}<span style={{ color:'var(--ice)', fontSize:36, fontWeight:400 }}>°</span></> : '—°'}
            </div>
            <div style={{ fontSize:12, color:'var(--t2)', marginTop:6, fontFamily:'var(--bd)', fontStyle:'italic' }}>{w?`${w.desc} · feels ${w.feels}°`:'Connecting…'}</div>
            {w && <div style={{ fontFamily:'var(--mn)', fontSize:10, color:'var(--ice)', marginTop:4, fontWeight:500, letterSpacing:'.04em' }}>
              <span style={{ color:'var(--t4)' }}>H</span> {w.high}°
              <span style={{ color:'var(--t5)', margin:'0 6px' }}>·</span>
              <span style={{ color:'var(--t4)' }}>L</span> {w.low}°
              <span style={{ color:'var(--t5)', margin:'0 6px' }}>·</span>
              <span style={{ color:'var(--t4)' }}>WIND</span> {w.wind}<span style={{ color:'var(--t4)' }}>km/h</span>
            </div>}
            {w && w.rainProb > 30 && <div style={{ fontFamily:'var(--mn)', fontSize:10, color:'var(--redHot)', marginTop:5, fontWeight:600, letterSpacing:'.04em' }}>☔ RAIN 12H · <span style={{ color:'var(--ice)' }}>{w.rainProb}%</span></div>}
          </div>
          {w && (w.code <= 1 ? <ISun size={36} color="var(--gold)" sw={1.3}/> : (w.code >= 51 && w.code <= 82) ? <IRain size={36} color="var(--blue)" sw={1.3}/> : <ICloud size={36} color="var(--t2)" sw={1.3}/>)}
        </div>
      </div>

      {/* ── URGENT MAIL ── */}
```

---

## Patch 8 — Brief reorder · remove weather from below the fold

Removing the original location of the weather block (it was the AMBIENT comment + weather card). Markets header stays — that's where the new sequence picks up.

### OLD
```jsx
      {/* ─── AMBIENT (weather / markets / FX / news) below the fold ─── */}
      <div className="hud hud-red-bdr scan glow-red" style={{ padding:16, marginBottom:12, position:'relative' }}>
        <div className="particles"><span/><span/><span/><span/><span/></div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', position:'relative', zIndex:1 }}>
          <div>
            <div style={{ fontFamily:'var(--mn)', fontSize:9, color:'var(--gold)', letterSpacing:'.16em', fontWeight:700 }}>{(w?.city || 'LOCATION').toUpperCase()} · LIVE</div>
            <div style={{ fontFamily:'var(--display)', fontSize:52, fontWeight:300, lineHeight:0.95, marginTop:6, color:'var(--hi)', letterSpacing:'-0.02em' }}>
              {w ? <>{w.temp}<span style={{ color:'var(--ice)', fontSize:36, fontWeight:400 }}>°</span></> : '—°'}
            </div>
            <div style={{ fontSize:12, color:'var(--t2)', marginTop:6, fontFamily:'var(--bd)', fontStyle:'italic' }}>{w?`${w.desc} · feels ${w.feels}°`:'Connecting…'}</div>
            {w && <div style={{ fontFamily:'var(--mn)', fontSize:10, color:'var(--ice)', marginTop:4, fontWeight:500, letterSpacing:'.04em' }}>
              <span style={{ color:'var(--t4)' }}>H</span> {w.high}°
              <span style={{ color:'var(--t5)', margin:'0 6px' }}>·</span>
              <span style={{ color:'var(--t4)' }}>L</span> {w.low}°
              <span style={{ color:'var(--t5)', margin:'0 6px' }}>·</span>
              <span style={{ color:'var(--t4)' }}>WIND</span> {w.wind}<span style={{ color:'var(--t4)' }}>km/h</span>
            </div>}
            {w && w.rainProb > 30 && <div style={{ fontFamily:'var(--mn)', fontSize:10, color:'var(--redHot)', marginTop:5, fontWeight:600, letterSpacing:'.04em' }}>☔ RAIN 12H · <span style={{ color:'var(--ice)' }}>{w.rainProb}%</span></div>}
          </div>
          {w && (w.code <= 1 ? <ISun size={36} color="var(--gold)" sw={1.3}/> : (w.code >= 51 && w.code <= 82) ? <IRain size={36} color="var(--blue)" sw={1.3}/> : <ICloud size={36} color="var(--t2)" sw={1.3}/>)}
        </div>
      </div>

      <div style={{ fontFamily:'var(--hd)', fontSize:11, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'var(--gold)', marginBottom:7, display:'flex', alignItems:'center', gap:6 }}>
        Markets <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--gn)', display:'inline-block', boxShadow:'0 0 6px var(--gn)', animation:'pg 2s infinite' }}/>
      </div>
```

### NEW
```jsx
      {/* Markets / FX / News continue below the fold (Phase F.2: weather lifted up) */}
      <div style={{ fontFamily:'var(--hd)', fontSize:11, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'var(--gold)', marginBottom:7, display:'flex', alignItems:'center', gap:6 }}>
        Markets <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--gn)', display:'inline-block', boxShadow:'0 0 6px var(--gn)', animation:'pg 2s infinite' }}/>
      </div>
```

---

## Patch 9 — Kill marathon tab from the bottom-nav

Removes from the tabs array. Run icon and label gone from the bottom nav.

### OLD
```js
    { id:'calendar', I:ICal, l:'Cal' },
    { id:'marathon', I:IRun, l:'Run' },
  ];
```

### NEW
```js
    { id:'calendar', I:ICal, l:'Cal' },
  ];
```

---

## Patch 10 — Kill marathon route + URL validation

Removes the marathon render branch and removes 'marathon' from the valid-tabs allow-list (so `?tab=marathon` URLs no longer match). The `RunTab` component itself stays in the file — if you want to bring marathon back later it's a 1-line revert.

### OLD
```js
      const valid = ['chat','home','tasks','mail','news','finance','calendar','brain','marathon'];
```

### NEW
```js
      const valid = ['chat','home','tasks','mail','news','finance','calendar','brain'];
```

### OLD
```jsx
        {tab==='brain' && <BrainTab/>}
        {tab==='marathon' && <RunTab days={dtr} raceDone={raceDone} gEvents={gEvents} gToken={gToken}/>}
      </div>
```

### NEW
```jsx
        {tab==='brain' && <BrainTab/>}
      </div>
```

---

## Done

Save. Drop sw.js (cache v10 → v11). Push.

After deploy:
- Header should read `v5.1.2`.
- Tap chat input → keyboard opens → nav slides down → dismiss keyboard → nav slides back up. Both directions reliable now.
- News refresh: even if the first attempt fails transiently, two more attempts run automatically before showing the cached-stale banner.
- Tap anywhere → ripple is visibly bigger and lingers longer (~1s for hits, 1.4s for miss-taps).
- Reactor's hot core has a slow drifting pupil — you should see it move on an 11-second cycle if you watch it for a minute.
- Brief: weather card now sits right below the quick-capture row, above urgent mail.
- Bottom nav has 7 buttons, no more Run/marathon.
