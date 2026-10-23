// NAADAM live — бодит зураг, бөхийн профайл + давах магадлал, ялагчийн баяр,
// дуу, барианы самбар, үзэгчдийн сэтгэгдэл, subscription.
// app.js-ийн 'naadam:*' үйл явдлуудыг сонсож ажиллана.
import {PHOTOS, LEGENDS, rating, winChance, SOURCES} from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const lang = () => (document.documentElement.dataset.lang || 'mn') === 'mn' ? 'mn' : 'en';
const t = (mn, en) => lang() === 'mn' ? mn : en;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasServer = location.protocol.startsWith('http');
const credit = p => `<span class="lv-credit">📷 <a href="${p.page}" target="_blank" rel="noopener">${esc(p.author)}</a> · ${p.license}</span>`;
const legendName = l => lang() === 'mn' ? l.name : l.en;
const initials = l => { const given = l.name.split(' ').pop(), parts = given.split('-'); return parts.length > 1 ? parts.map(p => p[0]).join('') : given.slice(0, 2); };
const AVATAR_COLORS = [['#e0524a', '#7a1f2b'], ['#3d8bd4', '#173e63'], ['#e8b86a', '#9a5b1e'], ['#5cc98a', '#1f5e44'], ['#b07ad8', '#4a2468'], ['#f08a4b', '#8a3a12'], ['#4fc1c9', '#145a63'], ['#d8697f', '#6b2133']];
const avatar = (i, cls = '') => {
  const [c1, c2] = AVATAR_COLORS[i % AVATAR_COLORS.length];
  return `<span class="lv-avatar ${cls}" style="--c1:${c1};--c2:${c2}">${esc(initials(LEGENDS[i]))}</span>`;
};
const last = name => window.naadamLast?.[name];

/* ---------------- Sound (WebAudio, no files) ---------------- */
const sound = {
  ctx: null,
  get on() { return $('#sound-toggle')?.getAttribute('aria-pressed') === 'true'; },
  ac() { this.ctx ||= new (window.AudioContext || window.webkitAudioContext)(); return this.ctx; },
  noise(dur, {freq = 1000, q = .7, type = 'bandpass', gain = .2, attack = .01, sweep = null, when = 0} = {}) {
    if (!this.on) return;
    try {
      const ac = this.ac(), now = ac.currentTime + when;
      const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
      const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      src.buffer = buf; f.type = type; f.frequency.setValueAtTime(freq, now); f.Q.value = q;
      if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, now + dur);
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(gain, now + attack); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      src.connect(f); f.connect(g); g.connect(ac.destination); src.start(now); src.stop(now + dur);
    } catch {}
  },
  tone(freq, dur, {type = 'sine', gain = .12, when = 0, slide = null} = {}) {
    if (!this.on) return;
    try {
      const ac = this.ac(), now = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, now); if (slide) o.frequency.exponentialRampToValueAtTime(slide, now + dur);
      g.gain.setValueAtTime(gain, now); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.connect(g); g.connect(ac.destination); o.start(now); o.stop(now + dur);
    } catch {}
  },
  cheer(big = false) {
    // Crowd roar: layered noise swells + a short "уухай" horn.
    this.noise(big ? 3.2 : 2, {freq: 900, q: .4, gain: big ? .35 : .22, attack: .35});
    this.noise(big ? 2.6 : 1.6, {freq: 2200, q: .6, gain: .12, attack: .25, when: .1});
    [392, 494, 587].forEach((f, i) => this.tone(f, .5, {type: 'triangle', gain: .05, when: .15 + i * .12}));
  },
  whoosh() { this.noise(.45, {freq: 600, sweep: 3200, q: 2, gain: .25}); },
  thud() { this.tone(110, .25, {gain: .3, slide: 50}); this.noise(.12, {freq: 400, type: 'lowpass', gain: .2}); },
  hoof(when = 0) { this.noise(.07, {freq: 180, type: 'lowpass', gain: .35, when}); this.tone(75, .08, {gain: .12, when}); },
};
let hoofTimer = null, racePaused = false;
function updateHooves() {
  const run = sound.on && window.naadamApp?.page === 'racing' && !racePaused && !document.hidden;
  if (run && !hoofTimer) hoofTimer = setInterval(() => { [0, .09, .17].forEach(w => sound.hoof(w)); }, 420);
  if (!run && hoofTimer) { clearInterval(hoofTimer); hoofTimer = null; }
}
$('#sound-toggle')?.addEventListener('click', () => setTimeout(updateHooves, 0));
document.addEventListener('visibilitychange', updateHooves);
window.addEventListener('hashchange', () => setTimeout(updateHooves, 50));

/* ---------------- Home: photo hero, stats, legends ---------------- */
const SLIDES = [
  {photo: PHOTOS.opening, mn: 'Наадмын нээлтийн ёслол', en: 'Naadam opening ceremony'},
  {photo: PHOTOS.wrestlers, mn: 'Үндэсний бөх', en: 'Mongolian wrestling'},
  {photo: PHOTOS.racers, mn: 'Хурдан морины уяачид, хүүхэд унаачид', en: 'Young Naadam horse racers'},
  {photo: PHOTOS.archery, mn: 'Сур харваа', en: 'Mongolian archery'},
];
const NAADAM = new Date('2027-07-11T10:00:00+08:00');
let slide = 0, slideTimer = null;

