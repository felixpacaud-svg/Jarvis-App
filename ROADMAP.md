# J.A.R.V.I.S. — Development Roadmap

> Personal assistant for Felix Pacaud. Living document — update as priorities change.

---

## 📍 Current Version: 4.4.0 (April 2026) — VIBRANT-HUD

**Platform focus**: Samsung Galaxy S21 5G (Felix's device, Android). Mélanie uses iPhone 17 — iOS polish deferred to later releases. Primary test target: Chrome Android + Samsung Internet.

**Recent highlights:**
- **Living HUD** — the app now feels like a Mark III helmet, not a static page
  - Tap crosshair reticle spawns at exact touch point on every interactive tap
  - Device-tilt parallax: background grid, cards, corner brackets and reactor all shift at different magnitudes via `deviceorientation`, creating genuine depth between layers
  - Ambient breathing vignette (red↔gold, 7s cycle) on the app background
  - Two diagonal scan sweeps constantly traversing the background (gold 11s, red 14s)
  - Random-pulse scheduler: every 3–6s a random HUD card briefly radiates gold — "neurons firing"
  - Corner reticles pulse + glow, reactor gets a second rotating orbital ring
  - All effects respect `prefers-reduced-motion`
- **News — refocused & reliable**
  - Removed CORS proxy fallback for GNews (was causing the "network unreachable" errors — GNews supports CORS directly, proxies were flaky)
  - Source trust-score ranking: Reuters/AP/AFP/Bloomberg/FT/WSJ/Economist top, BBC/NYT/Guardian/Al Jazeera/DW/Le Monde next tier
  - Strict title-prefix dedupe — the same story from 3 wires collapses to 1
  - Breaking tab capped at 5 articles (real highlights only); other categories at 6
  - `keepOld()` policy: failed refresh never overwrites good cached articles — shows soft amber "stale" banner instead
  - NewsTab + BriefNewsSection now initialize synchronously from cache → no more flash of "NO ARTICLES" on tab switch or refresh
- **Mail reclassify** — Felix can override AI priority
  - Priority chips in the in-app viewer: URGENT / IMPORTANT / ROUTINE / LOW (tap to set)
  - Stored as `userOverride: true` — AI will never flip it back on the next fetch
  - Indicator shows "● YOUR CALL" vs "○ AI GUESS" / "○ GMAIL"
  - Demoting from Urgent auto-removes the corresponding Brain entry

## Previous: 4.3.0 (April 2026)

**Recent highlights:**
- **Groq integration** as primary chat AI (Llama 3.3 70B) with silent fallback to Gemini
  - 1000 req/day free on Groq 70B, 14400/day on 8B instant backup, then Gemini
  - News queries auto-route to Gemini (Groq has no web grounding)
  - Provider badge shown in chat (GROQ·70B / GROQ·8B / GEMINI)
- Mail classification now uses callAI (prefers Groq, saves Gemini quota for news)
- Simplified Android Gmail deep-link (App Links auto-opens Gmail app)
- System Check includes Groq + Gemini status

## Previous: 4.2.0 (April 2026)

**Recent highlights:**
- In-app mail viewer with Jarvis assessment overlays
- Gmail label + category signals pre-filter before LLM classification (~60% fewer tokens)
- Geolocation-based weather
- Resilient fetch with CORS proxy fallbacks (fixes iOS PWA "Failed to fetch")
- Tap ripple animations + thinking HUD + ambient particles
- System Check diagnostic panel
- Auto-reload on new service worker version

---

## 🟢 Next Up (v4.5+)

### AI / Intelligence
- [ ] **OpenRouter** as a third option (aggregates free Llama/Qwen/Gemma models)
- [ ] **Cerebras** as tertiary fallback (1700 req/day, similar speed to Groq)
- [ ] **Smart model-per-task routing**
  - [x] Gemini Flash with search: news, current events → DONE
  - [x] Groq Llama 3.3 70B: general chat, reasoning → DONE
  - [ ] Dedicated JSON-output model for event/note parsing (more reliable)
- [ ] **Voice output** — Jarvis speaks replies via Web Speech Synthesis API
- [ ] **Conversation memory across devices** (would need backend — defer)

### Mail
- [x] ~~**Override priority** — tap to reclassify in viewer~~ → **DONE in v4.4**
- [ ] **Long-press on mail list** — quick reclassify without opening
- [ ] **Reply drafting** — select an email → Jarvis drafts a reply → "Approve" sends via Gmail API
- [ ] **Snooze** — swipe right on an email, pick "tomorrow 9am" etc
- [ ] **Thread view** — tap an email to show the full thread, not just the last message
- [ ] **Smart unsubscribe** — one-tap unsubscribe for newsletters using `List-Unsubscribe` header
- [ ] **Digest notifications** — 7am/7pm push with top 3 emails needing attention

### Calendar
- [ ] **Direct Google Calendar write** (currently read-only scope) — add events from chat go to GCal, not just local
- [ ] **Outlook integration** for work calendar (MS Graph API)
- [ ] **Travel time awareness** — factor in commute time for events at Chêne-Bougerie vs off-site
- [ ] **Conflict detection** — warn when Jarvis tries to add event that overlaps existing

### Marathon / Fitness
- [ ] **Direct Garmin Connect integration** (not just via GCal)
  - Garmin Connect IQ API or scraping session tokens
  - Pull actual workout data: pace, distance, HR, training load
- [ ] **Weekly training summary card** on Sunday evening
- [ ] **Pre-race checklist** (3 weeks out, 1 week out, day-of)
- [ ] **Recovery tracking** — flag when HR variability drops, suggest rest

### Finance
- [ ] **PEA + assurance-vie tracking** — positions entered manually, show allocation breakdown
- [ ] **Dividend calendar** — upcoming dividends from holdings
- [ ] **Currency exposure dashboard** — total CHF vs EUR vs USD across all holdings
- [ ] **Fuel price tracker** (TotalEnergies/Shell stations near commute)
- [ ] **Benchmark charts** — portfolio vs S&P 500 vs MSCI World visualization

### News
- [x] ~~**Source quality ranking**~~ → **DONE in v4.4** (trust-score + dedupe + capped count)
- [ ] **Saved articles** — star an article, appears in a "Reading list" section
- [ ] **Custom feeds** — RSS support for specific sources (FT, Reuters, Bloomberg)
- [ ] **Topic alerts** — get push when news matches "MSC Air Cargo", "Switzerland economy", etc
- [ ] **"Catch me up"** — Jarvis summarises the top 5 into one paragraph of context

### Brain
- [ ] **Full-text search** across all brain entries (currently title + tags only)
- [ ] **Auto-tagging** — Gemini assigns semantic tags when saving
- [ ] **Related entries** — when viewing one entry, show connected thoughts
- [ ] **Weekly review prompt** — Sunday evening, Jarvis surfaces 3 old entries worth revisiting

---

## 🟡 Planned (v5.0 — Visual/Immersion Overhaul)

### Iron Man HUD Feel
- [x] ~~**3D depth layering** — CSS transforms + tilt parallax~~ → **DONE in v4.4**
- [x] ~~**Randomized light pulses** across the UI~~ → **DONE in v4.4**
- [x] ~~**HUD targeting crosshairs** on taps~~ → **DONE in v4.4**
- [x] ~~**Ambient scanning grid** that sweeps the background~~ → **DONE in v4.4**
- [x] ~~**Device motion parallax** — tilt phone, UI shifts~~ → **DONE in v4.4**
- [ ] **Arc reactor in center of screen** during boot (user-facing reactor glow)
- [ ] **Voice activation** — "Hey Jarvis" wake word via Web Speech API
- [ ] **Face-off intro animation** on first daily launch — morning briefing unfurls from a central point
- [ ] **Per-tab depth signatures** — each tab arrives with a slightly different parallax profile

### Sound Design
- [ ] **Subtle UI sounds** — soft chime on toast, low whoosh on tab switch, click on button
- [ ] **Mute toggle** in Settings
- [ ] **Jarvis voice** for boot-up ("Online, sir.")

### Animation System
- [ ] **Page transitions** between tabs (slide + fade + depth)
- [ ] **Success/error animations** — gold checkmark draws in, red X glitches
- [ ] **Long-press gestures** on cards for context menus (edit/delete/share)

---

## 🔵 Future Considerations (v6+)

### Architecture
- [ ] **Optional backend** for cross-device sync (Vercel + Supabase free tier)
- [ ] **Offline-first with background sync** when network returns
- [ ] **Multi-account support** (work Gmail + personal)

### Advanced Features
- [ ] **Receipt scanning** — photo a receipt, Jarvis parses it into an expense entry
- [ ] **Document summarization** — upload a PDF (work report), get bullet summary
- [ ] **Meeting prep** — for each calendar meeting, Jarvis surfaces past emails + brain entries about attendees
- [ ] **Language switch** — English / French toggle (UI + responses)
- [ ] **Shared family space** — a section Mélanie can also write to (shared shopping list, date ideas)
- [ ] **Garmin Heart Rate Variability** → daily readiness score in morning briefing

### Polish
- [ ] **Dark/darker/crimson/classic** theme picker
- [ ] **Custom accent colors** per Felix's preference
- [ ] **Keyboard shortcuts** for desktop users

---

## 🐛 Known Issues / Technical Debt

- GitHub Pages hosts everything public — API keys are stored in localStorage only (never committed) — acceptable for personal use but should consider a thin backend proxy eventually
- iOS Safari standalone PWA has occasional service worker cache quirks — currently mitigated by cachebuster
- No E2E tests — each deploy is manually validated
- `dangerouslySetInnerHTML` in mail viewer → add DOMPurify sanitization before HTML-rendering in production (currently strip `<script>` and `<style>` which covers the realistic risks but is not bulletproof)
- Device-orientation parallax on iOS requires permission gesture; granted silently on first tap but iOS Safari can still deny. Falls back gracefully (static layout).

---

## 📝 Design Principles

1. **Helmet feel** — every interaction should feel like the Mark III HUD. Gold + red. Crisp geometry. Never generic. The app should feel ALIVE — breathing, pulsing, reacting.
2. **Felix-first** — the app is personalized. Defaults reflect his life (Geneva, French resident, marathon Nov 8, markets focus, Mélanie).
3. **Friction-free logging** — the Brain tab auto-populates from chat because Felix "tends to forget things and is actively working to become more structured."
4. **Respect attention** — classify mail / news aggressively; only surface what actually matters. Top 5 breaking, not top 50.
5. **User overrides AI, always** — if Felix reclassifies something, the app must remember and not second-guess him.
6. **Offline-graceful** — cache everything, fall back sensibly, never show a blank screen. Stale > empty.
7. **No dark patterns** — no ads, no upsells, no tracking. Ever.

---

## 🔖 Version History

- **v4.4.0** (Apr 2026) — Vibrant HUD: tap crosshairs, tilt parallax, breathing, random pulses, sweep lines. News: trust-score ranking + dedupe + stale-aware caching. Mail: manual priority override.
- **v4.3.0** (Apr 2026) — Groq integration (Llama 3.3 70B primary) + silent Gemini fallback, Samsung-first platform focus
- **v4.2.0** (Apr 2026) — In-app mail viewer, Gmail signals, geolocation, CORS resilience, tap animations
- **v4.1.x** (Apr 2026) — Mail tab + System Check (wiring fixes)
- **v4.0.0** (Apr 2026) — Boot sequence, voice input, service worker v4, Iron Man visual overhaul
- **v3.x** (Apr 2026) — Original multi-agent architecture (deprecated)

---

*Keep this file in the repo root. Update when features ship or priorities shift.*
