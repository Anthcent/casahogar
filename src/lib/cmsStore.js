import { useState, useEffect } from 'react';
import { ASSETS, IMAGE_ALTS, heroSlides, ticker, filters, articles, events, podcasts, campusLinks, readings } from '../data/content.js';
import { articleDetails } from '../data/editorial.js';
import { getSupabase, isSupabaseConfigured } from './supabase.js';

const CMS_CACHE_KEY = 'casahogar_cms_v2';
const LOCAL_SUBSCRIBERS_KEY = 'casahogar_subscribers_v1';
const LOCAL_AUTH_SESSION_KEY = 'casahogar_admin_session';
const LOCAL_AUTH_CREDENTIALS_KEY = 'casahogar_admin_creds';

export { filters };

export function createDefaultSiteContent() {
  return {
    hero: {
      imageUrl: ASSETS.hero,
      handwriting: 'Mentes\npreparadas.\nCorazones\ndispuestos.\nUn mundo\nmejor.',
      videoButtonTitle: 'Voces del liceo',
      videoButtonSub: 'Próximamente',
      videoModalTitle: 'Voces de Casa Hogar',
      videoUrl: '',
      slides: heroSlides.map((s, idx) => ({
        id: `slide-${idx + 1}`,
        eyebrow: s.eyebrow,
        titleText: idx === 0 ? 'Jóvenes\nque iluminan\nel mañana' : s.lines.join('\n'),
        highlight: idx === 0 ? 'iluminan' : (s.highlight || ''),
        description: s.description,
        tag: s.tag,
      })),
    },
    quote: {
      imageUrl: ASSETS.faithImage,
      imageAlt: IMAGE_ALTS.faithImage,
      text: 'Un liceo se construye cada día: con preguntas, encuentros y ganas de aprender.',
      author: 'Casa Hogar · Comunidad educativa',
    },
    ticker: [...ticker],
    articles: articles.map((a) => {
      const detail = articleDetails[a.id] || { intro: a.excerpt, sections: [] };
      return {
        id: a.id,
        category: a.category,
        filter: a.filter,
        title: a.title,
        excerpt: a.excerpt,
        read: a.read || '4 min',
        author: a.author || 'Comunidad educativa',
        type: a.type || 'standard',
        imageUrl: ASSETS[a.image] || a.image || '',
        imageAlt: IMAGE_ALTS[a.image] || a.title,
        caption: 'U.E.C. Casa Hogar Monseñor Carrillo · Trujillo',
        intro: detail.intro || a.excerpt,
        sections: (detail.sections || []).map((sec) => ({
          heading: sec.heading,
          paragraphs: [...(sec.paragraphs || [])],
        })),
      };
    }),
    events: events.map((e, idx) => ({
      id: `event-${idx + 1}`,
      day: e.day,
      month: e.month,
      title: e.title,
      place: e.place,
      time: e.time,
      description: 'La fecha, hora y lugar se comunicarán por los canales oficiales del liceo.',
    })),
    podcastMeta: {
      posterUrl: ASSETS.podcast,
      posterAlt: IMAGE_ALTS.podcast,
      heading: 'VOCES\nDEL LICEO',
      subtitle: 'Historias que merecen\nser escuchadas',
      badge: 'Próximamente',
    },
    podcasts: podcasts.map((p, idx) => ({
      id: `pod-${idx + 1}`,
      title: p.title,
      time: p.time,
      mediaUrl: '',
      description: 'Contenido audiovisual de nuestra comunidad educativa.',
    })),
    campus: {
      imageUrl: ASSETS.campus,
      imageAlt: IMAGE_ALTS.campus,
      handwriting: 'Aquí\ncrecemos\njuntos.',
      ctaText: 'Explorar vida escolar',
      modalTitle: 'Aprender y crecer juntos',
      modalExcerpt: 'Las aulas, los recreos y los proyectos compartidos también cuentan nuestra historia.',
      storyKicker: 'CASA HOGAR',
      storyQuoteHighlight: 'Cada',
      storyQuoteRest: 'día cuenta\nuna historia',
      storyImageUrl: ASSETS.storyFaith,
      storyImageAlt: IMAGE_ALTS.storyFaith,
      links: campusLinks.map((c, idx) => ({
        id: `campus-${idx + 1}`,
        title: c.title,
        date: c.date,
        imageUrl: ASSETS[c.image] || c.image || '',
        imageAlt: IMAGE_ALTS[c.image] || c.title,
        excerpt: 'Una mirada a las experiencias de nuestra comunidad educativa.',
      })),
    },
    gallery: ['gallery1', 'gallery2', 'gallery3', 'gallery4', 'gallery5'].map((key, idx) => ({
      id: `gal-${idx + 1}`,
      imageUrl: ASSETS[key],
      alt: IMAGE_ALTS[key] || `Fotografía ${idx + 1}`,
      caption: 'U.E.C. Casa Hogar Monseñor Carrillo',
    })),
    readings: readings.map((r, idx) => ({
      id: `read-${idx + 1}`,
      category: r.category,
      name: r.name,
      author: r.author,
      imageUrl: ASSETS[r.image] || r.image || '',
      imageAlt: IMAGE_ALTS[r.image] || r.name,
      synopsis: 'Publicaciones y recuerdos institucionales de Casa Hogar.',
      externalUrl: '',
    })),
    footer: {
      instagramUrl: 'https://instagram.com',
      youtubeUrl: 'https://youtube.com',
      facebookUrl: 'https://www.facebook.com/p/UE-Casa-Hogar-Monse%C3%B1or-Carrillo-100064379967262/',
      subscribeHeading: 'Mantente al día',
      subscribeText: 'Recibe historias y novedades de nuestra comunidad educativa.',
      copyright: '© U.E.C. Casa Hogar Monseñor Carrillo.',
      motto: 'Paz y Bien · Educación · Valores Franciscanos',
    },
  };
}

