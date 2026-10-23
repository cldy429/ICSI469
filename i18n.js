// NAADAM i18n — Монгол, English, Русский, 日本語, 한국어.
// index.html болон app.js-ийг өөрчлөхгүйгээр Монгол текстийг орчуулна:
// текст зангилаа бүрийн эх (Монгол) утгыг хадгалж, сонгосон хэл рүү солино.
// app.js шинээр бичсэн текстийг MutationObserver барьж орчуулна.

const LANGS = [
  { code: 'mn', label: 'Монгол', short: 'MN' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'ja', label: '日本語', short: 'JA' },
  { code: 'ko', label: '한국어', short: 'KO' },
];
const COL = { en: 0, ru: 1, ja: 2, ko: 3 };
const STORE_KEY = 'naadam-lang';

// Монгол эх текст → [English, Русский, 日本語, 한국어]
const DICT = {
  // <head>
  'NAADAM / Монгол эрийн гурван наадам': ['NAADAM / The Three Manly Games of Mongolia', 'НААДАМ / Три игры мужей Монголии', 'ナーダム / モンゴルの男の三種競技', '나담 / 몽골 남자의 세 경기'],

  // Толгой хэсэг
  'Наадам нүүр хуудас': ['Naadam home page', 'Главная страница Наадам', 'ナーダム ホーム', '나담 홈페이지'],
  'НААДАМ': ['NAADAM', 'НААДАМ', 'ナーダム', '나담'],
  'Үндсэн цэс': ['Main menu', 'Главное меню', 'メインメニュー', '주 메뉴'],
  'Нүүр': ['Home', 'Главная', 'ホーム', '홈'],
  'Бөх': ['Wrestling', 'Борьба', '相撲', '씨름'],
  'Морь': ['Horses', 'Скачки', '競馬', '경마'],
  'Сур харваа': ['Archery', 'Стрельба из лука', '弓術', '활쏘기'],
  'Дууг асаах, унтраах': ['Toggle sound', 'Включить/выключить звук', '音のオン/オフ', '소리 켜기/끄기'],
  'Дууг асаах/унтраах': ['Toggle sound', 'Включить/выключить звук', '音のオン/オフ', '소리 켜기/끄기'],
  'Цэс нээх': ['Open menu', 'Открыть меню', 'メニューを開く', '메뉴 열기'],
  'Хэл сонгох': ['Choose language', 'Выбрать язык', '言語を選択', '언어 선택'],
  'Өнгөний горим солих': ['Switch light / dark mode', 'Светлая / тёмная тема', 'ライト/ダークモード切替', '라이트/다크 모드 전환'],

  // Нүүр хуудас
  'МОНГОЛ ӨВ • ШИНЭ ҮЕИЙН ТЕХНОЛОГИ': ['MONGOLIAN HERITAGE • NEW-GENERATION TECHNOLOGY', 'МОНГОЛЬСКОЕ НАСЛЕДИЕ • ТЕХНОЛОГИИ НОВОГО ПОКОЛЕНИЯ', 'モンゴルの遺産 • 次世代テクノロジー', '몽골의 유산 • 차세대 기술'],
  'ЭР': ['TRUE', 'МУЖСКАЯ', '男の', '사나이의'],
  'ХҮЧ.': ['STRENGTH.', 'СИЛА.', '力。', '힘.'],
  'ӨВ': ['LIVING', 'КУЛЬТУРНОЕ', '文化', '문화'],
  'СОЁЛ.': ['HERITAGE.', 'НАСЛЕДИЕ.', '遺産。', '유산.'],
  'НААДАМ.': ['NAADAM.', 'НААДАМ.', 'ナーダム。', '나담.'],
  'Монгол түмний хийморь болсон эрийн гурван наадмыг шинээр мэдэр. 3D талбай, хөдөлгөөнт үзүүлэлт, агшин бүрийн өөрчлөлт.': [
    'Experience the three manly games, the pride of the Mongolian people, in a new way. 3D arenas, animated stats, every moment as it changes.',
    'Откройте заново три игры мужей — гордость монгольского народа. 3D-арены, живая статистика, каждое мгновение в движении.',
    'モンゴル民族の誇りである男の三種競技を新しい形で体験しよう。3Dフィールド、動くデータ、刻々と変わる瞬間。',
    '몽골 민족의 자부심인 남자의 세 경기를 새롭게 경험하세요. 3D 경기장, 움직이는 통계, 매 순간의 변화.'],
  '3D УРАЛДААН ҮЗЭХ': ['WATCH 3D RACE', 'СМОТРЕТЬ 3D-СКАЧКИ', '3Dレースを見る', '3D 경주 보기'],
  'БӨХИЙН ТАЛБАЙ': ['WRESTLING ARENA', 'АРЕНА БОРЬБЫ', '相撲の会場', '씨름 경기장'],
  'ТҮҮХЭН ӨВ / DIGITAL EXPERIENCE': ['HISTORIC HERITAGE / DIGITAL EXPERIENCE', 'ИСТОРИЧЕСКОЕ НАСЛЕДИЕ / DIGITAL EXPERIENCE', '歴史的遺産 / DIGITAL EXPERIENCE', '역사적 유산 / DIGITAL EXPERIENCE'],
  'Монгол морьтон, тал нутгийн график дүрслэл': ['Mongolian horse rider on the steppe, illustration', 'Монгольский всадник в степи, иллюстрация', '草原のモンゴル騎手のイラスト', '초원의 몽골 기수 그림'],
  'ЭРИЙН ГУРВАН НААДАМ': ['THE THREE MANLY GAMES', 'ТРИ ИГРЫ МУЖЕЙ', '男の三種競技', '남자의 세 경기'],
  'НЭГ ДИЖИТАЛ ТАЛБАР': ['ONE DIGITAL ARENA', 'ОДНА ЦИФРОВАЯ АРЕНА', 'ひとつのデジタル舞台', '하나의 디지털 무대'],
  'ҮНДЭСНИЙ БАХАРХАЛ ✦': ['NATIONAL PRIDE ✦', 'НАЦИОНАЛЬНАЯ ГОРДОСТЬ ✦', '民族の誇り ✦', '민족의 자부심 ✦'],
  'ТАЛБАРАА СОНГО': ['CHOOSE YOUR ARENA', 'ВЫБЕРИТЕ АРЕНУ', '競技を選ぶ', '경기를 선택하세요'],
  'ГУРВАН': ['THREE', 'ТРИ', '三つの', '세 가지'],
  'ИХ ӨВ': ['GREAT LEGACIES', 'ВЕЛИКИХ НАСЛЕДИЯ', '偉大な遺産', '위대한 유산'],
  'ТҮҮХ, ӨРСӨЛДӨӨН, ТЕХНОЛОГИ': ['HISTORY, COMPETITION, TECHNOLOGY', 'ИСТОРИЯ, СОСТЯЗАНИЕ, ТЕХНОЛОГИИ', '歴史・競争・テクノロジー', '역사, 경쟁, 기술'],
  '01 / БӨХ': ['01 / WRESTLING', '01 / БОРЬБА', '01 / 相撲', '01 / 씨름'],
  '02 / МОРЬ': ['02 / HORSES', '02 / СКАЧКИ', '02 / 競馬', '02 / 경마'],
  '03 / СУР': ['03 / ARCHERY', '03 / ЛУК', '03 / 弓術', '03 / 활쏘기'],
  'ҮНДЭСНИЙ БӨХ': ['NATIONAL WRESTLING', 'НАЦИОНАЛЬНАЯ БОРЬБА', 'モンゴル相撲', '몽골 씨름'],
  'Бөхийн барилдаан · Оноолт · 3D': ['Wrestling bouts · Bracket · 3D', 'Схватки · Турнирная сетка · 3D', '取組 · 組み合わせ · 3D', '경기 · 대진표 · 3D'],
  'ХУРДАН МОРЬ': ['HORSE RACING', 'СКАЧКИ', '競馬', '경마'],
  '3D уралдаан · Шууд явц · Байрлал': ['3D race · Live progress · Positions', '3D-скачки · Ход гонки · Позиции', '3Dレース · ライブ進行 · 順位', '3D 경주 · 실시간 진행 · 순위'],
  'СУР ХАРВАА': ['ARCHERY', 'СТРЕЛЬБА ИЗ ЛУКА', '弓術', '활쏘기'],
  '3D бай · Оноо · Харвааны замнал': ['3D target · Score · Arrow path', '3D-мишень · Очки · Траектория', '3D的 · 得点 · 矢の軌道', '3D 과녁 · 점수 · 화살 궤적'],

  // Спортын хуудсууд
  'ХУРДАН': ['SWIFT', 'СКАКОВЫЕ', '速き', '빠른'],
  'МОРЬ': ['HORSES', 'КОНИ', '馬', '말'],
  'Тал нутгийн хийморь — 3D симуляци дахь уралдааны явцыг агшин бүрд дагаарай.': [
    'The spirit of the steppe — follow every moment of the race in a 3D simulation.',
    'Дух степи — следите за каждым мгновением скачек в 3D-симуляции.',
    '草原の魂 — 3Dシミュレーションでレースの瞬間を追いかけよう。',
    '초원의 기상 — 3D 시뮬레이션으로 경주의 매 순간을 따라가세요.'],
  'Камерыг буцаах': ['Reset camera', 'Сбросить камеру', 'カメラをリセット', '카메라 초기화'],
  'Камер': ['Camera', 'Камера', 'カメラ', '카메라'],
  'Зогсоох': ['Pause', 'Пауза', '一時停止', '일시정지'],
  'Үргэлжлүүлэх': ['Resume', 'Продолжить', '再開', '계속'],
  'Хурдан морины 3D уралдааны талбай': ['3D horse race track', '3D-трасса скачек', '競馬の3Dコース', '경마 3D 트랙'],
  '3D ҮЗҮҮЛЭЛТ АЧААЛЖ БАЙНА…': ['LOADING 3D VIEW…', 'ЗАГРУЗКА 3D…', '3Dを読み込み中…', '3D 불러오는 중…'],
  '3D ТАЛБАЙ АЧААЛЖ БАЙНА…': ['LOADING 3D ARENA…', 'ЗАГРУЗКА 3D-АРЕНЫ…', '3D会場を読み込み中…', '3D 경기장 불러오는 중…'],
  '3D АЧААЛАХ БОЛОМЖГҮЙ — ИНТЕРНЕТ / WEBGL ШАЛГАНА УУ': ['3D UNAVAILABLE — CHECK INTERNET / WEBGL', '3D НЕДОСТУПНО — ПРОВЕРЬТЕ ИНТЕРНЕТ / WEBGL', '3Dを表示できません — ネット/WebGLを確認', '3D를 불러올 수 없음 — 인터넷/WebGL 확인'],
  'Three.js ашиглан талбай дүрслэнэ': ['Arena rendered with Three.js', 'Арена отрисована на Three.js', 'Three.jsで会場を描画', 'Three.js로 경기장 렌더링'],
  'Чирж эргүүлнэ · Scroll хийж ойртуулна': ['Drag to rotate · Scroll to zoom', 'Тяните для вращения · Колесо для зума', 'ドラッグで回転 · スクロールでズーム', '드래그로 회전 · 스크롤로 확대'],
  'УРАЛДААНЫ ЯВЦ': ['RACE PROGRESS', 'ХОД СКАЧЕК', 'レース進行', '경주 진행'],
  'ГАРАА': ['START', 'СТАРТ', 'スタート', '출발'],
  'БАРИА': ['FINISH', 'ФИНИШ', 'ゴール', '결승'],
  'Уралдаан үргэлжилж байна': ['Race in progress', 'Скачки идут', 'レース進行中', '경주 진행 중'],
  'Барианд ирлээ': ['Finished', 'Финишировали', 'ゴール', '결승 도착'],
  'Түр зогсоосон': ['Paused', 'Пауза', '一時停止中', '일시정지됨'],
  'УРАЛДААНЫ АНГИЛАЛ': ['RACE CLASS', 'КАТЕГОРИЯ СКАЧЕК', 'レース区分', '경주 등급'],
  'Морины насны ангилал': ['Horse age class', 'Возрастная категория коней', '馬の年齢区分', '말 나이 등급'],
  'Азарга': ['Stallion', 'Жеребцы', '種牡馬', '종마'],
  'Соёолон': ['Six-year', 'Шестилетки', '6歳馬', '6세마'],
  'Их нас': ['Senior', 'Старшие', '成馬', '성마'],
  'ТЭРГҮҮЛЖ БУЙ': ['LEADING', 'ЛИДИРУЮЩИЕ', '先頭の', '선두'],
  'МОРЬД': ['HORSES', 'КОНИ', '馬たち', '말들'],
  'ДЭЭЖ ХУРД': ['TOP SPEED', 'МАКС. СКОРОСТЬ', '最高速度', '최고 속도'],
  'км/ц': ['km/h', 'км/ч', 'km/h', 'km/h'],
  '— км/ц': ['— km/h', '— км/ч', '— km/h', '— km/h'],

  'ҮНДЭСНИЙ': ['NATIONAL', 'НАЦИОНАЛЬНАЯ', '伝統の', '전통'],
  'БӨХ': ['WRESTLING', 'БОРЬБА', '相撲', '씨름'],
  'Эр бяр, уран мэх, ёс жудаг. Бөхийн талбайг 3D орчинд мэдэр.': [
    'Strength, skill and honor. Feel the wrestling arena in 3D.',
    'Сила, мастерство и честь. Почувствуйте арену борьбы в 3D.',
    '力、技、そして礼節。相撲の会場を3Dで体感しよう。',
    '힘, 기술, 그리고 예의. 씨름 경기장을 3D로 느껴보세요.'],
  '3D ТАЛБАЙ': ['3D ARENA', '3D-АРЕНА', '3D会場', '3D 경기장'],
  '3D БӨХИЙН ТАЛБАЙ': ['3D WRESTLING ARENA', '3D-АРЕНА БОРЬБЫ', '3D相撲会場', '3D 씨름 경기장'],
  'Чирж талбайг эргүүлнэ': ['Drag to rotate the arena', 'Тяните, чтобы вращать арену', 'ドラッグで会場を回転', '드래그로 경기장 회전'],
  'ӨРСӨЛДӨӨНИЙ АГШИН': ['MATCH MOMENT', 'МОМЕНТ СХВАТКИ', '取組の瞬間', '경기의 순간'],
  'БАРИЛДААН ЭХЭЛЛЭЭ': ['THE BOUTS HAVE BEGUN', 'СХВАТКИ НАЧАЛИСЬ', '取組開始', '경기 시작'],
  'ТОГЛОЛТЫН СИМУЛЯЦИ': ['MATCH SIMULATION', 'СИМУЛЯЦИЯ СХВАТОК', '取組シミュレーション', '경기 시뮬레이션'],
  'БӨХИЙН': ['WRESTLING', 'ТУРНИРНАЯ', '相撲の', '씨름'],
  'ОНООЛТ': ['BRACKET', 'СЕТКА', '組み合わせ', '대진표'],
  'ДАРААГИЙН БАРИЛДААН →': ['NEXT BOUT →', 'СЛЕДУЮЩАЯ СХВАТКА →', '次の取組 →', '다음 경기 →'],
  'ТЭМЦЭЭН ДУУСЛАА': ['TOURNAMENT OVER', 'ТУРНИР ЗАВЕРШЁН', '大会終了', '대회 종료'],
  'I ДАВАА': ['ROUND I', 'I КРУГ', '第1回戦', '1라운드'],
  'II ДАВАА': ['ROUND II', 'II КРУГ', '第2回戦', '2라운드'],
  'Ялагч': ['Winner', 'Победитель', '勝者', '승자'],
  'Хүлээгдэж буй': ['Pending', 'Ожидается', '未定', '대기 중'],
  'Тодорхойгүй': ['TBD', 'Не определён', '未定', '미정'],
  '↻ Шинээр эхлэх': ['↻ Start over', '↻ Начать заново', '↻ やり直す', '↻ 다시 시작'],

  'СУР': ['MONGOLIAN', 'ТРАДИЦИОННАЯ', '伝統', '전통'],
  'ХАРВАА': ['ARCHERY', 'СТРЕЛЬБА', '弓術', '활쏘기'],
  'МЭРГЭН': ['MASTER', 'МЕТКАЯ', '名手の', '명궁의'],
  'Мэргэн харваачдын оюун ухаан, хараа, төвлөрлийг 3D дүрслэлээр.': [
    'The mind, sight and focus of master archers, visualized in 3D.',
    'Разум, зоркость и сосредоточенность метких лучников — в 3D.',
    '名射手の知恵、視力、集中力を3Dで表現。',
    '명궁의 지혜, 시력, 집중력을 3D로 표현합니다.'],
  '3D СУРЫН БАЙ': ['3D ARCHERY TARGET', '3D-МИШЕНЬ', '3Dの的', '3D 과녁'],
  '3D байг эргүүлж харна': ['Rotate the 3D target', 'Вращайте 3D-мишень', '3Dの的を回して見る', '3D 과녁을 돌려 보기'],
  'СҮҮЛИЙН ХАРВАА': ['LAST SHOT', 'ПОСЛЕДНИЙ ВЫСТРЕЛ', '最後の一射', '마지막 사격'],
  'БАЙНД ТУСАХЫГ ХҮЛЭЭНЭ ҮҮ': ['WAITING FOR A HIT', 'ОЖИДАЕМ ПОПАДАНИЯ', '的中を待っています', '명중을 기다리는 중'],
  'ОНООНЫ ХЯНАЛТ': ['SCOREBOARD', 'ТАБЛО ОЧКОВ', 'スコア', '점수판'],
  '8 СУМ': ['8 ARROWS', '8 СТРЕЛ', '8本の矢', '화살 8개'],
  'ХАРВААЧ': ['ARCHER', 'ЛУЧНИК', '射手', '궁수'],
  'Мэргэн харваач · Демо': ['Master archer · Demo', 'Меткий лучник · Демо', '名射手 · デモ', '명궁 · 데모'],
  'НИЙТ ОНОО': ['TOTAL SCORE', 'ВСЕГО ОЧКОВ', '合計得点', '총점'],
  'ХАРВСАН СУМ': ['ARROWS SHOT', 'ВЫПУЩЕНО СТРЕЛ', '放った矢', '쏜 화살'],
  'СУМ ТАВИХ': ['SHOOT ARROW', 'ВЫСТРЕЛИТЬ', '矢を放つ', '화살 쏘기'],
  'ШИНЭЭР ЭХЛЭХ': ['START OVER', 'НАЧАТЬ ЗАНОВО', 'やり直す', '다시 시작'],
  '※ Оноо нь сургалтын зориулалттай симуляци; бодит тэмцээний дүрэм, үр дүн биш.': [
    '※ Scores are an educational simulation, not official competition rules or results.',
    '※ Очки — учебная симуляция, а не официальные правила или результаты.',
    '※ 得点は学習用のシミュレーションであり、実際の大会の規則や結果ではありません。',
    '※ 점수는 교육용 시뮬레이션이며 실제 대회 규칙이나 결과가 아닙니다.'],
  'ҮНДЭСНИЙ ӨВ / ДИЖИТАЛ ИРЭЭДҮЙ': ['NATIONAL HERITAGE / DIGITAL FUTURE', 'НАЦИОНАЛЬНОЕ НАСЛЕДИЕ / ЦИФРОВОЕ БУДУЩЕЕ', '民族の遺産 / デジタルの未来', '민족 유산 / 디지털 미래'],
};

