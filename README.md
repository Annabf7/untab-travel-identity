# UNTAB Travel Identity

Frontend web experience that generates a personalized travel identity card based on a multi-step form.

## What it does

The user answers a series of questions about their travel preferences. The system scores their responses across four axes — **Exploración, Cultura, Placer, Calma** — and generates a visual card (1080×1350 px) with their travel profile: dominant axis, traveler tribe, micro DNA, and desired destination.

## Stack

- HTML / CSS / Vanilla JavaScript
- [p5.js](https://p5js.org/) — canvas card render
- [Baserow](https://baserow.io/) — external data source (scoring rules, tribes, micro DNA)
- Netlify — deploy target

## Project structure

```
untab-travel-identity/
├── index.html
├── styles.css
├── app.js                  # Orchestration
├── config.example.js       # Token template (copy as config.js)
├── data/
│   ├── scoring.js          # Mock scoring rules + calculateAxes()
│   ├── tribes.js           # Mock tribe mappings
│   ├── dna.js              # Mock micro DNA mappings
│   ├── baserow.js          # Baserow adapter (mock/live toggle)
│   └── profile.js          # Profile builder
├── ui/
│   ├── form.js             # Multi-step form
│   └── result.js           # Result view
└── render/
    └── card.js             # p5.js card renderer
```

## Local setup

1. Clone the repo
2. Copy `config.example.js` to `config.js` and add your Baserow token:
   ```js
   const CONFIG = {
     BASEROW_TOKEN: 'your-token-here',
   };
   ```
3. Open `index.html` in a browser (or use a local server)

> `config.js` is listed in `.gitignore` and will never be committed.

## Data source toggle

In `data/baserow.js`, set `USE_BASEROW` to switch between live data and local mock:

```js
const USE_BASEROW = true;  // fetch from Baserow
const USE_BASEROW = false; // use local mock data
```

## Scoring questions

| Form field | Question slug | Type |
|---|---|---|
| q4 | `sensacion_mejores_viajes` | single |
| q5 | `entorno_preferido` | multi (max 2) |
| q6 | `ritmo_viaje` | single |
| q7 | `evitar_en_viaje` | multi (max 2) |
