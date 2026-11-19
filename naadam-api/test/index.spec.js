import {SELF} from 'cloudflare:test';
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
    for (const query of ['red=0&blue=0', 'red=0', 'red=0&blue=99', 'red=no&blue=1']) {
      expect((await SELF.fetch(url('/api/wrestling/events?' + query))).status).toBe(400);
    }
    expect((await post('/api/comments', {text: ' '})).status).toBe(400);
    expect((await post('/api/subscribe', {email: 'invalid'})).status).toBe(400);
    expect((await post('/api/comments', null)).status).toBe(400);
    expect((await post('/api/comments', {text: 'x'.repeat(9000)})).status).toBe(413);
    const malformed = await SELF.fetch(url('/api/comments'), {method: 'POST', body: '{'});
    expect(malformed.status).toBe(400);
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
