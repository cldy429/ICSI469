# NAADAM / Эрийн гурван наадам

A responsive web app about the Mongolian Naadam festival: wrestling, horse racing and archery. It uses real photos, real champion facts, an interactive Naadam field and a simulated live view. **All bout results, win chances, race data and scores are simulated demo data.** The site does not show official live Naadam results.

## Run locally

Requires Node.js 22+.

Run these commands from the repository root:

```bash
npm --prefix naadam-api ci
npm --prefix naadam-front ci
npm run dev
```

Open the frontend URL printed by Wrangler, usually **http://localhost:8787**. If another process already uses that port, Wrangler prints the next available port. Both Workers run together. To run only the backend, use `npm --prefix naadam-api run dev`.

The frontend serves the site and forwards `/api/*` requests through its `API` service binding to `naadam-api`. The browser uses the same origin for assets and API requests.

The API provides:

- `GET /api/health`: backend health.
- `GET /api/wrestlers`: paginated summaries of the 512 database registrations (`limit` up to 64, `offset`, optional `level=state|aimag|sum`).
- `GET /api/wrestlers?featured=1`: the nine existing champion summaries and festival metadata used on the home page.
- `GET /api/wrestlers?details=1&ids=0,1,2`: full profiles for up to 32 IDs, used to prepare field participants.
- `GET /api/wrestlers/:id`: one full profile, with IDs from 0 to 511.
- `GET /api/events`: shared race telemetry every 1.2 seconds and live comment/like events.
- `GET /api/wrestling/events`: one minute of positions for 16 wrestlers in eight simultaneous bouts, streamed once per second. Optional `red` and `blue` parameters select the first pair using two distinct IDs from 0 to 511.
- `GET/POST /api/comments`: viewer comments by topic (`home`, `wrestling`, `racing`, `archery`, `live`).
- `POST /api/comments/:id/like`: increment a comment's likes.
- `POST /api/subscribe`: save or update a demo subscription.

Wrestler profiles, comments, likes and subscriptions persist in a SQLite-backed Durable Object named `NaadamRoom`. All viewers use the same room. Local data lives in `naadam-api/.wrangler/` and is separate from deployed data. Photos are loaded from Wikimedia Commons.

Every page shows all recent comments by default, including general comments posted on the home page. The comment panel offers an explicit topic filter and keeps the topic badge on each entry. Successful submissions appear immediately and stay visible if an older refresh response arrives afterward.

## Wrestler database and preparation

The `wrestlers` SQL table contains exactly 512 registrations with stable numeric IDs (`0`–`511`). The original nine champion profiles and seven fictional stadium participants keep their IDs. Another 496 fictional wrestlers provide a mixture of state, aimag and sum titles. Fictional profiles are marked `isDemo: true` and labelled as demo wrestlers in the profile drawer. The existing champion facts are carried over from the project; this roster is a teaching dataset across different eras, not an official tournament entry list.

`naadam-api/data/wrestlers.json` is the backend-only initial seed. `src/wrestlers.js` creates the table and inserts the 512 rows in a single transaction on the first database request. A `wrestlers-v1` entry in `schema_migrations` prevents subsequent restarts and deployments from replacing stored records. Existing comments and subscribers are preserved. There is no additional Cloudflare binding or manual database setup: deploying the updated backend is enough. Changes to the seed file after initialization require an explicit data migration; normal reads always use SQL, not the seed.

The frontend no longer stores profiles in `data.js`. On startup it fetches nine small summaries for the existing home page and bracket. When a wrestling field becomes active, it prepares the 16 participants' full profiles in a batch before showing their markers. If the stream introduces a new participant ID, that participant is prepared before its marker changes. Requests for the same ID share in-flight work; full profiles stay in memory for five minutes, and cached clicks open immediately without another API request. Portraits are warmed in the background. Failed preparation offers a retry without displaying incomplete participants.

The profile drawer now works for fictional wrestlers too. Clicking a stadium marker opens the prepared profile and retains the compact bout panel. To inspect a different group locally or after deployment, open `/?red=16&blue=17#wrestling` (mixed state/aimag/sum ranks) or `/?red=510&blue=511#wrestling`. These query parameters override the featured pair for the stadium; the existing fantasy bracket remains separate.

## Folders

```text
naadam-api/
  data/wrestlers.json      initial 512-profile seed, never shipped as frontend assets
  data/festival.json       existing festival summary
  src/index.js            API routing and wrestling SSE
  src/wrestlers.js         SQL initialization, summaries and full-profile queries
  src/room.js             persistent comments, likes, subscriptions and shared race/chat SSE
  src/responses.js        JSON/body handling and SSE cleanup
  src/wrestling-demo.js   source of the one-minute dummy data
  wrangler.jsonc          backend Worker, SQLite Durable Object binding and migration
  test/index.spec.js      API integration checks

naadam-front/
  public/index.html       page skeleton
  public/css/             styles
  public/js/              routing, sport views, language, theme and crowd animation
  public/js/wrestlers.js  API summaries and deduplicated profile cache
  src/index.js            /api proxy to the backend
  scripts/build.mjs       copies the API demo module for offline playback
  wrangler.jsonc          frontend Worker, static assets and API service binding
```

