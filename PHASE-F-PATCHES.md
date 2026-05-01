# Phase F — index.html patches

Apply in order. Each `OLD` block matches exactly once in current `index.html`. After each replace, save the file before moving to the next.

---

## Patch 1 — Version bump

### OLD
```js
const JARVIS_VERSION = '5.0.1';
const JARVIS_BUILD = 'PRESENCE';
```

### NEW
```js
const JARVIS_VERSION = '5.1.0';
const JARVIS_BUILD = 'RESPONSIVE';
```

---

## Patch 2 — Voice language preference helpers

Adds a stored preference for speech-recognition language. Inserted just before the existing `SpeechRec` constant.

### OLD
```js
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const useVoice = (onResult) => {
```

### NEW
```js
// ─── Voice language preference (Phase F) ─────────────────────
// Stored as 'auto' (use navigator.language) or an explicit BCP-47
// tag like 'en-GB' / 'fr-FR'. Felix speaks both English and French,
// and navigator.language is unreliable on some Samsung builds.
const VOICE_LANG_KEY = 'j_voice_lang';
const loadVoiceLang = () => sto.get(VOICE_LANG_KEY) || 'auto';
const saveVoiceLang = (l) => sto.set(VOICE_LANG_KEY, l);
const resolvedVoiceLang = () => {
  const pref = loadVoiceLang();
  if (pref && pref !== 'auto') return pref;
  return navigator.language || 'en-GB';
};

const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const useVoice = (onResult) => {
```

---

## Patch 3 — Wire voice hook to language preference

The existing hook hardcodes `r.lang = navigator.language || 'en-GB'`. Switch to the stored preference.

### OLD
```js
      const r = new SpeechRec();
      r.lang = navigator.language || 'en-GB';
      r.interimResults = false;
```

### NEW
```js
      const r = new SpeechRec();
      r.lang = resolvedVoiceLang();
      r.interimResults = false;
```

---

## Patch 4 — Tasks data layer · accept `recur` field on addTask

The schema gains an optional `recur` block. Also fixes a latent bug: the dedup-within-60s check was matching against `done` tasks, which would silently swallow the next instance of a recurring task spawned right after marking the previous one done.

### OLD
```js
const addTask = (t) => {
  const tasks = loadTasks();
  // De-dupe within 60s (mirrors brain de-dupe — protects against AI double-tags)
  const now = Date.now();
  const recent = tasks.find(x => x.title?.toLowerCase().trim() === t.title?.toLowerCase().trim() && (now - x.createdAt) < 60000);
  if (recent) return recent.id;
  const id = uid();
  const todayISO = new Date().toISOString().slice(0, 10);
  tasks.unshift({
    id,
    title: t.title || '(untitled)',
    notes: t.notes || '',
    priority: ['high','med','low'].includes(t.priority) ? t.priority : 'med',
    due: t.due || todayISO,
    dueTime: t.dueTime || null,
    status: 'open',
    snoozeUntil: null,
    source: t.source || 'manual',
    createdAt: now,
    doneAt: null
  });
  saveTasks(tasks.slice(0, 500));
  return id;
};
```

### NEW
```js
const addTask = (t) => {
  const tasks = loadTasks();
  // De-dupe within 60s — but ONLY against open/snoozed tasks. Done tasks
  // shouldn't block new ones (Phase F: required for recurring spawn-on-done
  // when the user marks done within 60s of the previous instance creation).
  const now = Date.now();
  const recent = tasks.find(x =>
    x.status !== 'done' &&
    x.title?.toLowerCase().trim() === t.title?.toLowerCase().trim() &&
    (now - x.createdAt) < 60000
  );
  if (recent) return recent.id;
  const id = uid();
  const todayISO = new Date().toISOString().slice(0, 10);
  tasks.unshift({
    id,
    title: t.title || '(untitled)',
    notes: t.notes || '',
    priority: ['high','med','low'].includes(t.priority) ? t.priority : 'med',
    due: t.due || todayISO,
    dueTime: t.dueTime || null,
    status: 'open',
    snoozeUntil: null,
    source: t.source || 'manual',
    recur: t.recur || null,
    createdAt: now,
    doneAt: null
  });
  saveTasks(tasks.slice(0, 500));
  return id;
};
```

