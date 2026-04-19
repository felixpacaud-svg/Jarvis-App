# ⚡ Jarvis — Personal AI Assistant

> *"Good morning, sir. All systems operational."*

Jarvis is a personal AI assistant Progressive Web App (PWA) built for daily use on mobile. It lives on your phone home screen, connects to your real calendar, tracks your portfolio, delivers live news, logs your notes automatically, and lets you chat with an AI that knows your life context.

Built by Felix Pacaud. Iron Man-inspired UI. Fully open source.

**Live demo:** https://felixpacaud-svg.github.io/Jarvis-App/

---

## 📱 Screenshots

| Chat | Briefing | News |
|---|---|---|
| AI with source links + auto-memory | Weather + calendar + FX + headlines | Breaking news by category |

| Finance | Calendar | Brain | Marathon |
|---|---|---|---|
| Live portfolio + FX | Week view + date nav | Auto-saved notes | Race countdown + Garmin |

---

## ✨ Features

### 💬 Chat (Default Screen)
- Talk to Jarvis in natural language
- **Say "dinner tonight at 20:00"** → it creates a calendar event automatically
- **Say "remember: Christian shared an article on AI"** → it logs a note in the Brain
- **Mention anything worth remembering** → Jarvis detects it and saves automatically (no need to say "remember")
- **Ask "what's happening in the Middle East?"** → Jarvis searches the web live via Gemini with source links
- Source links displayed below answers — tap to read the full article
- "Save to Brain" button on any Jarvis response
- Status strip at the top shows: marathon countdown, next event, live Geneva weather
- Quick-tap suggestion pills for common queries
- Detailed responses with context and analysis (2048 token limit)

### 📋 Brief Tab
- Live weather (Geneva, via Open-Meteo — no API key needed)
- Today's schedule pulled from Google Calendar + Jarvis events
- Live stock prices for your holdings (Alpha Vantage)
- Live FX rates: CHF/EUR, CHF/USD, USD/EUR with flag indicators and live status
- Top 5 breaking news headlines with source and time (GNews API)
- Rain probability warning

### 📰 News Tab
- Live headlines from GNews API
- Category filters: Breaking, World, Markets, Tech, Middle East, Ukraine, Science
- Hero card for top story with image
- Compact article list with source, time ago, and thumbnail
- Tap any article to open in browser
- Cached 30 minutes to conserve API calls (100/day free tier)

### 📊 Finance Tab
- Fully editable portfolio: add/edit/delete holdings
- Live prices via Alpha Vantage (cached 1 hour to respect free tier limits)
- P&L tracking per holding and total
- PEA / Assurance Vie accounts
- FX rates panel with prominent vertical layout
- Last-updated timestamp on FX rates
- Refresh button to pull latest prices

### 📅 Calendar Tab
- Week-at-a-glance date strip with tappable days
- Default view: today + 7 days
- Navigate backward to see past events, forward for future
- "Today" button to snap back to current week
- Dot indicators on days with events
- Unified view: Google Calendar events (green) + Jarvis-created events (gold)
- Upcoming events preview below the selected day
- Delete Jarvis events directly; Google events are read-only

### 🧠 Brain Tab
- Persistent second brain: notes and ideas logged via chat
- **Automatic detection**: Jarvis saves things worth remembering even without being asked
- Tagged automatically by Jarvis
- Searchable, filterable by tag
- "Save to Brain" button on any chat message
- Brain entries are fed back into the AI context — Jarvis remembers what you told it
- Delete entries you no longer need

### 🏃 Marathon Tab
- Live countdown to race day (Lake Maggiore, November 8, 2026)
- Training sessions pulled from Google Calendar (Garmin sync)
- Week-at-a-glance view showing actual run days
- Next session highlighted with date and time
- Google Calendar status indicator

### 🔔 Notifications
- 7:00 AM and 7:00 PM briefing notifications
- Weather summary in morning notification
- Service Worker for background delivery
- Enable in ⚙️ Settings → "Enable Notifications"
- Firebase Cloud Messaging infrastructure ready for always-on push (optional upgrade)

### 🔐 Persistent Google Login
- OAuth token saved in localStorage
- Auto-reconnects on app reload within token lifetime
- Silent re-auth attempted when token expires
- No more manual sign-in every session

---

## 🏗️ Architecture

This is a **single-file PWA** — no build tools, no Node.js, no npm. One `index.html` plus a service worker deployed on GitHub Pages.

