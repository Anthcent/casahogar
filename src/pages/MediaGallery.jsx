import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Film, Images, LayoutGrid, Play, Search, X } from 'lucide-react';
import { useSiteContent, resolveAssetUrl } from '../lib/cmsStore.js';
import '../styles/gallery.css';

const DEFAULT_ALBUM = 'Momentos del liceo';
const normalize = value => String(value || '').toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '');

const TYPES = [
  { id: 'all', label: 'Todo', icon: LayoutGrid },
  { id: 'photo', label: 'Fotos', icon: Images },
  { id: 'video', label: 'Videos', icon: Film },
];

function youtubeEmbed(url) {
  const match = String(url || '').match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

/** Collects every image and video published on the site into one media list. */
function buildMediaItems(content) {
  const items = [];
  const push = item => { if (item.imageUrl || item.type === 'video') items.push(item); };

  (content.gallery || []).forEach((photo, idx) => push({
    key: `gallery-${photo.id || idx}`,
    type: 'photo',
    album: (photo.album || '').trim() || DEFAULT_ALBUM,
    title: photo.caption || photo.alt || 'Fotografía de Casa Hogar',
    description: photo.alt || '',
    imageUrl: photo.imageUrl,
    alt: photo.alt,
  }));

  const campus = content.campus || {};
  push({ key: 'campus-main', type: 'photo', album: 'Vida escolar', title: campus.modalTitle || 'Vida escolar', description: campus.modalExcerpt, imageUrl: campus.imageUrl, alt: campus.imageAlt, href: '#/vida-escolar' });
  (campus.links || []).forEach((link, idx) => push({
    key: `campus-${link.id || idx}`,
    type: 'photo',
    album: 'Vida escolar',
    title: link.title,
    description: link.excerpt,
    imageUrl: link.imageUrl,
    alt: link.imageAlt,
    href: link.id ? `#/vida-escolar/${encodeURIComponent(link.id)}` : undefined,
  }));

  (content.articles || []).forEach(article => push({
    key: `article-${article.id}`,
    type: 'photo',
    album: 'Historias',
    title: article.title,
    description: article.excerpt,
    imageUrl: article.imageUrl,
    alt: article.imageAlt,
    href: `#/articulo/${encodeURIComponent(article.id)}`,
  }));

  (content.podcasts || []).forEach((pod, idx) => push({
    key: `video-${pod.id || idx}`,
    type: 'video',
    album: 'Voces del liceo',
    title: pod.title,
    description: pod.description,
    imageUrl: pod.imageUrl || content.podcastMeta?.imageUrl || '',
    mediaUrl: String(pod.mediaUrl || '').trim(),
    meta: pod.time,
  }));

  (content.readings || []).forEach((reading, idx) => push({
    key: `reading-${reading.id || idx}`,
    type: 'photo',
    album: 'Publicaciones',
    title: reading.name,
    description: reading.synopsis,
    imageUrl: reading.imageUrl,
    alt: reading.imageAlt,
    href: reading.id ? `#/lecturas/${encodeURIComponent(reading.id)}` : reading.externalUrl || undefined,
  }));

  return items;
}

function MediaImage({ src, alt = '' }) {
  const resolved = resolveAssetUrl(src);
  if (!resolved) return <div className="media-image media-image-empty" aria-hidden="true" />;
  return <img className="media-image" src={resolved} alt={alt} loading="lazy" onError={event => { event.currentTarget.style.visibility = 'hidden'; }} />;
}

function AlbumCover({ album, active, onSelect }) {
  const covers = album.items.filter(item => item.imageUrl).slice(0, 3);
  return <button type="button" className={`album-cover ${active ? 'active' : ''}`} aria-pressed={active} onClick={onSelect}>
    <span className="album-stack" aria-hidden="true">
      {covers.length ? covers.map((item, idx) => <span key={item.key} className={`album-sheet album-sheet-${idx + 1}`}><MediaImage src={item.imageUrl} /></span>)
        : <span className="album-sheet album-sheet-1 album-sheet-empty"><Film size={28} /></span>}
    </span>
    <span className="album-label"><strong>{album.name}</strong><small>{album.items.length} {album.items.length === 1 ? 'elemento' : 'elementos'}</small></span>
  </button>;
}

function MediaViewer({ items, index, onMove, onClose }) {
  const ref = useRef(null);
  const item = items[index];

  useEffect(() => {
    if (ref.current && !ref.current.open) ref.current.showModal();
  }, []);

  useEffect(() => {
    const onKey = event => {
      if (event.key === 'ArrowLeft') onMove(-1);
      if (event.key === 'ArrowRight') onMove(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onMove]);

  if (!item) return null;
  const embed = item.type === 'video' ? youtubeEmbed(item.mediaUrl) : null;
  const isFile = item.type === 'video' && /\.(mp4|webm|mov)(\?|$)/i.test(item.mediaUrl);
  const isAudio = item.type === 'video' && /\.(mp3|wav|ogg|m4a)(\?|$)/i.test(item.mediaUrl);
  const isExternal = item.href && /^https?:/i.test(item.href);

  return <dialog ref={ref} className="media-viewer" onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }} aria-label={item.title}>
    <button className="media-viewer-close" type="button" onClick={onClose} aria-label="Cerrar visor"><X size={22} /></button>
    <div className="media-viewer-stage">
      {embed ? <iframe src={embed} title={item.title} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        : isFile ? <video controls src={item.mediaUrl} poster={resolveAssetUrl(item.imageUrl) || undefined} />
        : item.imageUrl ? <img src={resolveAssetUrl(item.imageUrl)} alt={item.alt || item.title} />
        : <div className="media-viewer-placeholder"><Film size={48} /><p>Contenido audiovisual próximamente</p></div>}
      {isAudio && <audio controls src={item.mediaUrl} />}
      {items.length > 1 && <>
        <button className="media-viewer-nav prev" type="button" onClick={() => onMove(-1)} aria-label="Anterior"><ChevronLeft size={26} /></button>
        <button className="media-viewer-nav next" type="button" onClick={() => onMove(1)} aria-label="Siguiente"><ChevronRight size={26} /></button>
      </>}
    </div>
    <div className="media-viewer-info">
      <div>
        <span className="media-viewer-album">{item.album}{item.meta ? ` · ${item.meta}` : ''}</span>
        <h2>{item.title}</h2>
        {item.description && item.description !== item.title && <p>{item.description}</p>}
      </div>
      <div className="media-viewer-actions">
        <span className="media-viewer-count">{index + 1} / {items.length}</span>
        {item.type === 'video' && item.mediaUrl && !embed && !isFile && !isAudio && <a href={item.mediaUrl} target="_blank" rel="noreferrer">Abrir video <ExternalLink size={14} /></a>}
        {item.href && <a href={item.href} {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})} onClick={isExternal ? undefined : onClose}>
          {isExternal ? 'Abrir' : 'Ver publicación'} <ArrowRight size={14} />
        </a>}
      </div>
    </div>
  </dialog>;
}