---

## Patch 5 — Recurrence helpers + spawn-on-done

Inserted right after `snoozeTask`. These compute the next occurrence of a recurring task and spawn it via `addTask`.

### OLD
```js
const snoozeTask = (id, untilISO) => updateTask(id, { status: 'snoozed', snoozeUntil: untilISO });

// Wake snoozed tasks whose snoozeUntil has passed.
```

### NEW
```js
const snoozeTask = (id, untilISO) => updateTask(id, { status: 'snoozed', snoozeUntil: untilISO });

// ─── RECURRENCE (Phase F) ───────────────────────────────────────
// recur shape on a task:
//   { type: 'daily'|'weekdays'|'weekly'|'monthly',
//     days: ['mon','tue',...],     // only meaningful for type='weekly'
//     times: ['08:00','20:00'],    // 0+ times-of-day; spawns one instance per time
//     endDate: 'YYYY-MM-DD'|null }
//
// Strategy: template-spawns-instances. Each spawned instance is a real
// task record carrying the same `recur` block. When marked done, we
// compute and spawn the next occurrence — no upfront calendar pollution.
const DOW = ['sun','mon','tue','wed','thu','fri','sat'];

const nextOccurrence = (task) => {
  if (!task.recur) return null;
  const r = task.recur;
  const currentDate = task.due;
  const currentTime = task.dueTime;

  // Multi-time same-day: if there's a later time today, use it
  if (r.times && r.times.length > 1 && currentTime) {
    const sortedTimes = [...r.times].sort();
    const idx = sortedTimes.indexOf(currentTime);
    if (idx >= 0 && idx < sortedTimes.length - 1) {
      return { due: currentDate, dueTime: sortedTimes[idx + 1] };
    }
  }

  // Otherwise advance to next valid date
  const d = new Date(currentDate + 'T00:00');
  if (r.type === 'daily') {
    d.setDate(d.getDate() + 1);
  } else if (r.type === 'weekdays') {
    do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0 || d.getDay() === 6);
  } else if (r.type === 'weekly') {
    const targetDows = (r.days || []).map(name => DOW.indexOf(name)).filter(n => n >= 0).sort();
    if (targetDows.length === 0) {
      d.setDate(d.getDate() + 7);
    } else {
      let safety = 0;
      do {
        d.setDate(d.getDate() + 1);
        safety++;
        if (safety > 14) break;
      } while (!targetDows.includes(d.getDay()));
    }
  } else if (r.type === 'monthly') {
    d.setMonth(d.getMonth() + 1);
  } else {
    return null;
  }

  const newDate = d.toISOString().slice(0, 10);
  if (r.endDate && newDate > r.endDate) return null;
  const newTime = r.times && r.times.length > 0 ? [...r.times].sort()[0] : null;
  return { due: newDate, dueTime: newTime };
};

const spawnNextRecur = (task) => {
  if (!task?.recur) return;
  const next = nextOccurrence(task);
  if (!next) return;
  addTask({
    title: task.title,
    notes: task.notes,
    priority: task.priority,
    due: next.due,
    dueTime: next.dueTime,
    source: task.source || 'manual',
    recur: task.recur,
  });
};

// Wake snoozed tasks whose snoozeUntil has passed.
```

---

## Patch 6 — completeTask spawns next recur instance

### OLD
```js
const completeTask = (id) => updateTask(id, { status: 'done', doneAt: Date.now() });
```

### NEW
```js
const completeTask = (id) => {
  // Phase F: capture task BEFORE updating, then spawn next recur instance
  const task = loadTasks().find(t => t.id === id);
  updateTask(id, { status: 'done', doneAt: Date.now() });
  if (task?.recur) spawnNextRecur(task);
};
```

---

## Patch 7 — Chat-tab layout fix (the bug Felix reported)

The auto-focus fires the keyboard on Android, which collapses the dvh-sized layout. Skip auto-focus on touch devices; keep it for desktop.

### OLD
```js
  useEffect(() => { setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100); }, []);
```

