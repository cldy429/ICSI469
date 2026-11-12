export const WRESTLING_DURATION = 60;
export const WRESTLING_BOUT_COUNT = 8;
export const DEFAULT_WRESTLING_PAIR = [0, 1];

// The eight pairs stay in separate areas on the field. Coordinates are map percentages.
const centers = [[12, 27], [37, 27], [63, 27], [88, 27], [12, 73], [37, 73], [63, 73], [88, 73]];
const headings = [-.34, .42, -.26, .22, .30, -.38, .26, -.28];
const wrestlerIds = Array.from({length: WRESTLING_BOUT_COUNT * 2}, (_, id) => id);
const turn = 2 * Math.PI;
const winReaction = {event: 'win', levels: [5, 5, 4, 3, 2], chant: 'Далайцэрэн давсааан'};

const crowdReactions = [
  {at: 4, event: 'move', levels: [4, 4, 3, 2]},
  {at: 11, ...winReaction},
  {at: 23, event: 'move', levels: [3, 3, 2]},
  {at: 36, event: 'move', levels: [4, 4, 3, 2]},
  {at: 51, ...winReaction},
];

const crowdFrames = Array.from({length: WRESTLING_DURATION + 1}, (_, second) => {
  const reaction = crowdReactions.find(({at, levels}) => second >= at && second < at + levels.length);
  if (!reaction) return {level: 1, event: null};
  const level = reaction.levels[second - reaction.at];
  return {
    level,
    event: reaction.event,
    ...(level === 5 && reaction.chant ? {chant: reaction.chant} : {}),
  };
});

export function wrestlingLineup(featuredPair) {
  const others = wrestlerIds.filter(id => !featuredPair.includes(id));
  return [featuredPair, ...Array.from({length: WRESTLING_BOUT_COUNT - 1}, (_, i) => others.slice(i * 2, i * 2 + 2))];
}

const frames = Array.from({length: WRESTLING_DURATION + 1}, (_, second) => centers.map(([x, y], i) => {
  const time = second / WRESTLING_DURATION;
  const beat = (time * (3 + i % 2) + i / WRESTLING_BOUT_COUNT + .05) % 1;
  const spacing = Math.cos(beat * turn);
  const gap = 8.65 + 1.45 * spacing;
  const angle = headings[i] + .14 * Math.sin(time * 4 * turn + i);
  const cx = x + 1.7 * Math.sin(time * 3 * turn + i);
  const cy = y + 2.5 * Math.sin(time * 2 * turn + i * 1.3);
  const dx = Math.cos(angle) * gap / 2;
  const dy = Math.sin(angle) * gap;
  let phase = beat < .5 ? 'approach' : 'separate';
  if (spacing < -.2) phase = 'grapple';
  if (second === WRESTLING_DURATION) phase = 'finished';

  return {
    phase,
    positions: [-1, 1].map(side => ({
      x: Math.round((cx + side * dx) * 10) / 10,
      y: Math.round((cy + side * dy) * 10) / 10,
    })),
  };
}));

export function wrestlingPacket(lineup, second) {
  return {
    type: 'wrestling',
    demo: true,
    second,
    duration: WRESTLING_DURATION,
    crowd: {...crowdFrames[second]},
    bouts: frames[second].map(({phase, positions}, i) => ({
      phase,
      wrestlers: lineup[i].map((id, j) => ({id, ...positions[j]})),
    })),
  };
}
