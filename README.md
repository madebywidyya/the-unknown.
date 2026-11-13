# THE UNKNOWN — Enter the Unexplored

A complete cinematic interactive mystery investigation website.

## Overview

THE UNKNOWN is a fictional digital investigation archive. Players explore classified case files, collect evidence, solve logic and cipher challenges, unlock locations on a hidden world map, use a secret terminal, and track progression through XP, levels, and achievements.

All stories and cases are original fiction created for entertainment and critical-thinking practice.

## Features

- Cinematic dark detective landing page
- Player dashboard with live progress (XP, level, activity, achievements)
- Case archive with filtering (open / in progress / completed / locked)
- Interactive case detail pages with chapters, objectives, evidence discovery, and theory notes
- Evidence Room inventory
- Mystery Challenges (logic, observation, cipher, pattern) with hints and XP
- Investigation Board for organizing clues and theories
- Hidden World Map with unlockable locations
- Secret Terminal with commands (HELP, STATUS, ACCESS TRACE, etc.)
- Collection Room and Explorer Profile
- Full LocalStorage save system (progress persists across refreshes)
- Responsive design (mobile → desktop)
- Accessibility considerations (semantic HTML, focus states, reduced-motion support)

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- JSON data files
- LocalStorage for persistence
- No backend, no build step required
- Ready for GitHub Pages

## How to Run Locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser (Chrome, Firefox, Edge, Safari).
3. Or serve the folder with any static server, e.g.:
   ```
   npx serve .
   ```
4. Google Fonts require internet; system fallbacks are defined.

## GitHub Pages Deployment

1. Create a new GitHub repository.
2. Upload all files from this folder (keep the structure).
3. Go to Settings → Pages.
4. Source: Deploy from a branch → `main` (or `master`) → `/ (root)`.
5. Save. Your site will be available at `https://<username>.github.io/<repo>/`.

Use relative paths (already configured). No server-side routing is used.

## Project Structure

```
THE-UNKNOWN/
├── index.html              # Landing
├── dashboard.html
├── cases.html
├── case-detail.html
├── evidence.html
├── challenges.html
├── investigation-board.html
├── profile.html
├── map.html
├── terminal.html
├── collection.html
├── about.html
├── css/
│   ├── global.css
│   ├── landing.css
│   ├── dashboard.css
│   └── investigation.css
├── js/
│   ├── storage.js          # LocalStorage core
│   ├── progression.js      # XP, levels, achievements
│   ├── navigation.js
│   ├── landing.js
│   ├── dashboard.js
│   ├── cases.js
│   ├── case-detail.js
│   └── challenges.js
├── data/
│   ├── cases.json
│   ├── evidence.json
│   ├── challenges.json
│   └── locations.json
├── assets/                 # Place custom images here if desired
└── README.md
```

## Sample Cases

1. **The Vanishing Hour** — Logic / observation (Beginner)
2. **Letters from Nowhere** — Pattern / cipher (Intermediate)
3. **The Empty Photograph** — Observation (Intermediate)
4. **The Silent Frequency** — Pattern (Advanced, unlockable)
5. **The Last Catalogue** — Logic (Advanced, unlockable)

## Progress & Reset

Progress is saved automatically in the browser. To reset everything, open the Profile page and use “Reset All Progress”, or clear the site’s LocalStorage key `the_unknown_save_v1`.

## Notes

- Stage 1 visual identity (colors, typography, atmosphere) is preserved and extended.
- Image placeholders use CSS gradients and icons; replace with real photographs in `assets/images/` and update paths in the JSON if desired.
- All content is fictional and suitable for a general audience.

---

© 2026 THE UNKNOWN ARCHIVE — All cases fictional.
