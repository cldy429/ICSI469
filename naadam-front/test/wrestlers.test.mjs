import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WrestlerStore} from '../public/js/wrestlers.js';

const profile = id => ({id, name: 'Демо бөх ' + id, title: {mn: 'Сумын заан', en: 'Sum Elephant'}});
const response = items => ({ok: true, json: async () => ({items})});

test('preparing a lineup shares in-flight requests and clicking prepared profiles does not refetch', async () => {
  let finish, calls = 0;
  const store = new WrestlerStore(() => {
    calls++;
    return new Promise(resolve => { finish = resolve; });
  });
  const lineup = store.prefetch([0, 1, 2]);
  const earlyClick = store.prefetch([1]);
  finish(response([0, 1, 2].map(profile)));
  await Promise.all([lineup, earlyClick]);
  await store.prefetch([1, 2]);
  assert.equal(calls, 1);
  assert.equal(store.cached(1).name, 'Демо бөх 1');
});

test('failed preparations can retry and never leave partial profiles cached', async () => {
  let calls = 0;
  const store = new WrestlerStore(async () => {
    calls++;
    if (calls === 1) return response([profile(0)]);
    return response([profile(0), profile(1)]);
  });
  await assert.rejects(store.prefetch([0, 1]));
  assert.equal(store.cached(0), undefined);
  assert.equal(store.pending.size, 0);
  await store.prefetch([0, 1]);
  assert.equal(calls, 2);
  assert.equal(store.cached(1).id, 1);
});

test('returning to the field uses fresh cached data, and expired data is refreshed', async () => {
  let time = 0, calls = 0;
  const store = new WrestlerStore(async () => {
    calls++;
    return response([{...profile(511), name: 'Version ' + calls}]);
  }, () => time);
  await store.prefetch([511]);
  time = 10000;
  await store.prefetch([511]);
  assert.equal(calls, 1);
  time = 300001;
  assert.equal(store.cached(511), undefined);
  await store.prefetch([511]);
  assert.equal(store.cached(511).name, 'Version 2');
});

test('large lineups split batches within the API limit', async () => {
  const batches = [];
  const store = new WrestlerStore(async path => {
    const ids = new URL(path, 'https://naadam.test').searchParams.get('ids').split(',').map(Number);
    batches.push(ids);
    return response(ids.map(profile));
  });
  const ids = Array.from({length: 70}, (_, id) => id);
  await store.prefetch(ids);
  assert.deepEqual(batches.map(batch => batch.length), [32, 32, 6]);
  assert.ok(ids.every(id => store.cached(id)?.id === id));
});
