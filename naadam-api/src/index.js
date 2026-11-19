import {NaadamRoom} from './room.js';
import {streamEvents, json} from './responses.js';
import {DEFAULT_WRESTLING_PAIR, WRESTLING_DURATION, WRESTLING_BOUT_COUNT, wrestlingLineup, wrestlingPacket} from './wrestling-demo.js';

export {NaadamRoom};

function wrestlingEvents(request) {
  const {searchParams} = new URL(request.url);
  const sides = ['red', 'blue'];
  const pair = sides.some(side => searchParams.has(side))
    ? sides.map(side => {
      const value = searchParams.get(side);
      return /^\d+$/.test(value ?? '') ? Number(value) : -1;
    })
    : DEFAULT_WRESTLING_PAIR;

  if (pair.some(id => id < 0 || id >= WRESTLING_BOUT_COUNT * 2) || pair[0] === pair[1]) {
    return json({error: 'Choose two distinct wrestler IDs from 0 to 15'}, 400);
  }

  const lineup = wrestlingLineup(pair);
  return streamEvents((send, close) => {
    let second = 0;
    send(wrestlingPacket(lineup, second));
    const timer = setInterval(() => {
      second++;
      send(wrestlingPacket(lineup, second));
      if (second === WRESTLING_DURATION) close();
    }, 1000);
    return () => clearInterval(timer);
  });
}

export default {
  async fetch(request, env) {
    const {pathname} = new URL(request.url);
    try {
      if (pathname === '/api/health') return json({ok: true, service: 'naadam-api', demo: true});
      if (pathname === '/api/wrestling/events') {
        if (request.method !== 'GET') return json({error: 'method not allowed'}, 405, {Allow: 'GET'});
        return wrestlingEvents(request);
      }
      if (pathname === '/api/events' || pathname === '/api/comments' || pathname === '/api/subscribe'
        || /^\/api\/comments\/[a-z0-9]+\/like$/.test(pathname)) {
        return await env.NAADAM.getByName('festival').fetch(request);
      }
      return json({error: 'not found'}, 404);
    } catch (error) {
      if (error instanceof Response) return error;
      console.error('Naadam API request failed', error);
      return json({error: 'server'}, 500);
    }
  },
};
