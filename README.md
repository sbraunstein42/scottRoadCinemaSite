# Scott Road Cinema

Free outdoor movies in the side yard at 54 Scott Road, Cumberland, RI.  
Double features every last Saturday of the month, May through August 2026.

**2026 Theme: Neighborhood Heroes**

---

## Editing the Site

All text on the site — movie titles, descriptions, times, links, rules, blurbs, button labels, the address, everything — lives in one file:

### `content.json`

Open it in any text editor and change whatever you like. No coding required.

| Section in `content.json` | Controls |
|---|---|
| `site` | Site title, address, 2026 theme line |
| `home.blurbs` | Rotating Minecraft-style splash quotes |
| `home.tagline` | Subtitle under the logo |
| `schedule.screenings` | Each night's movies (title, year, rating, runtime, times, links) |
| `schedule.shorts` | Short films shown before each feature |
| `schedule.musicVideos` | Pre-show music video playlists |
| `howto.rules` | House rules — icon, title, and description for each |
| `rsvp` | Mailing list URL, Google Form URL, and all the copy |

### Updating RSVP links

Find these two fields in the `rsvp` section and replace `"#"` with the real URLs:

```json
"mailingListUrl": "https://your-mailchimp-or-whatever-link.com",
"rsvpUrl":        "https://docs.google.com/forms/..."
```

### Updating the movie schedule

Each screening follows this shape:

```json
{
  "date": "May 30, 2026",
  "dusk": "~8:30 PM",
  "kids": {
    "title": "The Iron Giant",
    "year": 1999,
    "rating": "PG",
    "runtime": "86 min",
    "startTime": "~8:40 PM",
    "endTime": "~10:06 PM",
    "imdb": "https://www.imdb.com/title/tt0129167/",
    "csm":  "https://www.commonsensemedia.org/movie-reviews/the-iron-giant",
    "description": "One-sentence description of the film."
  },
  "adults": { ... }
}
```

---

## Running Locally

The site fetches `content.json` at runtime, so it needs a local web server (not opened as a plain file).

**Node (recommended):**
```bash
npx serve .
```

**Python:**
```bash
python -m http.server 8000
```

Then open `http://localhost:3000` (or whatever port is shown) in your browser.

---

## How the site works

| Feature | Details |
|---|---|
| Navigation | Four sections — Home, Schedule, How does it work?, RSVP — laid out in a 2×2 grid. Clicking a nav button pans to it smoothly. |
| Panning | Home is top-left, Schedule is top-right, Rules is bottom-left, RSVP is bottom-right. |
| Swipe | On mobile, swipe left/right/up/down to navigate between sections. |
| Arrow keys | Desktop keyboard navigation with arrow keys. |
| Splash text | Rotating Minecraft-style diagonal blurb on the home screen, cycling through `home.blurbs` every 5 seconds. |
| Star field | 180 randomly placed stars with staggered twinkle animations. |
| Film grain | Very subtle CSS noise overlay for atmosphere. |

---

## File structure

```
scottRoadCinemaSite/
├── index.html      — page skeleton (minimal HTML)
├── styles.css      — all styling
├── script.js       — navigation, content rendering, animations
├── content.json    ← edit this to update all site text
├── images/
│   └── logo.png    — the Scott Road Cinema pixel-art logo
└── README.md
```

---

## Deployment

This is a plain static site — no build step, no dependencies. Drop the folder on any static host:

- **GitHub Pages** — push to a repo, enable Pages in Settings
- **Netlify / Vercel** — drag and drop the folder
- **Any web host** — upload via FTP

---

*Scott Road Cinema · Cumberland, RI · Free outdoor movies since 2026*
