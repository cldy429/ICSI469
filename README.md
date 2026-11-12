# NAADAM / Эрийн гурван наадам

A responsive web app about the Mongolian Naadam festival: wrestling, horse racing and archery. It uses real photos, real champion facts, an interactive Naadam field and a simulated live view. **All bout results, win chances, race data and scores are simulated demo data.** The site does not show official live Naadam results.

## Run

Requires Node.js 18+. No `npm install` is needed.

```bash
npm start   # эсвэл: node server/server.mjs
```

Open **http://localhost:4173**. The server serves the site and provides:

- `GET /api/events`: a real Server-Sent Events stream with simulated race telemetry, about every 1.2 seconds.
- `GET /api/wrestling/events`: one minute of positions for 16 wrestlers in eight simultaneous bouts, streamed once per second. Optional `red` and `blue` parameters select the first pair using distinct indexes in `LEGENDS`.
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
js/field.js         SVG views: Naadam stadium, race route map, Khalkh archery sur wall
js/wrestling.js     wrestling replay, live telemetry and fullscreen controls
js/wrestling-demo.js shared one-minute dummy positions for the server and local playback
js/live.js          photo hero, profiles + win chance, celebration, Live page, comments, subscription
js/data.js          champion facts (title path, sum/aimag wins), 2026 State Naadam results, photo credits
js/i18n.js          MN / EN / RU / JA / KO texts
js/theme.js, js/splash.js
server/server.mjs   dependency-free Node server
```

## Screens

- **Home:** photo hero with a countdown, legendary champions, the 2026 State Naadam summary, fan comments and subscription plans.
- **Wrestling:** a full-viewport overhead stadium automatically loops a one-minute demo of eight simultaneous bouts. Each pair stays in its own area and remains connected by a line, with a lightning effect during grappling. The crowd meter runs from 1 to 5. More spectators stand up to clap, shout and raise their hands as the level rises. Named markers vary in size, color and symbol by rank. Tap either wrestler to open the pair's titles, coordinates and bout phase in the lower-right panel. Tap a champion's name in the panel to open their profile. The bracket and 2026 State Naadam summary are below the stadium.
- **Racing:** a steppe route map from the start to the finish. Horse dots move with the stream; tap a dot or a leaderboard row to follow a horse. A finish podium appears at the end.
- **Archery:** Khalkh archery seen from behind the archer. Six fictional archers (men from 75 m, women from 65 m) shoot 4 arrows per round for 4 rounds at a wall of 30 sur. A hit knocks a sur off, the judges raise their arms and call "Uukhai!". The panel shows the round, wind, the current archer's arrows and the ranking by hits. Below it is a guide to the Khalkh, Uriankhai and Buryat styles and the archer titles.
- **Live:** a simulated broadcast with Wrestling / Racing / Archery tabs, a LIVE badge and timer, a scoreboard, a play-by-play log and a live chat. The "Live үзэх" button in a wrestler's profile opens this page and follows that wrestler. A link points to the national broadcaster (mnb.mn) for the real Naadam stream.

## Controls

- Navbar: Нүүр, Бөх, Морь, Сур харваа, Live. Language and theme switches are on the right.
- Wrestling: the bout panel includes replay, fullscreen and close controls. "Дараагийн барилдаан" advances the bracket and places its next pair in the first bout. On the Live page, "Барилдааныг эхлүүлэх" plays the short broadcast animation first.
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

The wrestling stream starts at `second: 0`, sends one frame per second and closes after `second: 60`. Each frame contains eight entries in `bouts`, each with its own `phase` and two wrestlers. Positions are percentages on the stadium map, with X increasing right and Y increasing down in the landscape view. Use `phase: "grapple"` to show contact for that pair. Each frame also contains `crowd`, for example `{"level":5,"event":"win","chant":"Далайцэрэн давсааан"}`. The level is an integer from 1 to 5. The event can be `"move"`, `"win"` or `null` for the usual crowd level. During a level-5 win, an optional `chant` moves between two or three randomly selected spectators. If the stream is unavailable, the browser plays the same sample frames locally. An example `bouts` entry is shown below.

```json
{"phase":"grapple","wrestlers":[{"id":0,"x":7.5,"y":32},{"id":1,"x":14.5,"y":24.9}]}
```

Check data rights, official timing and scoring rules before using real results.