function buildHero() {
  const home = $('#page-home');
  if (!home) return;
  $('.lv-hero', home)?.remove(); $('.lv-stats', home)?.remove();
  const hero = el(`<div class="lv-hero">
    <div class="lv-slides">${SLIDES.map((s, i) => `<div class="lv-slide ${i === slide ? 'on' : ''}" style="background-image:url('${s.photo.src}')"></div>`).join('')}</div>
    <div class="lv-hero-inner">
      <div>
        <span class="lv-chip"><i></i>${t('ҮНДЭСНИЙ ИХ БАЯР НААДАМ · 2027', 'NATIONAL NAADAM FESTIVAL · 2027')}</span>
        <h1>${t('Эрийн гурван<br/><em>наадам.</em>', 'Three manly<br/><em>games.</em>')}</h1>
        <p>${t('Бөх, хурдан морь, сур харваа — олон зуун жилийн түүхтэй их баярыг бодит зураг, шууд үр дүн, 3D талбайгаар мэдэр. Аваргуудаа таниад, дэмжиж, сэтгэгдлээ үлдээ.', 'Wrestling, horse racing and archery — experience a festival with centuries of history through real photos, live results and an optional 3D arena.')}</p>
        <div class="lv-cta">
          <button class="lv-btn red" data-go="wrestling">${t('Бөхийн барилдаан', 'Watch wrestling')} →</button>
          <button class="lv-btn ghost" data-go="racing">${t('Морины уралдаан', 'Horse race')}</button>
          <button class="lv-btn ghost" data-scroll="lv-subscribe">${t('Subscribe хийх', 'Subscribe')} ★</button>
        </div>
      </div>
      <div class="lv-glass">
        <span class="lv-count-label">${t('НААДАМ ЭХЛЭХЭД', 'NAADAM STARTS IN')}</span>
        <div class="lv-count" id="lv-count"></div>
        <div class="lv-dots">${SLIDES.map((s, i) => `<button type="button" aria-label="${esc(t(s.mn, s.en))}" data-slide="${i}" class="${i === slide ? 'on' : ''}"></button>`).join('')}</div>
        <div class="lv-slide-label"><b id="lv-slide-name">${esc(t(SLIDES[slide].mn, SLIDES[slide].en))}</b><span id="lv-slide-credit">${credit(SLIDES[slide].photo)}</span></div>
      </div>
    </div>
  </div>`);
  const stats = el(`<div class="lv-stats">
    <div><b>2010</b><span>${t('ЮНЕСКО-гийн соёлын биет бус өвд бүртгэгдсэн', 'Inscribed by UNESCO as intangible heritage')}</span></div>
    <div><b>512–1024</b><span>${t('Улсын наадамд барилддаг бөхчүүд', 'Wrestlers at the national Naadam')}</span></div>
    <div><b>6</b><span>${t('Хурдан морины насны ангилал', 'Horse racing age classes')}</span></div>
    <div><b>11×</b><span>${t('Б. Бат-Эрдэнэ — хамгийн олон түрүү', 'B. Bat-Erdene — most titles')}</span></div>
  </div>`);
  home.prepend(stats); home.prepend(hero);
  $$('[data-go]', hero).forEach(b => b.addEventListener('click', () => { location.hash = b.dataset.go; }));
  $$('[data-scroll]', hero).forEach(b => b.addEventListener('click', () => document.getElementById(b.dataset.scroll)?.scrollIntoView({behavior: reduced ? 'auto' : 'smooth'})));
  $$('[data-slide]', hero).forEach(b => b.addEventListener('click', () => showSlide(+b.dataset.slide)));
  tickCountdown();
  clearInterval(slideTimer);
  if (!reduced) slideTimer = setInterval(() => showSlide((slide + 1) % SLIDES.length), 6000);
}
function showSlide(i) {
  slide = i;
  $$('.lv-slide').forEach((s, k) => s.classList.toggle('on', k === i));
  $$('.lv-dots button').forEach((b, k) => { b.classList.remove('on'); if (k === i) { void b.offsetWidth; b.classList.add('on'); } });
  const name = $('#lv-slide-name'), cr = $('#lv-slide-credit');
  if (name) name.textContent = t(SLIDES[i].mn, SLIDES[i].en);
  if (cr) cr.innerHTML = credit(SLIDES[i].photo);
}
function tickCountdown() {
  const box = $('#lv-count'); if (!box) return;
  let ms = Math.max(0, NAADAM - Date.now());
  const parts = [[86400000, t('өдөр', 'days')], [3600000, t('цаг', 'hrs')], [60000, t('мин', 'min')], [1000, t('сек', 'sec')]].map(([unit, label]) => {
    const v = Math.floor(ms / unit); ms -= v * unit; return `<div><b>${String(v).padStart(2, '0')}</b><small>${label}</small></div>`;
  });
  box.innerHTML = parts.join('');
}
setInterval(tickCountdown, 1000);

function decorateSportCards() {
  const map = {'card-wrestling': PHOTOS.wrestling, 'card-racing': PHOTOS.race, 'card-archery': PHOTOS.archer};
  for (const [cls, p] of Object.entries(map)) {
    const card = $('.' + cls); if (!card) continue;
    card.classList.add('lv-photo');
    card.style.backgroundImage = `url('${p.src}')`;
  }
}

