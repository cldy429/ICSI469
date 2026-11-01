// NAADAM field views — flat SVG drawings of the wrestling field, the race route and the archery target.
// Each view builds its SVG once and then only moves the dots, so CSS transitions animate every change.
const NS = 'http://www.w3.org/2000/svg';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const svg = (viewBox, inner, cls) => {
  const t = document.createElementNS(NS, 'svg');
  t.setAttribute('viewBox', viewBox);
  t.setAttribute('class', 'field-svg ' + cls);
  t.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  t.innerHTML = inner;
  return t;
};
const move = (node, x, y) => { node.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`; };
let uid = 0;
// Text drawn inside the SVGs; live.js sets these for the current language before building the views.
const LABELS = {tribune: 'ШҮҮГЧИЙН ТАВЦАН', start: 'ГАРАА', finish: 'БАРИА', km: 'км', uukhai: 'Уухай!', wind: 'САЛХИ', m: 'м', ms: 'м/с', men: 'ЭРЭГТЭЙ', women: 'ЭМЭГТЭЙ', round: 'ҮЕ', finished: 'ДУУСЛАА', lang: 'mn'};
export const setFieldLabels = labels => Object.assign(LABELS, labels);

/* ---------------- Wrestling field ---------------- */
// Bout pairs follow app.js: 0–3 first round, 4–5 semi-finals, 6 final.
export function boutPair(i, winners) {
  if (i < 4) return [i * 2, i * 2 + 1];
  if (i < 6) { const k = (i - 4) * 2; return [winners[k], winners[k + 1]]; }
  return [winners[4], winners[5]];
}
export function fighterStates(bracket) {
  const step = bracket?.step || 0, winners = bracket?.winners || [];
  const out = new Set(), wins = Array(8).fill(0);
  for (let k = 0; k < step; k++) {
    const [a, b] = boutPair(k, winners), w = winners[k];
    out.add(w === a ? b : a); wins[w]++;
  }
  return {step, next: bracket?.next || null, champion: step >= 7 ? winners[6] : null, out, wins};
}

const SLOTS = [[215, 175], [585, 175], [215, 300], [585, 300]];
const CENTER = [400, 238];
function flags(n, x0, x1, y) {
  const colors = ['#c4272f', '#0066b3', '#f4dba4'];
  return Array.from({length: n}, (_, i) => {
    const x = x0 + (x1 - x0) * i / (n - 1);
    return `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 26}" stroke="#d9cfb8" stroke-width="1.4"/><path class="fld-flag" style="animation-delay:${(i % 5) * -.4}s" d="M${x} ${y - 26}l14 4-14 5z" fill="${colors[i % 3]}"/>`;
  }).join('');
}
function ger(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 0v-14h44V0z" fill="#f3efe6"/><path d="M-25 -14 0 -27 25 -14z" fill="#e7e0d0"/><path d="M-22 -10h44" stroke="#c4272f" stroke-width="2"/><rect x="-5" y="-11" width="10" height="11" fill="#c4272f"/><circle cy="-27" r="2.5" fill="#c99441"/></g>`;
}

