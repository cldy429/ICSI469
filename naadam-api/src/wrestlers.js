import festival from '../data/festival.json';
import {json} from './responses.js';

export const WRESTLER_COUNT = 512;
const SUMMARY = `id, slug, name, name_en AS en, rank, rank_level, is_demo, featured,
  json_extract(profile, '$.title') AS title, json_extract(profile, '$.photo') AS photo,
  json_extract(profile, '$.wins') AS wins, json_extract(profile, '$.runnerUp') AS runnerUp,
  json_extract(profile, '$.years') AS years`;

const integer = value => /^\d+$/.test(value ?? '') && Number.isSafeInteger(Number(value));
const summary = row => ({
  id: row.id, slug: row.slug, name: row.name, en: row.en, rank: row.rank,
  rankLevel: row.rank_level, isDemo: Boolean(row.is_demo), featured: Boolean(row.featured),
  title: JSON.parse(row.title), photo: JSON.parse(row.photo ?? 'null'),
  wins: row.wins, runnerUp: row.runnerUp, years: row.years,
});
const detail = row => ({...JSON.parse(row.profile), id: row.id, slug: row.slug, name: row.name, en: row.name_en, rank: row.rank,
  rankLevel: row.rank_level, isDemo: Boolean(row.is_demo), featured: Boolean(row.featured)});

export async function wrestlerResponse(request, db) {
  if (request.method !== 'GET') return json({error: 'method not allowed'}, 405, {Allow: 'GET'});
  const {pathname, searchParams: params} = new URL(request.url);
  if (pathname !== '/api/wrestlers') {
    const id = pathname.slice('/api/wrestlers/'.length);
    if (!integer(id)) return json({error: 'not found'}, 404);
    const row = await db.prepare('SELECT * FROM wrestlers WHERE id = ?').bind(Number(id)).first();
    return row ? json(detail(row)) : json({error: 'not found'}, 404);
  }

  if (params.has('ids')) {
    const values = params.get('ids').split(',');
    if (values.length > 32 || values.some(value => !integer(value) || Number(value) >= WRESTLER_COUNT)) {
      return json({error: 'Supply 1 to 32 wrestler IDs from 0 to 511'}, 400);
    }
    const ids = [...new Set(values.map(Number))];
    const full = params.get('details') === '1';
    const {results: rows} = await db.prepare(`SELECT ${full ? '*' : SUMMARY} FROM wrestlers
      WHERE id IN (${ids.map(() => '?').join(',')})`).bind(...ids).all();
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
  const [count, page] = await db.batch([
    db.prepare('SELECT COUNT(*) AS total FROM wrestlers' + where).bind(...bindings),
    db.prepare(`SELECT ${SUMMARY} FROM wrestlers${where} ORDER BY id LIMIT ? OFFSET ?`)
      .bind(...bindings, Number(limit), Number(offset)),
  ]);
  const total = count.results[0].total;
  const items = page.results.map(summary);
  return json({total, offset: Number(offset), limit: Number(limit), items,
    ...(params.get('featured') === '1' ? {festival} : {})});
}