function buildHomeSections() {
  const lower = $('#page-home .home-lower'); if (!lower) return;
  $$('.lv-home-extra').forEach(n => n.remove());
  const legends = el(`<section class="lv-section lv-home-extra" id="lv-legends">
    <div class="lv-head"><div><span class="lv-kicker">${t('МОНГОЛЫН ДОМОГТ АВАРГУУД', 'MONGOLIAN LEGENDS')}</span><h2>${t('Түүх бүтээсэн бөхчүүд', 'Wrestlers who made history')}</h2></div>
      <p>${t('Улсын баяр наадамд хамгийн олон түрүүлсэн бөхчүүд. Карт дээр дарж дэлгэрэнгүйг үзээрэй.', 'The most decorated champions of the national Naadam. Tap a card for details.')} <a href="${SOURCES.wrestling}" target="_blank" rel="noopener">${t('Эх сурвалж: Wikipedia', 'Source: Wikipedia')}</a></p></div>
    <div class="lv-legends">${LEGENDS.map((l, i) => `<button type="button" class="lv-legend" data-legend="${i}">
      ${avatar(i)}<span><b>${esc(legendName(l))}</b><br/><small>${l.wins} ${t('түрүү', 'titles')} · ${l.runnerUp} ${t('үзүүр', 'runner-up')}<br/>${esc(l.years)}</small></span>
      <span class="lv-medals">${'<i></i>'.repeat(l.wins)}${'<i class="silver"></i>'.repeat(l.runnerUp)}</span>
    </button>`).join('')}</div>
  </section>`);
  const talk = el(`<section class="lv-section alt lv-home-extra" id="lv-talk">
    <div class="lv-head"><div><span class="lv-kicker">${t('ҮЗЭГЧДИЙН ТАЛБАР', 'FAN ZONE')}</span><h2>${t('Сэтгэгдлээ үлдээ', 'Join the conversation')}</h2></div>
      <p>${t('Дуртай бөх, морь, харваачаа дэмжээрэй. Сэтгэгдэл бүх үзэгчдэд шууд харагдана.', 'Cheer for your favourites. Comments appear live for every viewer.')}</p></div>
    <div data-comments="home"></div>
  </section>`);
  const sub = el(`<section class="lv-section lv-home-extra" id="lv-subscribe"></section>`);
  lower.after(legends, talk, sub);
  $$('[data-legend]', legends).forEach(b => b.addEventListener('click', () => openProfile(+b.dataset.legend)));
  buildSubscription(sub);
  mountComments($('[data-comments="home"]', talk), 'home');
  buildCredits();
}

function buildCredits() {
  $('.lv-credits')?.remove();
  const box = el(`<div class="lv-credits"><b>${t('Зургийн эх сурвалж', 'Photo credits')}:</b> ${Object.values(PHOTOS).map(p =>
    `<a href="${p.page}" target="_blank" rel="noopener">${esc(p.author)}</a> (${p.license})`).join(' · ')} — Wikimedia Commons.
    ${t('Аваргуудын мэдээлэл', 'Champion facts')}: <a href="${SOURCES.wrestling}" target="_blank" rel="noopener">Wikipedia</a>.
    ${t('Барилдааны үр дүн, давах магадлал, уралдааны өгөгдөл нь сургалтын симуляц бөгөөд албан ёсны үр дүн биш.', 'Bout results, win chances and race data are a learning simulation, not official results.')}</div>`);
  $('.site-footer')?.before(box);
}

/* ---------------- Subscription ---------------- */
const PLANS = [
  {id: 'free', mn: 'Үнэгүй', en: 'Free', price: '0₮', per: '', features: [['Шууд үр дүн, онооны самбар', 'Live results & scoreboard'], ['Сэтгэгдэл бичих', 'Post comments'], ['Аваргуудын мэдээлэл', 'Champion profiles']]},
  {id: 'premium', mn: 'Наадамч Premium', en: 'Naadam Premium', price: '9,900₮', per: ['/сар', '/mo'], hot: true, features: [['HD шууд дамжуулалт', 'HD live stream'], ['Барилдаан бүрийн давталт', 'Replay of every bout'], ['Дуртай бөхийн мэдэгдэл', 'Alerts for your wrestler'], ['Сурталчилгаагүй', 'No ads']]},
  {id: 'family', mn: 'Гэр бүл', en: 'Family', price: '19,900₮', per: ['/сар', '/mo'], features: [['Premium-ийн бүх эрх', 'Everything in Premium'], ['5 хүртэл профайл', 'Up to 5 profiles'], ['Хүүхдэд зориулсан тайлбар', 'Kid-friendly commentary']]},
];
function buildSubscription(box) {
  box.innerHTML = `<div class="lv-head"><div><span class="lv-kicker">SUBSCRIPTION</span><h2>${t('Наадмаа нэг ч мөч алдалгүй үз', 'Never miss a Naadam moment')}</h2></div>
    <p>${t('Багцаа сонгоод и-мэйлээ үлдээгээрэй.', 'Pick a plan and leave your email.')}</p></div>
    <div class="lv-plans">${PLANS.map(p => `<div class="lv-plan ${p.hot ? 'hot' : ''}">
      ${p.hot ? `<span class="lv-badge">${t('ХАМГИЙН ИХ СОНГОГДДОГ', 'MOST POPULAR')}</span>` : ''}
      <h3>${t(p.mn, p.en)}</h3>
      <div class="lv-plan-price"><b>${p.price}</b><small>${p.per ? t(...p.per) : ''}</small></div>
      <ul>${p.features.map(f => `<li>${t(...f)}</li>`).join('')}</ul>
      <button type="button" class="lv-btn ${p.hot ? 'red' : 'ghost'}" data-plan="${p.id}">${t('Сонгох', 'Choose')}</button>
    </div>`).join('')}</div>
    <form class="lv-sub-form lv-panel lv-form" novalidate>
      <b class="lv-sub-title"></b>
      <div class="lv-sub-row"><input type="email" name="email" required placeholder="${t('и-мэйл хаяг', 'email address')}" autocomplete="email" /><button class="lv-btn" type="submit">${t('Бүртгүүлэх', 'Sign up')}</button></div>
      <div class="lv-sub-msg" aria-live="polite"></div>
    </form>
    <p class="lv-demo-note">※ ${t('Сургалтын demo: бодит төлбөр авахгүй, и-мэйл зөвхөн энэ серверт хадгалагдана.', 'Learning demo: no real payment is taken; emails are stored only on this server.')}</p>`;
  const form = $('form', box); let plan = 'premium';
  $$('[data-plan]', box).forEach(b => b.addEventListener('click', () => {
    plan = b.dataset.plan;
    $('.lv-sub-title', form).textContent = t('Сонгосон багц: ', 'Selected plan: ') + t(...[PLANS.find(p => p.id === plan)].map(p => [p.mn, p.en])[0]);
    form.classList.add('on'); $('input', form).focus();
  }));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = form.email.value.trim(), msg = $('.lv-sub-msg', form);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = t('И-мэйл хаягаа зөв оруулна уу.', 'Please enter a valid email.'); return; }
    let ok = false;
    if (hasServer) { try { ok = (await fetch('/api/subscribe', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email, plan})})).ok; } catch {} }
    if (!ok) store.set('naadam-sub', JSON.stringify({email, plan}));
    msg.innerHTML = `<span class="lv-success">✓ ${t('Баярлалаа! Та бүртгэгдлээ (demo).', 'Thank you! You are subscribed (demo).')}</span>`;
    sound.tone(660, .15); sound.tone(880, .2, {when: .12});
    form.reset();
  });
}