export function normalizeSiteContent(raw) {
  const base = createDefaultSiteContent();
  if (!raw || typeof raw !== 'object') return base;
  return {
    hero: {
      ...base.hero,
      ...(raw.hero || {}),
      slides: Array.isArray(raw.hero?.slides) && raw.hero.slides.length ? raw.hero.slides : base.hero.slides,
    },
    quote: { ...base.quote, ...(raw.quote || {}) },
    ticker: Array.isArray(raw.ticker) && raw.ticker.length ? raw.ticker : base.ticker,
    articles: Array.isArray(raw.articles) && raw.articles.length ? raw.articles : base.articles,
    events: Array.isArray(raw.events) ? raw.events : base.events,
    podcastMeta: { ...base.podcastMeta, ...(raw.podcastMeta || {}) },
    podcasts: Array.isArray(raw.podcasts) ? raw.podcasts : base.podcasts,
    campus: {
      ...base.campus,
      ...(raw.campus || {}),
      links: Array.isArray(raw.campus?.links) ? raw.campus.links : base.campus.links,
    },
    gallery: Array.isArray(raw.gallery) && raw.gallery.length ? raw.gallery : base.gallery,
    readings: Array.isArray(raw.readings) ? raw.readings : base.readings,
    footer: { ...base.footer, ...(raw.footer || {}) },
  };
}

export function resolveAssetUrl(value) {
  if (!value) return '';
  if (ASSETS[value]) return ASSETS[value];
  return String(value);
}

function readCachedContent() {
  try {
    const raw = localStorage.getItem(CMS_CACHE_KEY);
    if (!raw) return createDefaultSiteContent();
    return normalizeSiteContent(JSON.parse(raw));
  } catch {
    return createDefaultSiteContent();
  }
}

function writeCachedContent(content) {
  try {
    localStorage.setItem(CMS_CACHE_KEY, JSON.stringify(content));
  } catch {
    // Ignore quota errors
  }
}

let storeState = {
  content: readCachedContent(),
  syncStatus: isSupabaseConfigured() ? 'loading' : 'local',
  lastSyncedAt: null,
  syncError: null,
};

const listeners = new Set();

function emit() {
  for (const fn of listeners) fn(storeState);
}

