import {SELF, env, applyD1Migrations} from 'cloudflare:test';
import {describe, it, expect} from 'vitest';

const url = path => 'https://naadam.test' + path;
const post = (path, body, client = crypto.randomUUID()) => SELF.fetch(url(path), {
  method: 'POST',
  headers: {'Content-Type': 'application/json', 'CF-Connecting-IP': client},
  body: JSON.stringify(body),
});

describe('Naadam API', () => {
  it('serves health and returns API errors for unknown routes and invalid methods', async () => {
    expect(await (await SELF.fetch(url('/api/health'))).json()).toMatchObject({ok: true, service: 'naadam-api'});
    expect((await SELF.fetch(url('/api/unknown'))).status).toBe(404);
    const response = await SELF.fetch(url('/api/subscribe'));
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
  });

  it('rejects invalid bodies and wrestler pairs', async () => {
    for (const query of ['red=0&blue=0', 'red=0', 'red=0&blue=512', 'red=no&blue=1']) {
      expect((await SELF.fetch(url('/api/wrestling/events?' + query))).status).toBe(400);
    }
    expect((await post('/api/comments', {text: ' '})).status).toBe(400);
    expect((await post('/api/subscribe', {email: 'invalid'})).status).toBe(400);
    expect((await post('/api/comments', null)).status).toBe(400);
    expect((await post('/api/comments', {text: 'x'.repeat(9000)})).status).toBe(413);
    const malformed = await SELF.fetch(url('/api/comments'), {method: 'POST', body: '{'});
    expect(malformed.status).toBe(400);
  });

  it('stores exactly 512 stable IDs with mixed ranks and paginates summaries without biographies', async () => {
    const ids = [];
    for (let offset = 0; offset < 512; offset += 64) {
      const response = await SELF.fetch(url('/api/wrestlers?limit=64&offset=' + offset));
      expect(response.status).toBe(200);
      const page = await response.json();
      expect(page.total).toBe(512);
      expect(page.items).toHaveLength(64);
      expect(page.items[0]).not.toHaveProperty('path');
      expect(page.items[0]).not.toHaveProperty('home');
      ids.push(...page.items.map(wrestler => wrestler.id));
    }
    expect(ids).toEqual(Array.from({length: 512}, (_, id) => id));
    for (const level of ['state', 'aimag', 'sum']) {
      const page = await (await SELF.fetch(url('/api/wrestlers?level=' + level))).json();
      expect(page.total).toBeGreaterThan(0);
      expect(page.items.every(wrestler => wrestler.rankLevel === level)).toBe(true);
    }
  });

  it('preserves existing profiles, exposes full database profiles in batches and distinguishes demo records', async () => {
    const featured = await (await SELF.fetch(url('/api/wrestlers?featured=1'))).json();
    expect(featured.total).toBe(9);
    expect(featured.items[0]).toMatchObject({id: 0, name: 'Б. Бат-Эрдэнэ', isDemo: false});
    expect(featured.festival.champion.name).toBe('Б. Орхонбаяр');
    const batch = await (await SELF.fetch(url('/api/wrestlers?details=1&ids=511,0,18,511'))).json();
    expect(batch.items.map(wrestler => wrestler.id)).toEqual([511, 0, 18]);
    expect(batch.items[0]).toMatchObject({isDemo: true, featured: false});
    expect(batch.items[0].note.mn).toContain('зохиомол');
    expect(batch.items[1].path.length).toBeGreaterThan(1);
    expect(batch.items[2].rankLevel).toBe('sum');
    const direct = await (await SELF.fetch(url('/api/wrestlers/511'))).json();
    expect(direct).toEqual(batch.items[0]);
  });

  it('reads edited D1 records and does not replace them when migrations run again', async () => {
    const original = await env.DB.prepare('SELECT * FROM wrestlers WHERE id = 511').first();
    const edited = {...JSON.parse(original.profile), note: {mn: 'Хадгалсан өөрчлөлт', en: 'Saved edit'}};
    await env.DB.prepare('UPDATE wrestlers SET name = ?, profile = ? WHERE id = 511')
      .bind('D1 шинэ нэр', JSON.stringify(edited)).run();
    await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
    const profile = await (await SELF.fetch(url('/api/wrestlers/511'))).json();
    expect(profile.name).toBe('D1 шинэ нэр');
    expect(profile.note.mn).toBe('Хадгалсан өөрчлөлт');
    const summaries = await (await SELF.fetch(url('/api/wrestlers?ids=511'))).json();
    expect(summaries.items[0].name).toBe('D1 шинэ нэр');
    const {total} = await env.DB.prepare('SELECT COUNT(*) AS total FROM wrestlers').first();
    expect(total).toBe(512);
    await env.DB.prepare('UPDATE wrestlers SET name = ?, profile = ? WHERE id = 511')
      .bind(original.name, original.profile).run();
  });

  it('rejects invalid catalogue queries and does not offer unauthenticated writes', async () => {
    for (const query of ['ids=', 'ids=-1', 'ids=512', 'ids=0,bad', 'ids=' + Array.from({length: 33}, (_, id) => id).join(','), 'offset=-1', 'limit=0', 'limit=100', 'level=bad']) {
      expect((await SELF.fetch(url('/api/wrestlers?' + query))).status).toBe(400);
    }
    for (const id of ['512', '-1', 'no', '0/other']) {
      expect((await SELF.fetch(url('/api/wrestlers/' + id))).status).toBe(404);
    }
    expect((await post('/api/wrestlers', {})).status).toBe(405);
  });

  it('streams wrestlers from all 512 registrations including a mixed-rank group', async () => {
    const response = await SELF.fetch(url('/api/wrestling/events?red=510&blue=511'));
    expect(response.status).toBe(200);
    const reader = response.body.getReader();
    const packet = JSON.parse(new TextDecoder().decode((await reader.read()).value).slice(6).trim());
    const ids = packet.bouts.flatMap(bout => bout.wrestlers.map(wrestler => wrestler.id));
    expect(ids).toHaveLength(16);
    expect(new Set(ids).size).toBe(16);
    expect(ids.slice(0, 2)).toEqual([510, 511]);
    expect(ids.every(id => id >= 496 && id < 512)).toBe(true);
    await reader.cancel();
  });

  it('persists comments, filters topics, and increments simultaneous likes atomically', async () => {
    const response = await post('/api/comments', {name: 'Баг', text: 'Сайн барилдаан', topic: 'wrestling'});
    expect(response.status).toBe(201);
    const comment = await response.json();
    const comments = await (await SELF.fetch(url('/api/comments?topic=wrestling'))).json();
    expect(comments).toContainEqual(comment);
    const other = await (await SELF.fetch(url('/api/comments?topic=racing'))).json();
    expect(other.some(row => row.id === comment.id)).toBe(false);
    const likes = await Promise.all(Array.from({length: 8}, () => post('/api/comments/' + comment.id + '/like', {})));
    expect(likes.every(result => result.status === 200)).toBe(true);
    const saved = await (await SELF.fetch(url('/api/comments'))).json();
    expect(saved.find(row => row.id === comment.id).likes).toBe(8);
  });

  it('enforces the post interval across simultaneous requests', async () => {
    const client = crypto.randomUUID();
    const results = await Promise.all([1, 2].map(i => post('/api/comments', {text: 'Зэрэг илгээх ' + i}, client)));
    expect(results.map(response => response.status).sort()).toEqual([201, 429]);
  });

  it('updates an existing subscription', async () => {
    const email = crypto.randomUUID() + '@example.test';
    expect((await post('/api/subscribe', {email, plan: 'free'})).status).toBe(201);
    const update = await post('/api/subscribe', {email: email.toUpperCase(), plan: 'premium'});
    expect(update.status).toBe(200);
    expect(await update.json()).toEqual({ok: true, plan: 'premium', demo: true});
  });

  it('streams the wrestling lineup and crowd data', async () => {
    const response = await SELF.fetch(url('/api/wrestling/events?red=4&blue=5'));
    expect(response.headers.get('Content-Type')).toContain('text/event-stream');
    const reader = response.body.getReader();
    const {value} = await reader.read();
    const packet = JSON.parse(new TextDecoder().decode(value).slice(6).trim());
    expect(packet.second).toBe(0);
    expect(packet.bouts).toHaveLength(8);
    expect(new Set(packet.bouts.flatMap(bout => bout.wrestlers.map(wrestler => wrestler.id))).size).toBe(16);
    expect(packet.bouts[0].wrestlers.map(wrestler => wrestler.id)).toEqual([4, 5]);
    expect(packet.crowd.level).toBe(1);
    await reader.cancel();
  });

  it('broadcasts a saved comment to a connected race/chat viewer', async () => {
    const response = await SELF.fetch(url('/api/events'));
    const reader = response.body.getReader();
    const decode = bytes => JSON.parse(new TextDecoder().decode(bytes).slice(6).trim());
    expect(decode((await reader.read()).value).type).toBe('race');
    const created = await post('/api/comments', {text: 'Шууд дамжуулалт', topic: 'live'});
    const comment = await created.json();
    expect(decode((await reader.read()).value)).toEqual({type: 'comment', comment});
    await reader.cancel();
  });
});