/* ---------------- Comments ---------------- */
const commentBoxes = new Set();
let commentCache = [];
const TOPIC_LABEL = {home: ['Ерөнхий', 'General'], wrestling: ['Бөх', 'Wrestling'], racing: ['Морь', 'Racing'], archery: ['Сур', 'Archery']};
function timeAgo(iso) {
  const s = Math.max(1, (Date.now() - new Date(iso)) / 1000);
  if (s < 60) return t('саяхан', 'just now');
  if (s < 3600) return Math.floor(s / 60) + t(' мин өмнө', 'm ago');
  if (s < 86400) return Math.floor(s / 3600) + t(' цагийн өмнө', 'h ago');
  return Math.floor(s / 86400) + t(' өдрийн өмнө', 'd ago');
}
function colorIndex(name) { let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % AVATAR_COLORS.length; }
function commentHtml(c) {
  const [c1, c2] = AVATAR_COLORS[colorIndex(c.name)];
  const liked = (store.get('naadam-liked') || '').includes(c.id);
  return `<div class="lv-comment" data-id="${esc(c.id)}">
    <span class="lv-avatar" style="--c1:${c1};--c2:${c2}">${esc([...c.name][0] || '?')}</span>
    <div><b>${esc(c.name)}</b><span class="lv-topic">#${esc(t(...(TOPIC_LABEL[c.topic] || TOPIC_LABEL.home)))}</span><time>${timeAgo(c.at)}</time><p>${esc(c.text)}</p></div>
    <button type="button" class="lv-like ${liked ? 'on' : ''}" data-like="${esc(c.id)}">♥ ${c.likes || 0}</button>
  </div>`;
}
function renderCommentBox(box) {
  const topic = box.dataset.comments;
  const list = commentCache.filter(c => topic === 'home' || c.topic === topic).slice().reverse();
  const ul = $('.lv-list', box); if (!ul) return;
  ul.innerHTML = list.length ? list.map(commentHtml).join('') : `<div class="lv-empty">${t('Анхны сэтгэгдлийг та бичээрэй 👋', 'Be the first to comment 👋')}</div>`;
  $$('[data-like]', ul).forEach(b => b.addEventListener('click', () => likeComment(b.dataset.like)));
}
function mountComments(box, topic) {
  if (!box) return;
  box.dataset.comments = topic;
  box.innerHTML = `<div class="lv-comments">
    <form class="lv-panel lv-form">
      <input name="name" maxlength="32" placeholder="${t('Таны нэр', 'Your name')}" value="${esc(store.get('naadam-name') || '')}" />
      <textarea name="text" maxlength="280" required placeholder="${t('Юу бодож байна? Жишээ нь: Бат-Эрдэнэ аварга ялна! 💪', 'What do you think? e.g. Go Bat-Erdene! 💪')}"></textarea>
      <div class="lv-emojis">${['🔥', '👏', '💪', '🐎', '🏹', '🇲🇳'].map(e => `<button type="button" data-emoji="${e}">${e}</button>`).join('')}</div>
      <div class="lv-form-foot"><span class="lv-status">${hasServer ? t('● Шууд холбогдсон', '● Live') : t('Офлайн горим', 'Offline mode')}</span><button class="lv-btn red" type="submit">${t('Илгээх', 'Post')} ↗</button></div>
    </form>
    <div class="lv-panel"><div class="lv-list"></div></div>
  </div>`;
  const form = $('form', box);
  $$('[data-emoji]', form).forEach(b => b.addEventListener('click', () => { form.text.value += b.dataset.emoji; form.text.focus(); }));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = form.name.value.trim().slice(0, 32) || t('Зочин', 'Guest'), text = form.text.value.trim().slice(0, 280);
    if (text.length < 2) return;
    store.set('naadam-name', name);
    const btn = $('button[type=submit]', form); btn.disabled = true;
    let saved = null;
    if (hasServer) {
      try {
        const r = await fetch('/api/comments', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({name, text, topic})});
        if (r.status === 429) $('.lv-status', form).textContent = t('Түр хүлээгээд дахин илгээнэ үү.', 'Please wait a moment.');
        if (r.ok) saved = await r.json();
      } catch {}
    }
    if (!saved && !hasServer) { saved = {id: Date.now().toString(36), name, text, topic, at: new Date().toISOString(), likes: 0}; saveLocal(saved); }
    if (saved) { addComment(saved); form.text.value = ''; sound.tone(740, .1); }
    setTimeout(() => { btn.disabled = false; }, 1200);
  });
  commentBoxes.add(box);
  renderCommentBox(box);
}
function addComment(c) { if (commentCache.some(x => x.id === c.id)) return; commentCache.push(c); commentBoxes.forEach(renderCommentBox); }
function saveLocal(c) { try { const a = JSON.parse(store.get('naadam-comments') || '[]'); a.push(c); store.set('naadam-comments', JSON.stringify(a.slice(-100))); } catch {} }
async function likeComment(id) {
  const liked = store.get('naadam-liked') || '';
  if (liked.includes(id)) return;
  store.set('naadam-liked', liked + ',' + id);
  const c = commentCache.find(x => x.id === id); if (c) c.likes = (c.likes || 0) + 1;
  commentBoxes.forEach(renderCommentBox);
  if (hasServer) { try { await fetch(`/api/comments/${encodeURIComponent(id)}/like`, {method: 'POST'}); } catch {} }
}
async function loadComments() {
  if (hasServer) {
    try { commentCache = await (await fetch('/api/comments')).json(); } catch { commentCache = []; }
    try {
      const es = new EventSource('/api/events');
      es.onmessage = ev => {
        try {
          const p = JSON.parse(ev.data);
          if (p.type === 'comment') addComment(p.comment);
          if (p.type === 'like') { const c = commentCache.find(x => x.id === p.id); if (c) { c.likes = p.likes; commentBoxes.forEach(renderCommentBox); } }
        } catch {}
      };
    } catch {}
  } else {
    try { commentCache = JSON.parse(store.get('naadam-comments') || '[]'); } catch { commentCache = []; }
  }
  commentBoxes.forEach(renderCommentBox);
}