```
index.html          ← The entire app (React via CDN, Babel transpiled in-browser)
sw.js               ← Service Worker (notifications + offline caching)
manifest.json       ← PWA manifest (name, icon, theme color)
jarvis-icon.svg     ← Home screen icon
```

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (loaded via CDN) |
| Transpiler | Babel Standalone (in-browser JSX) |
| Styling | Pure CSS-in-JS (no Tailwind, no dependencies) |
| Hosting | GitHub Pages (free) |
| AI | Gemini 2.5 Flash API (Google) |
| Web search | Gemini with Google Search grounding |
| News | GNews API (free tier, 100 req/day) |
| Weather | Open-Meteo API (free, no key) |
| FX Rates | Frankfurter API (primary) + ExchangeRate API (fallback) |
| Stock prices | Alpha Vantage API (free tier, 25 req/day) |
| Calendar | Google Calendar API (OAuth 2.0) |
| Notifications | Service Worker + Notification API |
| Storage | localStorage (all data stays on device) |

### Data Flow

```
User types in chat
       ↓
Jarvis (Gemini API) processes with full context + Brain memory
       ↓
Parses [[EVENT:...]] and [[NOTE:...]] tags silently
       ↓
Auto-detects memory-worthy content and saves
       ↓
Extracts source links from grounding metadata
       ↓
Stores events/notes in localStorage
       ↓
Calendar, Brain, and Brief tabs read from localStorage + Google Calendar + GNews
```

### No backend. No server. No database.

Everything runs in the browser. API keys are stored in `localStorage` on your device only. No data is sent to any third party except the official APIs (Gemini, Alpha Vantage, GNews, Google).

---

## 🚀 Setup — Step by Step

### Step 1 — Fork or clone the repo

```
https://github.com/felixpacaud-svg/Jarvis-App
```

Or just download `index.html`, `sw.js`, `manifest.json`, and `jarvis-icon.svg`.

### Step 2 — Host on GitHub Pages

1. Create a GitHub repository (e.g. `jarvis-app`)
2. Upload all four files to the repo root
3. Go to Settings → Pages → Source: Deploy from branch → main / root
4. Your app is live at `https://YOUR_USERNAME.github.io/jarvis-app/`

**Important:** `sw.js` must be in the same directory as `index.html`.

No build step. No CI/CD. Just upload and go.

### Step 3 — Get your API keys

#### Gemini API Key (required — for chat, search, and auto-memory)
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click "Get API key" → Create API key
3. Copy it. Keep it private.
4. Free tier: generous daily limits. Gemini 2.5 Flash is very cheap (~€1-2/month for personal use)

