import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight, Search, Menu, X, Sun, Moon, Play, ChevronRight, BookOpen,
  CalendarDays, Clock3, Bookmark, Instagram, Youtube, Facebook, Quote,
  Globe2, CircleUserRound, House, School, UsersRound, MessagesSquare,
  Clapperboard, Newspaper, NotebookPen, Shapes, MessageSquareQuote,
  Lightbulb, Grid2X2, Video, ExternalLink, LockKeyhole
} from 'lucide-react';
import { IMAGE_ALTS } from './data/content.js';
import { BlogPage, ArticlePage, CampusPage } from './pages/EditorialPages.jsx';
import { GalleryPage } from './pages/MediaGallery.jsx';
import { AgendaPage, ReadingsPage } from './pages/SchoolPages.jsx';
import { AdminPage } from './pages/AdminPage.jsx';
import { parseRoute } from './routes.js';
import { useSiteContent, subscribeNewsletter, filters, resolveAssetUrl } from './lib/cmsStore.js';

const icons = {
  all: Grid2X2,
  formation: NotebookPen,
  school: School,
  creative: Shapes,
  community: UsersRound,
  voices: MessageSquareQuote,
  ideas: Lightbulb,
  media: Clapperboard,
};

const navItems = [
  ['Inicio', '#inicio'],
  ['El liceo', '#historias'],
  ['Vida escolar', '#vida-escolar'],
  ['Blog y noticias', '#/blog'],
  ['Galería', '#/galeria'],
  ['Lecturas', '#lecturas'],
];

function renderMultiline(text) {
  const lines = String(text || '').split('\n');
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}

