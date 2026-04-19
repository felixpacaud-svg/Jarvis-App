# ⚡ Jarvis — Personal AI Assistant

> *"Good morning, sir. All systems operational."*

Jarvis is a personal AI assistant Progressive Web App (PWA) built for daily use on mobile. It lives on your phone home screen, connects to your real calendar, tracks your portfolio, logs your notes, and lets you chat with an AI that knows your life context.

Built by Felix Pacaud. Iron Man-inspired UI. Fully open source.

**Live demo:** https://felixpacaud-svg.github.io/Jarvis-App/

---

## 📱 Screenshots

| Chat | Briefing | Finance |
|---|---|---|
| Real-time AI with context | Live weather + calendar | Live portfolio + FX |

| Calendar | Brain | Marathon |
|---|---|---|
| Google Cal + Jarvis events | Logged notes and ideas | Race countdown + Garmin |

---

## ✨ Features

### 💬 Chat (Default Screen)
- Talk to Jarvis in natural language
- **Say "dinner tonight at 20:00"** → it creates a calendar event automatically
- **Say "remember: Christian shared an article on AI"** → it logs a note in the Brain
- **Ask "what's happening in the Middle East?"** → Jarvis searches the web live via Gemini
- Status strip at the top shows: marathon countdown, next event, live Geneva weather
- Quick-tap suggestion pills for common queries

### 📋 Brief Tab
- Live weather (Geneva, via Open-Meteo — no API key needed)
- Today's schedule pulled from Google Calendar + Jarvis events
- Live stock prices for your holdings (Alpha Vantage)
- Live FX rates: CHF/EUR, CHF/USD, USD/EUR (Frankfurter API — free)
- Rain probability warning

### 📊 Finance Tab
- Fully editable portfolio: add/edit/delete holdings
- Live prices via Alpha Vantage (cached 1 hour to respect free tier limits)
- P&L tracking per holding and total
- PEA / Assurance Vie accounts
- FX rates panel
- Refresh button to pull latest prices

### 📅 Calendar Tab
- Unified view: Google Calendar events (green) + Jarvis-created events (gold)
- 14-day rolling view
- Events created via chat appear instantly
- Delete Jarvis events directly; Google events are read-only

### 🧠 Brain Tab
- Persistent second brain: notes and ideas logged via chat
- Tagged automatically by Jarvis
- Searchable, filterable by tag
- Delete entries you no longer need
- Empty state guides you on how to start logging

### 🏃 Marathon Tab
- Live countdown to race day (Lake Maggiore, November 8, 2026)
- Training sessions pulled from Google Calendar (Garmin sync)
- Week-at-a-glance view showing actual run days
- Next session highlighted with date and time
- Google Calendar status indicator

---

## 🏗️ Architecture

This is a **single-file PWA** — no build tools, no Node.js, no npm. One `index.html` deployed on GitHub Pages.

```
index.html          ← The entire app (React via CDN, Babel transpiled in-browser)
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
| Weather | Open-Meteo API (free, no key) |
| FX Rates | Frankfurter API (free, no key) |
| Stock prices | Alpha Vantage API (free tier, 25 req/day) |
| Calendar | Google Calendar API (OAuth 2.0) |
| Storage | localStorage (all data stays on device) |

### Data Flow

```
User types in chat
       ↓
Jarvis (Gemini API) processes with full context
       ↓
Parses [[EVENT:...]] and [[NOTE:...]] tags silently
       ↓
Stores events/notes in localStorage
       ↓
Calendar and Brain tabs read from localStorage + Google Calendar
```

### No backend. No server. No database.

Everything runs in the browser. API keys are stored in `localStorage` on your device only. No data is sent to any third party except the official APIs (Gemini, Alpha Vantage, Google).

---

## 🚀 Setup — Step by Step

### Step 1 — Fork or clone the repo

```
https://github.com/felixpacaud-svg/Jarvis-App
```

Or just download `index.html`, `manifest.json`, and `jarvis-icon.svg`.

### Step 2 — Host on GitHub Pages

1. Create a GitHub repository (e.g. `jarvis-app`)
2. Upload the three files to the repo
3. Go to Settings → Pages → Source: Deploy from branch → main / root
4. Your app is live at `https://YOUR_USERNAME.github.io/jarvis-app/`

