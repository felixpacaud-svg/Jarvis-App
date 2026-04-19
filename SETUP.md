# ⚡ Jarvis — Quick Setup (10 minutes)

This guide assumes you have a GitHub account and a Samsung/Android phone. No coding required.

---

## What you'll need

- A GitHub account (free) → github.com
- A Google account (you already have one)
- Your phone

API keys you'll get during setup:
- **Gemini API key** — free, takes 2 minutes
- **Alpha Vantage key** — free, takes 2 minutes  
- **Google OAuth Client ID** — free, takes 5 minutes

---

## Step 1 — Fork the repository

1. Go to: **github.com/felixpacaud-svg/Jarvis-App**
2. Tap the **Fork** button (top right)
3. Tap **Create fork**

You now have your own copy at `github.com/YOUR_USERNAME/Jarvis-App`

---

## Step 2 — Enable GitHub Pages

1. In your forked repo, tap **Settings**
2. In the left sidebar, tap **Pages**
3. Under Source: select **Deploy from a branch**
4. Branch: **main** · Folder: **/ (root)** → tap Save
5. Wait 2 minutes. Your app will be live at:
   `https://YOUR_USERNAME.github.io/Jarvis-App/`

---

## Step 3 — Get your Gemini API key

1. Go to: **aistudio.google.com**
2. Sign in with your Google account
3. Tap **"Get API key"** → **Create API key**
4. Copy the key → save it somewhere (Notes app is fine)

---

## Step 4 — Get your Alpha Vantage key

1. Go to: **alphavantage.co**
2. Tap **"Get your free API key"**
3. Fill in your name and email
4. Copy the key → save it

---

## Step 5 — Set up Google Calendar access

1. Go to: **console.cloud.google.com** (sign in with your Google account)
2. Tap **"Select a project"** → **"NEW PROJECT"** → name it **Jarvis** → Create
3. Tap **☰ menu** → **APIs & Services** → **Library**
4. Search **Google Calendar API** → tap it → tap **ENABLE**
5. Tap **☰** → **APIs & Services** → **OAuth consent screen**
6. Select **External** → Create
7. Fill in: App name = **Jarvis**, Support email = your Gmail → Save and Continue × 3
8. Tap **☰** → **APIs & Services** → **Credentials**
9. Tap **+ Create Credentials** → **OAuth Client ID** → **Web application**
10. Name: **Jarvis Web**
11. Under "Authorised JavaScript origins" → Add URI → paste: `https://YOUR_USERNAME.github.io`
12. Tap Create → copy the **Client ID** (looks like `123456789-abc.apps.googleusercontent.com`)
13. Go back to **OAuth consent screen** → scroll to **Test users** → Add your Gmail → Save

---

## Step 6 — Add your Client ID to the code

1. In your GitHub repo, tap **index.html**
2. Tap the **pencil ✏️** edit icon
3. Press **Ctrl+F** (or use the browser search) → search for: `GCID`
4. You'll find this line:
   ```
   const GCID = '1022045416372-q8dcqrmpoc7nuc32vuiom5bbdrtcnsak.apps.googleusercontent.com';
   ```
5. Replace the value inside the quotes with **your own Client ID**
6. Scroll down → **Commit changes** → Commit directly to main

---

## Step 7 — Customise for yourself

In `index.html`, find the `getSYS()` function (search for "getSYS"). You'll see:

```
Felix: Network financial analyst at MSC Air Cargo, Geneva...
```

Replace Felix's details with your own: your name, job, city, interests, investments, partner's name, goals. This is what makes Jarvis know about your life. The more you put here, the better it works.

---

## Step 8 — Install on your phone

1. Open **Chrome** on your Android phone
2. Go to: `https://YOUR_USERNAME.github.io/Jarvis-App/`
3. Tap the **three dots** (top right) → **"Add to Home screen"** → **Install**
4. Jarvis is now on your home screen

---

## Step 9 — Add your API keys in the app

1. Open Jarvis on your phone
2. Tap the **⚙️ gear icon** (top right of the header)
3. Paste your **Gemini API key**
4. Paste your **Alpha Vantage key**
5. Tap **"Sign in with Google"** → sign in → approve access
6. Tap **Save Configuration**

The status dot in the header turns **green** when you're connected.

---

## Step 10 — Sync Garmin (optional)

If you use a Garmin watch:

1. Open **Garmin Connect** on your phone
2. Settings → Connected Apps → **Google Calendar** → Connect
3. Done. Your training sessions now appear in Jarvis's Marathon tab and daily briefing.

---

## You're done! Try these first

Once set up, try saying these in the Chat tab:

- **"What's my schedule today?"**
- **"Dinner with [name] tonight at 20:00"** → watch it appear in the Calendar tab
- **"What's happening in the world today?"**
- **"How is the market doing?"**
- **"Remember: [someone] told me about [something]"** → logged in Brain tab
- **"Log: interesting idea about [topic]"**

---

## Troubleshooting

**"OFFLINE" shown in header**
→ Your Gemini API key is missing. Tap ⚙️ and paste it.

**Calendar tab shows "NO EVENTS"**
→ Either no events in the next 14 days, or Google not connected. Tap ⚙️ → Sign in with Google.

**"Error 403: access_denied" when signing into Google**
→ You haven't added your Gmail as a test user. Go to Google Cloud Console → APIs & Services → OAuth consent screen → Test users → add your Gmail.

**Stock prices showing "..."**
→ Alpha Vantage key missing, or daily limit reached (25/day free). Prices cache for 1 hour so this is usually fine.

**Chat gives generic answers (doesn't know about you)**
→ You haven't updated the system prompt in `getSYS()`. Follow Step 7 above.

**White screen on load**
→ Clear browser cache on your phone and reload.

---

*For more detail, see the full [README.md](README.md)*
