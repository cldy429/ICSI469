// Runtime data from the database. No wrestler records are bundled with the frontend.
const CACHE_TTL = 5 * 60 * 1000;

export class WrestlerStore {
  constructor(fetcher = (...args) => fetch(...args), now = Date.now) {
    this.fetcher = fetcher;
    this.now = now;
    this.summaries = new Map();
    this.profiles = new Map();
    this.pending = new Map();
  }

  async request(path) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await this.fetcher(path, {signal: controller.signal});
      if (!response.ok) throw new Error('Wrestler data unavailable: ' + response.status);
      return await response.json();
    } finally { clearTimeout(timer); }
  }

  get(id) { return this.profiles.get(id)?.value ?? this.summaries.get(id); }
  cached(id) {
    const entry = this.profiles.get(id);
    return entry && entry.expires > this.now() ? entry.value : undefined;
  }

  async featured() {
    const data = await this.request('/api/wrestlers?featured=1');
    if (!Array.isArray(data.items) || data.items.length !== 9 || !data.festival) {
      throw new Error('Invalid wrestler catalogue');
    }
    data.items.forEach(wrestler => this.summaries.set(wrestler.id, wrestler));
    return data;
  }

  async prefetch(ids) {
    const unique = [...new Set(ids)];
    const missing = unique.filter(id => !this.cached(id) && !this.pending.has(id));
    for (let start = 0; start < missing.length; start += 32) {
      const batch = missing.slice(start, start + 32);
      const loading = this.request('/api/wrestlers?details=1&ids=' + batch.join(','))
        .then(data => {
          if (!Array.isArray(data.items) || data.items.length !== batch.length
            || batch.some(id => !data.items.some(item => item.id === id && item.name && item.title))) {
            throw new Error('Incomplete wrestler profiles');
          }
          const expires = this.now() + CACHE_TTL;
          data.items.forEach(value => this.profiles.set(value.id, {value, expires}));
        }).finally(() => batch.forEach(id => this.pending.delete(id)));
      batch.forEach(id => this.pending.set(id, loading));
    }
    await Promise.all(unique.map(id => this.pending.get(id)));
    return unique.map(id => this.cached(id));
  }
}

export const wrestlerStore = new WrestlerStore();
export const LEGENDS = [];
export let NAADAM_2026;
export async function loadFeaturedWrestlers() {
  const {items, festival} = await wrestlerStore.featured();
  LEGENDS.splice(0, LEGENDS.length, ...items);
  NAADAM_2026 = festival;
}
export const getWrestler = id => wrestlerStore.get(id);
export const cachedWrestler = id => wrestlerStore.cached(id);
const photos = new Set();
export async function prefetchWrestlers(ids) {
  const profiles = await wrestlerStore.prefetch(ids);
  // Warm available portraits without delaying the field when an image host is slow.
  if (typeof Image !== 'undefined') profiles.forEach(profile => {
    const src = profile?.photo?.src;
    if (!src || photos.has(src)) return;
    photos.add(src);
    const image = new Image();
    image.src = src;
  });
  return profiles;
}