function updateStore(patch) {
  storeState = { ...storeState, ...patch };
  emit();
}

export async function refreshFromCloud() {
  const supabase = getSupabase();
  if (!supabase) {
    updateStore({ syncStatus: 'local', syncError: null });
    return { ok: false, mode: 'local' };
  }
  updateStore({ syncStatus: 'loading', syncError: null });
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('data, updated_at')
      .eq('key', 'main')
      .maybeSingle();

    if (error) {
      updateStore({ syncStatus: 'error', syncError: error.message });
      return { ok: false, error: error.message };
    }

    if (data?.data && Object.keys(data.data).length > 0) {
      const normalized = normalizeSiteContent(data.data);
      writeCachedContent(normalized);
      updateStore({
        content: normalized,
        syncStatus: 'cloud',
        lastSyncedAt: data.updated_at || new Date().toISOString(),
        syncError: null,
      });
      return { ok: true, mode: 'cloud', hasData: true };
    }

    updateStore({ syncStatus: 'cloud-empty', syncError: null });
    return { ok: true, mode: 'cloud', hasData: false };
  } catch (err) {
    const msg = err?.message || 'Error de red al consultar Supabase.';
    updateStore({ syncStatus: 'error', syncError: msg });
    return { ok: false, error: msg };
  }
}

let initialFetchTriggered = false;

export function useSiteContent() {
  const [snap, setSnap] = useState(storeState);

  useEffect(() => {
    listeners.add(setSnap);
    if (!initialFetchTriggered) {
      initialFetchTriggered = true;
      if (isSupabaseConfigured()) {
        refreshFromCloud();
      }
    }
    return () => listeners.delete(setSnap);
  }, []);

  return snap;
}

export async function saveSiteContent(nextRawContent) {
  const normalized = normalizeSiteContent(nextRawContent);
  writeCachedContent(normalized);
  updateStore({ content: normalized, syncError: null });

  const supabase = getSupabase();
  if (!supabase) {
    updateStore({ syncStatus: 'local', lastSyncedAt: new Date().toISOString() });
    return { ok: true, mode: 'local' };
  }

  updateStore({ syncStatus: 'saving' });
  try {
    const { data: userRes } = await supabase.auth.getUser();
    const payload = {
      key: 'main',
      data: normalized,
      updated_at: new Date().toISOString(),
      updated_by: userRes?.user?.id || null,
    };
    const { error } = await supabase.from('site_content').upsert(payload, { onConflict: 'key' });
    if (error) {
      updateStore({ syncStatus: 'error', syncError: error.message });
      return { ok: false, mode: 'cloud', error: error.message };
    }
    updateStore({
      syncStatus: 'cloud',
      lastSyncedAt: payload.updated_at,
      syncError: null,
    });
    return { ok: true, mode: 'cloud' };
  } catch (err) {
    const msg = err?.message || 'No se pudo guardar en Supabase.';
    updateStore({ syncStatus: 'error', syncError: msg });
    return { ok: false, mode: 'cloud', error: msg };
  }
}

export async function resetToFactoryContent() {
  const defaults = createDefaultSiteContent();
  return saveSiteContent(defaults);
}

// Suscriptores del boletín ("Mantente al día")
function readLocalSubscribers() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SUBSCRIBERS_KEY) || '[]');
  } catch {
    return [];
  }
}

export async function subscribeNewsletter(email) {
  const clean = String(email || '').trim().toLowerCase();
  if (!clean || !clean.includes('@')) {
    return { ok: false, message: 'Ingresa un correo electrónico válido.' };
  }
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('newsletter_subscribers').insert({ email: clean });
    if (error) {
      if (error.code === '23505') {
        return { ok: true, message: 'Este correo ya está registrado en nuestro boletín.' };
      }
      return { ok: false, message: 'No se pudo registrar el correo en la nube. Intenta más tarde.' };
    }
    return { ok: true, message: '¡Gracias por suscribirte! Recibirás novedades de Casa Hogar.' };
  }

  const list = readLocalSubscribers();
  if (!list.some((item) => item.email === clean)) {
    const next = [{ id: `sub-${Date.now()}`, email: clean, created_at: new Date().toISOString() }, ...list];
    try {
      localStorage.setItem(LOCAL_SUBSCRIBERS_KEY, JSON.stringify(next));
    } catch {
      // Ignore
    }
  }
  return { ok: true, message: 'Correo registrado. Puedes consultarlo en el apartado de administración.' };
}