export function GalleryPage({ initialIndex = null }) {
  const { content } = useSiteContent();
  const items = useMemo(() => buildMediaItems(content), [content]);
  const albums = useMemo(() => {
    const map = new Map();
    items.forEach(item => {
      if (!map.has(item.album)) map.set(item.album, []);
      map.get(item.album).push(item);
    });
    return [...map].map(([name, albumItems]) => ({ name, items: albumItems }));
  }, [items]);

  const [album, setAlbum] = useState('all');
  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState(null);

  // Landing mosaic links to #/galeria/<n>, the n-th gallery photo.
  useEffect(() => {
    const photo = initialIndex === null ? null : (content.gallery || [])[initialIndex];
    setSelectedKey(photo ? `gallery-${photo.id || initialIndex}` : null);
  }, [initialIndex, content.gallery]);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return items.filter(item =>
      (album === 'all' || item.album === album) &&
      (type === 'all' || item.type === type) &&
      (!q || normalize(`${item.title} ${item.description} ${item.album}`).includes(q))
    );
  }, [items, album, type, query]);

  const viewerItems = visible.some(item => item.key === selectedKey) ? visible : items;
  const selectedIndex = viewerItems.findIndex(item => item.key === selectedKey);
  const move = step => {
    if (selectedIndex < 0) return;
    setSelectedKey(viewerItems[(selectedIndex + step + viewerItems.length) % viewerItems.length].key);
  };
  const closeViewer = () => {
    setSelectedKey(null);
    if (/^#\/galeria\/\d+$/.test(window.location.hash)) history.replaceState(null, '', '#/galeria');
  };
  const resetFilters = () => { setAlbum('all'); setType('all'); setQuery(''); };

  const photoCount = items.filter(item => item.type === 'photo').length;
  const videoCount = items.length - photoCount;
  const currentAlbum = album === 'all' ? 'Todos los álbumes' : album;

  return <main className="editorial-page media-page" id="contenido">
    <section className="media-hero">
      <div className="page-shell">
        <a className="editorial-back" href="#inicio"><ArrowLeft size={16} />Volver al inicio</a>
        <span className="page-intro-label">MULTIMEDIA</span>
        <h1 tabIndex={-1}>El álbum de <em>Casa Hogar</em></h1>
        <p>Fotografías, videos y publicaciones de nuestra comunidad educativa, reunidos en un solo lugar.</p>
        <ul className="media-stats" aria-label="Resumen del álbum">
          <li><strong>{photoCount}</strong> fotos</li>
          <li><strong>{videoCount}</strong> videos</li>
          <li><strong>{albums.length}</strong> álbumes</li>
        </ul>
      </div>
    </section>

    <div className="page-shell">
      <section className="album-shelf" aria-label="Álbumes">
        <AlbumCover album={{ name: 'Todos', items }} active={album === 'all'} onSelect={() => setAlbum('all')} />
        {albums.map(item => <AlbumCover key={item.name} album={item} active={album === item.name} onSelect={() => setAlbum(album === item.name ? 'all' : item.name)} />)}
      </section>

      <div className="media-toolbar">
        <div className="media-types" role="group" aria-label="Tipo de contenido">
          {TYPES.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={type === id ? 'active' : ''} aria-pressed={type === id} onClick={() => setType(id)}><Icon size={15} />{label}</button>)}
        </div>
        <label className="blog-search media-search"><Search size={17} /><span className="sr-only">Buscar en el álbum</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar fotos, videos, álbumes…" /></label>
      </div>

      <div className="editorial-section-title"><h2>{currentAlbum}</h2><span aria-live="polite">{visible.length} {visible.length === 1 ? 'resultado' : 'resultados'}</span></div>

      {visible.length ? <div className="media-grid">
        {visible.map((item, idx) => <button
          key={item.key}
          type="button"
          className={`media-tile media-tile-${item.type}`}
          style={{ '--delay': `${Math.min(idx, 12) * 40}ms` }}
          onClick={() => setSelectedKey(item.key)}
          aria-label={`${item.type === 'video' ? 'Reproducir' : 'Ver'}: ${item.title}`}
        >
          <MediaImage src={item.imageUrl} alt={item.alt || item.title} />
          {item.type === 'video' && <span className="media-play" aria-hidden="true"><Play size={22} fill="currentColor" /></span>}
          <span className="media-tile-caption"><small>{item.album}</small><strong>{item.title}</strong></span>
        </button>)}
      </div> : <div className="editorial-empty"><h2>Sin resultados por ahora</h2><p>Prueba con otro término o explora todos los álbumes.</p><button type="button" onClick={resetFilters}>Ver todo el álbum</button></div>}

      <div className="gallery-page-note"><span>CASA HOGAR</span><p>Momentos, actividades y proyectos compartidos de nuestro liceo.</p><a href="#/blog">Leer historias del liceo <ArrowRight size={16} /></a></div>
    </div>

    {selectedIndex >= 0 && <MediaViewer items={viewerItems} index={selectedIndex} onMove={move} onClose={closeViewer} />}
  </main>;
}
