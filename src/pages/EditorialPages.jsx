import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, Search } from 'lucide-react';
import { IMAGE_ALTS, topicFromParam, topicSlug } from '../data/content.js';
import { articleDetails } from '../data/editorial.js';
import { useSiteContent, filters, resolveAssetUrl } from '../lib/cmsStore.js';
import { useBookmarks, toggleBookmark } from '../lib/bookmarks.js';

const topics = filters.filter(({ id }) => id !== 'media');

export function EditorialPhoto({ src, alt = '', className = '' }) {
  const resolved = resolveAssetUrl(src);
  return <div className={`editorial-photo ${className}`}>
    {resolved && <img src={resolved} alt={alt || IMAGE_ALTS[src] || ''} loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; }} />}
  </div>;
}

export function PageIntro({ back = '#inicio', backLabel = 'Volver al inicio', eyebrow, title, description }) {
  return <div className="page-intro">
    <a className="editorial-back" href={back}><ArrowLeft size={16} />{backLabel}</a>
    <span className="page-intro-label">{eyebrow}</span>
    <h1 tabIndex={-1}>{title}</h1>
    {description && <p>{description}</p>}
  </div>;
}

function StoryCard({ article, featured = false }) {
  return <a className={`story-card ${featured ? 'story-card-featured' : ''}`} href={`#/articulo/${encodeURIComponent(article.id)}`}>
    <EditorialPhoto src={article.imageUrl || article.image} alt={article.imageAlt || article.title} />
    <div className="story-card-copy">
      <span className="story-category">{article.category}</span>
      <h2>{article.title}</h2>
      <p>{article.excerpt}</p>
      <span className="story-card-link">Leer artículo <ArrowRight size={16} /></span>
    </div>
  </a>;
}

export function BlogPage({ initialTopic = 'all' }) {
  const { content } = useSiteContent();
  const articles = content.articles;
  const bookmarks = useBookmarks();
  const validTopic = value => {
    if (value === 'guardados' || value === 'saved') return 'saved';
    const id = topicFromParam(value);
    return topics.some(item => item.id === id) ? id : 'all';
  };
  const [topic, setTopicState] = useState(() => validTopic(initialTopic));
  useEffect(() => { setTopicState(validTopic(initialTopic)); }, [initialTopic]);
  // Keep the URL shareable without triggering a route change.
  const setTopic = value => {
    setTopicState(value);
    history.replaceState(null, '', value === 'all' ? '#/blog' : `#/blog?tema=${value === 'saved' ? 'guardados' : topicSlug(value)}`);
  };
  const [query, setQuery] = useState('');
  const visible = articles.filter(article =>
    (topic === 'all' || (topic === 'saved' ? bookmarks.includes(article.id) : article.filter === topic)) &&
    `${article.title} ${article.category} ${article.excerpt}`.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es'))
  );

  return <main className="editorial-page" id="contenido">
    <div className="page-shell">
      <PageIntro eyebrow="BLOG Y NOTICIAS" title="Historias de nuestra comunidad" description="Ideas, experiencias y aprendizajes para leer con calma en nuestra comunidad educativa." />
      <div className="blog-toolbar">
        <div className="blog-topics" aria-label="Filtrar historias">{topics.map(item =>
          <button key={item.id} type="button" className={topic === item.id ? 'active' : ''} aria-pressed={topic === item.id} onClick={() => setTopic(item.id)}>{item.label}</button>
        )}
        {(bookmarks.length > 0 || topic === 'saved') && <button type="button" className={`blog-topic-saved ${topic === 'saved' ? 'active' : ''}`} aria-pressed={topic === 'saved'} onClick={() => setTopic('saved')}><Bookmark size={13} fill="currentColor" /> Guardados ({bookmarks.length})</button>}
        </div>
        <label className="blog-search"><Search size={17} /><span className="sr-only">Buscar historias</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar historias" /></label>
      </div>
      <div className="editorial-section-title"><h2>{topic === 'all' ? 'Todas las historias' : topic === 'saved' ? 'Mis guardados' : topics.find(item => item.id === topic)?.label}</h2><span>{visible.length} {visible.length === 1 ? 'historia' : 'historias'}</span></div>
      {visible.length ? <div className="story-grid">{visible.map((article, index) => <StoryCard key={article.id} article={article} featured={index === 0 && topic === 'all' && !query.trim()} />)}</div> :
        <div className="editorial-empty"><h2>{topic === 'saved' && !query.trim() ? 'Aún no guardas historias' : 'Sin resultados por ahora'}</h2><p>{topic === 'saved' && !query.trim() ? 'Toca el marcador de cualquier historia para encontrarla aquí después.' : 'Prueba con otro término o revisa todas las historias.'}</p><button type="button" onClick={() => { setTopic('all'); setQuery(''); }}>Ver todas las historias</button></div>}
    </div>
  </main>;
}