function renderHighlightedLines(titleText, highlight) {
  const lines = String(titleText || '').split('\n');
  const hl = String(highlight || '').trim();
  return lines.map((line, i) => {
    let content = line;
    if (hl && line.includes(hl)) {
      const idx = line.indexOf(hl);
      content = (
        <>
          {line.slice(0, idx)}
          <span>{hl}</span>
          {line.slice(idx + hl.length)}
        </>
      );
    }
    return (
      <React.Fragment key={i}>
        {content}
        {i < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

function Brand({ footer = false, goHome = true }) {
  return (
    <a className={'brand ' + (footer ? 'brand-footer' : '')} href={goHome ? '#inicio' : '#footer'} aria-label="Casa Hogar — Inicio">
      <House className="brand-icon" aria-hidden="true" strokeWidth={1.8} />
      <span className="brand-word">Casa Hogar</span>
      {!footer && <span className="brand-tagline">Aprender juntos,<br />crecer en comunidad</span>}
      {footer && <span className="footer-tagline">Un espacio para aprender<br />y crecer juntos</span>}
    </a>
  );
}

function Slot({ asset, src, alt, className = '', compact = false, children, label = 'Imagen pendiente' }) {
  const url = resolveAssetUrl(src || asset);
  const altText = alt || IMAGE_ALTS[asset] || label;
  return (
    <div className={'slot ' + (compact ? 'slot-compact ' : '') + className}>
      <div className="slot-placeholder" role={url ? undefined : 'img'} aria-label={url ? undefined : label} aria-hidden={url ? 'true' : undefined}>
        <svg className="mountain-glyph" viewBox="0 0 100 72" fill="none" aria-hidden="true">
          <circle cx="69" cy="19" r="7" fill="currentColor" opacity=".48" />
          <path d="M4 64L35 24 51 45 63 32 96 64H4z" fill="currentColor" opacity=".36" />
          <path d="M4 64L20 44 37 64H4z" fill="currentColor" opacity=".22" />
        </svg>
      </div>
      {url && <img className="slot-image" src={url} alt={altText} loading="lazy" onError={e => { e.currentTarget.style.display = 'none'; }} />}
      {children}
    </div>
  );
}

function Eyebrow({ children, color = 'yellow' }) {
  return <span className={'eyebrow eyebrow-' + color}>{children}</span>;
}

function SectionHeading({ title, action = 'Ver todas', onClick }) {
  return (
    <div className="section-heading">
      <div className="heading-title"><h2>{title}</h2></div>
      <button className="more-link" type="button" onClick={onClick} aria-label={action}><span>{action}</span><ArrowRight size={14} /></button>
      <span className="heading-divider" aria-hidden="true" />
    </div>
  );
}

function Header({ theme, onTheme, toggleSearch, searchOpen, search, setSearch, searchResults, onArticle, route }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  return (
    <>
      <header className="topbar" id="inicio">
        <div className="topbar-inner page-shell">
          <Brand />
          <nav className={'main-nav ' + (mobileMenu ? 'nav-open' : '')} aria-label="Navegación principal">
            {navItems.map(([label, href], i) => (
              <a
                onClick={() => setMobileMenu(false)}
                className={(route.type === 'home' && i === 0) || (route.type === 'blog' && href === '#/blog') || (route.type === 'article' && href === '#/blog') || (route.type === 'gallery' && href === '#/galeria') ? 'selected' : ''}
                href={href}
                key={label}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="top-actions">
            <div className="search-field">
              <Search size={15} />
              <input
                aria-label="Buscar artículos y temas"
                placeholder="Buscar artículos, temas..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => toggleSearch(true)}
                onKeyDown={e => e.key === 'Escape' && toggleSearch(false)}
              />
              <button className="search-trigger" aria-label="Buscar" onClick={() => toggleSearch(!searchOpen)}><Search size={18} /></button>
            </div>
            <button className="theme-toggle" onClick={onTheme} title={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'} aria-label="Cambiar tema">
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <a className="theme-toggle admin-toggle" href="#/admin" title="Administración" aria-label="Ir a administración">
              <LockKeyhole size={16} />
            </a>
            <button className="menu-toggle" onClick={() => setMobileMenu(s => !s)} aria-label={mobileMenu ? 'Cerrar menú' : 'Abrir menú'}>
              {mobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
      {searchOpen && (
        <div className="search-results" role="dialog" aria-label="Resultados de búsqueda">
          <div className="search-results-top">
            <strong>Buscar en Casa Hogar</strong>
            <button onClick={() => toggleSearch(false)} aria-label="Cerrar búsqueda"><X size={17} /></button>
          </div>
          <input className="search-mobile-input" type="search" aria-label="Buscar historias" placeholder="Buscar historias..." value={search} onChange={e => setSearch(e.target.value)} />
          {search.trim()
            ? (searchResults.length
              ? searchResults.map(a => (
                <button className="search-result-item" key={a.id} onClick={() => { onArticle(a); toggleSearch(false); }}>
                  <span>{a.category}</span>{a.title}<ArrowRight size={14} />
                </button>
              ))
              : <p>No se encontraron resultados para «{search}».</p>)
            : <p>Escribe una palabra clave para buscar entre las publicaciones.</p>}
        </div>
      )}
    </>
  );
}

function Ticker({ headlines }) {
  return (
    <div className="news-ticker" role="region" aria-label="Noticias de Casa Hogar">
      <div className="page-shell ticker-inner">
        <span className="ticker-label">EN CASA HOGAR</span>
        <div className="ticker-window" tabIndex={0} role="group" aria-label="Titulares; desplaza horizontalmente para leerlos">
          <div className="ticker-marquee">
            <div className="ticker-group">{headlines.map((headline, index) => <span className="ticker-headline" key={index}>{headline}</span>)}</div>
            <div className="ticker-group" aria-hidden="true">{headlines.map((headline, index) => <span className="ticker-headline" key={index}>{headline}</span>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const HERO_AUTOPLAY_MS = 6000;

function Hero({ hero, onArticle, onVideo }) {
  const [idx, setIdx] = useState(0);
  const slides = hero.slides || [];
  const safeIdx = idx < slides.length ? idx : 0;
  const s = slides[safeIdx] || { eyebrow: 'CASA HOGAR', titleText: 'Casa Hogar', highlight: '', description: '', tag: 'VIDA ESCOLAR' };
  const heroBg = resolveAssetUrl(hero.imageUrl);
  const heroBgStyle = heroBg ? { backgroundImage: `url('${heroBg}')` } : undefined;
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = setInterval(() => setIdx(i => (i + 1) % slides.length), HERO_AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length, safeIdx]);

  return (
    <section
      className="hero"
      aria-label="Historia principal"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="hero-ambient" style={heroBgStyle} aria-hidden="true" />
      <div className="hero-image" style={heroBgStyle} />
      <div className="hero-scrim" />
      <div className="hero-side-texture" />
      <div className="hero-left-swoosh" aria-hidden="true">
        <svg viewBox="0 0 90 180"><path d="M-14 85c25-4 37 22 83 29M-6 107c29-9 38 16 78 18M-6 131c25-11 36 6 66 11" fill="none" stroke="#ffc915" strokeWidth="9" strokeLinecap="round" /></svg>
      </div>
      <div className="hero-copy page-shell">
        <div className="hero-copy-inner hero-slide" key={safeIdx} aria-live={paused ? 'polite' : 'off'}>
          <p className="hero-eyebrow">{s.eyebrow}</p>
          <h1>{renderHighlightedLines(s.titleText, s.highlight)}</h1>
          <p className="hero-description">{s.description}</p>
          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => onArticle({ id: 'hero', category: s.tag, title: String(s.titleText || '').replace(/\n+/g, ' '), excerpt: s.description })}
            >
              Conoce nuestra comunidad <ArrowRight size={16} />
            </button>
            <button
              className="video-hero"
              onClick={() => onVideo({ title: hero.videoModalTitle || hero.videoButtonTitle || 'Voces de Casa Hogar', mediaUrl: hero.videoUrl || '' })}
            >
              <span className="play-outline"><Play size={13} fill="currentColor" /></span>
              <span>{hero.videoButtonTitle || 'Voces del liceo'}<small>{hero.videoButtonSub || 'Próximamente'}</small></span>
            </button>
          </div>
        </div>
      </div>
      <div className="hero-handwriting">{renderMultiline(hero.handwriting)}<i aria-hidden="true" /></div>
      <div className="hero-mark hero-mark-one" aria-hidden="true">✳</div>
      <div className="hero-mark hero-mark-two" aria-hidden="true">〰</div>
      <div className="hero-pager" aria-label="Cambiar historia principal">
        {slides.map((_, i) => (
          <button key={i} className={safeIdx === i ? 'active' : ''} onClick={() => setIdx(i)} aria-label={'Historia ' + (i + 1)}>
            {String(i + 1).padStart(2, '0')}
          </button>
        ))}
        {slides.length > 1 && (
          <button aria-label="Siguiente historia" onClick={() => setIdx(i => (i + 1) % slides.length)}><ArrowRight size={15} /></button>
        )}
      </div>
    </section>
  );
}

function FilterNav({ selected, onSelect }) {
  return (
    <div className="filters">
      <div className="page-shell filters-scroll">
        {filters.map(f => {
          const Icon = icons[f.icon] || Grid2X2;
          return (
            <button key={f.id} className={'filter-btn ' + (selected === f.id ? 'active' : '')} onClick={() => onSelect(f.id)} aria-pressed={selected === f.id}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FeatureCard({ article, onArticle, variant = 'large' }) {
  if (!article) return null;
  const large = variant === 'large';
  return (
    <button className={'feature-card feature-' + variant} onClick={() => onArticle(article)}>
      <Slot src={article.imageUrl || article.image} alt={article.imageAlt} className="feature-photo" label={'Imagen pendiente: ' + article.title}>
        {large && <div className="feature-gradient" />}
        <div className="feature-body">
          <Eyebrow>{article.category}</Eyebrow>
          <h3>{article.title}</h3>
          {large && <p>{article.excerpt}</p>}
          <div className="feature-meta">
            {large && <><CircleUserRound size={17} /> {article.author || 'Comunidad educativa'} <span className="meta-divider">|</span> </>}
            <Clock3 size={12} /> {article.read}
          </div>
        </div>
      </Slot>
    </button>
  );
}

function Events({ events, onEvent }) {
  return (
    <div className="events-card">
      <div className="events-heading">
        <span><CalendarDays size={17} /> Agenda escolar</span>
        <button onClick={() => onEvent(null)}>Ver agenda <ArrowRight size={13} /></button>
      </div>
      {events.map((e, idx) => (
        <button key={e.id || idx} className="event-row" onClick={() => onEvent(e)}>
          <span className="date-square">
            {e.day ? <>{e.day}{e.month && <small>{e.month}</small>}</> : <CalendarDays size={20} />}
          </span>
          <span className="event-info">
            <strong>{e.title}</strong>
            <span>{[e.place, e.time].filter(Boolean).join(' · ') || 'Fecha y lugar por confirmar'}</span>
          </span>
          <ChevronRight size={16} />
        </button>
      ))}
    </div>
  );
}

function Featured({ articles, quote, events, onArticle, onEvent, filter, onBrowse }) {
  const base = articles.slice(0, 3);
  const focus = filter === 'all' ? base[0] : (articles.find(a => a.filter === filter) || base[0]);
  const mids = articles.filter(a => a.id !== focus?.id).slice(0, 2);

  return (
    <section className="page-shell featured-section" id="historias">
      <SectionHeading
        icon={Newspaper}
        title={filter === 'all' ? 'Historias destacadas' : `${filters.find(f => f.id === filter)?.label ?? 'Historias'} destacadas`}
        onClick={onBrowse}
        action="Ver todas las historias"
      />
      <div className="featured-grid">
        <FeatureCard article={focus} onArticle={onArticle} />
        <div className="side-stories">
          {mids.map(a => <FeatureCard article={a} key={a.id} onArticle={onArticle} variant="small" />)}
        </div>
        <aside className="right-rail">
          <div className="quote-card quote-photo-card">
            <Slot src={quote.imageUrl} alt={quote.imageAlt} className="quote-photo" label="Cita Casa Hogar" />
            <div className="quote-copy">
              <Quote size={26} className="quote-icon" />
              <blockquote>{quote.text}</blockquote>
              <p>{quote.author}</p>
            </div>
          </div>
          <Events events={events} onEvent={onEvent} />
        </aside>
      </div>
    </section>
  );
}

function Latest({ articles, onArticle, bookmarks, onBookmark, onBrowse }) {
  const cards = articles.slice(3);
  return (
    <section className="latest-section" id="publicaciones">
      <SectionHeading title="En el liceo" action="Ver historias" onClick={onBrowse} />
      <div className="post-grid">
        {cards.map((a, i) => (
          <article className="post-card" key={a.id}>
            <button className="post-image-click" onClick={() => onArticle(a)} aria-label={'Abrir ' + a.title}>
              <Slot className="post-image" src={a.imageUrl || a.image} alt={a.imageAlt} label={'Imagen pendiente: ' + a.title} />
            </button>
            <div className="post-details">
              <Eyebrow color={i === 1 || i === 2 ? 'blue' : 'yellow'}>{a.category}</Eyebrow>
              <button className="post-title" onClick={() => onArticle(a)}>{a.title}</button>
              <div className="post-foot">
                <span>{a.read}</span>
                <button
                  className={bookmarks.includes(a.id) ? 'saved' : ''}
                  aria-label={bookmarks.includes(a.id) ? 'Quitar de guardados' : 'Guardar artículo'}
                  title="Guardar artículo"
                  onClick={() => onBookmark(a.id)}
                >
                  <Bookmark size={15} fill={bookmarks.includes(a.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Podcasts({ podcastMeta, podcasts, onVideo }) {
  const [active, setActive] = useState(0);
  const safeActive = active < podcasts.length ? active : 0;
  const currentPod = podcasts[safeActive] || { title: 'Voces del liceo', mediaUrl: '' };
  const bars = [8, 16, 11, 25, 18, 30, 12, 22, 34, 16, 27, 12, 21, 9, 17, 26, 13, 20];

  return (
    <section className="podcast-section" id="multimedia">
      <SectionHeading icon={MessagesSquare} title="Voces del liceo" action="Explorar voces" onClick={() => onVideo(currentPod)} />
      <div className="podcast-layout">
        <div className="podcast-feature">
          <Slot src={podcastMeta.posterUrl} alt={podcastMeta.posterAlt} className="podcast-poster" label="Micrófono de grabación">
            <div className="podcast-title">
              <strong>{renderMultiline(podcastMeta.heading)}</strong>
              <p>{renderMultiline(podcastMeta.subtitle)}</p>
            </div>
            <div className="podcast-wave" aria-hidden="true">{bars.map((height, i) => <span key={i} style={{ height }} />)}</div>
            <button className="big-play" aria-label="Consultar audios de Voces del liceo" onClick={() => onVideo(currentPod)}>
              <Play size={21} fill="currentColor" />
            </button>
            <span className="podcast-duration">{podcastMeta.badge || 'Próximamente'}</span>
          </Slot>
        </div>
        <div className="podcast-episodes">
          {podcasts.map((p, i) => (
            <button key={p.id || i} className={'episode ' + (safeActive === i ? 'episode-active' : '')} onClick={() => { setActive(i); onVideo(p); }}>
              <span className="episode-icon"><Play size={13} fill="currentColor" /></span>
              <span>{p.title}<small>{p.time}</small></span>
              <ChevronRight size={13} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Campus({ campus, onOpen }) {
  return (
    <section className="campus-section" id="vida-escolar">
      <SectionHeading
        icon={School}
        title="Vida escolar"
        action="Conocer más"
        onClick={() => onOpen()}
      />
      <div className="campus-layout">
        <button
          className="campus-main"
          onClick={() => onOpen()}
        >
          <Slot src={campus.imageUrl} alt={campus.imageAlt} className="campus-image">
            <p className="campus-handwriting">{renderMultiline(campus.handwriting)}<span>↗</span></p>
            <span className="primary-btn campus-cta">{campus.ctaText || 'Explorar vida escolar'} <ArrowRight size={15} /></span>
          </Slot>
        </button>
        <div className="campus-news">
          {(campus.links || []).map((c, idx) => (
            <button key={c.id || idx} onClick={() => onOpen(c.id)}>
              <Slot src={c.imageUrl} alt={c.imageAlt} compact className="campus-thumbnail" label={'Imagen: ' + c.title} />
              <span><strong>{c.title}</strong><small>{c.date}</small></span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery({ gallery, campus, onGallery }) {
  const first = gallery[0];
  const tiles = gallery.slice(1, 4);
  return (
    <section className="gallery-section" id="galeria">
      <SectionHeading title="Vida escolar en imágenes" action="Ver galería" onClick={() => onGallery()} />
      <div className="gallery-wrap">
        <div className="gallery-tiles">
          <button onClick={() => onGallery(0)} className="gallery-big">
            <Slot src={first?.imageUrl} alt={first?.alt} label="Fotografía de galería" />
          </button>
          <div className="gallery-grid">
            {tiles.map((photo, i) => (
              <button key={photo.id || i} onClick={() => onGallery(i + 1)}>
                <Slot src={photo.imageUrl} alt={photo.alt} label="Fotografía de galería">
                  {i === tiles.length - 1 && <strong className="plus-images">Ver galería</strong>}
                </Slot>
              </button>
            ))}
          </div>
        </div>
        <div className="mascot-space">
          <Slot src={campus.storyImageUrl} alt={campus.storyImageAlt} className="story-image" label="Casa Hogar" />
          <span className="story-kicker">{campus.storyKicker || 'CASA HOGAR'}</span>
          <span className="story-cross" aria-hidden="true">✝</span>
          <p>
            <span>{campus.storyQuoteHighlight || 'Cada'}</span><br />
            {renderMultiline(campus.storyQuoteRest || 'día cuenta\nuna historia')}
          </p>
        </div>
      </div>
    </section>
  );
}

function Readings({ readings, onReading }) {
  return (
    <section className="readings-section" id="lecturas">
      <SectionHeading icon={BookOpen} title="Lecturas recomendadas" onClick={() => onReading(null)} />
      <div className="reading-grid">
        {readings.map((r, i) => (
          <button className="reading-card" key={r.id || i} onClick={() => onReading(r)}>
            <Slot src={r.imageUrl} alt={r.imageAlt} className="book-cover" label={'Portada: ' + r.name}>
              {!resolveAssetUrl(r.imageUrl) && <BookOpen size={28} className="book-dummy-icon" />}
            </Slot>
            <span className="reading-copy">
              <Eyebrow>{r.category}</Eyebrow>
              <strong>{r.name}</strong>
              <small>{r.author}</small>
            </span>
            <ArrowRight size={15} className="reading-arrow" />
          </button>
        ))}
      </div>
    </section>
  );
}

function SchoolFooter({ footer, theme, onTheme, subEmail, setSubEmail, onSubscribe, subMessage }) {
  const links = [
    ['Inicio', '#inicio'],
    ['El liceo', '#historias'],
    ['Vida escolar', '#vida-escolar'],
    ['Blog y noticias', '#/blog'],
    ['Galería', '#/galeria'],
    ['Lecturas', '#lecturas'],
    ['Contacto', '#footer'],
  ];
  return (
    <footer id="footer">
      <div className="footer-main page-shell">
        <div className="footer-brand"><Brand footer /></div>
        <div className="footer-links">
          <strong>Explora</strong>
          <div>{links.map(([label, href]) => <a key={label} href={href}>{label}</a>)}</div>
        </div>
        <div className="footer-subscribe">
          <strong>{footer.subscribeHeading || 'Mantente al día'}</strong>
          <p>{footer.subscribeText || 'Recibe historias y novedades de nuestra comunidad educativa.'}</p>
          <form onSubmit={onSubscribe}>
            <input type="email" required aria-label="Correo electrónico" placeholder="Tu correo electrónico" value={subEmail} onChange={e => setSubEmail(e.target.value)} />
            <button type="submit">Suscribirme</button>
          </form>
          {subMessage && <small className="subscribe-note">{subMessage}</small>}
        </div>
        <div className="footer-social">
          <strong>Síguenos</strong>
          <div className="socials">
            <a href={footer.instagramUrl || 'https://instagram.com'} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17} /></a>
            <a href={footer.youtubeUrl || 'https://youtube.com'} target="_blank" rel="noreferrer" aria-label="YouTube"><Youtube size={18} /></a>
            <a href={footer.facebookUrl || 'https://facebook.com'} target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={17} /></a>
          </div>
          <div className="footer-utility">
            <button className="footer-theme" onClick={onTheme}>
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />} Modo {theme === 'dark' ? 'claro' : 'oscuro'}
            </button>
            <span className="footer-utility-dot" aria-hidden="true">·</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="page-shell">
          <span>{footer.copyright || '© U.E.C. Casa Hogar Monseñor Carrillo.'} Fotografías de la comunidad educativa (Trujillo, Venezuela).</span>
          <span>{footer.motto || 'Paz y Bien · Educación · Valores Franciscanos'}</span>
        </div>
      </div>
    </footer>
  );
}

function SchoolModal({ modal, onClose }) {
  useEffect(() => {
    if (!modal) return;
    const esc = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = before;
    };
  }, [modal, onClose]);

  if (!modal) return null;
  const { type, item } = modal;
  const mediaItem = typeof item === 'string' ? { title: item, mediaUrl: '' } : item;
  const mediaUrl = String(mediaItem?.mediaUrl || '').trim();
  const isAudio = /\.(mp3|wav|ogg|m4a)(\?|$)/i.test(mediaUrl);
  const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(mediaUrl);

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={mediaItem?.title || mediaItem?.name || 'Contenido de Casa Hogar'} className="modal-box">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>

        {type === 'article' && (
          <>
            <Eyebrow>{item.category || 'CASA HOGAR'}</Eyebrow>
            <h2>{item.title}</h2>
            <Slot className="modal-slot" src={item.imageUrl || item.image || ''} />
            <p>{item.excerpt || 'Experiencias y aprendizajes de nuestra comunidad educativa.'}</p>
          </>
        )}

        {type === 'video' && (
          <>
            <Eyebrow>VOCES DEL LICEO</Eyebrow>
            <h2>{mediaItem?.title}</h2>
            {isAudio ? (
              <div style={{ margin: '18px 0' }}>
                <audio controls src={mediaUrl} style={{ width: '100%' }} />
              </div>
            ) : isVideo ? (
              <div style={{ margin: '18px 0' }}>
                <video controls src={mediaUrl} style={{ width: '100%', borderRadius: 10 }} />
              </div>
            ) : mediaUrl ? (
              <div style={{ margin: '18px 0' }}>
                <p>{mediaItem?.description || 'Recurso externo disponible:'}</p>
                <a className="primary-btn" href={mediaUrl} target="_blank" rel="noreferrer" style={{ marginTop: 8 }}>
                  Abrir contenido multimedia <ExternalLink size={14} />
                </a>
              </div>
            ) : (
              <div className="modal-video">
                <Video size={48} />
                <p>{mediaItem?.description || 'Contenido audiovisual próximamente'}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  const { content } = useSiteContent();
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('casahogar_theme') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
  });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [subEmail, setSubEmail] = useState('');
  const [subMessage, setSubMessage] = useState('');
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b1117' : '#fdfcf7');
    try { localStorage.setItem('casahogar_theme', theme); } catch { /* ignore */ }
  }, [theme]);

  useEffect(() => {
    const sync = () => {
      setRoute(parseRoute(window.location.hash));
      setSearchOpen(false);
      setModal(null);
    };
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const hash = window.location.hash;
      if (route.type === 'home' && hash.startsWith('#') && !hash.startsWith('#/')) {
        document.getElementById(hash.slice(1))?.scrollIntoView();
      } else {
        window.scrollTo(0, 0);
        if (route.type !== 'home') document.querySelector('main h1')?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [route]);

  useEffect(() => {
    const article = route.type === 'article' ? content.articles.find(item => item.id === route.id) : null;
    document.title = article
      ? `${article.title} — Casa Hogar`
      : route.type === 'blog'
        ? 'Blog y noticias — Casa Hogar'
        : route.type === 'gallery'
          ? 'Galería — Casa Hogar'
          : route.type === 'campus'
            ? 'Vida escolar — Casa Hogar'
            : route.type === 'agenda'
              ? 'Agenda escolar — Casa Hogar'
              : route.type === 'readings'
                ? 'Lecturas recomendadas — Casa Hogar'
            : route.type === 'admin'
            ? 'Administración — Casa Hogar'
            : 'Casa Hogar — Vida escolar y comunidad';
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = article?.excerpt || 'Casa Hogar: vida escolar, aprendizaje, proyectos y voces de nuestra comunidad educativa.';
    }
  }, [route, content.articles]);

  const searchResults = useMemo(
    () => content.articles.filter(a => [a.title, a.category, a.excerpt].join(' ').toLowerCase().includes(search.toLowerCase())),
    [content.articles, search]
  );

  const openArticle = (item) => {
    if (item.id === 'hero') window.location.hash = '#/blog';
    else if (content.articles.some(a => a.id === item.id)) window.location.hash = `#/articulo/${encodeURIComponent(item.id)}`;
    else setModal({ type: 'article', item });
  };
  const openVideo = (item) => setModal({ type: 'video', item });
  const openEvent = (item) => { window.location.hash = item?.id ? `#/agenda/${encodeURIComponent(item.id)}` : '#/agenda'; };
  const openReading = (item) => { window.location.hash = item?.id ? `#/lecturas/${encodeURIComponent(item.id)}` : '#/lecturas'; };
  const openCampus = (id) => { window.location.hash = id ? `#/vida-escolar/${encodeURIComponent(id)}` : '#/vida-escolar'; };
  const openGallery = (i) => { window.location.hash = i === undefined ? '#/galeria' : `#/galeria/${i}`; };
  const toggleBookmark = (id) => setBookmarks(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);

  const subscribe = async (e) => {
    e.preventDefault();
    const res = await subscribeNewsletter(subEmail);
    setSubMessage(res.message);
    if (res.ok) setSubEmail('');
  };

  return (
    <div className="website">
      <Header
        route={route}
        theme={theme}
        onTheme={() => setTheme(v => v === 'dark' ? 'light' : 'dark')}
        toggleSearch={setSearchOpen}
        searchOpen={searchOpen}
        search={search}
        setSearch={setSearch}
        searchResults={searchResults}
        onArticle={openArticle}
      />

      {route.type === 'home' && (
        <>
          <Ticker headlines={content.ticker} />
          <main>
            <Hero hero={content.hero} onArticle={openArticle} onVideo={openVideo} />
            <FilterNav selected={filter} onSelect={setFilter} />
            <div className="editorial-bg">
              <Featured
                articles={content.articles}
                quote={content.quote}
                events={content.events}
                filter={filter}
                onBrowse={() => { window.location.hash = '#/blog'; }}
                onArticle={openArticle}
                onEvent={openEvent}
              />
              <div className="page-shell lower-body">
                <div className="double-row double-podcast">
                  <Latest
                    articles={content.articles}
                    onArticle={openArticle}
                    bookmarks={bookmarks}
                    onBookmark={toggleBookmark}
                    onBrowse={() => { window.location.hash = '#/blog'; }}
                  />
                  <Podcasts podcastMeta={content.podcastMeta} podcasts={content.podcasts} onVideo={openVideo} />
                </div>
                <div className="double-row double-gallery">
                  <Campus campus={content.campus} onOpen={openCampus} />
                  <Gallery gallery={content.gallery} campus={content.campus} onGallery={openGallery} />
                </div>
                <Readings readings={content.readings} onReading={openReading} />
              </div>
            </div>
          </main>
        </>
      )}

      {route.type === 'blog' && <BlogPage />}
      {route.type === 'article' && <ArticlePage id={route.id} />}
      {route.type === 'campus' && <CampusPage id={route.id} />}
      {route.type === 'agenda' && <AgendaPage id={route.id} />}
      {route.type === 'readings' && <ReadingsPage id={route.id} />}
      {route.type === 'gallery' && <GalleryPage initialIndex={route.index} />}
      {route.type === 'admin' && <AdminPage />}

      <SchoolFooter
        footer={content.footer}
        theme={theme}
        onTheme={() => setTheme(v => v === 'dark' ? 'light' : 'dark')}
        subEmail={subEmail}
        setSubEmail={setSubEmail}
        onSubscribe={subscribe}
        subMessage={subMessage}
      />
      <SchoolModal modal={modal} onClose={() => setModal(null)} />
    </div>
  );
}

export default App;