Edit dummy data in `naadam-api/src/wrestling-demo.js`. The frontend build copies it into `naadam-front/public/js/wrestling-demo.js`, so online and fallback playback use the same frames. Wrangler runs this build automatically before development and deployment.

## Deploy to Cloudflare

Install both projects' dependencies using the commands above, then sign in:

```bash
cd naadam-api
npx wrangler login
cd ..
```

Deploy the backend first, followed by the frontend:

```bash
npm run deploy:api
npm run deploy:front
```

The backend deploy creates its SQLite-backed Durable Object through the `v1` migration in its configuration. The frontend's `API` binding points to the Worker named `naadam-api`. Both Workers must belong to the same Cloudflare account. If you change the backend name, update the frontend's `services[0].service` value too.

Open the **naadam-front** deployment URL. Verify `/api/health`, then open `/#wrestling`. Subscribe, comment and like requests are processed by the backend through this frontend URL.

To connect a purchased domain, open the deployed **naadam-front** Worker in the Cloudflare dashboard, then **Settings → Domains & Routes → Add → Custom Domain** and enter your domain. The domain's zone must already be active in that Cloudflare account. The backend continues to work through the existing service binding.

For Git-based deployment, commit and push the prepared code from the repository root:

```bash
git add -u
git add naadam-api naadam-front
git commit -m "Prepare frontend and API for Cloudflare"
git push origin main
```

In Cloudflare, open **Workers & Pages → Create application → GitHub** and select `cldy429/ICSI469`. Connect the same repository to two Worker projects with these settings:

| Worker | Root directory | Build command | Deploy command |
| --- | --- | --- | --- |
| naadam-api | `naadam-api` | leave empty | `npx wrangler deploy` |
| naadam-front | `naadam-front` | `npm run build` | `npx wrangler deploy` |

Use `main` as the production branch and keep the Worker names exactly as shown. Deploy `naadam-api` successfully before creating `naadam-front`, because the frontend's service binding requires the backend to exist. For existing Workers, connect the repository under **Settings → Builds → Connect**.

Set the frontend's Build command explicitly in the dashboard: Workers Builds does not honor the Custom Builds settings in Wrangler configuration. Keep both folders in the repository because the frontend build copies the dummy data module from the backend. Once both projects are connected, pushes to `main` trigger automatic deployments. See the [Cloudflare Git integration](https://developers.cloudflare.com/workers/ci-cd/builds/) and [build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) documentation.

## Check before deploying

```bash
npm test
npm --prefix naadam-api run check
npm --prefix naadam-front run check
```

The check commands build the deployment packages locally using `wrangler deploy --dry-run`.

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

Vanilla JS ES modules, inline SVG with CSS transitions, WebAudio, Cloudflare Workers, Server-Sent Events and SQLite-backed Durable Objects.

## Sources

Champion facts and the 2026 results: Mongolian Wikipedia pages of each wrestler and "2026 оны улсын наадмын бөх барилдаан"; [Wikipedia, Mongolian wrestling](https://en.wikipedia.org/wiki/Mongolian_wrestling). Archery rules: [mn.wikipedia, Сур харваа](https://mn.wikipedia.org/wiki/Сур_харваа) and [enaadam.mn](https://enaadam.mn/about/national-sport/archery). The archers in the archery game are fictional. Photos: Wikimedia Commons, with author and license shown on the page.

## Connecting real event data

Replace `advanceRace()` in `naadam-api/src/room.js` with an authorized data feed in the same JSON shape:

```json
{"type": "race", "demo": false, "horses": [{"progress": 38.5, "speed": 51.2}]}
```

The wrestling stream starts at `second: 0`, sends one frame per second and closes after `second: 60`. Each frame contains eight entries in `bouts`, each with its own `phase` and two wrestlers. Positions are percentages on the stadium map, with X increasing right and Y increasing down in the landscape view. Use `phase: "grapple"` to show contact for that pair. Each frame also contains `crowd`, for example `{"level":5,"event":"win","chant":"Далайцэрэн давсааан"}`. The level is an integer from 1 to 5. The event can be `"move"`, `"win"` or `null` for the usual crowd level. During a level-5 win, an optional `chant` moves between two or three randomly selected spectators. If the stream is unavailable, the browser plays the same sample frames locally. An example `bouts` entry is shown below.

```json
{"phase":"grapple","wrestlers":[{"id":0,"x":7.5,"y":32},{"id":1,"x":14.5,"y":24.9}]}
```

Check data rights, official timing and scoring rules before using real results.
