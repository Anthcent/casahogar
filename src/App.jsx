import React, {useState, useEffect, useMemo} from 'react';
import { ArrowRight, Search, Menu, X, Sun, Moon, Play, ChevronRight, GraduationCap, Camera, BookOpen, CalendarDays, CirclePlay, Sparkles, HandHeart, Clock3, Bookmark, Instagram, Youtube, Facebook, Headphones, Quote, Globe2, CircleUserRound, House, School, Palette, UsersRound, MessagesSquare, Clapperboard, Newspaper, NotebookPen, Shapes, MessageSquareQuote, Lightbulb, Grid2X2, Video } from 'lucide-react';
import { ASSETS, IMAGE_ALTS, heroSlides, ticker, filters, articles, events, podcasts, campusLinks, readings } from './data/content.js';
import { BlogPage, ArticlePage, GalleryPage } from './pages/EditorialPages.jsx';
import { parseRoute } from './routes.js';

const icons = {all:Grid2X2,formation:NotebookPen,school:School,creative:Shapes,community:UsersRound,voices:MessageSquareQuote,ideas:Lightbulb,media:Clapperboard};
const navItems = [ ['Inicio','#inicio'],['El liceo','#historias'],['Vida escolar','#vida-escolar'],['Blog y noticias','#/blog'],['Galería','#/galeria'],['Lecturas','#lecturas'] ];