### NEW
```js
  useEffect(() => {
    // Phase F: skip auto-focus on touch devices. Focusing the input opens
    // the keyboard, which collapses the dvh-sized flex layout and pushes
    // the header off-screen. Desktop (no virtual keyboard) still benefits.
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100);
  }, []);
```

---

## Patch 8 — Chat voice handler · auto-submit on result

Replace the concatenation behavior with auto-submit. When the user speaks and the recognizer detects natural silence (~800ms, baked into the Web Speech API), `onresult` fires and we send immediately.

### OLD
```js
  const voice = useVoice((txt) => { setInp(prev => (prev ? prev + ' ' : '') + txt); haptic.tick(); });
```

### NEW
```js
  const voice = useVoice((txt) => {
    // Phase F: auto-submit voice input. Web Speech API's natural ~800ms
    // silence detection IS the trigger here — `onresult` only fires once
    // the user has stopped talking, so by the time we get `txt` they're done.
    setInp('');
    haptic.tap();
    sendFromText(txt.trim(), msgs);
  });
```

---

## Patch 9 — Brief quick-capture · voice + auto-submit

The quick-capture row in BriefTab gains a mic button. The submit handler is widened to accept an explicit text override (used by the voice handler).

### OLD
```js
  // ─── Quick capture handling ─────────────────────────────────
  const [qc, setQc] = useState('');
  const [qcBusy, setQcBusy] = useState(false);
  const submitQuickCapture = async () => {
    const text = qc.trim();
    if (!text || qcBusy) return;
    setQcBusy(true);
```

### NEW
```js
  // ─── Quick capture handling ─────────────────────────────────
  const [qc, setQc] = useState('');
  const [qcBusy, setQcBusy] = useState(false);
  // Phase F: voice in Brief, auto-submits via the same submit handler
  const qcVoice = useVoice((txt) => {
    const text = txt?.trim();
    if (!text) return;
    setQc(text);
    haptic.tap();
    submitQuickCapture(text);
  });
  const submitQuickCapture = async (textOverride) => {
    const text = (typeof textOverride === 'string' ? textOverride : qc).trim();
    if (!text || qcBusy) return;
    setQcBusy(true);
```

---

## Patch 10 — Brief quick-capture JSX · mic button

Add the mic between the input and the gold arrow.

### OLD
```jsx
        {/* ── QUICK CAPTURE ── */}
        <div className="qc-wrap" style={{ marginTop:10 }}>
          <input
            className="qc-input"
            value={qc}
            onChange={e => setQc(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitQuickCapture(); }}
            placeholder="Quick capture — task, event, or anything…"
            disabled={qcBusy}
          />
          <button className="qc-go" onClick={submitQuickCapture} disabled={!qc.trim() || qcBusy} aria-label="Add">
            {qcBusy ? <div className="dp"><span/><span/><span/></div> : <IPlus size={16} color="#1a0e08" sw={3}/>}
          </button>
        </div>
```

### NEW
```jsx
        {/* ── QUICK CAPTURE ── */}
        <div className="qc-wrap" style={{ marginTop:10 }}>
          <input
            className="qc-input"
            value={qc}
            onChange={e => setQc(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitQuickCapture(); }}
            placeholder={qcVoice.listening ? 'Listening…' : 'Quick capture — task, event, or anything…'}
            disabled={qcBusy}
          />
          {qcVoice.supported && (
            <button
              className={`qc-mic${qcVoice.listening?' on':''}`}
              onClick={() => qcVoice.listening ? qcVoice.stop() : qcVoice.start()}
              aria-label="Voice input"
              disabled={qcBusy}>
              <IMic size={16} color={qcVoice.listening?'var(--redHot)':'var(--t3)'} sw={1.75}/>
            </button>
          )}
          <button className="qc-go" onClick={() => submitQuickCapture()} disabled={!qc.trim() || qcBusy} aria-label="Add">
            {qcBusy ? <div className="dp"><span/><span/><span/></div> : <IPlus size={16} color="#1a0e08" sw={3}/>}
          </button>
        </div>
```

---

