# 🎨 Customising Jarvis

Everything in Jarvis is controlled by a single `index.html` file. This guide walks through every customisation point.

---

## Your Personal Context (Most Important)

This is what makes Jarvis actually useful vs generic. Find the `getSYS()` function in `index.html` and rewrite the paragraph that describes you.

**Current (Felix's profile):**
```
Felix: Network financial analyst at MSC Air Cargo, Geneva. French resident, 
Massongy 74140. Engaged to Mélanie. Commutes ~45min to Chêne-Bougerie...
```

**Replace with your own details. Include:**
- Your name and what you call yourself ("sir", or change to your name)
- Your job and company
- Your city and where you live
- Your partner / family situation
- Your key investments and financial focus
- Any personal goals (race, project, etc.)
- What news topics matter to you
- Any tendencies you want Jarvis to help with (forgetting things, staying organised, etc.)

The system prompt is sent with every message, so Gemini always has your context.

---

## Race / Goal Countdown

In the main `Jarvis()` function, change the date:

```javascript
const dtr = Math.ceil((new Date('2026-11-08') - time) / 864e5);
```

Change `2026-11-08` to your target date.

Also update the display label in the `RunTab` function:
```javascript
LAKE MAGGIORE · NOVEMBER 8
```

And update the goal pace / target time in RunTab's countdown card:
```javascript
{[{ l: 'GOAL', v: '3h 45' }, { l: 'PACE NEEDED', v: '5:20/km' }]
```

---

## Portfolio Holdings

The default holdings load from `loadPortfolio()`. Clear them in the Finance tab (tap each holding → delete) and add your own, or edit the defaults:

```javascript
const loadPortfolio = () => sto.getJSON('j_portfolio', [
  { id: 1, name: 'Accenture', symbol: 'ACN', units: 0, costBasis: 0 },
  { id: 2, name: 'iShares MSCI World', symbol: 'IWDA.AMS', units: 0, costBasis: 0 },
  { id: 3, name: 'SPDR S&P 500', symbol: 'SPY', units: 0, costBasis: 0 },
]);
```

**Symbol format for Alpha Vantage:**
- US stocks: `AAPL`, `ACN`, `MSFT`
- European ETFs: `IWDA.AMS` (Amsterdam), `CSX5.PAR` (Paris)
- Gold: `GLD` (ETF) or use as manual entry without live price

---

## Weather Location

Change the latitude/longitude in `fetchWeather()`:

```javascript
const res = await fetch(
  'https://api.open-meteo.com/v1/forecast?latitude=46.2044&longitude=6.1432&...'
);
```

Find your coordinates at [open-meteo.com](https://open-meteo.com).

Also update the display label in `BriefTab`:
```javascript
Massongy → Chêne-Bougerie · ~47 min standard
```

---

## Google OAuth Client ID

If you forked the repo, you need your own OAuth Client ID (the original one only works for Felix's domain). See Step 5-6 in SETUP.md.

Find and replace:
```javascript
const GCID = '1022045416372-q8dcqrmpoc7nuc32vuiom5bbdrtcnsak.apps.googleusercontent.com';
```

---

## Colour Scheme

All colours are CSS variables. Find this block at the top of the `CSS` constant:

```javascript
:root {
  --bg:#0a0507;        /* Deepest background — near black */
  --bg2:#180a0c;       /* Card background */
  --bg3:#241417;       /* Elevated elements */
  --bg4:#2e1a1e;       /* Hovered elements */
  --red:#e63946;       /* Primary accent (currently Iron Man red) */
  --redHot:#ff4757;    /* Brighter red for highlights */
  --gold:#ffb400;      /* Secondary accent (currently Iron Man gold) */
  --goldBright:#ffd447;
  --gn:#22c55e;        /* Green for positive values */
  --t:#fff0e0;         /* Primary text */
  --t2:#f0c49a;        /* Secondary text */
  --t3:#a08876;        /* Muted text */
  --t4:#604838;        /* Very muted / disabled */
}
```

**Example alternative themes:**

Blue/silver (JARVIS classic):
```css
--red:#0af; --redHot:#00cfff; --gold:#c0c0ff; --bg:#050a18; --bg2:#0a1428;
```

Green/amber (terminal):
```css
--red:#00ff41; --gold:#ffb000; --bg:#000; --bg2:#0a0f00;
```

---

## Fonts

Three fonts are loaded from Google Fonts:
- **Rajdhani** — headers and labels (futuristic, technical feel)
- **Exo 2** — body text (clean, readable)
- **JetBrains Mono** — numbers and codes (monospace precision)

To change, find this line in `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Rajdhani...
```

And update the `--hd`, `--bd`, `--mn` CSS variables.

---

## Training/Running Keywords

The Marathon tab filters Google Calendar events by these keywords to identify running sessions:

```javascript
const keywords = ['run','running','km','tempo','easy','long run','interval',
  'trail','garmin','training','jog','course','sortie','cardio'];
```

Add your own keywords (e.g. your language, your training type names).

---

## Chat Quick-Action Pills

The suggested taps shown above the chat input:

```javascript
{['Dinner tonight 20:00', 'Middle East news', 'Add doctor Tuesday 10am', 
  'Log: interesting idea...'].map((p,i) => ...
```

Replace with whatever you type most often.

---

## App Name and Icon

**Name:** Change `Jarvis` in:
- `<title>Jarvis</title>` in the HTML head
- `"name": "Jarvis"` and `"short_name": "Jarvis"` in `manifest.json`
- The header title in `Jarvis()` function: `<div className="hdr-t">Jarvis</div>`
- The `"J"` letter in the header logo

**Icon:** Replace `jarvis-icon.svg` with your own SVG. Keep the same filename or update `manifest.json` to point to the new file.
