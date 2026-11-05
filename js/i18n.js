// NAADAM i18n — Монгол, English, Русский, 日本語, 한국어.
// index.html болон app.js-ийг өөрчлөхгүйгээр Монгол текстийг орчуулна:
// текст зангилаа бүрийн эх (Монгол) утгыг хадгалж, сонгосон хэл рүү солино.
// app.js шинээр бичсэн текстийг MutationObserver барьж орчуулна.

const LANGS = [
  { code: 'mn', label: 'Монгол', short: 'MN', sub: 'Mongolian' },
  { code: 'en', label: 'English', short: 'EN', sub: 'English' },
  { code: 'ru', label: 'Русский', short: 'RU', sub: 'Russian' },
  { code: 'ja', label: '日本語', short: 'JA', sub: 'Japanese' },
  { code: 'ko', label: '한국어', short: 'KO', sub: 'Korean' },
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
  'Монгол түмний хийморь болсон эрийн гурван наадмыг шинээр мэдэр. Наадмын талбай, бөхчүүдийн мэдээлэл, шууд дүрслэл.': [
    'Experience the three manly games, the pride of the Mongolian people, in a new way. The Naadam field, wrestler profiles and a live view.',
    'Откройте заново три игры мужей — гордость монгольского народа. Поле Наадама, профили борцов и прямой показ.',
    'モンゴル民族の誇りである男の三種競技を新しい形で体験しよう。ナーダムの会場、力士の情報、ライブ表示。',
    '몽골 민족의 자부심인 남자의 세 경기를 새롭게 경험하세요. 나담 경기장, 선수 정보, 라이브 화면.'],
  'LIVE ҮЗЭХ': ['WATCH LIVE', 'СМОТРЕТЬ LIVE', 'ライブを見る', '라이브 보기'],
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
  'Наадмын талбай · Бөхчүүд · Оноолт': ['Naadam field · Wrestlers · Bracket', 'Поле · Борцы · Сетка', '会場 · 力士 · 組み合わせ', '경기장 · 선수 · 대진'],
  'ХУРДАН МОРЬ': ['HORSE RACING', 'СКАЧКИ', '競馬', '경마'],
  'Замын зураг · Шууд явц · Байрлал': ['Route map · Live progress · Positions', 'Карта · Ход гонки · Позиции', 'コースマップ · ライブ進行 · 順位', '코스 지도 · 실시간 진행 · 순위'],
  'СУР ХАРВАА': ['ARCHERY', 'СТРЕЛЬБА ИЗ ЛУКА', '弓術', '활쏘기'],
  'Бай · Оноо · Тусалт': ['Target · Score · Hits', 'Мишень · Очки · Попадания', '的 · 得点 · 命中', '과녁 · 점수 · 명중'],

  // Спортын хуудсууд
  'ХУРДАН': ['SWIFT', 'СКАКОВЫЕ', '速き', '빠른'],
  'МОРЬ': ['HORSES', 'КОНИ', '馬', '말'],
  'Тал нутгийн хийморь — уралдааны явцыг замын зураг дээр агшин бүрд дагаарай.': [
    'The spirit of the steppe — follow every moment of the race on the route map.',
    'Дух степи — следите за скачками на карте маршрута.',
    '草原の魂 — コースマップでレースの瞬間を追いかけよう。',
    '초원의 기상 — 코스 지도에서 경주의 매 순간을 따라가세요.'],
  'Зогсоох': ['Pause', 'Пауза', '一時停止', '일시정지'],
  'Үргэлжлүүлэх': ['Resume', 'Продолжить', '再開', '계속'],
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
  'Эр бяр, уран мэх, ёс жудаг. Наадмын талбай дээрх бөх бүр дээр дарж танилц.': [
    'Strength, skill and honor. Tap any wrestler on the Naadam field to meet them.',
    'Сила, мастерство и честь. Нажмите на борца на поле, чтобы узнать о нём.',
    '力、技、そして礼節。会場の力士をタップして知ろう。',
    '힘, 기술, 그리고 예의. 경기장의 선수를 눌러 알아보세요.'],
  'НААДМЫН ТАЛБАЙ': ['NAADAM FIELD', 'ПОЛЕ НААДАМА', 'ナーダム会場', '나담 경기장'],
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
  'Мэргэн харваачдын оюун ухаан, хараа, төвлөрлийг байны дүрслэлээр.': [
    'The mind, sight and focus of master archers, shown on the target.',
    'Разум, зоркость и сосредоточенность лучников — на мишени.',
    '名射手の知恵、視力、集中力を的で表現。',
    '명궁의 지혜, 시력, 집중력을 과녁으로 보여줍니다.'],
  'LIVE / ЭРИЙН ГУРВАН НААДАМ': ['LIVE / THE THREE MANLY GAMES', 'LIVE / ТРИ ИГРЫ МУЖЕЙ', 'LIVE / 男の三種競技', 'LIVE / 남자의 세 경기'],
  'ШУУД': ['LIVE', 'ПРЯМОЙ', 'ライブ', '라이브'],
  'ДАМЖУУЛАЛТ': ['BROADCAST', 'ЭФИР', '中継', '중계'],
  'Талбай дээрх барилдаан, уралдаан, харвааг нэг дор шууд дагаарай.': ['Follow the bouts, the race and the archery live in one place.', 'Следите за борьбой, скачками и стрельбой в одном месте.', '取組、レース、弓射を一か所でライブ観戦。', '씨름, 경주, 활쏘기를 한곳에서 라이브로 보세요.'],
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
  'ХАЛХ СУР · ЗАСУУЛЫН ХЯНАЛТ': ['KHALKH ARCHERY · JUDGES\' BOARD', 'ХАЛХАСКАЯ СТРЕЛЬБА · СУДЬИ', 'ハルハ弓射 · 審判', '할하 활쏘기 · 심판'],
  '4 СУМ × 4 ҮЕ': ['4 ARROWS × 4 ROUNDS', '4 СТРЕЛЫ × 4 РАУНДА', '4本 × 4巡', '화살 4 × 4라운드'],
  'Эрэгтэй · 75 м': ['Men · 75 m', 'Мужчины · 75 м', '男子 · 75 m', '남자 · 75 m'],
  'Эмэгтэй · 65 м': ['Women · 65 m', 'Женщины · 65 м', '女子 · 65 m', '여자 · 65 m'],
  'ҮЕ': ['ROUND', 'РАУНД', '巡', '라운드'],
  'САЛХИ': ['WIND', 'ВЕТЕР', '風', '바람'],
  'ҮЕ ХАРВАХ': ['SHOOT ROUND', 'СЕРИЯ', '一巡射る', '라운드 쏘기'],
  'ШИНЭЭР': ['RESET', 'ЗАНОВО', 'リセット', '초기화'],
  'ХАЛХ СУР · 30 СУР': ['KHALKH · 30 SUR', 'ХАЛХ · 30 СУР', 'ハルハ · 30スル', '할하 · 수르 30개'],
  'Хана · Онолт · Уухай': ['Wall · Hits · Uukhai', 'Стенка · Попадания · Уухай', '壁 · 的中 · ウーハイ', '벽 · 명중 · 우하이'],
  '※ Харваачид нь зохиомол, онолт нь симуляци. Дүрэм: Халх сурын эрэгтэй 75 м, эмэгтэй 65 м зайнаас 30 сурын хана руу харваж, онолтын тоогоор шалгаруулна.': [
    '※ The archers are fictional and the hits are simulated. Rules: in Khalkh archery men shoot from 75 m and women from 65 m at a wall of 30 sur; the most hits wins.',
    '※ Лучники вымышлены, попадания — симуляция. Правила: в халхаской стрельбе мужчины стреляют с 75 м, женщины с 65 м по стенке из 30 сур; побеждает больше попаданий.',
    '※ 射手は架空で、的中はシミュレーションです。ハルハ式では男子75 m、女子65 mから30個のスルの壁を射て、的中数で競います。',
    '※ 궁수는 가상이며 명중은 시뮬레이션입니다. 할하식은 남자 75 m, 여자 65 m에서 수르 30개 벽을 쏘며 명중 수로 겨룹니다.'],
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
  const sw = document.getElementById('lang-switch');
  if (sw) {
    const cur = LANGS.find(l => l.code === lang);
    sw.querySelector('.ls-code').textContent = cur.short;
    sw.querySelector('.ls-name').textContent = cur.label;
    sw.querySelectorAll('[role="option"]').forEach(o => o.setAttribute('aria-selected', String(o.dataset.code === lang)));
  }
}