/* ---------------- Sport pages: photo banners, photo stage ↔ 3D ---------------- */
const PAGES = {
  wrestling: {banner: PHOTOS.wrestling, stage: PHOTOS.wrestlers, canvas: '#wrestling-canvas', mn: 'Талбай дээр барилдаж буй бөхчүүд — дээр нь дарж мэдээллийг нь үз.', en: 'Wrestlers on the field — tap one to see their profile.'},
  racing: {banner: PHOTOS.racers, stage: PHOTOS.race, canvas: '#race-canvas', mn: 'Хүүхэд унаачид, хурдан хүлгүүд — тал нутгийн хийморь.', en: 'Young riders and swift horses of the steppe.'},
  archery: {banner: PHOTOS.archery, stage: PHOTOS.archer, canvas: '#archery-canvas', mn: 'Мэргэн харваачид — "Уухай!" дуудлагын дор.', en: 'Master archers — to the call of "Uukhai!".'},
};
const want3D = () => store.get('naadam-3d') === 'on';
function buildSportPages() {
  for (const [page, cfg] of Object.entries(PAGES)) {
    const section = $('#page-' + page); if (!section) continue;
    $$('.lv-banner, .lv-page-comments', section).forEach(n => n.remove());
    const banner = el(`<div class="lv-banner" style="background-image:url('${cfg.banner.src}')"><strong>${t(cfg.mn, cfg.en)}</strong>${credit(cfg.banner)}</div>`);
    $('.page-heading', section)?.after(banner);
    const wrap = $(cfg.canvas, section)?.closest('.canvas-wrap');
    if (wrap) {
      $('.lv-stage', wrap)?.remove();
      const stage = el(`<div class="lv-stage" style="background-image:url('${cfg.stage.src}')">
        ${page === 'wrestling' ? `<span class="lv-tap-hint">👆 ${t('Бөх дээр дарж мэдээлэл харах', 'Tap a wrestler for info')}</span><div class="lv-vs" id="lv-stage-vs"></div>` : `<span>${credit(cfg.stage)}</span>`}
        <button type="button" class="lv-3d-btn" data-3d="on">◉ ${t('3D-ээр үзэх', 'View in 3D')}</button>
      </div>`);
      wrap.append(stage);
      wrap.classList.toggle('is-photo', !want3D());
      $('[data-3d]', stage).addEventListener('click', () => set3D(true));
    }
    const bar = $(cfg.canvas, section)?.closest('.race-main, .wrestling-visual, .archery-visual')?.querySelector('.viewer-bar');
    if (bar) {
      $('.lv-view-toggle', bar)?.remove();
      const toggle = el(`<button type="button" class="viewer-control lv-view-toggle"></button>`);
      toggle.addEventListener('click', () => set3D(!want3D()));
      const controls = $('.viewer-controls', bar) || $('.viewer-control', bar);
      controls ? controls.before(toggle) : bar.append(toggle);
    }
    const comments = el(`<div class="lv-page-comments lv-panel"><div class="lv-head" style="margin-bottom:16px"><div><span class="lv-kicker">${t('ҮЗЭГЧДИЙН СЭТГЭГДЭЛ', 'FAN COMMENTS')}</span></div></div><div data-comments="${page}"></div></div>`);
    section.append(comments);
    mountComments($('[data-comments]', comments), page);
  }
  syncToggles();
  renderMatchup();
}
function syncToggles() {
  $$('.lv-view-toggle').forEach(b => { b.innerHTML = want3D() ? `▣ <span>${t('Зураг', 'Photo')}</span>` : `◉ <span>3D</span>`; });
  $$('.lv-stage').forEach(s => s.closest('.canvas-wrap')?.classList.toggle('is-photo', !want3D()));
}
function set3D(on) {
  store.set('naadam-3d', on ? 'on' : 'off');
  syncToggles();
  if (on) window.naadamApp?.load3D(); else window.naadamApp?.unload3D();
}

