# NAADAM / 3D Live Experience

Premium, responsive Mongolian heritage web application prototype. **All competition data is fictional / simulated demo data.** The site does not claim to show official live Naadam results.

## Run

Requires Node.js 18+ and Internet access for the Three.js ESM module and optional Noto fonts.

```bash
node server.mjs
```

Open **http://localhost:4173** in Chrome or another WebGL-capable browser. The demo server provides an **actual SSE streaming connection** (`GET /api/events`), sending simulated racing telemetry about every 1.2 seconds. No npm install is necessary.

You can also open `index.html` directly for local state simulation, but most browsers restrict cross-origin module imports from `file://` URLs. Running the server is recommended.

## Screens
- Home: cinematic Mongolian heritage design with animated ornament, hero art, three sport navigation cards.
- Wrestling: procedurally constructed 3D wrestling arena (rotate / zoom), step-through fictional bracket.
- Racing: procedurally constructed 3D horses, riders, track, finish posts, flags and leaderboard synced to simulated streamed telemetry; pause/resume, camera reset, age filters.
- Archery: 3D target, animated arrow trajectories, fictional scoring, reset.

## Tech

Vanilla JS / ES modules, WebGL via Three.js v0.186.1 loaded from pinned jsDelivr CDN, CSS transitions & animation, Node.js HTTP + Server-Sent Events. No build tool or database required for this prototype.

## Connecting actual event data

Replace simulated `eventPacket()` in `server.mjs` with a validated, authorized data feed; normalize to the existing JSON shape:

```json
{
  "type": "race",
  "demo": false,
  "horses": [
    {"progress": 38.5, "speed": 51.2},
    {"progress": 37.9, "speed": 49.3}
  ]
}
```

**Before production:** verify event provenance and authorized rights, age category, official timing, and schema semantics. The frontend presently accepts SSE only for the Azarga demo mode; other categories remain local fictional simulations. Authentication, persistence, automated tests, validation, official race feeds and real-world scoring rules are out of scope for this visual prototype.

## Controls

- Navbar: switch between sport pages.
- 3D canvas: pointer drag to orbit; mouse wheel to zoom; reset button restores camera.
- Racing: pause/resume streaming visualization, select racer, select simulated age category.
- Wrestling: advance fictional match results, reset bracket.
- Archery: shoot a simulated arrow, reset scores.
- UI includes reduced-motion CSS; WebGL effects are lightweight procedural geometry.
