# NAADAM / Эрийн гурван наадам

A responsive web app about the Mongolian Naadam festival: wrestling, horse racing and archery. It uses real photos, real champion facts, an interactive Naadam field and a simulated live view. **All bout results, win chances, race data and scores are simulated demo data.** The site does not show official live Naadam results.

## Run

Requires Node.js 18+. No `npm install` is needed.

```bash
npm start   # эсвэл: node server/server.mjs
```

Open **http://localhost:4173**. The server serves the site and provides:

- `GET /api/events`: a real Server-Sent Events stream with simulated race telemetry, about every 1.2 seconds.
- `GET/POST /api/comments`: viewer comments, with likes, by topic (`home`, `wrestling`, `racing`, `archery`, `live`).
- `POST /api/subscribe`: the subscription form.

Saved data lives in `server/data/` (git-ignored and never served). Photos are loaded from Wikimedia Commons, so an Internet connection is needed to see them.

## Folders

```
index.html          page skeleton
css/styles.css      base layout
css/extras.css      splash, language menu, light/dark theme
css/live.css        photo design, field views, Live page, profiles, comments, subscription
js/app.js           routing and the simulations (bracket, race, archery); emits naadam:* events
js/field.js         SVG views: Naadam wrestling field, race route map, Khalkh archery sur wall
js/live.js          photo hero, profiles + win chance, celebration, Live page, comments, subscription
js/data.js          champion facts (title path, sum/aimag wins), 2026 State Naadam results, photo credits
js/i18n.js          MN / EN / RU / JA / KO texts
js/theme.js, js/splash.js
server/server.mjs   dependency-free Node server
```

## Screens

- **Home:** photo hero with a countdown, legendary champions, the 2026 State Naadam summary, fan comments and subscription plans.
- **Wrestling:** a drawing of the Naadam field (stands, judges' tribune, the nine white banners, gers) with the eight champions as dots. The current bout moves to the centre and eliminated wrestlers step aside. Tap a dot to open the wrestler's profile: birth year and home sum, the title path from sum and aimag Naadams to state titles, awards, a photo when a free-licensed one exists, and the simulated win chance for the next bout. Below the field is the 2026 State Naadam summary (1024 wrestlers, champion B. Orkhonbayar, titles awarded).
- **Racing:** a steppe route map from the start to the finish. Horse dots move with the stream; tap a dot or a leaderboard row to follow a horse. A finish podium appears at the end.
- **Archery:** Khalkh archery seen from behind the archer. Six fictional archers (men from 75 m, women from 65 m) shoot 4 arrows per round for 4 rounds at a wall of 30 sur. A hit knocks a sur off, the judges raise their arms and call "Uukhai!". The panel shows the round, wind, the current archer's arrows and the ranking by hits. Below it is a guide to the Khalkh, Uriankhai and Buryat styles and the archer titles.
- **Live:** a simulated broadcast with Wrestling / Racing / Archery tabs, a LIVE badge and timer, a scoreboard, a play-by-play log and a live chat. The "Live үзэх" button in a wrestler's profile opens this page and follows that wrestler. A link points to the national broadcaster (mnb.mn) for the real Naadam stream.

## Controls

- Navbar: Нүүр, Бөх, Морь, Сур харваа, Live. Language and theme switches are on the right.
- Wrestling: "Дараагийн барилдаан" advances the bracket; on the Live page "Барилдааныг эхлүүлэх" plays the bout first.
- Racing: pause/resume, select a horse, choose an age class.
- Archery: men / women, shoot one arrow, shoot a whole round, reset.
- Sound button turns on the synthesized crowd, hoof and arrow sounds.

## Tech

Vanilla JS ES modules, inline SVG with CSS transitions, WebAudio, Node.js HTTP + Server-Sent Events. No build tool, framework or database.

## Sources

Champion facts and the 2026 results: Mongolian Wikipedia pages of each wrestler and "2026 оны улсын наадмын бөх барилдаан"; [Wikipedia, Mongolian wrestling](https://en.wikipedia.org/wiki/Mongolian_wrestling). Archery rules: [mn.wikipedia, Сур харваа](https://mn.wikipedia.org/wiki/Сур_харваа) and [enaadam.mn](https://enaadam.mn/about/national-sport/archery). The archers in the archery game are fictional. Photos: Wikimedia Commons, with author and license shown on the page.

## Connecting real event data

Replace the simulated `eventPacket()` in `server/server.mjs` with an authorized data feed in the same JSON shape:

```json
{"type": "race", "demo": false, "horses": [{"progress": 38.5, "speed": 51.2}]}
```

Check data rights, official timing and scoring rules before using real results.