export class WrestlingField {
  constructor(host, {colors, initials, name, onPick, compact = false}) {
    this.host = host; this.colors = colors; this.initials = initials; this.name = name; this.onPick = onPick;
    const id = 'wf' + (++uid);
    // Nine white banners (Есөн хөлт цагаан туг) stand in front of the judges' tribune.
    const banners = Array.from({length: 9}, (_, i) => {
      const x = 340 + i * 15;
      return `<line x1="${x}" y1="80" x2="${x}" y2="48" stroke="#e9e2cf" stroke-width="1.6"/><ellipse cx="${x}" cy="54" rx="4" ry="7" fill="#fffdf6"/><path d="M${x - 3} 46h6l-3-6z" fill="#c99441"/>`;
    }).join('');
    const crowd = Array.from({length: 150}, (_, i) => {
      const a = i / 150 * Math.PI * 2, rr = 1 + (i % 3) * .035;
      const x = 400 + Math.cos(a) * 372 * rr, y = 238 + Math.sin(a) * 196 * rr;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" fill="${['#e0524a', '#3d8bd4', '#f4dba4', '#5cc98a', '#fff'][i % 5]}" opacity=".55"/>`;
    }).join('');
    const dots = Array.from({length: 8}, (_, i) => {
      const [c1, c2] = colors[i % colors.length];
      return `<g class="wr-dot" data-fighter="${i}" tabindex="0" role="button" aria-label="${esc(name(i))}">
        <g class="wr-body">
          <circle class="wr-halo" r="27"/>
          <circle class="wr-ring" r="21"/>
          <circle r="17" fill="url(#${id}-g${i})"/>
          <text class="wr-ini" y="5">${esc(initials(i))}</text>
          <path class="wr-crown" d="M-11 -24l4 -10 7 6 7-6 4 10z"/>
          <text class="wr-name" y="40">${esc(name(i))}</text>
        </g>
        <defs><linearGradient id="${id}-g${i}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
      </g>`;
    }).join('');
    this.svg = svg('0 0 800 470', `
      <defs>
        <radialGradient id="${id}-grass" cx="50%" cy="45%" r="60%"><stop stop-color="#4f9a55"/><stop offset="1" stop-color="#2f6d3c"/></radialGradient>
        <pattern id="${id}-mow" width="60" height="470" patternUnits="userSpaceOnUse"><rect width="30" height="470" fill="#fff" opacity=".05"/></pattern>
      </defs>
      <rect width="800" height="470" fill="#13283a"/>
      <ellipse cx="400" cy="238" rx="392" ry="214" fill="#1d3a50"/>
      ${crowd}
      <ellipse cx="400" cy="238" rx="340" ry="172" fill="url(#${id}-grass)"/>
      <ellipse cx="400" cy="238" rx="340" ry="172" fill="url(#${id}-mow)"/>
      <ellipse cx="400" cy="238" rx="318" ry="156" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2" stroke-dasharray="7 7"/>
      <ellipse cx="400" cy="238" rx="78" ry="40" fill="none" stroke="#f4dba4" stroke-opacity=".5" stroke-width="2"/>
      <rect x="318" y="76" width="164" height="22" rx="4" fill="#0c2236" stroke="#c99441" stroke-opacity=".7"/>
      <text x="400" y="91" class="fld-label">${LABELS.tribune}</text>
      ${banners}
      ${flags(13, 120, 680, 418)}
      ${ger(96, 128, .9)}${ger(704, 128, .9)}${ger(70, 352, .8)}${ger(730, 352, .8)}
      <g class="wr-ref"><circle r="7" fill="#f4dba4"/><path d="M-7 -4h14l-7-9z" fill="#c4272f"/></g>
      <g class="wr-ref"><circle r="7" fill="#f4dba4"/><path d="M-7 -4h14l-7-9z" fill="#c4272f"/></g>
      <g class="wr-dots">${dots}</g>`, compact ? 'wrestling compact' : 'wrestling');
    this.dots = [...this.svg.querySelectorAll('.wr-dot')];
    this.refs = [...this.svg.querySelectorAll('.wr-ref')];
    this.svg.addEventListener('click', e => { const d = e.target.closest('.wr-dot'); if (d) this.onPick(+d.dataset.fighter); });
    this.svg.addEventListener('keydown', e => { const d = e.target.closest('.wr-dot'); if (d && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); this.onPick(+d.dataset.fighter); } });
    host.replaceChildren(this.svg);
  }
  update(bracket, {focus = null} = {}) {
    const st = fighterStates(bracket), [a, b] = st.next || [-1, -1];
    const outOrder = [...st.out];
    this.dots.forEach((d, i) => {
      let x, y;
      const pairSlot = SLOTS[Math.floor(i / 2)];
      if (i === st.champion) [x, y] = CENTER;
      else if (i === a || i === b) [x, y] = [CENTER[0] + (i === a ? -50 : 50), CENTER[1]];
      // Eliminated wrestlers step off to the edge of the field on their half of the bracket.
      else if (st.out.has(i)) { const side = i < 4 ? 0 : 1, k = outOrder.filter(o => (o < 4 ? 0 : 1) === side).indexOf(i); [x, y] = [side ? 690 : 110, 178 + k * 44]; }
      else [x, y] = [pairSlot[0] + (i % 2 ? 46 : -46), pairSlot[1]];
      move(d, x, y);
      d.classList.toggle('current', i === a || i === b);
      d.classList.toggle('out', st.out.has(i));
      d.classList.toggle('adv', st.wins[i] > 0 && !st.out.has(i) && i !== st.champion);
      d.classList.toggle('champ', i === st.champion);
      d.classList.toggle('focus', i === focus);
      d.classList.toggle('left', i === a);
    });
    const busy = !!st.next;
    this.refs.forEach((r, k) => { move(r, CENTER[0] + (k ? 92 : -92), CENTER[1] - 30); r.style.opacity = busy ? 1 : 0; });
    this.state = st;
  }
  // Short grappling animation for the current pair; resolves when it ends.
  grapple(ms = 2200) {
    this.svg.classList.add('grappling');
    return new Promise(res => setTimeout(() => { this.svg.classList.remove('grappling'); res(); }, ms));
  }
}