function Brand({footer=false, goHome=true}) {
  return <a className={'brand '+(footer?'brand-footer':'')} href={goHome?'#inicio':'#footer'} aria-label="Casa Hogar — Inicio">
    <House className="brand-icon" aria-hidden="true" strokeWidth={1.8}/>
    <span className="brand-word">Casa Hogar</span>
    {!footer && <span className="brand-tagline">Aprender juntos,<br/>crecer en comunidad</span>}
    {footer && <span className="footer-tagline">Un espacio para aprender<br/>y crecer juntos</span>}
  </a>;
}
function Slot({asset, className='', compact=false, children, label='Imagen pendiente'}) {
  const url = ASSETS[asset];
  return <div className={'slot '+(compact?'slot-compact ':'')+className}>
    <div className="slot-placeholder" role={url?undefined:'img'} aria-label={url?undefined:label} aria-hidden={url?'true':undefined}>
      <svg className="mountain-glyph" viewBox="0 0 100 72" fill="none" aria-hidden="true">
        <circle cx="69" cy="19" r="7" fill="currentColor" opacity=".48" />
        <path d="M4 64L35 24 51 45 63 32 96 64H4z" fill="currentColor" opacity=".36" />
        <path d="M4 64L20 44 37 64H4z" fill="currentColor" opacity=".22" />
      </svg>
    </div>
    {url && <img className="slot-image" src={url} alt={IMAGE_ALTS[asset] || label} loading="lazy" onError={e=>{e.currentTarget.style.display='none'}} />}
    {children}
  </div>;
}
function Eyebrow({children, color='yellow'}) { return <span className={'eyebrow eyebrow-'+color}>{children}</span>; }
function SectionHeading({title,action='Ver todas',onClick}) {
  return <div className="section-heading"><div className="heading-title"><h2>{title}</h2></div><button className="more-link" type="button" onClick={onClick} aria-label={action}><span>{action}</span><ArrowRight size={14}/></button><span className="heading-divider" aria-hidden="true"/></div>;
}
function Header({theme,onTheme,toggleSearch,searchOpen,search,setSearch,searchResults,onArticle,route}) {
 const [mobileMenu,setMobileMenu]=useState(false);
 return <>
  <header className="topbar" id="inicio"><div className="topbar-inner page-shell">
   <Brand/>
   <nav className={'main-nav '+(mobileMenu?'nav-open':'')} aria-label="Navegación principal">
     {navItems.map(([label,href],i)=><a onClick={()=>setMobileMenu(false)} className={(route.type==='home'&&i===0)||(route.type==='blog'&&href==='#/blog')||(route.type==='article'&&href==='#/blog')||(route.type==='gallery'&&href==='#/galeria')?'selected':''} href={href} key={label}>{label}</a>)}
   </nav>
   <div className="top-actions">
     <div className="search-field"><Search size={15}/><input aria-label="Buscar artículos y temas" placeholder="Buscar artículos, temas..." value={search} onChange={e=>setSearch(e.target.value)} onFocus={()=>toggleSearch(true)} onKeyDown={e=>e.key==='Escape'&&toggleSearch(false)}/><button className="search-trigger" aria-label="Buscar" onClick={()=>toggleSearch(!searchOpen)}><Search size={18}/></button></div>
     <button className="theme-toggle" onClick={onTheme} title={theme==='dark'?'Activar modo claro':'Activar modo oscuro'} aria-label="Cambiar tema">{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}</button>
     <button className="menu-toggle" onClick={()=>setMobileMenu(s=>!s)} aria-label={mobileMenu?'Cerrar menú':'Abrir menú'}>{mobileMenu?<X size={22}/>:<Menu size={22}/>}</button>
   </div>
  </div></header>
    {searchOpen&&<div className="search-results" role="dialog" aria-label="Resultados de búsqueda"><div className="search-results-top"><strong>Buscar en Casa Hogar</strong><button onClick={()=>toggleSearch(false)} aria-label="Cerrar búsqueda"><X size={17}/></button></div><input className="search-mobile-input" type="search" aria-label="Buscar historias" placeholder="Buscar historias..." value={search} onChange={e=>setSearch(e.target.value)}/>
   {search.trim() ? (searchResults.length? searchResults.map(a=><button className="search-result-item" key={a.id} onClick={()=>{onArticle(a);toggleSearch(false)}}><span>{a.category}</span>{a.title}<ArrowRight size={14}/></button>) : <p>No se encontraron resultados para «{search}».</p>) : <p>Escribe una palabra clave para buscar entre los artículos de demostración.</p>}
  </div>}
 </>;
}
function Ticker() {
  return <div className="news-ticker" role="region" aria-label="Noticias de Casa Hogar">
    <div className="page-shell ticker-inner"><span className="ticker-label">EN CASA HOGAR</span>
      <div className="ticker-window" tabIndex={0} role="group" aria-label="Titulares; desplaza horizontalmente para leerlos">
        <div className="ticker-marquee"><div className="ticker-group">{ticker.map((headline,index)=><span className="ticker-headline" key={index}>{headline}</span>)}</div><div className="ticker-group" aria-hidden="true">{ticker.map((headline,index)=><span className="ticker-headline" key={index}>{headline}</span>)}</div></div>
      </div>
    </div>
  </div>;
}
function Hero({onArticle,onVideo}) {
 const [idx,setIdx]=useState(0);
 const s=heroSlides[idx];
 return <section className="hero" aria-label="Historia principal"><div className="hero-image" style={{backgroundImage:`url('${ASSETS.hero}')`}}/><div className="hero-scrim"/><div className="hero-side-texture"/>
   <div className="hero-left-swoosh" aria-hidden="true"><svg viewBox="0 0 90 180"><path d="M-14 85c25-4 37 22 83 29M-6 107c29-9 38 16 78 18M-6 131c25-11 36 6 66 11" fill="none" stroke="#ffc915" strokeWidth="9" strokeLinecap="round"/></svg></div>
    <div className="hero-copy page-shell"><div className="hero-copy-inner"><p className="hero-eyebrow">{s.eyebrow}</p><h1>{idx===0?<>Jóvenes<br/>que <span>iluminan</span><br/>el mañana</>:s.lines.map((line,i)=><React.Fragment key={line}>{line}{i!==s.lines.length-1&&<br/>}</React.Fragment>)}</h1><p className="hero-description">{s.description}</p><div className="hero-buttons"><button className="primary-btn" onClick={()=>onArticle({id:'hero', category:s.tag,title:idx===0?'Jóvenes que iluminan el mañana':s.lines.join(' '), excerpt:s.description})}>Conoce nuestra comunidad <ArrowRight size={16}/></button><button className="video-hero" onClick={()=>onVideo('Voces de Casa Hogar')}><span className="play-outline"><Play size={13} fill="currentColor"/></span><span>Voces del liceo<small>Próximamente</small></span></button></div></div></div>
   <div className="hero-handwriting">Mentes<br/>preparadas.<br/>Corazones<br/>dispuestos.<br/>Un mundo<br/>mejor.<i aria-hidden="true"/></div>
   <div className="hero-mark hero-mark-one" aria-hidden="true">✳</div><div className="hero-mark hero-mark-two" aria-hidden="true">〰</div>
   <div className="hero-pager" aria-label="Cambiar historia principal">{heroSlides.map((s,i)=><button key={i} className={idx===i?'active':''} onClick={()=>setIdx(i)} aria-label={'Historia '+(i+1)}>0{i+1}</button>)}<button aria-label="Siguiente historia" onClick={()=>setIdx(i=>(i+1)%heroSlides.length)}><ArrowRight size={15}/></button></div>
 </section>;
}
 function FilterNav({selected,onSelect}) { return <div className="filters"><div className="page-shell filters-scroll">{filters.map(f=>{const Icon=icons[f.icon];return <button key={f.id} className={'filter-btn '+(selected===f.id?'active':'')} onClick={()=>onSelect(f.id)} aria-pressed={selected===f.id}><Icon size={18} strokeWidth={1.8}/><span>{f.label}</span></button>})}</div></div> }
