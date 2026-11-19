import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mergeComments, visibleComments} from '../public/js/comments.js';

const comment = (id, topic, second = 0, likes = 0) => ({id, topic, name: 'Баг', text: id,
  at: new Date(1760000000000 + second * 1000).toISOString(), likes});

test('all sections show general comments by default and allow an explicit topic filter', () => {
  const comments = [comment('home-comment', 'home'), comment('wrestling-comment', 'wrestling', 1)];
  assert.deepEqual(visibleComments(comments).map(row => row.id), ['wrestling-comment', 'home-comment']);
  assert.deepEqual(visibleComments(comments, 'wrestling').map(row => row.id), ['wrestling-comment']);
  assert.deepEqual(visibleComments(comments, 'home').map(row => row.id), ['home-comment']);
});

test('a delayed old snapshot does not remove newly posted or streamed comments', () => {
  const old = comment('old', 'home');
  let cache = mergeComments([], [old]);
  cache = mergeComments(cache, [comment('posted', 'wrestling', 2)]);
  cache = mergeComments(cache, [comment('streamed', 'racing', 1)]);
  cache = mergeComments(cache, [old]);
  assert.deepEqual(visibleComments(cache).map(row => row.id), ['posted', 'streamed', 'old']);
});

test('post and SSE duplicates stay unique and older responses do not reduce likes', () => {
  const current = comment('saved', 'home', 0, 4);
  const cache = mergeComments([current], [{...current, likes: 0}, current]);
  assert.equal(cache.length, 1);
  assert.equal(cache[0].likes, 4);
});

test('retains the latest 100 comments and always shows the newest first', () => {
  const cache = mergeComments([], Array.from({length: 120}, (_, i) => comment(String(i), 'home', i)).reverse());
  assert.equal(cache.length, 100);
  assert.equal(visibleComments(cache)[0].id, '119');
  assert.equal(visibleComments(cache).at(-1).id, '20');
});