export function ArticlePage({ id }) {
  const { content } = useSiteContent();
  const bookmarks = useBookmarks();
  const articles = content.articles;
  const article = articles.find(item => item.id === id);
  if (!article) return <main className="editorial-page" id="contenido"><div className="page-shell editorial-not-found"><PageIntro back="#/blog" backLabel="Volver al blog" eyebrow="CASA HOGAR" title="No encontramos esta historia" description="Puede que el enlace haya cambiado. Explora el resto de publicaciones del liceo." /><a className="editorial-cta" href="#/blog">Ver todas las historias <ArrowRight size={16} /></a></div></main>;

  const fallbackDetail = articleDetails[id] || { intro: article.excerpt, sections: [] };
  const intro = article.intro ?? fallbackDetail.intro;
  const sections = Array.isArray(article.sections) ? article.sections : fallbackDetail.sections;
  const saved = bookmarks.includes(article.id);
  const related = articles.filter(item => item.id !== id && item.filter === article.filter).concat(articles.filter(item => item.id !== id && item.filter !== article.filter)).slice(0, 3);

  return <main className="editorial-page" id="contenido"><div className="page-shell">
    <PageIntro back="#/blog" backLabel="Volver al blog" eyebrow={article.category} title={article.title} description={article.excerpt} />
    <div className="article-layout">
      <article className="article-body">
        <figure className="article-figure">
          <EditorialPhoto src={article.imageUrl || article.image} alt={article.imageAlt || article.title} />
          {article.caption && <figcaption>{article.caption}</figcaption>}
        </figure>
        <button type="button" className={`article-save ${saved ? 'saved' : ''}`} aria-pressed={saved} onClick={() => toggleBookmark(article.id)}>
          <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Guardado' : 'Guardar artículo'}
        </button>
        <div className="article-prose">
          {intro && <p className="article-lead">{intro}</p>}
          {sections.map((section, idx) => <section key={`${section.heading}-${idx}`}><h2>{section.heading}</h2>{(section.paragraphs || []).map((paragraph, pIdx) => <p key={pIdx}>{paragraph}</p>)}</section>)}
          <div className="article-endmark" aria-hidden="true">CH</div>
          <p className="article-note">{article.author ? `${article.author} · ${article.read || ''}` : 'Casa Hogar · Comunidad educativa'}</p>
        </div>
      </article>
      <aside className="article-aside" aria-label="Más historias"><h2>Seguir leyendo</h2>{related.map(item => <a href={`#/articulo/${encodeURIComponent(item.id)}`} key={item.id}><span>{item.category}</span><strong>{item.title}</strong><ArrowRight size={16} /></a>)}<a className="aside-all" href="#/blog">Explorar el blog <ArrowRight size={16} /></a></aside>
    </div>
  </div></main>;
}