export async function fetchSubscribers() {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, created_at')
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) {
      return { items: data, mode: 'cloud' };
    }
    return { items: readLocalSubscribers(), mode: 'local', error: error?.message };
  }
  return { items: readLocalSubscribers(), mode: 'local' };
}

export async function removeSubscriber(id) {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
    if (!error) return { ok: true };
  }
  const next = readLocalSubscribers().filter((item) => item.id !== id);
  try {
    localStorage.setItem(LOCAL_SUBSCRIBERS_KEY, JSON.stringify(next));
  } catch {
    // Ignore
  }
  return { ok: true };
}

// Autenticación de administrador (Supabase Auth en la nube + respaldo local mientras se configura)
function getLocalCreds() {
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_CREDENTIALS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.email && parsed?.password) return parsed;
    }
  } catch {
    // Ignore
  }
  return { email: 'admin@casahogar.edu', password: 'casahogar2026' };
}

export function useAdminAuth() {
  const [authState, setAuthState] = useState({
    loading: true,
    user: null,
    mode: isSupabaseConfigured() ? 'cloud' : 'local',
  });

  const syncAuth = async () => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        setAuthState({
          loading: false,
          user: data?.session?.user || null,
          mode: 'cloud',
        });
      } catch {
        setAuthState({ loading: false, user: null, mode: 'cloud' });
      }
      return;
    }
    try {
      const raw = sessionStorage.getItem(LOCAL_AUTH_SESSION_KEY) || localStorage.getItem(LOCAL_AUTH_SESSION_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      setAuthState({ loading: false, user: parsed, mode: 'local' });
    } catch {
      setAuthState({ loading: false, user: null, mode: 'local' });
    }
  };

  useEffect(() => {
    syncAuth();
    const supabase = getSupabase();
    if (supabase) {
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setAuthState({ loading: false, user: session?.user || null, mode: 'cloud' });
      });
      return () => sub?.subscription?.unsubscribe();
    }
  }, []);

  return { ...authState, refreshAuth: syncAuth };
}

export async function signInAdmin(email, password) {
  const cleanEmail = String(email || '').trim();
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (error) {
      return { ok: false, error: 'Credenciales inválidas o usuario no registrado en Supabase Auth.' };
    }
    return { ok: true, user: data.user, mode: 'cloud' };
  }

  const creds = getLocalCreds();
  if (
    (cleanEmail.toLowerCase() === creds.email.toLowerCase() || cleanEmail.toLowerCase() === 'admin') &&
    password === creds.password
  ) {
    const sessionUser = { email: creds.email, role: 'local-admin' };
    try {
      sessionStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify(sessionUser));
    } catch {
      // Ignore
    }
    return { ok: true, user: sessionUser, mode: 'local' };
  }
  return { ok: false, error: 'Usuario o contraseña incorrectos.' };
}

export async function signOutAdmin() {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
  try {
    sessionStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
    localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
  } catch {
    // Ignore
  }
}

export async function updateAdminCredentials({ email, newPassword }) {
  const supabase = getSupabase();
  if (supabase) {
    const payload = {};
    if (newPassword) payload.password = newPassword;
    if (email) payload.email = email;
    const { error } = await supabase.auth.updateUser(payload);
    if (error) return { ok: false, error: error.message };
    return { ok: true, mode: 'cloud' };
  }

  const current = getLocalCreds();
  const updated = {
    email: String(email || current.email).trim() || current.email,
    password: String(newPassword || current.password),
  };
  try {
    localStorage.setItem(LOCAL_AUTH_CREDENTIALS_KEY, JSON.stringify(updated));
  } catch {
    return { ok: false, error: 'No se pudo actualizar la credencial local.' };
  }
  return { ok: true, mode: 'local' };
}

