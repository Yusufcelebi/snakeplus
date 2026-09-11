# Snakebound

Snakebound is a browser-first prototype combining **Snake**, **roguelike exploration**, **grid encounters**, and a **deck-builder**.

## Features

- Grid-based Snake movement
- Procedurally selected room types
- Battles and elite encounters
- Portals that advance the floor
- Gold and collectible shards
- Growing snake as a core progression mechanic
- Cards that modify combat and movement
- Card rewards after encounters/portals
- Relic-ready side panel
- Responsive UI
- No framework, build step, backend, or external dependency

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static server.

Example:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy to Netlify

This is a static site. Push the three files to GitHub and import the repository into Netlify.

No build command is required.
Publish directory: `/`

## Next systems to add

- True room/map node generation
- 100+ cards with tags and synergies
- Relics
- Shops
- Boss fights
- Status effects
- Multiple enemy AI patterns
- Save/progression
- Sound and particle effects
- Mobile swipe controls