## Patch 11 — Styles for the new mic button

Inserted right after the `.qc-go:disabled` rule so it lives next to its siblings.

### OLD
```css
.qc-go:active{transform:scale(.92)}
.qc-go:disabled{opacity:.4;cursor:wait}
```

### NEW
```css
.qc-go:active{transform:scale(.92)}
.qc-go:disabled{opacity:.4;cursor:wait}
/* Phase F — voice mic button in the Brief quick-capture row */
.qc-mic{
  background:var(--bg3);border:1px solid var(--bdr);border-radius:9px;
  width:34px;height:34px;display:flex;align-items:center;justify-content:center;
  cursor:pointer;flex-shrink:0;
  transition:border-color .15s,background .15s,transform .12s;
}
.qc-mic:active{transform:scale(.92)}
.qc-mic.on{border-color:var(--redHot);background:rgba(216,85,64,.10);box-shadow:0 0 12px rgba(216,85,64,.25)}
.qc-mic.on::after{
  content:'';position:absolute;inset:-3px;border-radius:11px;
  border:1.5px solid var(--redHot);opacity:.6;
  animation:pg 1.2s infinite;pointer-events:none;
}
```

---

## Patch 12 — TaskEdit · recur state and helpers

Expand the editor's state to include the recur block. Also adjust the `save` payload to include it.

### OLD
```js
function TaskEdit({ task, onSave, onCancel }) {
  const isNew = !task?.id;
  const [title, setTitle] = useState(task?.title || '');
  const [notes, setNotes] = useState(task?.notes || '');
  const [priority, setPriority] = useState(task?.priority || 'med');
  const [due, setDue] = useState(task?.due || todayISO());
  const [dueTime, setDueTime] = useState(task?.dueTime || '');
  const titleRef = useRef(null);
```

### NEW
```js
function TaskEdit({ task, onSave, onCancel }) {
  const isNew = !task?.id;
  const [title, setTitle] = useState(task?.title || '');
  const [notes, setNotes] = useState(task?.notes || '');
  const [priority, setPriority] = useState(task?.priority || 'med');
  const [due, setDue] = useState(task?.due || todayISO());
  const [dueTime, setDueTime] = useState(task?.dueTime || '');
  // Phase F — recurrence
  const [recur, setRecur] = useState(task?.recur || null);
  const setRecurType = (type) => {
    if (!type) { setRecur(null); return; }
    setRecur({
      type,
      days: recur?.days || (type === 'weekly' ? ['mon'] : []),
      times: recur?.times || (dueTime ? [dueTime] : []),
      endDate: recur?.endDate || null,
    });
  };
  const toggleRecurDay = (d) => {
    if (!recur) return;
    const days = recur.days?.includes(d) ? recur.days.filter(x => x !== d) : [...(recur.days || []), d];
    setRecur({ ...recur, days });
  };
  const updateRecurTime = (i, val) => {
    if (!recur) return;
    const times = [...(recur.times || [])];
    times[i] = val;
    setRecur({ ...recur, times });
  };
  const addRecurTime = () => {
    if (!recur) return;
    setRecur({ ...recur, times: [...(recur.times || []), '08:00'] });
  };
  const removeRecurTime = (i) => {
    if (!recur) return;
    setRecur({ ...recur, times: (recur.times || []).filter((_, j) => j !== i) });
  };
  const titleRef = useRef(null);
```

---

## Patch 13 — TaskEdit · pass recur in save

### OLD
```js
  const save = () => {
    if (!title.trim()) { haptic.warn(); return; }
    onSave({
      title: title.trim(),
      notes: notes.trim(),
      priority,
      due,
      dueTime: dueTime || null,
    });
  };
```

### NEW
```js
  const save = () => {
    if (!title.trim()) { haptic.warn(); return; }
    // Phase F: clean up recur — drop empty times, drop empty days for weekly
    let cleanRecur = recur;
    if (cleanRecur) {
      const cleanedTimes = (cleanRecur.times || []).filter(t => t && /^\d{2}:\d{2}$/.test(t));
      cleanRecur = { ...cleanRecur, times: cleanedTimes };
      if (cleanRecur.type === 'weekly' && (!cleanRecur.days || cleanRecur.days.length === 0)) {
        cleanRecur.days = ['mon'];
      }
    }
    onSave({
      title: title.trim(),
      notes: notes.trim(),
      priority,
      due,
      dueTime: dueTime || null,
      recur: cleanRecur,
    });
  };
```