// Тоо, нэр орсон динамик текстүүд (app.js-ээс).
const PATTERNS = [
  [/^(\d\d) \/ ЭРИЙН ГУРВАН НААДАМ$/, m => `${m[1]} / ${word('ЭРИЙН ГУРВАН НААДАМ')}`],
  [/^([\d.,]+) км\/ц$/, m => `${m[1]} ${word('км/ц')}`],
  [/^([\d,]+) \/ 18,000 м$/, m => `${m[1]} / 18,000 ${['m', 'м', 'm', 'm'][COL[lang]]}`],
  [/^(\d) \/ 7 БАРИЛДААН ДУУСЛАА$/, m => [`${m[1]} / 7 BOUTS DONE`, `${m[1]} / 7 СХВАТОК ЗАВЕРШЕНО`, `${m[1]} / 7 取組終了`, `${m[1]} / 7 경기 종료`][COL[lang]]],
  [/^(.+) — ТҮРҮҮЛЛЭЭ$/, m => [`${m[1]} — CHAMPION`, `${m[1]} — ПОБЕДИТЕЛЬ`, `${m[1]} — 優勝`, `${m[1]} — 우승`][COL[lang]]],
  [/^СҮҮЛИЙН СУМ: (\d+) ОНОО$/, m => [`LAST ARROW: ${m[1]} POINTS`, `ПОСЛЕДНЯЯ СТРЕЛА: ${m[1]} ОЧК.`, `最後の矢: ${m[1]}点`, `마지막 화살: ${m[1]}점`][COL[lang]]],
  [/^(\d+)-р сум: (\d+) оноо$/, m => [`Arrow ${m[1]}: ${m[2]} points`, `Стрела ${m[1]}: ${m[2]} очк.`, `${m[1]}本目: ${m[2]}点`, `${m[1]}번째 화살: ${m[2]}점`][COL[lang]]],
  [/^(.+) морины явцыг харах$/, m => [`View ${m[1]}'s progress`, `Следить за конём ${m[1]}`, `${m[1]}の進行を見る`, `${m[1]}의 진행 보기`][COL[lang]]],
];

