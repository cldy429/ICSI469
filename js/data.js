// NAADAM content data — real champions and free-license photos.
// Champion facts: Wikipedia "Mongolian wrestling" (State champions table).
// Photos: Wikimedia Commons, hot-linked with author + license credit.

const commons = (path, file, width = 1920) =>
  `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${file}/${width}px-${file}`;
const commonsFull = (path, file) => `https://upload.wikimedia.org/wikipedia/commons/${path}/${file}`;

export const PHOTOS = {
  opening: {
    src: commons('d/d9', 'Naadam_Festival_2024_Opening_Ceremony.jpg'),
    author: 'Chongkian', license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Naadam_Festival_2024_Opening_Ceremony.jpg',
  },
  wrestlers: {
    src: commons('e/ee', 'Mongolian_Naadam_Wrestlers_-_2010.jpg'),
    author: 'FischerFotos', license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Mongolian_Naadam_Wrestlers_-_2010.jpg',
  },
  wrestling: {
    src: commons('5/5f', 'Naadam_wrestling.jpg'),
    author: 'Zoharby', license: 'CC BY-SA 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:Naadam_wrestling.jpg',
  },
  racers: {
    src: commons('9/96', 'Young_Naadam_Horse_Racers_in_Mongolia_-_2010.jpg'),
    author: 'FischerFotos', license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Young_Naadam_Horse_Racers_in_Mongolia_-_2010.jpg',
  },
  race: {
    src: commons('1/17', 'Nadaam_Racers.jpg'),
    author: 'Mark Fischer', license: 'CC BY-SA 2.0',
    page: 'https://commons.wikimedia.org/wiki/File:Nadaam_Racers.jpg',
  },
  archery: {
    src: commonsFull('5/52', 'Sur_harvaa_Archery_2015_Mongolia.png'),
    author: 'Orgio89', license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Sur_harvaa_Archery_2015_Mongolia.png',
  },
  archer: {
    src: commons('d/d5', 'Mongolian_Archery_Competition.jpg', 1280),
    author: 'Bfreeproductions', license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Mongolian_Archery_Competition.jpg',
  },
  city: {
    src: commons('c/c0', 'Naadam_2023%2C_Ulan_Bator_07.jpg'),
    author: 'Bernard Gagnon', license: 'CC0',
    page: 'https://commons.wikimedia.org/wiki/File:Naadam_2023,_Ulan_Bator_07.jpg',
  },
};

