import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { ASSETS, IMAGE_ALTS, articles, filters } from '../data/content.js';
import { articleDetails } from '../data/editorial.js';

const photos = ['gallery1', 'gallery2', 'gallery3', 'gallery4', 'gallery5'];
const topics = filters.filter(({ id }) => id !== 'media');

function EditorialPhoto({ asset, className = '' }) {
  return <div className={`editorial-photo ${className}`}>
    <img src={ASSETS[asset]} alt={IMAGE_ALTS[asset]} loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; }} />
  </div>;
}

function PageIntro({ back = '#inicio', backLabel = 'Volver al inicio', eyebrow, title, description }) {
  return <div className="page-intro">
    <a className="editorial-back" href={back}><ArrowLeft size={16} />{backLabel}</a>
    <span className="page-intro-label">{eyebrow}</span>
    <h1 tabIndex={-1}>{title}</h1>
    {description && <p>{description}</p>}
  </div>;
}

function StoryCard({ article, featured = false }) {
  return <a className={`story-card ${featured ? 'story-card-featured' : ''}`} href={`#/articulo/${article.id}`}>
    <EditorialPhoto asset={article.image} />
    <div className="story-card-copy">
      <span className="story-category">{article.category}</span>
      <h2>{article.title}</h2>
      <p>{article.excerpt}</p>
      <span className="story-card-link">Leer artículo <ArrowRight size={16} /></span>
    </div>
  </a>;
}

export function BlogPage() {
  const [topic, setTopic] = useState('all');
  const [query, setQuery] = useState('');
  const visible = articles.filter(article =>
    (topic === 'all' || article.filter === topic) &&
    `${article.title} ${article.category} ${article.excerpt}`.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es'))
  );

  return <main className="editorial-page" id="contenido">
    <div className="page-shell">
      <PageIntro eyebrow="BLOG Y NOTICIAS" title="Historias de nuestra comunidad" description="Ideas, experiencias y aprendizajes para leer con calma. Publicaciones de muestra mientras preparamos contenido oficial de Casa Hogar." />
      <div className="blog-toolbar">
        <div className="blog-topics" aria-label="Filtrar historias">{topics.map(item =>
          <button key={item.id} type="button" className={topic === item.id ? 'active' : ''} aria-pressed={topic === item.id} onClick={() => setTopic(item.id)}>{item.label}</button>
        )}</div>
        <label className="blog-search"><Search size={17} /><span className="sr-only">Buscar historias</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar historias" /></label>
      </div>
      <div className="editorial-section-title"><h2>{topic === 'all' ? 'Todas las historias' : topics.find(item => item.id === topic)?.label}</h2><span>{visible.length} {visible.length === 1 ? 'historia' : 'historias'}</span></div>
      {visible.length ? <div className="story-grid">{visible.map((article, index) => <StoryCard key={article.id} article={article} featured={index === 0 && topic === 'all' && !query.trim()} />)}</div> :
        <div className="editorial-empty"><h2>Sin resultados por ahora</h2><p>Prueba con otro término o revisa todas las historias.</p><button type="button" onClick={() => { setTopic('all'); setQuery(''); }}>Ver todas las historias</button></div>}
    </div>
  </main>;
}

export function ArticlePage({ id }) {
  const article = articles.find(item => item.id === id);
  if (!article) return <main className="editorial-page" id="contenido"><div className="page-shell editorial-not-found"><PageIntro back="#/blog" backLabel="Volver al blog" eyebrow="CASA HOGAR" title="No encontramos esta historia" description="Puede que el enlace haya cambiado. Explora el resto de publicaciones del liceo." /><a className="editorial-cta" href="#/blog">Ver todas las historias <ArrowRight size={16} /></a></div></main>;
  const body = articleDetails[id] || { intro: article.excerpt, sections: [] };
  const related = articles.filter(item => item.id !== id && item.filter === article.filter).concat(articles.filter(item => item.id !== id && item.filter !== article.filter)).slice(0, 3);

  return <main className="editorial-page" id="contenido"><div className="page-shell">
    <PageIntro back="#/blog" backLabel="Volver al blog" eyebrow={article.category} title={article.title} description={article.excerpt} />
    <div className="article-layout">
      <article className="article-body">
        <figure className="article-figure"><EditorialPhoto asset={article.image} /><figcaption>Fotografía ilustrativa. No corresponde a instalaciones ni estudiantes de Casa Hogar.</figcaption></figure>
        <div className="article-prose">
          <p className="article-lead">{body.intro}</p>
          {body.sections.map(section => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>)}
          <div className="article-endmark" aria-hidden="true">CH</div>
          <p className="article-note">Este texto es una muestra editorial. Las publicaciones oficiales se incorporarán cuando estén disponibles.</p>
        </div>
      </article>
      <aside className="article-aside" aria-label="Más historias"><h2>Seguir leyendo</h2>{related.map(item => <a href={`#/articulo/${item.id}`} key={item.id}><span>{item.category}</span><strong>{item.title}</strong><ArrowRight size={16} /></a>)}<a className="aside-all" href="#/blog">Explorar el blog <ArrowRight size={16} /></a></aside>
    </div>
  </div></main>;
}

function GalleryViewer({ selected, setSelected, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current.open) ref.current.showModal();
  }, []);
  const asset = photos[selected];
  return <dialog ref={ref} className="gallery-dialog" onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }} aria-label="Ver fotografía">
    <button className="gallery-dialog-close" type="button" onClick={onClose} aria-label="Cerrar imagen"><X size={22} /></button>
    <img src={ASSETS[asset]} alt={IMAGE_ALTS[asset]} />
    <div className="gallery-dialog-bottom"><button type="button" onClick={() => setSelected((selected + photos.length - 1) % photos.length)} aria-label="Imagen anterior"><ChevronLeft size={22} /></button><span>{selected + 1} / {photos.length} · Fotografía ilustrativa</span><button type="button" onClick={() => setSelected((selected + 1) % photos.length)} aria-label="Imagen siguiente"><ChevronRight size={22} /></button></div>
  </dialog>;
}

export function GalleryPage({ initialIndex = null }) {
  const safeIndex = initialIndex !== null && initialIndex >= 0 && initialIndex < photos.length ? initialIndex : null;
  const [selected, setSelected] = useState(safeIndex);
  useEffect(() => { setSelected(safeIndex); }, [safeIndex]);
  return <main className="editorial-page" id="contenido"><div className="page-shell">
    <PageIntro eyebrow="GALERÍA" title="Vida escolar en imágenes" description="Una mirada visual al aprendizaje, la convivencia y la creatividad. Fotografías ilustrativas; no muestran estudiantes ni espacios reales de Casa Hogar." />
    <div className="editorial-section-title"><h2>Explora la galería</h2><span>{photos.length} imágenes</span></div>
    <div className="gallery-page-grid">{photos.map((asset, index) => <button className={`gallery-page-tile gallery-tile-${index + 1}`} type="button" key={asset} onClick={() => setSelected(index)} aria-label={`Ampliar imagen ${index + 1}: ${IMAGE_ALTS[asset]}`}><EditorialPhoto asset={asset} /><span>Ver imagen <ArrowRight size={16} /></span></button>)}</div>
    <div className="gallery-page-note"><span>CASA HOGAR</span><p>Las fotos reales del liceo tendrán su lugar aquí cuando estén disponibles.</p><a href="#/blog">Leer historias del liceo <ArrowRight size={16} /></a></div>
  </div>{selected !== null && <GalleryViewer selected={selected} setSelected={setSelected} onClose={() => setSelected(null)} />}</main>;
}
