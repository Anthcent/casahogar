import { ArrowLeft, ArrowRight, CalendarDays, Clock3, ExternalLink, MapPin, UserRound } from 'lucide-react';
import { useSiteContent } from '../lib/cmsStore.js';
import { EditorialPhoto, PageIntro, toParagraphs } from './EditorialPages.jsx';

const eventHref = id => `#/agenda/${encodeURIComponent(id)}`;
const readingHref = id => `#/lecturas/${encodeURIComponent(id)}`;

function NotFound({ back, backLabel, eyebrow, title, cta }) {
  return <main className="editorial-page" id="contenido"><div className="page-shell editorial-not-found">
    <PageIntro back={back} backLabel={backLabel} eyebrow={eyebrow} title={title} description="Puede que el enlace haya cambiado o que el contenido ya no esté publicado." />
    <a className="editorial-cta" href={back}>{cta} <ArrowRight size={16} /></a>
  </div></main>;
}

function Pager({ items, index, href, label }) {
  if (items.length < 2) return null;
  const prev = items[(index + items.length - 1) % items.length];
  const next = items[(index + 1) % items.length];
  return <nav className="article-pager" aria-label={label}>
    <a href={href(prev.id)}><ArrowLeft size={16} /><span><small>Anterior</small>{prev.title || prev.name}</span></a>
    <a href={href(next.id)}><span><small>Siguiente</small>{next.title || next.name}</span><ArrowRight size={16} /></a>
  </nav>;
}

function DateBadge({ event, large = false }) {
  return <span className={`event-date-badge ${large ? 'event-date-badge-lg' : ''}`} aria-hidden="true">
    {event.day ? <><strong>{event.day}</strong><small>{event.month}</small></> : <CalendarDays size={large ? 30 : 22} />}
  </span>;
}

function eventWhen(event) {
  return [event.day && event.month ? `${event.day} ${event.month}` : null, event.time].filter(Boolean).join(' · ') || 'Fecha por confirmar';
}

export function AgendaPage({ id = null }) {
  const { content } = useSiteContent();
  const events = (content.events || []).filter(event => event.id);

  if (id === null) {
    return <main className="editorial-page" id="contenido"><div className="page-shell">
      <PageIntro eyebrow="AGENDA ESCOLAR" title="Próximas fechas del liceo" description="Celebraciones, encuentros con familias y actividades de nuestra comunidad educativa." />
      <div className="editorial-section-title"><h2>Calendario</h2><span>{events.length} {events.length === 1 ? 'actividad' : 'actividades'}</span></div>
      {events.length ? <ol className="agenda-list">{events.map(event => <li key={event.id}>
        <a className="agenda-item" href={eventHref(event.id)}>
          <DateBadge event={event} />
          <span className="agenda-item-copy">
            <strong>{event.title}</strong>
            <small>{[event.time, event.place].filter(Boolean).join(' · ') || 'Detalles por confirmar'}</small>
            {event.description && <span>{event.description}</span>}
          </span>
          <ArrowRight size={18} className="agenda-item-arrow" />
        </a>
      </li>)}</ol> : <div className="editorial-empty"><h2>Sin actividades publicadas</h2><p>Pronto compartiremos las próximas fechas del liceo.</p></div>}
    </div></main>;
  }

  const index = events.findIndex(event => event.id === id);
  const event = events[index];
  if (!event) return <NotFound back="#/agenda" backLabel="Volver a la agenda" eyebrow="AGENDA ESCOLAR" title="No encontramos esta actividad" cta="Ver la agenda" />;

  const body = toParagraphs(event.body);
  const others = events.filter(other => other.id !== event.id).slice(0, 4);

  return <main className="editorial-page" id="contenido"><div className="page-shell">
    <PageIntro back="#/agenda" backLabel="Volver a la agenda" eyebrow="AGENDA ESCOLAR" title={event.title} description={event.description} />
    <div className="article-layout">
      <article className="article-body">
        <div className="event-hero-card">
          <DateBadge event={event} large />
          <dl className="event-facts">
            <div><dt><CalendarDays size={16} /> Fecha</dt><dd>{eventWhen(event)}</dd></div>
            <div><dt><MapPin size={16} /> Lugar</dt><dd>{event.place || 'Por confirmar'}</dd></div>
            {event.time && <div><dt><Clock3 size={16} /> Hora</dt><dd>{event.time}</dd></div>}
          </dl>
        </div>
        <div className="article-prose">
          {body.length > 0 && <p className="article-lead">{body[0]}</p>}
          {body.slice(1).map((paragraph, idx) => <p key={idx}>{paragraph}</p>)}
          <p className="article-note">Los detalles pueden cambiar; confirma por los canales oficiales del liceo.</p>
        </div>
        <Pager items={events} index={index} href={eventHref} label="Otras actividades" />
      </article>
      <aside className="article-aside" aria-label="Más actividades"><h2>También en agenda</h2>{others.map(other => <a href={eventHref(other.id)} key={other.id}><span>{eventWhen(other)}</span><strong>{other.title}</strong><ArrowRight size={16} /></a>)}<a className="aside-all" href="#/agenda">Toda la agenda <ArrowRight size={16} /></a></aside>
    </div>
  </div></main>;
}

