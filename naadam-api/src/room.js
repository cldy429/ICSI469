import {DurableObject} from 'cloudflare:workers';
import {json, readJson, streamEvents} from './responses.js';
import {initializeWrestlers, wrestlerResponse} from './wrestlers.js';

const TOPICS = new Set(['home', 'wrestling', 'racing', 'archery', 'live']);
const clean = (value, max) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const seedRacers = () => ['Хээр', 'Зээрд', 'Хул', 'Халиун', 'Хар', 'Бор'].map((name, i) => ({
  name, progress: 14 + (i * 5) % 9 - i * .4, speed: 47 + (i * 7) % 13,
}));

// A single room coordinates the race and fan comments for all connected viewers.
export class NaadamRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.clients = new Set();
    this.racers = seedRacers();
    this.tick = 0;
    ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS comments (
        sequence INTEGER PRIMARY KEY AUTOINCREMENT,
        id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        text TEXT NOT NULL,
        topic TEXT NOT NULL,
        at TEXT NOT NULL,
        likes INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS subscribers (
        email TEXT PRIMARY KEY,
        plan TEXT NOT NULL,
        at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS comment_limits (
        client TEXT PRIMARY KEY,
        posted_at INTEGER NOT NULL
      );
    `);
    ctx.blockConcurrencyWhile(async () => initializeWrestlers(ctx.storage));
  }

  async fetch(request) {
    const url = new URL(request.url);
    const {pathname} = url;
    try {
      if (pathname === '/api/wrestlers' || pathname.startsWith('/api/wrestlers/')) {
        return wrestlerResponse(request, this.ctx.storage.sql);
      }
      if (pathname === '/api/events' && request.method === 'GET') return this.events();
      if (pathname === '/api/comments' && request.method === 'GET') {
        const topic = url.searchParams.get('topic');
        const columns = 'id, name, text, topic, at, likes';
        const rows = topic && topic !== 'home'
          ? this.ctx.storage.sql.exec(`SELECT ${columns} FROM comments WHERE topic = ? ORDER BY sequence DESC LIMIT 60`, topic).toArray()
          : this.ctx.storage.sql.exec(`SELECT ${columns} FROM comments ORDER BY sequence DESC LIMIT 60`).toArray();
        return json(rows.reverse());
      }
      if (pathname === '/api/comments' && request.method === 'POST') return await this.postComment(request);
      if (pathname === '/api/subscribe' && request.method === 'POST') return await this.subscribe(request);
      const like = pathname.match(/^\/api\/comments\/([a-z0-9]+)\/like$/);
      if (like && request.method === 'POST') {
        const [comment] = this.ctx.storage.sql.exec(
          'UPDATE comments SET likes = likes + 1 WHERE id = ? RETURNING id, name, text, topic, at, likes', like[1],
        ).toArray();
        if (!comment) return json({error: 'not found'}, 404);
        this.broadcast({type: 'like', id: comment.id, likes: comment.likes});
        return json(comment);
      }
      const allow = pathname === '/api/comments' ? 'GET, POST' : pathname === '/api/events' ? 'GET' : 'POST';
      return json({error: 'method not allowed'}, 405, {Allow: allow});
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }
  }

  async postComment(request) {
    const body = await readJson(request);
    const text = clean(body.text, 280);
    if (text.length < 2) return json({error: 'empty'}, 400);
    const now = Date.now();
    const client = request.headers.get('CF-Connecting-IP') ?? 'local';
    const comment = {
      id: crypto.randomUUID().replaceAll('-', ''),
      name: clean(body.name, 32) || 'Зочин', text,
      topic: TOPICS.has(body.topic) ? body.topic : 'home',
      at: new Date(now).toISOString(), likes: 0,
    };
    const saved = this.ctx.storage.transactionSync(() => {
      const [last] = this.ctx.storage.sql.exec('SELECT posted_at FROM comment_limits WHERE client = ?', client).toArray();
      if (last && now - last.posted_at < 5000) return false;
      this.ctx.storage.sql.exec(
        'INSERT INTO comments (id, name, text, topic, at) VALUES (?, ?, ?, ?, ?)',
        comment.id, comment.name, text, comment.topic, comment.at,
      );
      this.ctx.storage.sql.exec('DELETE FROM comment_limits WHERE posted_at <= ?', now - 5000);
      this.ctx.storage.sql.exec(
        'INSERT INTO comment_limits (client, posted_at) VALUES (?, ?) ON CONFLICT(client) DO UPDATE SET posted_at = excluded.posted_at', client, now,
      );
      this.ctx.storage.sql.exec('DELETE FROM comments WHERE sequence NOT IN (SELECT sequence FROM comments ORDER BY sequence DESC LIMIT 500)');
      return true;
    });
    if (!saved) return json({error: 'slow down'}, 429);
    this.broadcast({type: 'comment', comment});
    return json(comment, 201);
  }

  async subscribe(request) {
    const body = await readJson(request);
    const email = clean(body.email, 120).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({error: 'email'}, 400);
    const plan = ['free', 'premium', 'family'].includes(body.plan) ? body.plan : 'free';
    const [existing] = this.ctx.storage.sql.exec('SELECT email FROM subscribers WHERE email = ?', email).toArray();
    this.ctx.storage.sql.exec(
      'INSERT INTO subscribers (email, plan, at) VALUES (?, ?, ?) ON CONFLICT(email) DO UPDATE SET plan = excluded.plan',
      email, plan, new Date().toISOString(),
    );
    return json({ok: true, plan, demo: true}, existing ? 200 : 201);
  }

  racePacket() {
    return {type: 'race', demo: true, simulation: true, generatedAt: new Date().toISOString(), horses: this.racers};
  }

  events() {
    return streamEvents(send => {
      this.clients.add(send);
      send(this.racePacket());
      if (!this.timer) this.timer = setInterval(() => this.advanceRace(), 1200);
      return () => {
        this.clients.delete(send);
        if (this.clients.size === 0) {
          clearInterval(this.timer);
          this.timer = null;
        }
      };
    });
  }

  advanceRace() {
    this.tick++;
    this.racers = this.racers.map((horse, i) => ({
      ...horse,
      progress: Math.min(100, horse.progress + (horse.speed / 3.6) / 18000 * 100 * 1.2 * (9.8 + Math.sin(this.tick * .25 + i) * .7)),
      speed: Math.max(35, Math.min(69, horse.speed + Math.sin(this.tick * .37 + i) * .85)),
    }));
    if (this.racers.every(horse => horse.progress >= 100)) {
      this.tick = 0;
      this.racers = seedRacers();
    }
    this.broadcast(this.racePacket());
  }

  broadcast(packet) {
    for (const send of this.clients) send(packet);
  }
}
