export function parseRoute(hash) {
  if (hash === '#/blog') return { type: 'blog' };

  const article = hash.match(/^#\/articulo\/([^/?#]+)$/);
  if (article) {
    try {
      return { type: 'article', id: decodeURIComponent(article[1]) };
    } catch {
      return { type: 'home' };
    }
  }

  const gallery = hash.match(/^#\/galeria(?:\/(\d+))?$/);
  if (gallery) {
    return { type: 'gallery', index: gallery[1] === undefined ? null : Number(gallery[1]) };
  }

  return { type: 'home' };
}
