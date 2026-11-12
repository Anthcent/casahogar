// Date helpers for school events. An event may carry a real `date` (YYYY-MM-DD)
// and optional `startTime` (HH:MM); legacy events only have display text
// (`day`, `month`, `time`) and are treated as undated.

const MONTHS = ['ENE.', 'FEB.', 'MAR.', 'ABR.', 'MAY.', 'JUN.', 'JUL.', 'AGO.', 'SEPT.', 'OCT.', 'NOV.', 'DIC.'];
const DAY_MS = 86400000;
const DEFAULT_DURATION_MIN = 120;
export const SCHOOL_TIMEZONE = 'America/Caracas';

export function eventDate(event) {
  const match = String(event?.date || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
  const date = new Date(year, month, day);
  // Reject overflowed dates such as 2026-13-45, which JS silently rolls over.
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? date : null;
}

function startOfToday(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Whole calendar days from today to the event; negative when it already happened. */
export function daysUntil(event, now = new Date()) {
  const date = eventDate(event);
  return date ? Math.round((date - startOfToday(now)) / DAY_MS) : null;
}

export function formatClock(startTime) {
  const match = String(startTime || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '';
  const hours = Number(match[1]);
  const suffix = hours < 12 ? 'a. m.' : 'p. m.';
  return `${hours % 12 || 12}:${match[2]} ${suffix}`;
}

/** Display fields derived from the real date when present, else the legacy text. */
export function eventDisplay(event) {
  const date = eventDate(event);
  return {
    day: date ? String(date.getDate()).padStart(2, '0') : event?.day || '',
    month: date ? MONTHS[date.getMonth()] : event?.month || '',
    time: formatClock(event?.startTime) || event?.time || '',
    year: date ? date.getFullYear() : null,
  };
}

export function relativeLabel(event, now = new Date()) {
  const days = daysUntil(event, now);
  if (days === null) return '';
  if (days < 0) return 'Realizado';
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  if (days < 7) return `Faltan ${days} días`;
  if (days < 14) return 'La próxima semana';
  return `Faltan ${days} días`;
}

export function isThisWeek(event, now = new Date()) {
  const days = daysUntil(event, now);
  return days !== null && days >= 0 && days < 7;
}

/** Upcoming (soonest first, undated last in original order) and past (latest first). */
export function splitEvents(events, now = new Date()) {
  const upcoming = [];
  const undated = [];
  const past = [];
  (events || []).forEach(event => {
    const days = daysUntil(event, now);
    if (days === null) undated.push(event);
    else if (days < 0) past.push(event);
    else upcoming.push(event);
  });
  upcoming.sort((a, b) => eventDate(a) - eventDate(b) || String(a.startTime || '').localeCompare(String(b.startTime || '')));
  past.sort((a, b) => eventDate(b) - eventDate(a));
  return { upcoming: [...upcoming, ...undated], past };
}

const pad = value => String(value).padStart(2, '0');

function eventRange(event) {
  const date = eventDate(event);
  if (!date) return null;
  const time = String(event.startTime || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!time) {
    const end = new Date(date.getTime() + DAY_MS);
    const day = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    return { allDay: true, start: day(date), end: day(end) };
  }
  const start = new Date(date);
  start.setHours(Number(time[1]), Number(time[2]));
  const end = new Date(start.getTime() + DEFAULT_DURATION_MIN * 60000);
  const stamp = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  return { allDay: false, start: stamp(start), end: stamp(end) };
}

export function canAddToCalendar(event) {
  return eventDate(event) !== null;
}

export function googleCalendarUrl(event) {
  const range = eventRange(event);
  if (!range) return '';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || 'Actividad de Casa Hogar',
    dates: `${range.start}/${range.end}`,
    details: [event.description, 'U.E.C. Casa Hogar Monseñor Carrillo'].filter(Boolean).join('\n\n'),
    location: event.place || '',
    ctz: SCHOOL_TIMEZONE,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

const icsEscape = value => String(value || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

export function downloadIcs(event) {
  const range = eventRange(event);
  if (!range) return;
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;
  const when = range.allDay
    ? [`DTSTART;VALUE=DATE:${range.start}`, `DTEND;VALUE=DATE:${range.end}`]
    : [`DTSTART;TZID=${SCHOOL_TIMEZONE}:${range.start}`, `DTEND;TZID=${SCHOOL_TIMEZONE}:${range.end}`];
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Casa Hogar//Agenda escolar//ES', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id || stamp}@casahogar`,
    `DTSTAMP:${stamp}`,
    ...when,
    `SUMMARY:${icsEscape(event.title)}`,
    event.place ? `LOCATION:${icsEscape(event.place)}` : '',
    event.description ? `DESCRIPTION:${icsEscape(event.description)}` : '',
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean);
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${String(event.title || 'evento').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'evento'}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