let lang = 'mn';
try { lang = localStorage.getItem(STORE_KEY) || 'mn'; } catch {}
if (!LANGS.some(l => l.code === lang)) lang = 'mn';

function word(src) {
  if (lang === 'mn') return src;
  const row = DICT[src];
  return row ? row[COL[lang]] : src;
}
function lookup(text) {
  if (lang === 'mn') return text;
  const row = DICT[text];
  if (row) return row[COL[lang]];
  for (const [re, fn] of PATTERNS) {
    const m = text.match(re);
    if (m) return fn(m);
  }
  return null;
}
function translate(src) {
  const t = src.trim();
  if (!t) return src;
  const out = lookup(t);
  return out == null ? src : src.replace(t, out);
}

// Зангилаа бүрийн эх Монгол текст ба бидний бичсэн орчуулга.
const textMemo = new WeakMap();
const attrMemo = new WeakMap();
const ATTRS = ['aria-label', 'title'];
const skip = el => !el || el.closest?.('[data-i18n-skip], script, style, svg');

function doText(node) {
  if (skip(node.parentElement)) return;
  let rec = textMemo.get(node);
  if (!rec || node.data !== rec.out) { rec = { src: node.data }; textMemo.set(node, rec); }
  rec.out = translate(rec.src);
  if (node.data !== rec.out) node.data = rec.out;
}
function doAttr(el, name) {
  if (!el.hasAttribute(name) || skip(el)) return;
  let recs = attrMemo.get(el);
  if (!recs) { recs = {}; attrMemo.set(el, recs); }
  const cur = el.getAttribute(name);
  let rec = recs[name];
  if (!rec || cur !== rec.out) { rec = recs[name] = { src: cur }; }
  rec.out = translate(rec.src);
  if (cur !== rec.out) el.setAttribute(name, rec.out);
}
function walk(root) {
  if (root.nodeType === Node.TEXT_NODE) return doText(root);
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  ATTRS.forEach(a => doAttr(root, a));
  const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n = it.nextNode(); n; n = it.nextNode()) {
    if (n.nodeType === Node.TEXT_NODE) doText(n);
    else ATTRS.forEach(a => doAttr(n, a));
  }
}