/* ---------------- Wrestling: matchup, probability, profile, celebration ---------------- */
function currentPair() { return last('bracket')?.next || [0, 1]; }
function renderMatchup() {
  const section = $('#page-wrestling'); if (!section) return;
  const [a, b] = currentPair();
  const done = last('bracket') && !last('bracket').next;
  const vs = $('#lv-stage-vs');
  if (vs) vs.innerHTML = done ? '' : `${pill(a)}<span class="lv-vs-mark">VS</span>${pill(b)}`;
  $$('[data-profile]', vs || document.createElement('div')).forEach(x => x.addEventListener('click', () => openProfile(+x.dataset.profile)));
  let card = $('.lv-matchup', section);
  if (!card) { card = el('<div class="lv-matchup"></div>'); $('.bracket-panel', section)?.append(card); }
  if (done) {
    const champ = last('bracket').winners[6];
    card.innerHTML = `<div class="lv-matchup-top"><span>${t('ТЭМЦЭЭНИЙ АВАРГА', 'CHAMPION')}</span></div>
      <button type="button" class="lv-side" data-profile="${champ}">${avatar(champ)}<span><b>${esc(legendName(LEGENDS[champ]))}</b><small>${t('Бүх барилдаанд давлаа 🏆', 'Won every bout 🏆')}</small></span></button>`;
  } else {
    const p = winChance(LEGENDS[a], LEGENDS[b]);
    card.innerHTML = `<div class="lv-matchup-top"><span>${t('ДАРААГИЙН БАРИЛДААН · ДАВАХ МАГАДЛАЛ', 'NEXT BOUT · WIN CHANCE')}</span><small>${(last('bracket')?.step || 0) + 1} / 7</small></div>
      <div class="lv-sides">
        <button type="button" class="lv-side" data-profile="${a}">${avatar(a)}<span><b>${esc(legendName(LEGENDS[a]))}</b><small>${LEGENDS[a].wins} ${t('түрүү', 'titles')}</small></span></button>
        <span class="lv-vs-big">VS</span>
        <button type="button" class="lv-side right" data-profile="${b}">${avatar(b)}<span><b>${esc(legendName(LEGENDS[b]))}</b><small>${LEGENDS[b].wins} ${t('түрүү', 'titles')}</small></span></button>
      </div>
      <div class="lv-prob"><div class="lv-prob-bar"><i style="width:50%"></i><i style="width:50%"></i></div>
        <div class="lv-prob-nums"><span data-count="${Math.round(p * 100)}">50%</span><span data-count="${Math.round((1 - p) * 100)}">50%</span></div></div>
      <p class="lv-prob-note">※ ${t('Магадлалыг түрүү, үзүүрийн тоогоор тооцсон уран зөгнөлт симуляц. Өөр өөр үеийн аваргуудыг уулзуулсан тул бодит үр дүн биш.', 'A fantasy simulation based on titles and runner-up finishes across different eras — not a real result.')}</p>`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const bars = $$('.lv-prob-bar i', card); bars[0].style.width = p * 100 + '%'; bars[1].style.width = (1 - p) * 100 + '%';
      $$('[data-count]', card).forEach(n => countUp(n, +n.dataset.count, '%'));
    }));
  }
  $$('[data-profile]', card).forEach(x => x.addEventListener('click', () => openProfile(+x.dataset.profile)));
}
const pill = i => `<button type="button" class="lv-fighter-pill" data-profile="${i}">${avatar(i)}<span><b>${esc(legendName(LEGENDS[i]))}</b><small>${LEGENDS[i].wins} ${t('түрүү', 'titles')}</small></span></button>`;
function countUp(node, to, suffix = '') {
  const from = parseInt(node.textContent) || 0, start = performance.now(), dur = reduced ? 1 : 900;
  const step = now => { const k = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - k, 3); node.textContent = Math.round(from + (to - from) * e) + suffix; if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

let drawer = null;
function openProfile(i) {
  const l = LEGENDS[i]; if (!l) return;
  drawer?.remove();
  const [a, b] = currentPair(), inNext = last('bracket')?.next && (i === a || i === b);
  const opp = i === a ? b : a, chance = inNext ? winChance(l, LEGENDS[opp]) : null;
  drawer = el(`<div class="lv-drawer-wrap" role="dialog" aria-modal="true" aria-label="${esc(legendName(l))}">
    <div class="lv-backdrop"></div>
    <aside class="lv-drawer">
      <div class="lv-drawer-hero">
        <button type="button" class="lv-close" aria-label="${t('Хаах', 'Close')}">✕</button>
        ${avatar(i)}
        <h3>${esc(legendName(l))}</h3>
        <p>${t('Улсын баяр наадмын аварга', 'National Naadam champion')} · ${esc(l.years)}</p>
      </div>
      <div class="lv-drawer-body lv-reveal">
        <div class="lv-kpis">
          <div><b data-count="${l.wins}">0</b><small>${t('Түрүү', 'Titles')}</small></div>
          <div><b data-count="${l.runnerUp}">0</b><small>${t('Үзүүр', 'Runner-up')}</small></div>
          <div><b data-count="${rating(l)}">0</b><small>${t('Хүч (симуляц)', 'Rating (sim)')}</small></div>
        </div>
        <div><h4>${t('ТҮРҮҮЛСЭН ОНУУД', 'TITLE YEARS')}</h4><p>${esc(l.years)}</p></div>
        <div><h4>${t('ОНЦЛОХ', 'HIGHLIGHT')}</h4><p>${esc(l.note[lang()])}</p></div>
        ${inNext ? `<div><h4>${t('ДАРААГИЙН БАРИЛДААН', 'NEXT BOUT')}</h4><p>${t('Өрсөлдөгч', 'Opponent')}: <b>${esc(legendName(LEGENDS[opp]))}</b></p>
          <div class="lv-prob"><div class="lv-prob-bar"><i style="width:0"></i><i style="width:100%"></i></div><div class="lv-prob-nums"><span>${t('Давах', 'Win')} <b data-count="${Math.round(chance * 100)}">0</b>%</span><span></span></div></div></div>` : ''}
        <p class="lv-src">${t('Эх сурвалж', 'Source')}: <a href="${SOURCES.wrestling}" target="_blank" rel="noopener">Wikipedia — Mongolian wrestling</a></p>
      </div>
    </aside>
  </div>`);
  document.body.append(drawer);
  const close = () => { drawer.classList.remove('open'); const d = drawer; setTimeout(() => d.remove(), 500); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  $('.lv-close', drawer).addEventListener('click', close);
  $('.lv-backdrop', drawer).addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    drawer.classList.add('open');
    $('.lv-close', drawer).focus();
    $$('[data-count]', drawer).forEach(n => setTimeout(() => countUp(n, +n.dataset.count), 250));
    if (chance != null) { const bars = $$('.lv-prob-bar i', drawer); setTimeout(() => { bars[0].style.width = chance * 100 + '%'; bars[1].style.width = (1 - chance) * 100 + '%'; }, 300); }
  }));
  sound.tone(520, .08);
}