export const toParagraphs = text => String(text || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
const campusHref = id => `#/vida-escolar/${encodeURIComponent(id)}`;

function CampusExperienceCard({ item }) {
  return <a className="story-card" href={campusHref(item.id)}>
    <EditorialPhoto src={item.imageUrl} alt={item.imageAlt || item.title} />
    <div className="story-card-copy">
      <span className="story-category">{item.date || 'VIDA ESCOLAR'}</span>
      <h2>{item.title}</h2>
      {item.excerpt && <p>{item.excerpt}</p>}
      <span className="story-card-link">Leer más <ArrowRight size={16} /></span>
    </div>
  </a>;
}

export function CampusPage({ id = null }) {
  const { content } = useSiteContent();
  const campus = content.campus;
  const links = (campus.links || []).filter(item => item.id);

  if (id === null) {
    const body = toParagraphs(campus.body);
    return <main className="editorial-page" id="contenido"><div className="page-shell">
      <PageIntro eyebrow="VIDA ESCOLAR" title={campus.modalTitle || 'Aprender y crecer juntos'} description={campus.modalExcerpt} />
      <div className="article-layout">
        <article className="article-body">
          <figure className="article-figure">
            <EditorialPhoto src={campus.imageUrl} alt={campus.imageAlt} />
          </figure>
          {body.length > 0 && <div className="article-prose">
            <p className="article-lead">{body[0]}</p>
            {body.slice(1).map((paragraph, idx) => <p key={idx}>{paragraph}</p>)}
          </div>}
        </article>
        <aside className="article-aside" aria-label="Experiencias de vida escolar"><h2>Experiencias</h2>{links.map(item => <a href={campusHref(item.id)} key={item.id}><span>{item.date || 'VIDA ESCOLAR'}</span><strong>{item.title}</strong><ArrowRight size={16} /></a>)}<a className="aside-all" href="#/galeria">Ver la galería <ArrowRight size={16} /></a></aside>
      </div>
      {links.length > 0 && <>
        <div className="editorial-section-title campus-page-section"><h2>Experiencias de nuestra comunidad</h2><span>{links.length} {links.length === 1 ? 'experiencia' : 'experiencias'}</span></div>
        <div className="story-grid">{links.map(item => <CampusExperienceCard key={item.id} item={item} />)}</div>
      </>}
    </div></main>;
  }

  const index = links.findIndex(item => item.id === id);
  const item = links[index];
  if (!item) return <main className="editorial-page" id="contenido"><div className="page-shell editorial-not-found"><PageIntro back="#/vida-escolar" backLabel="Volver a Vida escolar" eyebrow="VIDA ESCOLAR" title="No encontramos esta experiencia" description="Puede que el enlace haya cambiado. Explora el resto de experiencias del liceo." /><a className="editorial-cta" href="#/vida-escolar">Ver vida escolar <ArrowRight size={16} /></a></div></main>;

  const body = toParagraphs(item.body);
  const prev = links.length > 1 ? links[(index + links.length - 1) % links.length] : null;
  const next = links.length > 1 ? links[(index + 1) % links.length] : null;
  const others = links.filter(other => other.id !== item.id).slice(0, 4);

  return <main className="editorial-page" id="contenido"><div className="page-shell">
    <PageIntro back="#/vida-escolar" backLabel="Volver a Vida escolar" eyebrow={`VIDA ESCOLAR${item.date ? ` · ${item.date.toLocaleUpperCase('es')}` : ''}`} title={item.title} description={item.excerpt} />
    <div className="article-layout">
      <article className="article-body">
        <figure className="article-figure">
          <EditorialPhoto src={item.imageUrl} alt={item.imageAlt || item.title} />
        </figure>
        <div className="article-prose">
          {body.length > 0 && <p className="article-lead">{body[0]}</p>}
          {body.slice(1).map((paragraph, idx) => <p key={idx}>{paragraph}</p>)}
          <div className="article-endmark" aria-hidden="true">CH</div>
          <p className="article-note">Casa Hogar · Vida escolar</p>
        </div>
        {prev && next && <nav className="article-pager" aria-label="Otras experiencias">
          <a href={campusHref(prev.id)}><ArrowLeft size={16} /><span><small>Anterior</small>{prev.title}</span></a>
          <a href={campusHref(next.id)}><span><small>Siguiente</small>{next.title}</span><ArrowRight size={16} /></a>
        </nav>}
      </article>
      <aside className="article-aside" aria-label="Más experiencias"><h2>Más de vida escolar</h2>{others.map(other => <a href={campusHref(other.id)} key={other.id}><span>{other.date || 'VIDA ESCOLAR'}</span><strong>{other.title}</strong><ArrowRight size={16} /></a>)}<a className="aside-all" href="#/vida-escolar">Toda la vida escolar <ArrowRight size={16} /></a></aside>
    </div>
  </div></main>;
}