#### Alpha Vantage Key (optional — for live stock prices)
1. Go to [alphavantage.co](https://www.alphavantage.co)
2. Click "Get your free API key" → fill name + email
3. Free tier: 25 requests/day. Prices are cached for 1 hour so this is plenty.

#### GNews API Key (required — for news feed)
1. Go to [gnews.io](https://gnews.io)
2. Sign up for a free account
3. Dashboard → copy your API key
4. Free tier: 100 requests/day. News is cached 30 minutes so this is plenty.

#### Google Calendar OAuth (optional — for live calendar + Garmin)
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project → name it "Jarvis"
3. Enable APIs: Google Calendar API
4. OAuth consent screen → External → fill name + email → Save
5. Credentials → Create credentials → OAuth Client ID → Web application
6. Add your GitHub Pages URL as "Authorised JavaScript origins" (e.g. `https://username.github.io`)
7. Copy the Client ID (format: `xxxx.apps.googleusercontent.com`)
8. In the code, find `const GCID = '...'` and replace with your Client ID
9. In OAuth consent screen → Test users → add your Gmail address

### Step 4 — Configure your Client ID in the code

Open `index.html` and find this line:

```javascript
const GCID = '1022045416372-q8dcqrmpoc7nuc32vuiom5bbdrtcnsak.apps.googleusercontent.com';
```

Replace the value with your own Google OAuth Client ID.

### Step 5 — Install on your phone

1. Open Chrome on Android
2. Navigate to your GitHub Pages URL
3. Tap the three-dot menu → "Add to Home screen" → Install
4. Jarvis appears on your home screen like a native app

### Step 6 — Add your API keys in the app

1. Open Jarvis → tap the ⚙️ gear icon (top right)
2. Paste your Gemini API key
3. Paste your Alpha Vantage key
4. Paste your GNews API key
5. Tap "Sign in with Google" to connect your calendar
6. Tap "Enable Notifications" to activate 7am/7pm briefings
7. Tap "Save Configuration"

---

## 📝 Customisation Guide

### Change the user profile (critical for useful chat)

The AI system prompt is what makes Jarvis know about you. Find this in `index.html`:

```javascript
const getSYS = () => {
  ...
  return `You are J.A.R.V.I.S. ...
  
  Felix: Network financial analyst at MSC Air Cargo, Geneva. French resident...
  ...`
};
```

Replace Felix's details with your own: name, job, city, investments, goals, interests. The more context you give, the more personalised the responses.

### Change the marathon / race event

Find this line:

```javascript
const dtr = Math.ceil((new Date('2026-11-08') - time) / 864e5);
```

Replace `2026-11-08` with your race date in `YYYY-MM-DD` format.

Also update the race label in the Run tab:

```javascript
LAKE MAGGIORE · NOVEMBER 8
```

### Change default portfolio holdings

In the `loadPortfolio()` function, find the default array:

```javascript
const loadPortfolio = () => sto.getJSON('j_portfolio', [
  { id: 1, name: 'Accenture', symbol: 'ACN', units: 0, costBasis: 0 },
  { id: 2, name: 'iShares MSCI World', symbol: 'IWDA.AMS', units: 0, costBasis: 0 },
  { id: 3, name: 'SPDR S&P 500', symbol: 'SPY', units: 0, costBasis: 0 },
]);
```

Replace with your own holdings. `symbol` must be an exact Alpha Vantage ticker symbol.

### Change the location / weather

Weather is pulled for Geneva (latitude 46.2044, longitude 6.1432). Find `fetchWeather()` and update:

```javascript
const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=46.2044&longitude=6.1432&...');
```

Replace coordinates with your city. Find yours at [open-meteo.com](https://open-meteo.com).

### Change the colour scheme

All colours are CSS variables at the top of the `CSS` constant:

```javascript
:root {
  --bg:#0a0507;       /* Main background */
  --bg2:#180a0c;      /* Card background */
  --red:#e63946;      /* Primary accent */
  --gold:#ffb400;     /* Secondary accent */
  --gn:#22c55e;       /* Green (positive) */
  --blue:#3b82f6;     /* Blue (news) */
  ...
}
```

---

## 🔑 API Reference

### Gemini API
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- **Auth:** API key in URL query parameter
- **Used for:** All chat responses + web search grounding (news queries) + auto-memory detection
- **Token limit:** 2048 output tokens per response
- **Cost:** Very low. Approximately €0.002 per message at Gemini 2.5 Flash pricing
- **Free tier:** Available at aistudio.google.com

### GNews API
- **Endpoint:** `https://gnews.io/api/v4/top-headlines` and `/search`
- **Auth:** API key in URL query parameter
- **Used for:** News feed (Breaking, World, Markets, Tech, Middle East, Ukraine, Science)
- **Free tier:** 100 requests/day — cached 30 minutes so this is plenty
- **Categories:** general, world, business, technology, science, health, entertainment, sports
- **Search:** Custom queries for topics like "middle east" or "ukraine russia war"

### Alpha Vantage
- **Endpoint:** `https://www.alphavantage.co/query?function=GLOBAL_QUOTE`
- **Auth:** API key in URL query parameter
- **Used for:** Live stock prices (ACN, SPY, IWDA, etc.)
- **Free tier:** 25 requests/day — sufficient because prices are cached for 1 hour

### Frankfurter API (primary FX)
- **Endpoint:** `https://api.frankfurter.app/latest`
- **Auth:** None required
- **Used for:** CHF/EUR, CHF/USD, USD/EUR live rates
- **Cost:** Free, no registration
- **Cache:** 30 minutes in localStorage

### ExchangeRate API (FX fallback)
- **Endpoint:** `https://open.er-api.com/v6/latest/CHF`
- **Auth:** None required
- **Used for:** Fallback when Frankfurter is unavailable
- **Cost:** Free, no registration

### Open-Meteo
- **Endpoint:** `https://api.open-meteo.com/v1/forecast`
- **Auth:** None required
- **Used for:** Live weather (temperature, condition, rain probability)
- **Cost:** Free, no registration

### Google Calendar API
- **Endpoint:** `https://www.googleapis.com/calendar/v3/calendars/primary/events`
- **Auth:** OAuth 2.0 token (user signs in with Google in the app)
- **Used for:** Reading calendar events (30 days back + 60 days forward) + Garmin training sessions
- **Scope:** `https://www.googleapis.com/auth/calendar.readonly` (read-only)
- **Token persistence:** Saved in localStorage, auto-reconnects on reload
- **Cost:** Free

---

## 🤖 How the AI Calendar & Brain Work

### Automatic Event Creation

When you type something with a date/time in chat, Jarvis appends a machine-readable tag to its response:

```
[[EVENT:{"title":"Dinner with Mélanie","date":"2026-04-19","time":"20:00","notes":""}]]
```

The app silently:
1. Parses this tag
2. Saves the event to `localStorage`
3. Strips the tag from the displayed message
4. Shows ✓ Added to calendar

**Supported phrasings:**
- "dinner tonight at 20:00"
- "doctor appointment next Tuesday 14:30"
- "meeting with Thomas Thursday 10am re budget"
- "remind me Friday to send the report"
- "call the caterer this week"

### Automatic Brain Logging

Jarvis detects and saves things worth remembering in two ways:

**Explicit:** When you say "remember", "log", "note", or "save":
```
[[NOTE:{"title":"Christian shared article on AI in logistics","tags":["AI","Work","Christian"],"comment":"Worth reading before next meeting"}]]
```

**Automatic:** Jarvis also saves without being asked when you:
- Mention someone told you something or shared something
- Discuss a decision you're considering
- Talk about something you learned or found interesting
- Mention something Mélanie said or asked
- Share a professional insight or plan

Brain entries are fed back into the system prompt so Jarvis has context from your previous conversations.

### Save from Chat

Any Jarvis response has a "Save to Brain" button — tap it to save the full response as a Brain entry tagged with `chat` and `saved`.

---

## 🔗 Garmin Integration

Garmin does not offer a public API for direct integration. The workaround (which works perfectly) is:

1. Open **Garmin Connect** app on Android
2. Settings → Connected Apps → **Google Calendar** → Connect
3. All your training sessions sync to Google Calendar automatically
4. Jarvis reads your Google Calendar → training sessions appear in the Marathon tab and the daily briefing

The Marathon tab filters Google Calendar events by keywords: `run`, `running`, `km`, `tempo`, `easy`, `long run`, `interval`, `trail`, `garmin`, `training`, `jog`, `course`, `sortie`, `cardio`.

---

## 🔔 Notifications Setup

### Local notifications (default)
1. Tap ⚙️ in the app → "Enable Notifications"
2. Allow when browser asks for permission
3. Notifications fire at 7:00 AM and 7:00 PM when the app is open or in background

### Firebase Cloud Messaging (optional — always-on push)
For notifications that arrive even when the app is fully closed:

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create project "Jarvis"
3. Project Settings → Cloud Messaging → enable
4. Add web app → get Firebase config
5. Deploy a Cloud Function for scheduled sends

This is an advanced setup documented separately. Local notifications work well for most use cases.

---

## 🗂️ Local Storage Keys

All data is stored in the browser's `localStorage`. Nothing leaves your device except API calls.

| Key | Contents |
|---|---|
| `j_gk` | Gemini API key |
| `j_ak` | Alpha Vantage API key |
| `j_nk` | GNews API key |
| `j_events` | JSON array of Jarvis-created calendar events |
| `j_brain` | JSON array of brain/note entries |
| `j_portfolio` | JSON array of portfolio holdings |
| `j_prices` | Cached stock prices (1 hour TTL) |
| `j_fx_cache` | Cached FX rates (30 min TTL) |
| `j_weather` | Cached weather data |
| `j_news_*` | Cached news by category (30 min TTL) |
| `j_gtoken` | Google OAuth access token |
| `j_gtoken_exp` | Google token expiry timestamp |

To fully reset the app, clear `localStorage` in Chrome DevTools or reinstall.

---

## 📋 Planned Improvements

- [ ] Gmail read-only integration (inbox triage in morning briefing)
- [ ] Firebase Cloud Functions for guaranteed push notifications
- [ ] TWA (Trusted Web Activity) wrapper for Google Play Store listing
- [ ] Offline mode with full service worker caching
- [ ] Share sheet integration (Android share → log to Brain)
- [ ] Mélanie's companion version (separate Google login, shared shopping list)
- [ ] Outlook ICS calendar import (for work calendar)
- [ ] Voice input
- [ ] Export Brain notes to Markdown

---

## 🙏 Credits & Dependencies

| Dependency | Version | License |
|---|---|---|
| React | 18.3.1 | MIT |
| ReactDOM | 18.3.1 | MIT |
| Babel Standalone | 7.23.2 | MIT |
| Rajdhani font | — | Open Font License |
| Exo 2 font | — | Open Font License |
| JetBrains Mono font | — | Open Font License |

All loaded via CDN. No npm, no node_modules, no build step.

---

## 📄 License

MIT — do whatever you want with it. If you build something cool on top of it, a mention would be appreciated.

---

## 👤 Author

**Felix Pacaud**  
Network Financial Analyst · Geneva  
github.com/felixpacaud-svg