const EAGLE_SVG = `<svg class="lv-eagle" viewBox="0 0 320 260" aria-hidden="true">
  <defs><linearGradient id="lvg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f4dba4"/><stop offset="1" stop-color="#c99441"/></linearGradient></defs>
  <g fill="url(#lvg)">
    <path class="wing l" d="M150 112 C110 90 70 70 18 86 C40 92 52 98 60 104 C42 106 30 112 22 122 C46 118 64 120 80 124 C66 130 58 138 54 148 C80 136 110 130 146 132Z"/>
    <path class="wing r" d="M170 112 C210 90 250 70 302 86 C280 92 268 98 260 104 C278 106 290 112 298 122 C274 118 256 120 240 124 C254 130 262 138 266 148 C240 136 210 130 174 132Z"/>
    <circle cx="160" cy="70" r="17"/>
    <path d="M142 96 Q160 88 178 96 L184 150 Q172 160 160 158 Q148 160 136 150Z"/>
    <path d="M138 150 L178 150 L184 176 L136 176Z" fill="#e0524a"/>
    <path d="M138 176 L156 176 L150 236 L134 236Z"/><path d="M164 176 L182 176 L188 236 L172 236Z"/>
    <path d="M126 236 L152 236 L156 246 L120 246Z"/><path d="M168 236 L194 236 L200 246 L164 246Z"/>
  </g>
</svg>`;
let celebrateTimer = null;
function celebrate(winnerIndex, {final = false, chance = null} = {}) {
  const l = LEGENDS[winnerIndex]; if (!l) return;
  $('.lv-celebrate')?.remove();
  const box = el(`<div class="lv-celebrate" role="status">
    <div class="lv-rays"></div><canvas class="lv-confetti"></canvas>
    <div class="lv-cel-inner">
      ${EAGLE_SVG}
      <div class="lv-kicker">${final ? t('НААДМЫН АВАРГА', 'NAADAM CHAMPION') : t('БАРИЛДААНЫ ЯЛАГЧ', 'BOUT WINNER')}</div>
      <h2>${esc(legendName(l))}</h2>
      <p>${final ? t('Түрүүллээ! Шонхорын дэвэлт хийж байна 🦅', 'Champion! Performing the eagle dance 🦅') : t('Давлаа! Шонхорын дэвэлтээр баяраа илэрхийлж байна 🦅', 'Wins and celebrates with the eagle dance 🦅')}</p>
      ${chance != null ? `<span class="lv-cel-chip">${t('Давах магадлал', 'Win chance')}: ${Math.round(chance * 100)}%</span>` : ''}
    </div>
  </div>`);
  document.body.append(box);
  requestAnimationFrame(() => box.classList.add('on'));
  confetti($('canvas', box), final ? 260 : 140);
  sound.cheer(final);
  const close = () => { box.classList.remove('on'); setTimeout(() => box.remove(), 450); };
  box.addEventListener('click', close);
  clearTimeout(celebrateTimer); celebrateTimer = setTimeout(close, final ? 6500 : 3400);
}
function confetti(canvas, count) {
  if (reduced) return;
  const ctx = canvas.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
  const W = canvas.width = innerWidth * dpr, H = canvas.height = innerHeight * dpr;
  const colors = ['#e0524a', '#3d8bd4', '#f4dba4', '#ffffff', '#c99441'];
  const bits = Array.from({length: count}, () => ({x: W / 2 + (Math.random() - .5) * W * .3, y: H * .55, vx: (Math.random() - .5) * 26 * dpr, vy: -(10 + Math.random() * 18) * dpr, r: (4 + Math.random() * 6) * dpr, a: Math.random() * 6, va: (Math.random() - .5) * .3, c: colors[Math.random() * colors.length | 0]}));
  const start = performance.now();
  const step = now => {
    if (!canvas.isConnected || now - start > 6000) return;
    ctx.clearRect(0, 0, W, H);
    for (const b of bits) {
      b.vy += .45 * dpr; b.vx *= .99; b.x += b.vx; b.y += b.vy; b.a += b.va;
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a); ctx.fillStyle = b.c; ctx.fillRect(-b.r, -b.r / 2, b.r * 2, b.r); ctx.restore();
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

window.addEventListener('naadam:bracket', renderMatchup);
window.addEventListener('naadam:bout', e => { const {winner, final, chance} = e.detail; celebrate(winner, {final, chance}); });
document.addEventListener('click', e => {
  const f = e.target.closest('.bracket .fighter[data-fighter]');
  if (f) openProfile(+f.dataset.fighter);
});
// Clicking a wrestler inside the 3D field (scene3d.js dispatches 'scene-pick').
document.addEventListener('scene-pick', e => {
  if (e.detail?.kind !== 'wrestler') return;
  const pair = currentPair(); openProfile(pair[e.detail.side] ?? pair[0]);
});

/* ---------------- Racing: live ticker + finish podium ---------------- */
function raceWrap() { return $('#race-canvas')?.closest('.canvas-wrap'); }
window.addEventListener('naadam:race', e => {
  racePaused = e.detail.paused; updateHooves();
  const wrap = raceWrap(); if (!wrap) return;
  let tick = $('.lv-ticker', wrap);
  if (!tick) { tick = el('<div class="lv-ticker" aria-live="off"></div>'); wrap.append(tick); }
  tick.innerHTML = e.detail.sorted.slice(0, 4).map((r, i) => `<span>${i + 1}. ${esc(r.name)} · ${Number(r.speed).toFixed(1)} ${t('км/ц', 'km/h')}</span>`).join('');
});
window.addEventListener('naadam:race-finish', e => {
  const wrap = raceWrap(); if (!wrap) return;
  const [first, second, third] = e.detail.podium;
  $('.lv-podium', wrap)?.remove();
  const box = el(`<div class="lv-podium"><div>
    <h3>🏁 ${t('Барианд ирлээ!', 'Finish!')}</h3>
    <div class="lv-podium-steps">
      <div><b>2</b><span>${esc(second?.name || '')}</span><br/><small>${esc(second?.rider || '')}</small></div>
      <div><b>🥇 1</b><span>${esc(first?.name || '')}</span><br/><small>${esc(first?.rider || '')}</small></div>
      <div><b>3</b><span>${esc(third?.name || '')}</span><br/><small>${esc(third?.rider || '')}</small></div>
    </div></div></div>`);
  wrap.append(box);
  requestAnimationFrame(() => box.classList.add('on'));
  sound.cheer(true);
  setTimeout(() => { box.classList.remove('on'); setTimeout(() => box.remove(), 500); }, 4500);
});

/* ---------------- Archery: whoosh, thud, "Уухай!" ---------------- */
let toastTimer = null;
function toast(text) {
  let n = $('.lv-toast'); if (!n) { n = el('<div class="lv-toast" role="status"></div>'); document.body.append(n); }
  n.textContent = text; n.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => n.classList.remove('on'), 1800);
}
window.addEventListener('naadam:shot', e => {
  sound.whoosh();
  setTimeout(() => sound.thud(), 420);
  const s = e.detail.score;
  setTimeout(() => {
    toast(s >= 8 ? t(`УУХАЙ! ${s} оноо 🎯`, `UUKHAI! ${s} points 🎯`) : t(`${s} оноо`, `${s} points`));
    if (s >= 8) sound.cheer(false);
  }, 650);
});

/* ---------------- Boot + language/theme refresh ---------------- */
function buildAll() {
  buildHero();
  decorateSportCards();
  buildHomeSections();
  buildSportPages();
}
buildAll();
loadComments();
let lastLang = lang();
new MutationObserver(() => {
  if (lang() === lastLang) return;
  lastLang = lang();
  commentBoxes.clear();
  buildAll();
  commentBoxes.forEach(renderCommentBox);
}).observe(document.documentElement, {attributes: true, attributeFilter: ['data-lang']});
