# ⚡ Jarvis V2 — Quick Setup

This guide covers the full setup including the new News feed, notifications, and all improvements.

---

## What you'll need

- A GitHub account (free) → github.com
- A Google account
- Your phone

API keys you'll get during setup:
- **Gemini API key** — free, 2 minutes
- **Alpha Vantage key** — free, 2 minutes
- **GNews API key** — free, 2 minutes (NEW — for news feed)
- **Google OAuth Client ID** — free, 5 minutes

---

## Step 1 — Fork & deploy (same as before)

1. Fork `github.com/felixpacaud-svg/Jarvis-App`
2. Settings → Pages → Deploy from branch → main / root
3. Upload both `index.html` and `sw.js` to your repo root
4. Live at `https://YOUR_USERNAME.github.io/Jarvis-App/`

**Important:** The `sw.js` file must be at the repo root alongside `index.html`.

---

## Step 2 — Get your API keys

### Gemini API Key (required — AI brain)
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. "Get API key" → Create API key
3. Copy it

### Alpha Vantage Key (optional — stock prices)
1. Go to [alphavantage.co](https://www.alphavantage.co)
2. "Get your free API key" → fill form
3. Copy it

### GNews API Key (required — news feed) ← NEW
1. Go to [gnews.io](https://gnews.io)
2. Sign up for a free account
3. Go to Dashboard → your API key is displayed
4. Copy it
5. Free tier: 100 requests/day (plenty — news is cached 30 minutes)

### Google Calendar OAuth (optional — calendar + Garmin)
Same as before:
1. console.cloud.google.com → new project "Jarvis"
2. Enable Google Calendar API
3. OAuth consent screen → External → fill details
4. Credentials → OAuth Client ID → Web application
5. Add your GitHub Pages URL as authorized origin
6. Copy Client ID → update `GCID` in code
7. Add your Gmail as test user

---

## Step 3 — Configure & install

1. Open Jarvis on your phone
2. Tap ⚙️ gear icon
3. Paste **Gemini API key**
4. Paste **Alpha Vantage key**
5. Paste **GNews API key** ← NEW
6. Tap **Sign in with Google**
7. Tap **Enable Notifications** ← NEW
8. Tap **Save Configuration**

---

## Step 4 — Enable notifications

When you tap "Enable Notifications" in settings:
- Your browser will ask for permission → tap Allow
- Jarvis will schedule briefings for 7:00 AM and 7:00 PM
- These work when the app is open or in background

### For reliable push notifications (Firebase — optional upgrade)

For notifications that arrive even when the app is closed:

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create project "Jarvis"
3. Project Settings → Cloud Messaging → enable
4. Project Settings → General → Add web app → get config
5. Deploy a Cloud Function for scheduled sends (see `firebase-functions/` in repo)

This is an advanced setup. The local notifications work well for most use cases.

---

## New features in V2

### 📰 News Tab
- Live headlines from GNews API
- Categories: Breaking, World, Markets, Tech, Middle East, Ukraine, Science
- Tap any article to open in browser
- Hero card for top story, compact list for rest
- Cached 30 minutes to save API calls

### 📅 Calendar (rebuilt)
- Shows today + 7 days by default
- Navigate forward AND backward by week to see future or past events
- Tap any date to see its events
- "Today" button to jump back to current week
- Dot indicators on days with events
- Upcoming events preview below the selected day
- Google Calendar fetches 30 days of history + 60 days ahead

### 💬 Chat (enhanced)
- Longer, more detailed responses (token limit 600 → 2048)
- Source links displayed below answers (from Gemini grounded search)
- "Save to Brain" button on any assistant message
- Brain context included in system prompt (Jarvis remembers your notes)
- **Auto-memory**: Jarvis detects things worth remembering and saves them automatically — no need to say "remember" or "log"

### 🔔 Notifications
- 7:00 AM / 7:00 PM briefing notifications
- Works via Service Worker when app is in background
- Weather summary in morning notification

### 💱 FX Rates (fixed + redesigned)
- Dual API: Frankfurter (primary) + ExchangeRate API (fallback)
- Cached 30 minutes in localStorage
- Prominent vertical layout with flag indicators (🇨🇭→🇪🇺)
- "Last updated" timestamp displayed
- Animated loading state instead of flat text
- Won't show "Loading..." forever anymore

### 📋 Brief Tab (enhanced)
- Now includes top 5 breaking news headlines at the bottom
- FX rates section redesigned with better visibility
- All existing sections preserved (weather, schedule, markets)

### 🔐 Google Login (persistent)
- Token saved in localStorage
- Auto-reconnects on app reload (within token lifetime)
- Silent re-auth when token expires
- No more manual sign-in every time

### 🧠 Brain (improved)
- **Auto-memory**: Jarvis detects and saves things worth remembering without being asked
- Triggers on: someone shared something, decisions, insights, Mélanie said X, new info about people/work
- Stronger system prompt for consistent note saving
- "Save to Brain" button in chat
- Brain entries included in AI context
- Hint text about saving from chat

---

## Troubleshooting

**News tab shows "Add a GNews API key"**
→ Paste your GNews key in ⚙️ settings

**Notifications not arriving**
→ Check browser permissions: Chrome → Site settings → Notifications → Allow
→ On Samsung, also check: Settings → Apps → Chrome → Notifications → Allow

**FX rates showing "Loading..."**
→ Both APIs might be temporarily down. Cached rates will show if previously loaded.

**Google Calendar disconnects**
→ Token expires after ~1 hour. The app tries silent re-auth. If it fails, tap ⚙️ → Sign in again (one tap).

**Chat responses still short**
→ Clear your browser cache to ensure the new code is loaded. The updated system prompt and token limit should give longer responses.

---

## Files in repo

```
index.html          ← The entire app (updated V2)
sw.js               ← Service Worker (notifications + offline)
manifest.json       ← PWA manifest
jarvis-icon.svg     ← Home screen icon
```