// Улсын баяр наадамд түрүүлсэн аваргууд (wins = түрүү, runnerUp = үзүүр).
// Bracket order: 0–1, 2–3, 4–5, 6–7 meet in round one. Index 8 (2026 champion) is not in the bracket.
// Career facts (birthplace, title path, local Naadams, awards): Mongolian Wikipedia pages linked in `wiki`.
// path levels: 'sum' = сумын, 'aimag' = аймгийн, 'state' = улсын цол.
const mnwiki = title => `https://mn.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
export const LEGENDS = [
  {id: 'baterdene', name: 'Б. Бат-Эрдэнэ', en: 'B. Bat-Erdene', full: 'Бадмаанямбуугийн Бат-Эрдэнэ', wins: 11, runnerUp: 1,
    years: '1988–1990, 1992–1999', title: {mn: 'Улсын дархан аварга', en: 'State Grand Champion'},
    born: 1964, home: {mn: 'Хэнтий аймаг, Өмнөдэлгэр сум', en: 'Ömnödelger sum, Khentii aimag'},
    path: [['aimag', null, 'Аймгийн арслан', 'Aimag Lion'], ['state', 1985, 'Улсын начин', 'State Falcon'], ['state', 1986, 'Улсын заан', 'State Elephant'],
      ['state', 1988, 'Улсын арслан', 'State Lion'], ['state', 1989, 'Улсын аварга', 'State Champion'], ['state', 1990, 'Даян, дархан аварга', 'Wide & Grand Champion']],
    local: {mn: 'Улсын наадамд ирэхээсээ өмнө аймгийн арслан цолтой байсан.', en: 'Held the Aimag Lion title before reaching the national Naadam.'},
    awards: {mn: 'Гавьяат тамирчин (1989), Хөдөлмөрийн баатар (1998), УИХ-ын гишүүн', en: 'Honoured Athlete (1989), Hero of Labour (1998), Member of Parliament'},
    note: {mn: '1990 онд "Монголын нууц товчоо"-ны 750 жилийн ойн наадамд мөн түрүүлсэн. Түрүүгээрээ дээд амжилт эзэмшигч.',
      en: 'Also won the 1990 Naadam marking 750 years of the Secret History of the Mongols. Holds the record for most titles.'},
    photo: {src: 'https://upload.wikimedia.org/wikipedia/commons/0/01/GRIX3129-550%281%29_%281%29.jpg', author: 'Mil.ru', license: 'CC BY 4.0',
      page: 'https://commons.wikimedia.org/wiki/File:GRIX3129-550(1)_(1).jpg'}},
  {id: 'batsuuri', name: 'Н. Батсуурь', en: 'N. Batsuuri', full: 'Намсрайжавын Батсуурь', wins: 4, runnerUp: 2,
    years: '2014, 2018–2019, 2024', title: {mn: 'Улсын дархан аварга', en: 'State Grand Champion'},
    born: 1987, home: {mn: 'Увс аймаг, Ховд сум', en: 'Khovd sum, Uvs aimag'},
    path: [['aimag', 2007, 'Аймгийн начин', 'Aimag Falcon'], ['aimag', 2011, 'Аймгийн арслан', 'Aimag Lion'], ['state', 2013, 'Улсын харцага', 'State Hawk'],
      ['state', 2014, 'Улсын арслан', 'State Lion'], ['state', 2018, 'Улсын аварга', 'State Champion'], ['state', 2021, 'Даян аварга', 'Wide Champion'], ['state', 2024, 'Дархан аварга', 'Grand Champion']],
    local: {mn: '2011 онд Дархан-Уул аймгийн 50 жилийн ойн наадамд түрүүлж аймгийн арслан болсон.', en: 'Won the 2011 Darkhan-Uul aimag 50th-anniversary Naadam, becoming Aimag Lion.'},
    awards: {mn: 'Жүдо бөхийн улсын аварга (2013), спортын мастер. 2026 оны наадамд шөвгийн дөрөвт үлдсэн.', en: 'National judo champion (2013), master of sport. Reached the final four at the 2026 Naadam.'},
    note: {mn: '2024 оны наадамд түрүүлж дархан аварга болсон.', en: 'Won the 2024 Naadam to become Grand Champion.'}},
  {id: 'munkhbat', name: 'Ж. Мөнхбат', en: 'J. Mönkhbat', full: 'Жигжидийн Мөнхбат', wins: 6, runnerUp: 4,
    years: '1963–1967, 1974', title: {mn: 'Улсын дархан аварга', en: 'State Grand Champion'},
    born: 1941, home: {mn: 'Төв аймаг, Эрдэнэсант сум', en: 'Erdenesant sum, Töv aimag'},
    path: [['sum', 1960, 'Сумын заан', 'Sum Elephant'], ['state', 1961, 'Улсын заан', 'State Elephant'], ['state', 1963, 'Улсын арслан', 'State Lion'],
      ['state', 1965, 'Улсын аварга', 'State Champion'], ['state', 1966, 'Дархан аварга', 'Grand Champion']],
    local: {mn: '1960 онд сумын наадамд түрүүлж сумын заан цол авсан.', en: 'Won his sum Naadam in 1960 to earn the Sum Elephant title.'},
    awards: {mn: 'Олимпын мөнгөн медальт (чөлөөт бөх), Гавьяат тамирчин, Хөдөлмөрийн баатар (1994)', en: 'Olympic silver medallist (freestyle), Honoured Athlete, Hero of Labour (1994)'},
    note: {mn: 'Таван жил дараалан түрүүлсэн.', en: 'Won five Naadams in a row.'}},
  {id: 'damdin', name: 'Д. Дамдин', en: 'D. Damdin', full: 'Дарийн Дамдин', wins: 5, runnerUp: 5,
    years: '1956–1960', title: {mn: 'Улсын дархан аварга', en: 'State Grand Champion'},
    born: 1931, home: {mn: 'Хөвсгөл аймаг, Цагаан-Үүр сум', en: 'Tsagaan-Üür sum, Khövsgöl aimag'},
    path: [['sum', null, 'Сумын наадмын түрүү', 'Sum Naadam winner'], ['state', 1952, 'Улсын начин', 'State Falcon'], ['state', 1956, 'Улсын арслан', 'State Lion'],
      ['state', 1957, 'Улсын аварга', 'State Champion'], ['state', 1959, 'Даян аварга', 'Wide Champion'], ['state', 1960, 'Дархан аварга', 'Grand Champion']],
    local: {mn: '20 настайдаа сумын наадамд түрүүлж бөхийн гараагаа эхэлсэн.', en: 'Started his career by winning his sum Naadam at age 20.'},
    awards: {mn: 'Хөдөлмөрийн баатар (1999), циркийн Гавьяат жүжигчин', en: 'Hero of Labour (1999), Honoured Artist of the circus'},
    note: {mn: '1956–1960 онд таван удаа дараалан түрүүлсэн.', en: 'Won five straight titles, 1956–1960.'}},
  {id: 'bayanmunkh', name: 'Х. Баянмөнх', en: 'Kh. Bayanmönkh', full: 'Хорлоогийн Баянмөнх', wins: 10, runnerUp: 2,
    years: '1968, 1971–1973, 1975, 1977, 1979, 1981–1982, 1987', title: {mn: 'Улсын дархан аварга', en: 'State Grand Champion'},
    born: 1944, home: {mn: 'Увс аймаг, Хяргас сум', en: 'Khyargas sum, Uvs aimag'},
    path: [['state', 1963, 'Улсын начин, заан', 'State Falcon, Elephant'], ['state', 1966, 'Улсын арслан', 'State Lion'], ['state', 1968, 'Улсын аварга', 'State Champion'], ['state', 1971, 'Дархан аварга', 'Grand Champion']],
    local: {mn: '1963 онд анхны улсын наадамдаа начин, заан цол зэрэг авсан.', en: 'Earned State Falcon and Elephant at his first national Naadam in 1963.'},
    awards: {mn: 'Чөлөөт бөхийн дэлхийн аварга, Олимпын мөнгөн медальт, Хөдөлмөрийн баатар, "XX зууны манлай бөх"', en: 'Freestyle world champion, Olympic silver medallist, Hero of Labour, "Wrestler of the 20th century"'},
    note: {mn: '1968–1987 оны хооронд арван удаа түрүүлсэн.', en: 'Ten titles between 1968 and 1987.'}},
  {id: 'usukhbayar', name: 'Г. Өсөхбаяр', en: 'G. Ösökhbayar', full: 'Гэлэгжамцын Өсөхбаяр', wins: 4, runnerUp: 1,
    years: '2002–2003, 2005, 2009', title: {mn: 'Улсын дархан аварга', en: 'State Grand Champion'},
    born: 1973, home: {mn: 'Архангай аймаг, Батцэнгэл сум', en: 'Battsengel sum, Arkhangai aimag'},
    path: [['aimag', 1994, 'Аймгийн арслан', 'Aimag Lion'], ['state', 1995, 'Улсын заан', 'State Elephant'], ['state', 2002, 'Улсын арслан', 'State Lion'],
      ['state', 2003, 'Улсын аварга', 'State Champion'], ['state', 2005, 'Далай аварга', 'Dalai Champion'], ['state', 2009, 'Даян аварга', 'Wide Champion'], ['state', 2014, 'Дархан аварга', 'Grand Champion']],
    local: {mn: '1994 онд аймгийн наадамд 8 даваад түрүүлж аймгийн арслан болсон.', en: 'Won 8 rounds at his aimag Naadam in 1994 to become Aimag Lion.'},
    awards: {mn: 'Сүмо бөхийн Азийн аварга (2001), Азийн наадмын хүрэл медаль (1998). Өвөө нь даян аварга Н.Жамъян.', en: 'Asian sumo champion (2001), Asian Games bronze (1998). His grandfather was Wide Champion N. Jamyan.'},
    note: {mn: '2002–2009 оны хооронд дөрвөн удаа түрүүлсэн.', en: 'Four titles between 2002 and 2009.'}},
  {id: 'tuvdendorj', name: 'Б. Түвдэндорж', en: 'B. Tüvdendorj', full: 'Бадамдоригийн Түвдэндорж', wins: 7, runnerUp: 2,
    years: '1939, 1941, 1945–1946, 1952–1954', title: {mn: 'Улсын дархан аварга', en: 'State Grand Champion'},
    born: 1916, home: {mn: 'Булган аймаг, Хангал сум', en: 'Khangal sum, Bulgan aimag'},
    path: [['state', 1939, 'Улсын арслан', 'State Lion'], ['state', 1941, 'Улсын аварга', 'State Champion'], ['state', 1945, 'Даян аварга', 'Wide Champion'], ['state', 1946, 'Дархан аварга', 'Grand Champion']],
    local: {mn: 'Сум, аймгийн наадмын амжилтын тухай эх сурвалжид мэдээлэл алга.', en: 'No sum or aimag results are recorded in the source.'},
    awards: {mn: 'Монгол Улсын анхны гавьяат тамирчин, "Далай даян" чимэг (1951)', en: "Mongolia's first Honoured Athlete, \"Dalai Dayan\" honour (1951)"},
    note: {mn: '1939–1954 оны хооронд долоон удаа түрүүлсэн.', en: 'Seven titles between 1939 and 1954.'}},
  {id: 'tserentogtokh', name: 'Д. Цэрэнтогтох', en: 'D. Tserentogtokh', full: 'Дашдоржийн Цэрэнтогтох', wins: 4, runnerUp: 5,
    years: '1978, 1980, 1983–1984', title: {mn: 'Улсын дархан аварга', en: 'State Grand Champion'},
    born: 1951, home: {mn: 'Өвөрхангай аймаг, Нарийнтээл сум', en: 'Nariinteel sum, Övörkhangai aimag'},
    path: [['state', 1972, 'Улсын начин', 'State Falcon'], ['state', 1977, 'Улсын заан', 'State Elephant'], ['state', 1978, 'Улсын арслан', 'State Lion'],
      ['state', 1979, 'Улсын аварга', 'State Champion'], ['state', 1980, 'Даян аварга', 'Wide Champion'], ['state', 1981, 'Дархан аварга', 'Grand Champion']],
    local: {mn: 'Сум, аймгийн наадмын амжилтын тухай эх сурвалжид мэдээлэл алга.', en: 'No sum or aimag results are recorded in the source.'},
    awards: {mn: 'Чөлөөт бөхийн Азийн наадмын аварга, Гавьяат тамирчин (1991)', en: 'Asian Games freestyle champion, Honoured Athlete (1991)'},
    note: {mn: 'Таван удаа үзүүрлэсэн нь энэ жагсаалтад хамгийн олон.', en: 'Five runner-up finishes, joint most in this list.'}},
  {id: 'orkhonbayar', name: 'Б. Орхонбаяр', en: 'B. Orkhonbayar', full: 'Баярсайханы Орхонбаяр', wins: 1, runnerUp: 2,
    years: '2026', title: {mn: 'Улсын даян аварга', en: 'State Wide Champion'},
    born: 1998, home: {mn: 'Сэлэнгэ аймаг, Цагааннуур сум', en: 'Tsagaannuur sum, Selenge aimag'},
    path: [['sum', 2017, 'Сумын заан', 'Sum Elephant'], ['aimag', 2018, 'Аймгийн арслан', 'Aimag Lion'], ['state', 2019, 'Улсын начин', 'State Falcon'],
      ['state', 2021, 'Улсын харцага', 'State Hawk'], ['state', 2022, 'Улсын арслан', 'State Lion'], ['state', 2026, 'Даян аварга', 'Wide Champion']],
    local: {mn: '2017 онд Цагааннуур сумын, 2018, 2019 онд Сэлэнгэ аймгийн наадамд түрүүлсэн.', en: 'Won the Tsagaannuur sum Naadam (2017) and the Selenge aimag Naadam (2018, 2019).'},
    awards: {mn: '2019 онд начин болсон хамгийн залуу бөхийн дааганы эзэн. Ерөнхийлөгчийн цом (2022, 2025). Netflix "Physical: Asia" (2025)-д Монголын багийн ахлагч.',
      en: 'Youngest new Falcon of 2019. President\'s Cup (2022, 2025). Captain of Team Mongolia on Netflix "Physical: Asia" (2025).'},
    note: {mn: '2026 онд 1024 бөхийн барилдаанд арав даваад түрүүлж, аварга цолыг алгасан даян аварга болсон.', en: 'Won all ten rounds of the 1,024-wrestler 2026 Naadam and went straight to Wide Champion.'}},
];
LEGENDS.forEach(l => { l.wiki = mnwiki(l.full); });

// Үндэсний их баяр наадам 2026 — хүчит бөхийн барилдаан (mn.wikipedia).
export const NAADAM_2026 = {
  dates: {mn: '2026 оны 7-р сарын 10–12', en: '10–12 July 2026'},
  wrestlers: 1024, rounds: 10,
  champion: {legend: 8, name: 'Б. Орхонбаяр', en: 'B. Orkhonbayar', rank: 'Улсын арслан', rankEn: 'State Lion'},
  runnerUp: {name: 'Б. Бат-Өлзий', en: 'B. Bat-Ölzii', rank: 'Улсын заан', rankEn: 'State Elephant'},
  semis: [{legend: 1, name: 'Н. Батсуурь', en: 'N. Batsuuri', rank: 'Дархан аварга', rankEn: 'Grand Champion'},
    {name: 'М. Лхагвагэрэл', en: 'M. Lkhagvagerel', rank: 'Улсын заан', rankEn: 'State Elephant'}],
  titles: [['Даян аварга', 'Wide Champion', 1], ['Арслан', 'Lion', 1], ['Гарьд', 'Garuda', 1], ['Заан', 'Elephant', 3], ['Харцага', 'Hawk', 3]],
  source: mnwiki('2026 оны улсын наадмын бөх барилдаан'),
};

// Simple rating: every title and runner-up finish adds strength. Not an official ranking.
export const rating = l => 1500 + l.wins * 40 + l.runnerUp * 15;
export const winChance = (a, b) => 1 / (1 + Math.pow(10, (rating(b) - rating(a)) / 400));

export const SOURCES = {
  wrestling: 'https://en.wikipedia.org/wiki/Mongolian_wrestling',
};