export function setLang(code) {
  if (!LANGS.some(l => l.code === code)) return;
  lang = code;
  try { localStorage.setItem(STORE_KEY, code); } catch {}
  applyAll();
}

// Толгой хэсэгт хэл сонгогч нэмнэ: бөмбөрцөг дүрстэй товч, дарахад хөдөлгөөнтэй жагсаалт нээгдэнэ.
// Гараар: ↑/↓ сонголт, Enter сонгох, Esc хаах.
function mountSwitcher() {
  const actions = document.querySelector('.top-actions');
  if (!actions || document.getElementById('lang-switch')) return;
  const wrap = document.createElement('div');
  wrap.id = 'lang-switch';
  wrap.className = 'lang-switch';
  wrap.setAttribute('data-i18n-skip', '');
  wrap.innerHTML = `<button type="button" class="ls-button" aria-haspopup="listbox" aria-expanded="false" aria-label="Хэл сонгох / Language">
      <svg class="ls-globe" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.8 3.9 5.8 3.9 9s-1.3 6.2-3.9 9c-2.6-2.8-3.9-5.8-3.9-9S9.4 5.8 12 3z"/></svg>
      <span class="ls-code"></span><span class="ls-name"></span>
      <svg class="ls-chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5"/></svg>
    </button>
    <ul class="ls-menu" role="listbox" tabindex="-1" aria-label="Хэл / Language">
      ${LANGS.map((l, i) => `<li role="option" data-code="${l.code}" style="--i:${i}" tabindex="-1"><span class="ls-badge">${l.short}</span><span class="ls-text"><b>${l.label}</b><small>${l.sub}</small></span><svg class="ls-check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5"/></svg></li>`).join('')}
    </ul>`;
  const btn = wrap.querySelector('.ls-button'), opts = [...wrap.querySelectorAll('[role="option"]')];
  const open = () => {
    wrap.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
    (opts.find(o => o.dataset.code === lang) || opts[0]).focus({ preventScroll: true });
  };
  const close = focus => {
    if (!wrap.classList.contains('open')) return;
    wrap.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
    if (focus) btn.focus();
  };
  const pick = code => {
    if (code !== lang) { setLang(code); wrap.classList.remove('flash'); void wrap.offsetWidth; wrap.classList.add('flash'); }
    close(true);
  };
  btn.addEventListener('click', () => wrap.classList.contains('open') ? close() : open());
  btn.addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); } });
  opts.forEach(o => o.addEventListener('click', () => pick(o.dataset.code)));
  wrap.querySelector('.ls-menu').addEventListener('keydown', e => {
    const i = opts.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); opts[(i + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length].focus(); }
    else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); opts[e.key === 'Home' ? 0 : opts.length - 1].focus(); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (i >= 0) pick(opts[i].dataset.code); }
    else if (e.key === 'Escape' || e.key === 'Tab') close(e.key === 'Escape');
  });
  document.addEventListener('click', e => { if (!wrap.contains(e.target)) close(); });
  actions.prepend(wrap);
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