No build step. No CI/CD. Just upload and go.

### Step 3 — Get your API keys

#### Gemini API Key (required — for chat and news)
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click "Get API key" → Create API key
3. Copy it. Keep it private.
4. Free tier: generous daily limits. Gemini 2.5 Flash is very cheap (~€1-2/month for personal use)

#### Alpha Vantage Key (optional — for live stock prices)
1. Go to [alphavantage.co](https://www.alphavantage.co)
2. Click "Get your free API key" → fill name + email
3. Free tier: 25 requests/day. Prices are cached for 1 hour so this is plenty for personal use.

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

Open `index.html` and find this line (around line 70):

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
4. Tap "Sign in with Google" to connect your calendar
5. Tap "Save Configuration"

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
  ...
}
```

---

## 🔑 API Reference

### Gemini API
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- **Auth:** API key in URL query parameter
- **Used for:** All chat responses + web search grounding (news queries)
- **Cost:** Very low. Approximately €0.002 per message at Gemini 2.5 Flash pricing
- **Free tier:** Available at aistudio.google.com
- **Rate limits:** None for reasonable personal use

### Alpha Vantage
- **Endpoint:** `https://www.alphavantage.co/query?function=GLOBAL_QUOTE`
- **Auth:** API key in URL query parameter
- **Used for:** Live stock prices (ACN, SPY, IWDA, etc.)
- **Free tier:** 25 requests/day — sufficient because prices are cached for 1 hour
- **Important:** Symbol format matters. Use `ACN` for US stocks, `IWDA.AMS` for Amsterdam-listed ETFs

### Frankfurter API
- **Endpoint:** `https://api.frankfurter.app/latest`
- **Auth:** None required
- **Used for:** CHF/EUR, CHF/USD, USD/EUR live rates
- **Cost:** Free, no registration

### Open-Meteo
- **Endpoint:** `https://api.open-meteo.com/v1/forecast`
- **Auth:** None required
- **Used for:** Live weather (temperature, condition, rain probability)
- **Cost:** Free, no registration

### Google Calendar API
- **Endpoint:** `https://www.googleapis.com/calendar/v3/calendars/primary/events`
- **Auth:** OAuth 2.0 token (user signs in with Google in the app)
- **Used for:** Reading calendar events (next 14 days) + Garmin training sessions
- **Scope:** `https://www.googleapis.com/auth/calendar.readonly` (read-only)
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

Similarly for notes:

```
[[NOTE:{"title":"Christian shared article on AI in logistics","tags":["AI","Work","Christian"],"comment":"Worth reading before next meeting"}]]
```

**Supported phrasings:**
- "log: saw interesting article on AI"
- "remember: Christian mentioned the Mumbai route opens Q3"
- "note: try fasted long runs before the marathon"
- "Mélanie said we need to find a florist"

---

## 🔗 Garmin Integration

Garmin does not offer a public API for direct integration. The workaround (which works perfectly) is:

1. Open **Garmin Connect** app on Android
2. Settings → Connected Apps → **Google Calendar** → Connect
3. All your training sessions sync to Google Calendar automatically
4. Jarvis reads your Google Calendar → training sessions appear in the Marathon tab and the daily briefing

The Marathon tab filters Google Calendar events by keywords: `run`, `running`, `km`, `tempo`, `easy`, `long run`, `interval`, `trail`, `garmin`, `training`, `jog`, `course`, `sortie`, `cardio`.

---

## 🗂️ Local Storage Keys

All data is stored in the browser's `localStorage`. Nothing leaves your device except API calls.

| Key | Contents |
|---|---|
| `j_gk` | Gemini API key |
| `j_ak` | Alpha Vantage API key |
| `j_events` | JSON array of Jarvis-created calendar events |
| `j_brain` | JSON array of brain/note entries |
| `j_portfolio` | JSON array of portfolio holdings |
| `j_prices` | Cached stock prices (1 hour TTL) |

To fully reset the app, clear `localStorage` in Chrome DevTools or reinstall.

---

## 📋 Planned Improvements

- [ ] Gmail read-only integration (inbox triage in morning briefing)
- [ ] Push notifications for 7am / 7pm scheduled briefings
- [ ] Offline mode with service worker
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