---

## Patch 14 — TaskEdit · Repeat UI rows

Inserted right after the existing Notes row, before the action buttons.

### OLD
```jsx
      <div className="tt-edit-row">
        <div className="tt-edit-l">Notes <span style={{ color:'var(--t4)', fontWeight:400 }}>(optional)</span></div>
        <textarea className="tt-edit-textarea" value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Anything else worth remembering…" rows={2} maxLength={1000}/>
      </div>
      <div className="tt-edit-actions">
        <button className="tt-edit-cancel" onClick={onCancel}>Cancel</button>
        <button className="tt-edit-save" onClick={save}>{isNew ? 'Add task' : 'Save changes'}</button>
      </div>
    </div>
  );
}
```

### NEW
```jsx
      <div className="tt-edit-row">
        <div className="tt-edit-l">Notes <span style={{ color:'var(--t4)', fontWeight:400 }}>(optional)</span></div>
        <textarea className="tt-edit-textarea" value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Anything else worth remembering…" rows={2} maxLength={1000}/>
      </div>
      {/* Phase F — recurrence */}
      <div className="tt-edit-row">
        <div className="tt-edit-l">Repeat</div>
        <div className="tt-edit-prio" style={{ flexWrap:'wrap' }}>
          {[
            { v: null,        l: 'Once' },
            { v: 'daily',     l: 'Daily' },
            { v: 'weekdays',  l: 'Weekdays' },
            { v: 'weekly',    l: 'Weekly' },
            { v: 'monthly',   l: 'Monthly' },
          ].map(o => {
            const active = (recur?.type ?? null) === o.v;
            return (
              <button key={o.l}
                className={active ? 'on-med' : ''}
                onClick={() => { setRecurType(o.v); haptic.tick(); }}>
                {o.l}
              </button>
            );
          })}
        </div>
      </div>
      {recur?.type === 'weekly' && (
        <div className="tt-edit-row">
          <div className="tt-edit-l">Days</div>
          <div className="tt-edit-prio" style={{ flexWrap:'wrap' }}>
            {['mon','tue','wed','thu','fri','sat','sun'].map(d => (
              <button key={d}
                className={recur.days?.includes(d) ? 'on-med' : ''}
                onClick={() => { toggleRecurDay(d); haptic.tick(); }}>
                {d.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
      {recur && (
        <div className="tt-edit-row">
          <div className="tt-edit-l">Times <span style={{ color:'var(--t4)', fontWeight:400 }}>(0+ per day)</span></div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {(recur.times || []).map((t, i) => (
              <div key={i} style={{ display:'flex', gap:6, alignItems:'center' }}>
                <input className="tt-edit-input" type="time" value={t}
                  style={{ maxWidth:140 }}
                  onChange={e => updateRecurTime(i, e.target.value)}/>
                <button onClick={() => { removeRecurTime(i); haptic.tick(); }}
                  style={{ background:'var(--bg3)', border:'1px solid var(--bdr)', borderRadius:6, padding:'6px 10px', color:'var(--t3)', cursor:'pointer', fontFamily:'var(--mn)', fontSize:11 }}>×</button>
              </div>
            ))}
            <button onClick={() => { addRecurTime(); haptic.tick(); }}
              style={{ background:'var(--bg3)', border:'1px dashed var(--bdr)', borderRadius:6, padding:'6px 10px', color:'var(--t3)', cursor:'pointer', fontFamily:'var(--mn)', fontSize:10, fontWeight:600, letterSpacing:'.06em', alignSelf:'flex-start' }}>
              + ADD TIME
            </button>
          </div>
        </div>
      )}
      <div className="tt-edit-actions">
        <button className="tt-edit-cancel" onClick={onCancel}>Cancel</button>
        <button className="tt-edit-save" onClick={save}>{isNew ? 'Add task' : 'Save changes'}</button>
      </div>
    </div>
  );
}
```