function FeatureCard({article,onArticle,variant='large'}) {
 const large=variant==='large';
  return <button className={'feature-card feature-'+variant} onClick={()=>onArticle(article)}><Slot asset={article.image} className="feature-photo" label={'Imagen pendiente: '+article.title}>
  {large&&<div className="feature-gradient"/>}
   <div className="feature-body"><Eyebrow>{article.category}</Eyebrow><h3>{article.title}</h3>{large&&<p>{article.excerpt}</p>}<div className="feature-meta">{large&&<><CircleUserRound size={17}/> {article.author} <span className="meta-divider">|</span> </>}<Clock3 size={12}/> {article.read}</div></div>
 </Slot></button>;
}
function Events({onEvent}) {return <div className="events-card"><div className="events-heading"><span><CalendarDays size={17}/> Agenda escolar</span><button onClick={()=>onEvent(events[0])}>Ver agenda <ArrowRight size={13}/></button></div>{events.map(e=><button key={e.title} className="event-row" onClick={()=>onEvent(e)}><span className="date-square"><CalendarDays size={20}/></span><span className="event-info"><strong>{e.title}</strong><span>Fecha y lugar por confirmar</span></span><ChevronRight size={16}/></button>)}</div>}
function Featured({onArticle,onEvent,filter,onBrowse}) {
 const base=articles.slice(0,3);
 const focus=filter==='all'?base[0]:(articles.find(a=>a.filter===filter)||base[0]);
 const mids=base.filter(a=>a.id!==focus.id); while(mids.length<2) mids.push(base[mids.length+1]);
 return <section className="page-shell featured-section" id="historias">
    <SectionHeading icon={Newspaper} title={filter==='all'?'Historias destacadas':`${filters.find(f=>f.id===filter)?.label ?? 'Historias'} destacadas`} onClick={onBrowse} action="Ver todas las historias"/>
   <div className="featured-grid"><FeatureCard article={focus} onArticle={onArticle}/><div className="side-stories">{mids.slice(0,2).map(a=><FeatureCard article={a} key={a.id} onArticle={onArticle} variant="small"/>)}</div><aside className="right-rail"><div className="quote-card quote-photo-card"><Slot asset="faithImage" className="quote-photo" label="Crucifijo frente a un vitral de iglesia"/><div className="quote-copy"><Quote size={26} className="quote-icon"/><blockquote>Un liceo se construye cada día: con preguntas, encuentros y ganas de aprender.</blockquote><p>Casa Hogar · Comunidad educativa</p></div></div><Events onEvent={onEvent}/></aside></div>
 </section>;
}
  function Latest({onArticle,bookmarks,onBookmark,onBrowse}) {
 const cards=articles.slice(3);
    return <section className="latest-section" id="publicaciones"><SectionHeading title="En el liceo" action="Ver historias" onClick={onBrowse}/><div className="post-grid">{cards.map((a,i)=><article className="post-card" key={a.id}><button className="post-image-click" onClick={()=>onArticle(a)} aria-label={'Abrir '+a.title}><Slot className="post-image" asset={a.image} label={'Imagen pendiente: '+a.title}/></button><div className="post-details"><Eyebrow color={i===1||i===2?'blue':'yellow'}>{a.category}</Eyebrow><button className="post-title" onClick={()=>onArticle(a)}>{a.title}</button><div className="post-foot"><span>{a.read}</span><button className={bookmarks.includes(a.id)?'saved':''} aria-label={bookmarks.includes(a.id)?'Quitar de guardados':'Guardar artículo'} title="Guardar artículo" onClick={()=>onBookmark(a.id)}><Bookmark size={15} fill={bookmarks.includes(a.id)?'currentColor':'none'}/></button></div></div></article>)}</div></section>;
}
function Podcasts({onVideo}) {
  const [active,setActive]=useState(0);
  const bars=[8,16,11,25,18,30,12,22,34,16,27,12,21,9,17,26,13,20];
  return <section className="podcast-section" id="multimedia"><SectionHeading icon={MessagesSquare} title="Voces del liceo" action="Explorar voces" onClick={()=>onVideo(podcasts[active].title)}/><div className="podcast-layout"><div className="podcast-feature"><Slot asset="podcast" className="podcast-poster" label="Micrófono de grabación ilustrativo"><div className="podcast-title"><strong>VOCES<br/>DEL LICEO</strong><p>Historias que merecen<br/>ser escuchadas</p></div><div className="podcast-wave" aria-hidden="true">{bars.map((height,i)=><span key={i} style={{height}}/>)}</div><button className="big-play" aria-label="Consultar audios de Voces del liceo" onClick={()=>onVideo(podcasts[active].title)}><Play size={21} fill="currentColor"/></button><span className="podcast-duration">Próximamente</span></Slot></div><div className="podcast-episodes">{podcasts.map((p,i)=><button key={p.title} className={'episode '+(active===i?'episode-active':'')} onClick={()=>{setActive(i);onVideo(p.title)}}><span className="episode-icon"><Play size={13} fill="currentColor"/></span><span>{p.title}<small>{p.time}</small></span><ChevronRight size={13}/></button>)}</div></div></section>;
}
function Campus({onArticle}) {
  return <section className="campus-section" id="vida-escolar">
    <SectionHeading icon={School} title="Vida escolar" action="Conocer más" onClick={()=>onArticle({title:'Vida escolar',category:'VIDA ESCOLAR',excerpt:'Experiencias, actividades y encuentros que forman parte de nuestro día a día en el liceo.'})}/>
    <div className="campus-layout">
      <button className="campus-main" onClick={()=>onArticle({title:'Aprender y crecer juntos',category:'VIDA ESCOLAR',excerpt:'Las aulas, los recreos y los proyectos compartidos también cuentan nuestra historia.'})}>
        <Slot asset="campus" className="campus-image"><p className="campus-handwriting">Aquí<br/>crecemos<br/>juntos.<span>↗</span></p><span className="primary-btn campus-cta">Explorar vida escolar <ArrowRight size={15}/></span></Slot>
      </button>
      <div className="campus-news">{campusLinks.map(c=><button key={c.title} onClick={()=>onArticle({...c,category:'VIDA ESCOLAR',excerpt:'Una mirada a las experiencias de nuestra comunidad educativa.'})}><Slot asset={c.image} compact className="campus-thumbnail" label={'Imagen ilustrativa: '+c.title}/><span><strong>{c.title}</strong><small>{c.date}</small></span></button>)}</div>
    </div>
  </section>;
}
function Gallery({onGallery}) {return <section className="gallery-section" id="galeria"><SectionHeading title="Vida escolar en imágenes" action="Ver galería" onClick={()=>onGallery()}/><div className="gallery-wrap"><div className="gallery-tiles"><button onClick={()=>onGallery(0)} className="gallery-big"><Slot asset="gallery1" label="Fotografía ilustrativa"/></button><div className="gallery-grid">{[0,1,2].map(i=><button key={i} onClick={()=>onGallery(i+1)}><Slot asset={'gallery'+(i+2)} label="Fotografía ilustrativa">{i===2&&<strong className="plus-images">Ver galería</strong>}</Slot></button>)}</div></div><div className="mascot-space"><Slot asset="storyFaith" className="story-image" label="Vitral de iglesia con cruz"/><span className="story-kicker">CASA HOGAR</span><span className="story-cross" aria-hidden="true">✝</span><p><span>Cada</span><br/>día cuenta<br/>una historia</p></div></div></section> }
function Readings({onReading}) {return <section className="readings-section" id="lecturas"><SectionHeading icon={BookOpen} title="Lecturas recomendadas" onClick={()=>onReading(readings[0])}/><div className="reading-grid">{readings.map((r,i)=><button className="reading-card" key={r.name} onClick={()=>onReading(r)}><Slot asset={r.image} className="book-cover" label={'Portada pendiente: '+r.name}>{!ASSETS[r.image]&&<BookOpen size={28} className="book-dummy-icon"/>}</Slot><span className="reading-copy"><Eyebrow>{r.category}</Eyebrow><strong>{r.name}</strong><small>{r.author}</small></span><ArrowRight size={15} className="reading-arrow"/></button>)}</div></section>}
function SchoolFooter({theme,onTheme,subEmail,setSubEmail,onSubscribe,subMessage}) {
  const links = [['Inicio','#inicio'],['El liceo','#historias'],['Vida escolar','#vida-escolar'],['Blog y noticias','#/blog'],['Galería','#/galeria'],['Lecturas','#lecturas'],['Contacto','#footer']];
  return <footer id="footer"><div className="footer-main page-shell">
    <div className="footer-brand"><Brand footer/></div>
    <div className="footer-links"><strong>Explora</strong><div>{links.map(([label,href])=><a key={label} href={href}>{label}</a>)}</div></div>
    <div className="footer-subscribe"><strong>Mantente al día</strong><p>Recibe historias y novedades de nuestra comunidad educativa.</p><form onSubmit={onSubscribe}><input type="email" required aria-label="Correo electrónico" placeholder="Tu correo electrónico" value={subEmail} onChange={e=>setSubEmail(e.target.value)}/><button type="submit">Suscribirme</button></form>{subMessage&&<small className="subscribe-note">{subMessage}</small>}</div>
    <div className="footer-social"><strong>Síguenos</strong><div className="socials"><a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17}/></a><a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><Youtube size={18}/></a><a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={17}/></a></div><button className="footer-theme" onClick={onTheme}>{theme==='dark'?<Sun size={14}/>:<Moon size={14}/>} Modo {theme==='dark'?'claro':'oscuro'}</button></div>
  </div><div className="footer-bottom"><div className="page-shell"><span>© Casa Hogar. Fotografías ilustrativas de <a href="https://unsplash.com/license" target="_blank" rel="noreferrer">Unsplash</a>.</span><span>Aprendizaje · Convivencia · Comunidad</span></div></div></footer>;
}
function SchoolModal({modal,onClose}) {
  useEffect(()=>{if(!modal)return;const esc=e=>{if(e.key==='Escape')onClose()};document.addEventListener('keydown',esc);const before=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.removeEventListener('keydown',esc);document.body.style.overflow=before}},[modal,onClose]);
  if(!modal)return null;
  const {type,item}=modal;
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div role="dialog" aria-modal="true" aria-label={item?.title||'Contenido de Casa Hogar'} className="modal-box"><button className="modal-close" onClick={onClose} aria-label="Cerrar"><X size={20}/></button>
    {type==='article'&&<><Eyebrow>{item.category||'CASA HOGAR'}</Eyebrow><h2>{item.title}</h2><Slot className="modal-slot" asset={item.image||''}/><p>{item.excerpt||'Próximamente compartiremos más sobre esta historia de nuestra comunidad educativa.'}</p><p className="modal-disclaimer">Contenido de muestra. Las noticias definitivas se publicarán cuando estén disponibles.</p></>}
    {type==='video'&&<><h2>{item}</h2><div className="modal-video"><Video size={48}/><p>Contenido audiovisual próximamente</p></div></>}
    {type==='event'&&<><Eyebrow>AGENDA ESCOLAR</Eyebrow><h2>{item.title}</h2><p>La fecha, hora y lugar se comunicarán por los canales del liceo.</p></>}
    {type==='reading'&&<><Eyebrow>{item.category}</Eyebrow><h2>{item.name}</h2><p>Próximamente incorporaremos recomendaciones de lectura para estudiantes y familias.</p></>}
    {type==='gallery'&&<><h2>Vida escolar en imágenes</h2><Slot className="modal-slot" asset={'gallery'+((item%5)+1)} label="Fotografía ilustrativa"/><p>Imagen ilustrativa. Las fotos reales del liceo podrán incorporarse aquí.</p></>}
  </div></div>;
}
function Footer({theme,onTheme,subEmail,setSubEmail,onSubscribe,subMessage}) {return <footer id="footer"><div className="footer-main page-shell"><div className="footer-brand"><Brand footer/></div><div className="footer-links"><strong>Enlaces</strong><div>{[['Inicio','#inicio'],['Sobre nosotros','#historias'],['Noticias','#publicaciones'],['Eventos','#eventos'],['Vida en el campus','#campus'],['Fe y sociedad','#historias'],['Recursos','#lecturas'],['Contacto','#footer']].map(([t,url])=><a key={t} href={url}>{t}</a>)}</div></div><div className="footer-subscribe"><strong>Suscríbete</strong><p>Recibe nuestras historias, eventos y reflexiones<br/>en tu correo.</p><form onSubmit={onSubscribe}><input type="email" required placeholder="Tu correo electrónico" value={subEmail} onChange={e=>setSubEmail(e.target.value)}/><button type="submit">Suscribirme</button></form>{subMessage&&<small className="subscribe-note">{subMessage}</small>}</div><div className="footer-social"><strong>Síguenos</strong><div className="socials"><a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17}/></a><a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><Youtube size={18}/></a><a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={17}/></a><a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X"><span className="x-letter">𝕏</span></a><a href="https://open.spotify.com" target="_blank" rel="noreferrer" aria-label="Spotify"><Headphones size={17}/></a></div><button className="footer-theme" onClick={onTheme}>{theme==='dark'?<Sun size={14}/>:<Moon size={14}/>} Modo {theme==='dark'?'claro':'oscuro'}</button></div></div><div className="footer-bottom"><div className="page-shell"><span>© 2024 Veritas. Todos los derechos reservados.</span><span>Educación&nbsp; · &nbsp;Fe&nbsp; · &nbsp;Servicio&nbsp; · &nbsp;Comunidad&nbsp; · &nbsp;Un mundo mejor</span></div></div></footer> }
function Modal({modal,onClose}) { useEffect(()=>{if(!modal)return;const esc=e=>{if(e.key==='Escape')onClose()};document.addEventListener('keydown',esc);const before=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.removeEventListener('keydown',esc);document.body.style.overflow=before}},[modal,onClose]);if(!modal)return null;const {type,item}=modal;return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div role="dialog" aria-modal="true" aria-label={item?.title||'Contenido VERITAS'} className="modal-box"><button className="modal-close" onClick={onClose} aria-label="Cerrar"><X size={20}/></button>{type==='article'?<><Eyebrow>{item.category||'VERITAS'}</Eyebrow><h2>{item.title}</h2><p className="modal-meta">{item.date||'25 Sep 2024'} {item.read&&' · '+item.read}</p><Slot className="modal-slot" asset={item.image||''}/><p>{item.excerpt||'Próximamente podrás consultar el contenido completo de esta publicación en VERITAS.'}</p><p className="modal-disclaimer">Esta página reproduce la interfaz de la referencia. El artículo completo se incorporará cuando se añada el contenido editorial definitivo.</p></>:type==='video'?<><h2>{item}</h2><div className="modal-video"><CirclePlay size={56}/><p>Espacio reservado para el reproductor</p></div><p>La interfaz está preparada para conectar el archivo de video, podcast o una URL embebida. No se incluye contenido audiovisual en este ZIP.</p></>:type==='event'?<><Eyebrow>PRÓXIMO EVENTO</Eyebrow><h2>{item.title}</h2><p><CalendarDays size={18} style={{verticalAlign:'middle'}}/> {item.day} de {item.month} · {item.time}</p><p><Globe2 size={18} style={{verticalAlign:'middle'}}/> {item.place}</p><p className="modal-disclaimer">Los eventos se muestran como contenido de demostración basado en la referencia.</p></>:type==='reading'?<><Eyebrow>{item.category}</Eyebrow><h2>{item.name}</h2><p>Autor: {item.author}</p><Slot className="modal-slot modal-book" asset={item.image}/><p>Espacio reservado para la sinopsis, ficha del libro y enlace externo.</p></>:<><h2>Galería fotográfica</h2><Slot className="modal-slot" asset={'gallery'+((item%5)+1)}/><p>Fotografía {item+1}. Aquí aparecerá la imagen original cuando la incorpores a la carpeta de recursos.</p></>}</div></div> }
function App(){
  const [theme,setTheme]=useState(()=>{try{return localStorage.getItem('casahogar_theme')==='dark'?'dark':'light'}catch{return 'light'}});
  const [filter,setFilter]=useState('all'),[search,setSearch]=useState(''),[searchOpen,setSearchOpen]=useState(false),[modal,setModal]=useState(null),[bookmarks,setBookmarks]=useState([]),[subEmail,setSubEmail]=useState(''),[subMessage,setSubMessage]=useState('');
  const [route,setRoute]=useState(()=>parseRoute(window.location.hash));
  useEffect(()=>{document.documentElement.dataset.theme=theme;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#0b1117':'#fdfcf7');try{localStorage.setItem('casahogar_theme',theme)}catch{}},[theme]);
  useEffect(()=>{const sync=()=>{setRoute(parseRoute(window.location.hash));setSearchOpen(false);setModal(null)};window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync)},[]);
  useEffect(()=>{const frame=requestAnimationFrame(()=>{const hash=window.location.hash;if(route.type==='home'&&hash.startsWith('#')&&!hash.startsWith('#/'))document.getElementById(hash.slice(1))?.scrollIntoView();else{window.scrollTo(0,0);if(route.type!=='home')document.querySelector('main h1')?.focus({preventScroll:true})}});return()=>cancelAnimationFrame(frame)},[route]);
  useEffect(()=>{const article=route.type==='article'?articles.find(item=>item.id===route.id):null;document.title=article?`${article.title} — Casa Hogar`:route.type==='blog'?'Blog y noticias — Casa Hogar':route.type==='gallery'?'Galería — Casa Hogar':'Casa Hogar — Vida escolar y comunidad';const description=document.querySelector('meta[name="description"]');if(description)description.content=article?.excerpt||'Casa Hogar: vida escolar, aprendizaje, proyectos y voces de nuestra comunidad educativa.'},[route]);
  const searchResults=useMemo(()=>articles.filter(a=>[a.title,a.category,a.excerpt].join(' ').toLowerCase().includes(search.toLowerCase())),[search]);
  const openArticle=(item)=>{if(item.id==='hero')window.location.hash='#/blog';else if(articles.some(a=>a.id===item.id))window.location.hash=`#/articulo/${encodeURIComponent(item.id)}`;else setModal({type:'article',item})};
  const openVideo=(title)=>setModal({type:'video',item:title}),openEvent=(item)=>setModal({type:'event',item}),openReading=(item)=>setModal({type:'reading',item}),openGallery=(i)=>{window.location.hash=i===undefined?'#/galeria':`#/galeria/${i}`};
  const toggleBookmark=(id)=>setBookmarks(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
  const subscribe=(e)=>{e.preventDefault();setSubMessage('Demostración: correo validado. Conecta tu servicio de suscripción para enviar registros reales.');};
  return <div className="website"><Header route={route} theme={theme} onTheme={()=>setTheme(v=>v==='dark'?'light':'dark')} toggleSearch={setSearchOpen} searchOpen={searchOpen} search={search} setSearch={setSearch} searchResults={searchResults} onArticle={openArticle}/>
    {route.type==='home'&&<><Ticker/><main><Hero onArticle={openArticle} onVideo={openVideo}/><FilterNav selected={filter} onSelect={setFilter}/><div className="editorial-bg"><Featured filter={filter} onBrowse={()=>window.location.hash='#/blog'} onArticle={openArticle} onEvent={openEvent}/><div className="page-shell lower-body"><div className="double-row double-podcast"><Latest onArticle={openArticle} bookmarks={bookmarks} onBookmark={toggleBookmark} onBrowse={()=>window.location.hash='#/blog'}/><Podcasts onVideo={openVideo}/></div><div className="double-row double-gallery"><Campus onArticle={openArticle}/><Gallery onGallery={openGallery}/></div><Readings onReading={openReading}/></div></div></main></>}
    {route.type==='blog'&&<BlogPage/>}
    {route.type==='article'&&<ArticlePage id={route.id}/>}
    {route.type==='gallery'&&<GalleryPage initialIndex={route.index}/>}
    <SchoolFooter theme={theme} onTheme={()=>setTheme(v=>v==='dark'?'light':'dark')} subEmail={subEmail} setSubEmail={setSubEmail} onSubscribe={subscribe} subMessage={subMessage}/><SchoolModal modal={modal} onClose={()=>setModal(null)}/></div>
}
export default App;