const titleSrc = document.title;
function applyAll() {
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;
  document.title = translate(titleSrc);
  walk(document.body);
  const sel = document.getElementById('lang-select');
  if (sel) sel.value = lang;
}

export function setLang(code) {
  if (!LANGS.some(l => l.code === code)) return;
  lang = code;
  try { localStorage.setItem(STORE_KEY, code); } catch {}
  applyAll();
}

// Толгой хэсэгт хэл сонгогч нэмнэ.
function mountSwitcher() {
  const actions = document.querySelector('.top-actions');
  if (!actions || document.getElementById('lang-select')) return;
  const sel = document.createElement('select');
  sel.id = 'lang-select';
  sel.className = 'lang-select';
  sel.setAttribute('aria-label', 'Хэл сонгох');
  sel.title = 'Хэл сонгох';
  sel.innerHTML = LANGS.map(l => `<option value="${l.code}">${l.short} · ${l.label}</option>`).join('');
  sel.addEventListener('change', () => setLang(sel.value));
  actions.prepend(sel);
}

mountSwitcher();
applyAll();
new MutationObserver(list => {
  if (lang === 'mn') return;
  for (const m of list) {
    if (m.type === 'characterData') doText(m.target);
    else if (m.type === 'attributes') doAttr(m.target, m.attributeName);
    else m.addedNodes.forEach(walk);
  }
}).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
