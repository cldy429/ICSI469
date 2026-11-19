// NAADAM presentation settings and free-license photos.
// Wrestler records are served by the API; see wrestlers.js for the runtime cache.
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

export const WRESTLING_RANKS = {
  grand: {mn: 'Дархан аварга', en: 'Grand Champion', color: '#f7ce79', symbol: '✦', scale: 1.13},
  wide: {mn: 'Даян аварга', en: 'Wide Champion', color: '#efb2ff', symbol: '◆', scale: 1.09},
  lion: {mn: 'Арслан', en: 'Lion', color: '#ff9d96', symbol: '▲', scale: 1.04},
  elephant: {mn: 'Заан', en: 'Elephant', color: '#8ed2ff', symbol: '■', scale: 1},
  hawk: {mn: 'Харцага', en: 'Hawk', color: '#8aefd1', symbol: '◇', scale: .94},
  falcon: {mn: 'Начин', en: 'Falcon', color: '#f2f5fa', symbol: '●', scale: .88},
  aimag_lion: {mn: 'Аймгийн арслан', en: 'Aimag Lion', color: '#ffc46c', symbol: '▲', scale: .85},
  aimag_elephant: {mn: 'Аймгийн заан', en: 'Aimag Elephant', color: '#b1d2f1', symbol: '■', scale: .81},
  aimag_falcon: {mn: 'Аймгийн начин', en: 'Aimag Falcon', color: '#b9d9bb', symbol: '●', scale: .77},
  sum_elephant: {mn: 'Сумын заан', en: 'Sum Elephant', color: '#a7b6be', symbol: '▪', scale: .71},
};

// Simple rating: every title and runner-up finish adds strength. Not an official ranking.
export const rating = l => 1500 + l.wins * 40 + l.runnerUp * 15;
export const winChance = (a, b) => 1 / (1 + Math.pow(10, (rating(b) - rating(a)) / 400));

export const SOURCES = {
  wrestling: 'https://en.wikipedia.org/wiki/Mongolian_wrestling',
};
