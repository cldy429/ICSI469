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
// Bracket order: 0–1, 2–3, 4–5, 6–7 meet in round one.
export const LEGENDS = [
  {id: 'baterdene', name: 'Б. Бат-Эрдэнэ', en: 'B. Bat-Erdene', wins: 11, runnerUp: 1,
    years: '1988–1990, 1992–1999',
    note: {mn: '1990 онд "Монголын нууц товчоо"-ны 750 жилийн ойн наадамд мөн түрүүлсэн. Түрүүгээрээ дээд амжилт эзэмшигч.',
      en: 'Also won the 1990 Naadam marking 750 years of the Secret History of the Mongols. Holds the record for most titles.'}},
  {id: 'batsuuri', name: 'Н. Батсуурь', en: 'N. Batsuuri', wins: 4, runnerUp: 2,
    years: '2014, 2018–2019, 2024',
    note: {mn: 'Хамгийн сүүлд 2024 оны наадамд түрүүлсэн.', en: 'Most recently won the 2024 Naadam.'}},
  {id: 'munkhbat', name: 'Ж. Мөнхбат', en: 'J. Mönkhbat', wins: 6, runnerUp: 4,
    years: '1963–1967, 1974',
    note: {mn: 'Таван жил дараалан түрүүлсэн.', en: 'Won five Naadams in a row.'}},
  {id: 'damdin', name: 'Д. Дамдин', en: 'D. Damdin', wins: 5, runnerUp: 5,
    years: '1956–1960',
    note: {mn: '1956–1960 онд таван удаа дараалан түрүүлсэн.', en: 'Won five straight titles, 1956–1960.'}},
  {id: 'bayanmunkh', name: 'Х. Баянмөнх', en: 'Kh. Bayanmönkh', wins: 10, runnerUp: 2,
    years: '1968, 1971–1973, 1975, 1977, 1979, 1981–1982, 1987',
    note: {mn: '1968–1987 оны хооронд арван удаа түрүүлсэн.', en: 'Ten titles between 1968 and 1987.'}},
  {id: 'usukhbayar', name: 'Г. Өсөхбаяр', en: 'G. Ösökhbayar', wins: 4, runnerUp: 1,
    years: '2002–2003, 2005, 2009',
    note: {mn: '2002–2009 оны хооронд дөрвөн удаа түрүүлсэн.', en: 'Four titles between 2002 and 2009.'}},
  {id: 'tuvdendorj', name: 'Б. Түвдэндорж', en: 'B. Tüvdendorj', wins: 7, runnerUp: 2,
    years: '1939, 1941, 1945–1946, 1952–1954',
    note: {mn: '1939–1954 оны хооронд долоон удаа түрүүлсэн.', en: 'Seven titles between 1939 and 1954.'}},
  {id: 'tserentogtokh', name: 'Д. Цэрэнтогтох', en: 'D. Tserentogtokh', wins: 4, runnerUp: 5,
    years: '1978, 1980, 1983–1984',
    note: {mn: 'Таван удаа үзүүрлэсэн нь энэ жагсаалтад хамгийн олон.', en: 'Five runner-up finishes, joint most in this list.'}},
];

// Simple rating: every title and runner-up finish adds strength. Not an official ranking.
export const rating = l => 1500 + l.wins * 40 + l.runnerUp * 15;
export const winChance = (a, b) => 1 / (1 + Math.pow(10, (rating(b) - rating(a)) / 400));

export const SOURCES = {
  wrestling: 'https://en.wikipedia.org/wiki/Mongolian_wrestling',
};