export function ReadingsPage({ id = null }) {
  const { content } = useSiteContent();
  const readings = (content.readings || []).filter(reading => reading.id);

  if (id === null) {
    return <main className="editorial-page" id="contenido"><div className="page-shell">
      <PageIntro eyebrow="LECTURAS" title="Lecturas recomendadas" description="Publicaciones, programas y recuerdos institucionales para estudiantes y familias." />
      <div className="editorial-section-title"><h2>Biblioteca</h2><span>{readings.length} {readings.length === 1 ? 'lectura' : 'lecturas'}</span></div>
      {readings.length ? <div className="reading-shelf">{readings.map(reading => <a key={reading.id} className="reading-shelf-item" href={readingHref(reading.id)}>
        <EditorialPhoto className="reading-book" src={reading.imageUrl} alt={reading.imageAlt || reading.name} />
        <span className="story-category">{reading.category}</span>
        <strong>{reading.name}</strong>
        {reading.author && <small>{reading.author}</small>}
      </a>)}</div> : <div className="editorial-empty"><h2>Sin lecturas publicadas</h2><p>Pronto compartiremos nuevas recomendaciones.</p></div>}
    </div></main>;
  }

  const index = readings.findIndex(reading => reading.id === id);
  const reading = readings[index];
  if (!reading) return <NotFound back="#/lecturas" backLabel="Volver a lecturas" eyebrow="LECTURAS" title="No encontramos esta lectura" cta="Ver todas las lecturas" />;

  const body = toParagraphs(reading.body);
  const others = readings.filter(other => other.id !== reading.id).slice(0, 4);

  return <main className="editorial-page" id="contenido"><div className="page-shell">
    <PageIntro back="#/lecturas" backLabel="Volver a lecturas" eyebrow={reading.category || 'LECTURAS'} title={reading.name} description={reading.synopsis} />
    <div className="article-layout">
      <article className="article-body">
        <div className="reading-detail">
          <EditorialPhoto className="reading-book reading-book-lg" src={reading.imageUrl} alt={reading.imageAlt || reading.name} />
          <div className="reading-detail-meta">
            {reading.author && <p><UserRound size={16} /> {reading.author}</p>}
            {reading.externalUrl && <a className="editorial-cta" href={reading.externalUrl} target="_blank" rel="noreferrer">Consultar lectura <ExternalLink size={16} /></a>}
          </div>
        </div>
        <div className="article-prose">
          {body.length > 0 && <p className="article-lead">{body[0]}</p>}
          {body.slice(1).map((paragraph, idx) => <p key={idx}>{paragraph}</p>)}
          <div className="article-endmark" aria-hidden="true">CH</div>
        </div>
        <Pager items={readings} index={index} href={readingHref} label="Otras lecturas" />
      </article>
      <aside className="article-aside" aria-label="Más lecturas"><h2>Más lecturas</h2>{others.map(other => <a href={readingHref(other.id)} key={other.id}><span>{other.category}</span><strong>{other.name}</strong><ArrowRight size={16} /></a>)}<a className="aside-all" href="#/lecturas">Toda la biblioteca <ArrowRight size={16} /></a></aside>
    </div>
  </div></main>;
}
