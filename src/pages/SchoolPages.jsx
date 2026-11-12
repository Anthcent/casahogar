import { ArrowLeft, ArrowRight, CalendarDays, CalendarPlus, Clock3, Download, ExternalLink, MapPin, UserRound } from 'lucide-react';
import { canAddToCalendar, downloadIcs, eventDisplay, googleCalendarUrl, isThisWeek, relativeLabel, splitEvents } from '../lib/eventDates.js';
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

function DateBadge({ event, large = false, past = false }) {
  const show = eventDisplay(event);
  return <span className={`event-date-badge ${large ? 'event-date-badge-lg' : ''} ${past ? 'is-past' : ''}`} aria-hidden="true">
    {show.day ? <><strong>{show.day}</strong><small>{show.month}</small></> : <CalendarDays size={large ? 30 : 22} />}
  </span>;
}

function eventWhen(event) {
  const show = eventDisplay(event);
  return [show.day && show.month ? `${show.day} ${show.month}${show.year ? ` ${show.year}` : ''}` : null, show.time].filter(Boolean).join(' · ') || 'Fecha por confirmar';
}

function Countdown({ event }) {
  const label = relativeLabel(event);
  if (!label) return null;
  const tone = label === 'Realizado' ? 'is-past' : label === 'Hoy' || label === 'Mañana' ? 'is-soon' : '';
  return <span className={`event-countdown ${tone}`}>{label}</span>;
}

function AgendaRow({ event, past = false }) {
  const show = eventDisplay(event);
  return <li>
    <a className={`agenda-item ${past ? 'is-past' : ''}`} href={eventHref(event.id)}>
      <DateBadge event={event} past={past} />
      <span className="agenda-item-copy">
        <span className="agenda-item-tags">
          {!past && isThisWeek(event) && <span className="agenda-week">Esta semana</span>}
          <Countdown event={event} />
        </span>
        <strong>{event.title}</strong>
        <small>{[show.time, event.place].filter(Boolean).join(' · ') || 'Detalles por confirmar'}</small>
        {event.description && !past && <span>{event.description}</span>}
      </span>
      <ArrowRight size={18} className="agenda-item-arrow" />
    </a>
  </li>;
}

export function AgendaPage({ id = null }) {
  const { content } = useSiteContent();
  const events = (content.events || []).filter(event => event.id);
  const { upcoming, past } = splitEvents(events);

  if (id === null) {
    return <main className="editorial-page" id="contenido"><div className="page-shell">
      <PageIntro eyebrow="AGENDA ESCOLAR" title="Próximas fechas del liceo" description="Celebraciones, encuentros con familias y actividades de nuestra comunidad educativa." />
      <div className="editorial-section-title"><h2>Próximas actividades</h2><span>{upcoming.length} {upcoming.length === 1 ? 'actividad' : 'actividades'}</span></div>
      {upcoming.length ? <ol className="agenda-list">{upcoming.map(event => <AgendaRow key={event.id} event={event} />)}</ol>
        : <div className="editorial-empty"><h2>Sin actividades próximas</h2><p>Pronto compartiremos las próximas fechas del liceo.</p></div>}
      {past.length > 0 && <details className="agenda-past">
        <summary>Ya realizados <span>{past.length}</span></summary>
        <ol className="agenda-list">{past.map(event => <AgendaRow key={event.id} event={event} past />)}</ol>
      </details>}
    </div></main>;
  }

  const ordered = [...upcoming, ...past];
  const index = ordered.findIndex(event => event.id === id);
  const event = ordered[index];
  if (!event) return <NotFound back="#/agenda" backLabel="Volver a la agenda" eyebrow="AGENDA ESCOLAR" title="No encontramos esta actividad" cta="Ver la agenda" />;

  const body = toParagraphs(event.body);
  const others = upcoming.filter(other => other.id !== event.id).slice(0, 4);
  const isPast = past.includes(event);
  const show = eventDisplay(event);

  return <main className="editorial-page" id="contenido"><div className="page-shell">
    <PageIntro back="#/agenda" backLabel="Volver a la agenda" eyebrow="AGENDA ESCOLAR" title={event.title} description={event.description} />
    <div className="article-layout">
      <article className="article-body">
        <div className={`event-hero-card ${isPast ? 'is-past' : ''}`}>
          <DateBadge event={event} large past={isPast} />
          <div className="event-hero-main">
            <Countdown event={event} />
            <dl className="event-facts">
              <div><dt><CalendarDays size={16} /> Fecha</dt><dd>{eventWhen(event)}</dd></div>
              <div><dt><MapPin size={16} /> Lugar</dt><dd>{event.place || 'Por confirmar'}</dd></div>
              {show.time && <div><dt><Clock3 size={16} /> Hora</dt><dd>{show.time}</dd></div>}
            </dl>
            {!isPast && canAddToCalendar(event) && <div className="event-calendar-actions">
              <a className="editorial-cta" href={googleCalendarUrl(event)} target="_blank" rel="noreferrer"><CalendarPlus size={16} /> Google Calendar</a>
              <button type="button" className="event-ics-btn" onClick={() => downloadIcs(event)}><Download size={16} /> Agregar a mi calendario</button>
            </div>}
            {isPast && <p className="event-past-note">Esta actividad ya se realizó.</p>}
          </div>
        </div>
        <div className="article-prose">
          {body.length > 0 && <p className="article-lead">{body[0]}</p>}
          {body.slice(1).map((paragraph, idx) => <p key={idx}>{paragraph}</p>)}
          <p className="article-note">Los detalles pueden cambiar; confirma por los canales oficiales del liceo.</p>
        </div>
        <Pager items={ordered} index={index} href={eventHref} label="Otras actividades" />
      </article>
      <aside className="article-aside" aria-label="Más actividades"><h2>Próximamente</h2>{others.map(other => <a href={eventHref(other.id)} key={other.id}><span>{eventWhen(other)}</span><strong>{other.title}</strong><ArrowRight size={16} /></a>)}<a className="aside-all" href="#/agenda">Toda la agenda <ArrowRight size={16} /></a></aside>
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