/* ---------------- Horse race route ---------------- */
// A winding steppe route, sampled from cubic curves so dots can be placed by distance.
const ROUTE = [[70, 340], [190, 200, 280, 430, 405, 310], [520, 200, 610, 220, 670, 270], [700, 295, 718, 285, 730, 268]];
function sampleRoute() {
  const pts = [ROUTE[0]];
  let p0 = ROUTE[0];
  for (const [x1, y1, x2, y2, x3, y3] of ROUTE.slice(1)) {
    for (let k = 1; k <= 80; k++) {
      const t = k / 80, u = 1 - t;
      pts.push([u * u * u * p0[0] + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * p0[1] + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]);
    }
    p0 = [x3, y3];
  }
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return {pts, len, total: len.at(-1)};
}
const RT = sampleRoute();
function routePoint(f) {
  const want = Math.max(0, Math.min(1, f)) * RT.total;
  let i = RT.len.findIndex(l => l >= want); if (i <= 0) return RT.pts[0];
  const k = (want - RT.len[i - 1]) / (RT.len[i] - RT.len[i - 1] || 1);
  return [RT.pts[i - 1][0] + (RT.pts[i][0] - RT.pts[i - 1][0]) * k, RT.pts[i - 1][1] + (RT.pts[i][1] - RT.pts[i - 1][1]) * k];
}

