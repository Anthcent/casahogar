// Sections with a list page (#/slug) and detail pages (#/slug/<id>).
const SECTIONS = [
  ['vida-escolar', 'campus'],
  ['agenda', 'agenda'],
  ['lecturas', 'readings'],
];

export function parseRoute(hash) {
  if (hash === '#/admin' || hash.startsWith('#/admin/')) {
    return { type: 'admin' };
  }

  const blog = hash.match(/^#\/blog(?:\?tema=([\w-]+))?$/);
  if (blog) return { type: 'blog', topic: blog[1] || 'all' };

  for (const [slug, type] of SECTIONS) {
    const match = hash.match(new RegExp(`^#/${slug}(?:/([^/?#]+))?$`));
    if (!match) continue;
    try {
      return { type, id: match[1] === undefined ? null : decodeURIComponent(match[1]) };
    } catch {
      return { type, id: null };
    }
  }

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