---

## Patch 15 — Settings · voice language selector

Adds a language chip row inside the existing Voice section. Inserted right after the `Test` button line, before the help text.

### OLD
```jsx
            <button onClick={() => { speak('Online, sir. Voice systems nominal.'); haptic.tick(); }}
              disabled={!voiceOn}
              style={{ padding:'10px 14px', background:'var(--bg3)', border:'1px solid var(--bdr)', borderRadius:10, cursor:voiceOn?'pointer':'not-allowed', fontFamily:'var(--mn)', fontSize:10, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--t2)', opacity:voiceOn?1:0.4 }}>
              Test
            </button>
          </div>
          <div style={{ marginTop:8, fontSize:10, color:'var(--t3)', lineHeight:1.5 }}>
            When enabled, Jarvis speaks the morning and evening briefings aloud, plus the daily overdue digest. Picks a British male voice when available. Off by default.
          </div>
        </div>
```

### NEW
```jsx
            <button onClick={() => { speak('Online, sir. Voice systems nominal.'); haptic.tick(); }}
              disabled={!voiceOn}
              style={{ padding:'10px 14px', background:'var(--bg3)', border:'1px solid var(--bdr)', borderRadius:10, cursor:voiceOn?'pointer':'not-allowed', fontFamily:'var(--mn)', fontSize:10, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--t2)', opacity:voiceOn?1:0.4 }}>
              Test
            </button>
          </div>
          {/* Phase F — speech recognition language preference */}
          <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontFamily:'var(--mn)', fontSize:9, color:'var(--t3)', fontWeight:700, letterSpacing:'.10em', textTransform:'uppercase' }}>
              Recognition lang
            </span>
            {[
              { v: 'auto', l: 'AUTO' },
              { v: 'en-GB', l: 'EN-GB' },
              { v: 'fr-FR', l: 'FR-FR' },
            ].map(o => {
              const active = voiceLang === o.v;
              return (
                <button key={o.v}
                  onClick={() => { saveVoiceLang(o.v); setVoiceLang(o.v); haptic.tick(); }}
                  className="mpr-chip" style={{
                    background: active ? 'rgba(232,154,58,.10)' : 'var(--bg3)',
                    borderColor: active ? 'var(--bdrGold)' : 'var(--bdr)',
                    color: active ? 'var(--gold)' : 'var(--t2)',
                  }}>
                  {o.l}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop:8, fontSize:10, color:'var(--t3)', lineHeight:1.5 }}>
            When enabled, Jarvis speaks the morning and evening briefings aloud, plus the daily overdue digest. Picks a British male voice when available. Off by default. Recognition language affects voice <em>input</em> (mic in Brief and Chat).
          </div>
        </div>
```

---

## Patch 16 — Settings · voiceLang state

Add the state hook alongside the other settings state.

### OLD
```js
  const [voiceOn, setVoiceOnState] = useState(isVoiceEnabled());
```

### NEW
```js
  const [voiceOn, setVoiceOnState] = useState(isVoiceEnabled());
  const [voiceLang, setVoiceLang] = useState(loadVoiceLang());
```

---

## Patch 17 — App container · 100dvh → 100svh

Belt-and-suspenders fix to defend the chat layout. With Patch 7 already removing the auto-focus trigger, this is defensive: if Felix manually taps the input later, the keyboard opening won't shrink the layout.

### OLD
```css
.app{max-width:480px;margin:0 auto;height:100dvh;display:flex;flex-direction:column;position:relative;overflow:hidden;background:var(--bg);transition:filter 1s ease-out}
```

### NEW
```css
.app{max-width:480px;margin:0 auto;height:100svh;display:flex;flex-direction:column;position:relative;overflow:hidden;background:var(--bg);transition:filter 1s ease-out}
```

---

## Done

17 patches. Save the file. Then drop in the new `sw.js` (cache v9). Commit + push. The PWA will auto-update on next launch.

If any `OLD` block does not match exactly — stop and tell me which one. Some of these have whitespace I may have miscounted.
