import seed from '../data/wrestlers.json';
import festival from '../data/festival.json';
import {json} from './responses.js';

export const WRESTLER_COUNT = 512;
const MIGRATION = 'wrestlers-v1';
const SUMMARY = `id, slug, rank, rank_level, is_demo, featured,
  json_extract(profile, '$.name') AS name, json_extract(profile, '$.en') AS en,
  json_extract(profile, '$.title') AS title, json_extract(profile, '$.photo') AS photo,
  json_extract(profile, '$.wins') AS wins, json_extract(profile, '$.runnerUp') AS runnerUp,
  json_extract(profile, '$.years') AS years`;

// Runs once per database, including existing festival rooms. Never resets edited records on deploy.
export function initializeWrestlers(storage) {
  storage.transactionSync(() => {
    const sql = storage.sql;
    sql.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS wrestlers (
        id INTEGER PRIMARY KEY CHECK (id >= 0 AND id < 512),
        slug TEXT NOT NULL UNIQUE,
        rank TEXT NOT NULL,
        rank_level TEXT NOT NULL CHECK (rank_level IN ('state', 'aimag', 'sum')),
        is_demo INTEGER NOT NULL,
        featured INTEGER NOT NULL DEFAULT 0,
        profile TEXT NOT NULL CHECK (json_valid(profile))
      );
    `);
    if (sql.exec('SELECT name FROM schema_migrations WHERE name = ?', MIGRATION).toArray().length) return;
    if (seed.length !== WRESTLER_COUNT || new Set(seed.map(wrestler => wrestler.id)).size !== WRESTLER_COUNT) {
      throw new Error('Expected 512 unique seed wrestlers');
    }
    // Keep bound parameters below SQLite's per-query limit.
    for (let start = 0; start < seed.length; start += 10) {
      const batch = seed.slice(start, start + 10);
      sql.exec(`INSERT INTO wrestlers (id, slug, rank, rank_level, is_demo, featured, profile)
        VALUES ${batch.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(',')}`,
      ...batch.flatMap(wrestler => [wrestler.id, wrestler.slug, wrestler.rank, wrestler.rankLevel,
        Number(wrestler.isDemo), Number(wrestler.featured), JSON.stringify(wrestler)]));
    }
    sql.exec('INSERT INTO schema_migrations (name) VALUES (?)', MIGRATION);
  });
}

const integer = value => /^\d+$/.test(value ?? '') && Number.isSafeInteger(Number(value));
const summary = row => ({
  id: row.id, slug: row.slug, name: row.name, en: row.en, rank: row.rank,
  rankLevel: row.rank_level, isDemo: Boolean(row.is_demo), featured: Boolean(row.featured),
  title: JSON.parse(row.title), photo: JSON.parse(row.photo ?? 'null'),
  wins: row.wins, runnerUp: row.runnerUp, years: row.years,
});
const detail = row => ({...JSON.parse(row.profile), id: row.id, slug: row.slug, rank: row.rank,
  rankLevel: row.rank_level, isDemo: Boolean(row.is_demo), featured: Boolean(row.featured)});

export function wrestlerResponse(request, sql) {
  if (request.method !== 'GET') return json({error: 'method not allowed'}, 405, {Allow: 'GET'});
  const {pathname, searchParams: params} = new URL(request.url);
  if (pathname !== '/api/wrestlers') {
    const id = pathname.slice('/api/wrestlers/'.length);
    if (!integer(id)) return json({error: 'not found'}, 404);
    const [row] = sql.exec('SELECT * FROM wrestlers WHERE id = ?', Number(id)).toArray();
    return row ? json(detail(row)) : json({error: 'not found'}, 404);
  }

  if (params.has('ids')) {
    const values = params.get('ids').split(',');
    if (values.length > 32 || values.some(value => !integer(value) || Number(value) >= WRESTLER_COUNT)) {
      return json({error: 'Supply 1 to 32 wrestler IDs from 0 to 511'}, 400);
    }
    const ids = [...new Set(values.map(Number))];
    const full = params.get('details') === '1';
    const rows = sql.exec(`SELECT ${full ? '*' : SUMMARY} FROM wrestlers
      WHERE id IN (${ids.map(() => '?').join(',')})`, ...ids).toArray();
    const byId = new Map(rows.map(row => [row.id, full ? detail(row) : summary(row)]));
    if (byId.size !== ids.length) return json({error: 'not found'}, 404);
    return json({items: ids.map(id => byId.get(id))});
  }

  const offset = params.get('offset') ?? '0', limit = params.get('limit') ?? '32';
  if (!integer(offset) || !integer(limit) || Number(limit) < 1 || Number(limit) > 64) {
    return json({error: 'Invalid pagination; limit must be 1 to 64'}, 400);
  }
  const level = params.get('level');
  if (level && !['state', 'aimag', 'sum'].includes(level)) return json({error: 'Invalid rank level'}, 400);
  const clauses = [], bindings = [];
  if (params.get('featured') === '1') clauses.push('featured = 1');
  if (level) { clauses.push('rank_level = ?'); bindings.push(level); }
  const where = clauses.length ? ' WHERE ' + clauses.join(' AND ') : '';
  const [{total}] = sql.exec('SELECT COUNT(*) AS total FROM wrestlers' + where, ...bindings).toArray();
  const items = sql.exec(`SELECT ${SUMMARY} FROM wrestlers${where} ORDER BY id LIMIT ? OFFSET ?`,
    ...bindings, Number(limit), Number(offset)).toArray().map(summary);
  return json({total, offset: Number(offset), limit: Number(limit), items,
    ...(params.get('featured') === '1' ? {festival} : {})});
}