export class RaceField {
  constructor(host, {onPick}) {
    this.host = host; this.onPick = onPick; this.nodes = new Map();
    const d = 'M' + RT.pts.map(p => p.map(n => n.toFixed(1)).join(' ')).join('L');
    const kms = [.25, .5, .75].map(f => { const [x, y] = routePoint(f); return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><rect x="-17" y="-34" width="34" height="16" rx="3" fill="#0c2236" opacity=".8"/><text y="-22" class="fld-label">${Math.round(f * 18)} ${LABELS.km}</text></g>`; }).join('');
    const [fx, fy] = routePoint(1), [sx, sy] = routePoint(0), id = 'rf' + (++uid);
    this.svg = svg('0 0 800 450', `
      <defs><linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7fb3d8"/><stop offset=".47" stop-color="#cfe3ec"/><stop offset=".48" stop-color="#8fb36a"/><stop offset="1" stop-color="#5d8a47"/></linearGradient></defs>
      <rect width="800" height="450" fill="url(#${id}-sky)"/>
      <circle cx="660" cy="80" r="26" fill="#fff6d8" opacity=".85"/>
      <path d="M0 200 C120 146 200 168 300 182 S480 140 560 160 700 178 800 154 V215 H0Z" fill="#6c8f86" opacity=".7"/>
      <path d="M0 214 C140 182 260 204 380 200 S600 182 800 194 V236 H0Z" fill="#7aa35a"/>
      <path d="${d}" fill="none" stroke="#d8c69a" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
      <path d="${d}" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="6 9" opacity=".7"/>
      ${ger(sx + 8, sy + 52, .9)}${ger(sx + 62, sy + 70, .7)}
      <g transform="translate(${sx.toFixed(0)} ${sy.toFixed(0)})"><rect x="-4" y="-46" width="4" height="46" fill="#0c2236"/><text x="8" y="-34" class="fld-label dark start">${LABELS.start}</text></g>
      <g transform="translate(${fx.toFixed(0)} ${fy.toFixed(0)})"><path d="M-24 14V-40M24 14V-40" stroke="#c4272f" stroke-width="5"/><path d="M-27 -44H27" stroke="#0066b3" stroke-width="7"/><text y="-52" class="fld-label dark">${LABELS.finish} 🏁</text>${flags(5, -60, 60, 40)}</g>
      ${kms}
      <g class="rf-dots"></g>`, 'race');
    this.layer = this.svg.querySelector('.rf-dots');
    this.svg.addEventListener('click', e => { const n = e.target.closest('.rf-dot'); if (n) this.onPick(+n.dataset.racer); });
    host.replaceChildren(this.svg);
  }
  update({sorted = [], selected = 0} = {}) {
    const rank = new Map(sorted.map((r, i) => [r.id, i]));
    for (const r of sorted) {
      let n = this.nodes.get(r.id);
      if (!n) {
        n = document.createElementNS(NS, 'g');
        n.setAttribute('class', 'rf-dot'); n.dataset.racer = r.id; n.setAttribute('role', 'button'); n.setAttribute('tabindex', '0');
        n.innerHTML = `<circle class="rf-halo" r="17"/><circle r="11" fill="${r.color}" stroke="#fff" stroke-width="2.5"/><text class="rf-num" y="4"></text><g class="rf-tag"><rect x="-44" y="-42" width="88" height="20" rx="10"/><text y="-28"></text></g>`;
        n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.onPick(r.id); } });
        this.layer.append(n); this.nodes.set(r.id, n);
      }
      const [x, y] = routePoint(r.progress / 100);
      // Small lane offset keeps neighbouring horses from covering each other.
      move(n, x, y + ((r.id % 3) - 1) * 7);
      n.querySelector('.rf-num').textContent = rank.get(r.id) + 1;
      n.querySelector('.rf-tag text').textContent = r.name;
      n.setAttribute('aria-label', r.name);
      n.classList.toggle('selected', r.id === selected);
      n.classList.toggle('lead', rank.get(r.id) === 0);
    }
    // The selected horse is drawn last so it stays on top.
    const sel = this.nodes.get(selected); if (sel && this.layer.lastChild !== sel) this.layer.append(sel);
  }
}

/* ---------------- Khalkh archery: the sur wall ---------------- */
// Seen from behind the archer: a row of 30 leather "sur" (the two in the middle are red) on a low base, judges (засуул) on both sides.
// Shots come from app.js: x −1…1 across the wall, y 0 = on the wall, <0 short, >0 over; sur = index of the hit cylinder.
const WALL = {x: 320, y: 262, half: 192, n: 30};
const surX = i => WALL.x - WALL.half + (i + .5) * (WALL.half * 2 / WALL.n);
const judge = (x, flip) => `<g class="af-judge" transform="translate(${x} ${WALL.y + 4}) scale(${flip ? -1 : 1} 1)">
  <ellipse cy="24" rx="11" ry="3" fill="#000" opacity=".25"/>
  <path d="M-7 23l2-22h10l2 22z" fill="#2f5d8a"/><path d="M-5 6h10" stroke="#e8b86a" stroke-width="2"/>
  <circle cy="-5" r="5" fill="#c99a6b"/><path d="M-6 -7q6-9 12 0z" fill="#7a2f22"/><path d="M0 -16v4" stroke="#7a2f22" stroke-width="2"/>
  <g class="af-arms"><path class="af-arm l" d="M-5 3l-8 9" stroke="#2f5d8a" stroke-width="3.2" stroke-linecap="round"/><path class="af-arm r" d="M5 3l8 9" stroke="#2f5d8a" stroke-width="3.2" stroke-linecap="round"/></g>
  <g class="af-bubble" transform="scale(${flip ? -1 : 1} 1)"><rect x="-30" y="-44" width="60" height="20" rx="10" fill="#f6f1e4"/><path d="M-4 -24l4 6 4-6z" fill="#f6f1e4"/><text y="-30" class="af-uukhai">${esc(LABELS.uukhai)}</text></g>
</g>`;
export class ArcheryField {
  constructor(host) {
    this.host = host; this.count = 0; this.key = '';
    const id = 'af' + (++uid), w = WALL.half * 2 / WALL.n;
    const surs = Array.from({length: WALL.n}, (_, i) => {
      const red = i === 14 || i === 15;
      return `<g class="af-sur" data-i="${i}" transform="translate(${surX(i).toFixed(1)} ${WALL.y})"><g class="af-sur-body"><rect x="${(-w / 2 + .8).toFixed(1)}" y="-13" width="${(w - 1.6).toFixed(1)}" height="13" rx="2" fill="${red ? '#c4272f' : '#e9dcc0'}" stroke="#5a3b22" stroke-width=".8"/><path d="M${(-w / 2 + .8).toFixed(1)} -9.5h${(w - 1.6).toFixed(1)}" stroke="${red ? '#8e1a20' : '#b89b6e'}" stroke-width="1"/></g></g>`;
    }).join('');
    // Back wall (хана) of stacked leather rings behind the sur row.
    const bricks = Array.from({length: 3}, (_, r) => Array.from({length: 21}, (_, k) => `<rect x="${WALL.x - WALL.half - 12 + k * 19 + (r % 2) * 9}" y="${WALL.y - 34 + r * 7}" width="18" height="6" rx="2" fill="${r === 1 ? '#b9874f' : '#9c6c3b'}" opacity=".85"/>`).join('')).join('');
    this.svg = svg('0 0 640 430', `
      <defs>
        <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#163a5a"/><stop offset=".55" stop-color="#5b8aa6"/><stop offset="1" stop-color="#c9d9cf"/></linearGradient>
        <linearGradient id="${id}-grass" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7a9a4e"/><stop offset="1" stop-color="#3f6232"/></linearGradient>
      </defs>
      <rect width="640" height="430" fill="url(#${id}-sky)"/>
      <path d="M0 214l60-40 50 22 70-56 80 50 60-30 80 44 70-52 80 46 50-26 40 26v40H0z" fill="#56718a" opacity=".7"/>
      <path d="M0 226l90-26 100 18 120-30 110 26 100-20 120 24v30H0z" fill="#6f8a6a"/>
      <rect y="232" width="640" height="198" fill="url(#${id}-grass)"/>
      ${flags(8, 40, 600, 212)}
      <path d="M${WALL.x} 430L${WALL.x - 60} ${WALL.y + 12}h120z" fill="#c9b27e" opacity=".22"/>
      <rect x="${WALL.x - WALL.half - 30}" y="${WALL.y - 2}" width="${WALL.half * 2 + 60}" height="16" fill="#d9c79f" opacity=".55"/>
      <g opacity=".9">${bricks}</g>
      <rect x="${WALL.x - WALL.half - 4}" y="${WALL.y}" width="${WALL.half * 2 + 8}" height="6" fill="#6b4a2c"/>
      <g class="af-surs">${surs}</g>
      <g class="af-marks"></g>
      ${judge(WALL.x - WALL.half - 30, false)}${judge(WALL.x + WALL.half + 30, true)}
      <g class="af-archer" transform="translate(96 430)">
        <ellipse cy="-4" rx="46" ry="8" fill="#000" opacity=".3"/>
        <path d="M-26 -6l6-74h34l8 74z" fill="#7a2f22"/><path d="M-20 -60h36" stroke="#e8b86a" stroke-width="3"/>
        <path d="M-8 -80l10 -22 12 0 6 22z" fill="#7a2f22"/>
        <circle cx="5" cy="-112" r="12" fill="#3a2a1c"/><path d="M-9 -116q14-20 28 0z" fill="#1d3a50"/><path d="M5 -128v-8" stroke="#c4272f" stroke-width="3"/>
        <path d="M14 -94l40 -10" stroke="#7a2f22" stroke-width="7" stroke-linecap="round"/>
        <path d="M58 -152q22 46 0 96" fill="none" stroke="#2b1a10" stroke-width="5" stroke-linecap="round"/>
        <path class="af-string" d="M58 -152L30 -104L58 -56" fill="none" stroke="#f6f1e4" stroke-width="1.2"/>
        <path class="af-nocked" d="M30 -104L72 -106" stroke="#3a2a1c" stroke-width="2.4"/>
      </g>
      <g class="af-flight"></g>
      <g class="af-hud"><rect x="${WALL.x - 150}" y="44" width="300" height="48" rx="10" fill="#071c30" opacity=".75"/><text x="${WALL.x}" y="64" class="af-hud-big"></text><text x="${WALL.x}" y="83" class="af-hud-small"></text></g>`, 'archery');
    this.marks = this.svg.querySelector('.af-marks');
    this.flight = this.svg.querySelector('.af-flight');
    this.judges = [...this.svg.querySelectorAll('.af-judge')];
    this.hudBig = this.svg.querySelector('.af-hud-big'); this.hudSmall = this.svg.querySelector('.af-hud-small');
    host.replaceChildren(this.svg);
  }
  // Where an arrow ends: on the wall for a hit, in the grass in front (short), or on the ground behind (over).
  target(s) {
    const x = WALL.x + s.x * WALL.half;
    if (s.hit) return [surX(s.sur), WALL.y - 7];
    if (s.y < 0) return [WALL.x + s.x * (WALL.half + 30), WALL.y + 14 - s.y * 34];
    return [x, WALL.y - 16 - s.y * 14];
  }
  mark(s, fresh) {
    const [x, y] = this.target(s), g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'af-mark ' + (s.hit ? 'hit' : 'miss') + (fresh ? ' new' : ''));
    g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    g.innerHTML = s.hit
      ? `<circle r="9" class="af-flash"/><path d="M0 0l-9 9" stroke="#3a2a1c" stroke-width="1.8"/>`
      : `<path d="M0 0l-8 7" stroke="#3a2a1c" stroke-width="1.8"/><path d="M-8 7l-3 1 1-3z" fill="#f4dba4"/><text y="-6" class="af-x">✕</text>`;
    this.marks.append(g);
  }
  knock(i) {
    const sur = this.svg.querySelector(`.af-sur[data-i="${i}"]`); if (!sur) return;
    sur.classList.remove('knock'); void sur.getBBox?.(); sur.classList.add('knock');
    clearTimeout(sur._t); sur._t = setTimeout(() => sur.classList.remove('knock'), 1500);
    this.judges.forEach(j => { j.classList.add('cheer'); clearTimeout(j._t); j._t = setTimeout(() => j.classList.remove('cheer'), 1600); });
  }
  fly(s, done) {
    const [x1, y1] = this.target(s), x0 = 168, y0 = 324, cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 120;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return done();
    const a = document.createElementNS(NS, 'g');
    a.innerHTML = '<path d="M-14 0h18" stroke="#2b1a10" stroke-width="2.2"/><path d="M4 0l-5-3v6z" fill="#2b1a10"/><path d="M-14 0l-4-3m4 3l-4 3" stroke="#f4dba4" stroke-width="1.6"/>';
    this.flight.append(a);
    this.svg.classList.add('shooting');
    const t0 = performance.now(), dur = 760;
    const step = now => {
      const t = Math.min(1, (now - t0) / dur), u = 1 - t;
      const x = u * u * x0 + 2 * u * t * cx + t * t * x1, y = u * u * y0 + 2 * u * t * cy + t * t * y1;
      const dx = 2 * u * (cx - x0) + 2 * t * (x1 - cx), dy = 2 * u * (cy - y0) + 2 * t * (y1 - cy);
      const k = 1 - t * .55; // smaller as it flies away
      a.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(Math.atan2(dy, dx) * 180 / Math.PI).toFixed(1)}) scale(${k.toFixed(2)})`);
      if (t < 1) requestAnimationFrame(step); else { a.remove(); this.svg.classList.remove('shooting'); done(); }
    };
    requestAnimationFrame(step);
  }
  update(state) {
    if (!state) return;
    const en = LABELS.lang === 'en', shots = state.shots || [];
    const key = state.gender;
    if (key !== this.key || shots.length < this.count) { this.marks.replaceChildren(); this.count = 0; this.key = key; }
    const shooter = state.current || state.winner, wind = `${state.wind < 0 ? '←' : state.wind > 0 ? '→' : '·'} ${Math.abs(state.wind).toFixed(1)} ${LABELS.ms}`;
    this.hudBig.textContent = `${state.distance} ${LABELS.m} · ${state.gender === 'male' ? LABELS.men : LABELS.women} · ${state.done ? LABELS.finished : `${LABELS.round} ${state.round + 1}/${state.rounds}`}`;
    this.hudSmall.textContent = `${shooter ? (state.done ? '🏆 ' : '🏹 ') + (en ? shooter.en : shooter.name) + ' · ' : ''}${LABELS.wind} ${wind}`;
    if (shots.length === this.count) return;
    // Keep only the marks of the archer who shot last, in that round.
    const lastShot = shots.at(-1), group = shots.filter(s => s.archer === lastShot.archer && s.round === lastShot.round);
    const groupKey = this.group = `${key}-${lastShot.archer}-${lastShot.round}`, n = shots.length;
    const fresh = shots.length - this.count === 1 && this.count > 0 || shots.length === 1;
    this.marks.replaceChildren();
    group.slice(0, fresh ? -1 : group.length).forEach(s => this.mark(s, false));
    this.count = shots.length;
    if (fresh) this.fly(lastShot, () => { if (this.group === groupKey && this.count >= n) this.mark(lastShot, true); if (lastShot.hit) this.knock(lastShot.sur); });
  }
}
