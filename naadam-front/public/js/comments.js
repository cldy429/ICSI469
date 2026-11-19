// Keep live events and successful posts when an older refresh response arrives later.
export function mergeComments(current, incoming) {
  const byId = new Map(current.map(comment => [comment.id, comment]));
  for (const comment of incoming) {
    const previous = byId.get(comment.id);
    byId.set(comment.id, {...previous, ...comment, likes: Math.max(previous?.likes ?? 0, comment.likes ?? 0)});
  }
  return [...byId.values()]
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at) || a.id.localeCompare(b.id))
    .slice(-100);
}

export function visibleComments(comments, filter = 'all') {
  return comments.filter(comment => filter === 'all' || comment.topic === filter).slice().reverse();
}
