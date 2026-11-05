import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, ArrowUp, ArrowDown, Plus, Trash2, Save, LogOut, Upload,
  Cloud, Newspaper, Sparkles, CalendarDays, Headphones,
  School, Camera, BookOpen, Share2, Database, RotateCcw, Download,
  Check, Lock, Copy, ExternalLink
} from 'lucide-react';
import {
  useSiteContent, saveSiteContent, refreshFromCloud, resetToFactoryContent,
  useAdminAuth, signInAdmin, signOutAdmin, updateAdminCredentials,
  fetchSubscribers, removeSubscriber, filters, resolveAssetUrl
} from '../lib/cmsStore.js';
import {
  getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig,
  isSupabaseConfigured, uploadMediaFile
} from '../lib/supabase.js';

const SCHEMA_SQL_SNIPPET = `-- Ejecuta este script en el SQL Editor de tu proyecto Supabase
create table if not exists public.site_content (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.site_content enable row level security;
drop policy if exists "Lectura publica de contenido" on public.site_content;
create policy "Lectura publica de contenido" on public.site_content for select to anon, authenticated using (true);
drop policy if exists "Administradores pueden insertar contenido" on public.site_content;
create policy "Administradores pueden insertar contenido" on public.site_content for insert to authenticated with check (true);
drop policy if exists "Administradores pueden actualizar contenido" on public.site_content;
create policy "Administradores pueden actualizar contenido" on public.site_content for update to authenticated using (true) with check (true);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
drop policy if exists "Visitantes pueden suscribirse al boletin" on public.newsletter_subscribers;
create policy "Visitantes pueden suscribirse al boletin" on public.newsletter_subscribers for insert to anon, authenticated with check (position('@' in email) > 1);
drop policy if exists "Administradores pueden ver suscriptores" on public.newsletter_subscribers;
create policy "Administradores pueden ver suscriptores" on public.newsletter_subscribers for select to authenticated using (true);
drop policy if exists "Administradores pueden eliminar suscriptores" on public.newsletter_subscribers;
create policy "Administradores pueden eliminar suscriptores" on public.newsletter_subscribers for delete to authenticated using (true);

insert into storage.buckets (id, name, public) values ('casahogar-media', 'casahogar-media', true) on conflict (id) do update set public = true;
drop policy if exists "Lectura publica de imagenes Casa Hogar" on storage.objects;
create policy "Lectura publica de imagenes Casa Hogar" on storage.objects for select to anon, authenticated using (bucket_id = 'casahogar-media');
drop policy if exists "Administradores pueden subir imagenes Casa Hogar" on storage.objects;
create policy "Administradores pueden subir imagenes Casa Hogar" on storage.objects for insert to authenticated with check (bucket_id = 'casahogar-media');`;

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `historia-${Date.now()}`;
}

function moveItem(list, index, direction) {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(index, 1);
  copy.splice(target, 0, item);
  return copy;
}

function ImageField({ label, value, onChange, folder = 'general', hint }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const preview = resolveAssetUrl(value);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const res = await uploadMediaFile(file, folder);
      onChange(res.url);
    } catch (err) {
      setError(err?.message || 'Error al procesar imagen.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="admin-field">
      <label>{label}</label>
      <div className="admin-image-picker">
        <div className="admin-image-thumb">
          {preview ? (
            <img src={preview} alt={label} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <span>Sin imagen</span>
          )}
        </div>
        <div>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... o /assets/imagen.webp"
          />
          <div className="admin-upload-row">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFile}
            />
            <button
              type="button"
              className="admin-btn admin-btn-sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={13} />
              {uploading ? 'Subiendo...' : isSupabaseConfigured() ? 'Subir a la nube' : 'Subir desde equipo'}
            </button>
            {hint && <span className="admin-hint">{hint}</span>}
          </div>
          {error && <p className="admin-hint" style={{ color: '#f87171', marginTop: 4 }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

function AdminLoginScreen({ authMode, onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = await signInAdmin(email, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onLoggedIn();
  };

  return (
    <main className="admin-page">
      <div className="page-shell">
        <div className="admin-login-wrap">
          <a href="#inicio" className="admin-back-link">
            <ArrowLeft size={14} /> Volver a Casa Hogar
          </a>
          <div className="admin-login-head">
            <span className="admin-kicker"><Lock size={12} /> Administración</span>
            <h1>Panel editorial</h1>
            <p>Gestiona noticias, portada, cintillo, agenda, galería, podcasts y lecturas de Casa Hogar.</p>
          </div>

          {error && <div className="admin-alert admin-alert-error" style={{ marginBottom: 14 }}>{error}</div>}

          <form onSubmit={handleSubmit} className="admin-form-stack">
            <div className="admin-field">
              <label htmlFor="admin-email">Correo o usuario</label>
              <input
                id="admin-email"
                type="text"
                required
                autoComplete="username"
                placeholder={authMode === 'cloud' ? 'correo@liceo.edu' : 'admin@casahogar.edu'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="admin-pass">Contraseña</label>
              <input
                id="admin-pass"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
              {busy ? 'Verificando...' : 'Entrar al panel'}
            </button>
          </form>

          {authMode === 'local' && (
            <div className="admin-local-hint">
              <strong>Vista previa sin nube conectada:</strong> accede con <code>admin@casahogar.edu</code> y contraseña <code>casahogar2026</code> (puedes cambiarla dentro del panel o conectar Supabase).
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export function AdminPage() {
  const { content, syncStatus, syncError } = useSiteContent();
  const { loading, user, mode: authMode, refreshAuth } = useAdminAuth();

  const [activeTab, setActiveTab] = useState('articles');
  const [draft, setDraft] = useState(() => structuredClone(content));
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  // Estado específico de pestaña Artículos
  const [selectedArticleIdx, setSelectedArticleIdx] = useState(0);
  const [articleFilter, setArticleFilter] = useState('');

  // Estado específico de pestaña Boletín y Nube
  const [subscribers, setSubscribers] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const initialCfg = getSupabaseConfig();
  const [sbUrl, setSbUrl] = useState(initialCfg.url);
  const [sbKey, setSbKey] = useState(initialCfg.anonKey);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [sqlCopied, setSqlCopied] = useState(false);
  const importInputRef = useRef(null);

  useEffect(() => {
    if (!isDirty) {
      setDraft(structuredClone(content));
    }
  }, [content, isDirty]);

  useEffect(() => {
    if (activeTab === 'footer' && user) {
      setSubsLoading(true);
      fetchSubscribers().then((res) => {
        setSubscribers(res.items || []);
        setSubsLoading(false);
      });
    }
  }, [activeTab, user]);

  const updateDraft = (updater) => {
    setDraft((prev) => {
      const next = typeof updater === 'function' ? updater(structuredClone(prev)) : updater;
      return next;
    });
    setIsDirty(true);
    setNotice(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setNotice(null);
    const res = await saveSiteContent(draft);
    setSaving(false);
    if (res.ok) {
      setIsDirty(false);
      setNotice({
        type: 'ok',
        text: res.mode === 'cloud'
          ? 'Cambios publicados en Supabase y actualizados en todo el sitio.'
          : 'Cambios guardados en este navegador. Conecta Supabase en la pestaña «Nube» para publicarlos en línea.',
      });
    } else {
      setNotice({
        type: 'error',
        text: `Guardado en caché local, pero ocurrió un error en Supabase: ${res.error}`,
      });
    }
  };

  useEffect(() => {
    if (!user) return;
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (loading) {
    return (
      <main className="admin-page">
        <div className="page-shell"><p className="admin-hint">Cargando apartado de administración...</p></div>
      </main>
    );
  }

  if (!user) {
    return <AdminLoginScreen authMode={authMode} onLoggedIn={refreshAuth} />;
  }

  const tabs = [
    { id: 'articles', label: 'Noticias y Blog', icon: Newspaper, count: draft.articles.length },
    { id: 'hero', label: 'Portada y Cita', icon: Sparkles, count: draft.hero.slides.length },
    { id: 'ticker', label: 'Cintillo superior', icon: Share2, count: draft.ticker.length },
    { id: 'events', label: 'Agenda escolar', icon: CalendarDays, count: draft.events.length },
    { id: 'podcasts', label: 'Voces y Podcasts', icon: Headphones, count: draft.podcasts.length },
    { id: 'campus', label: 'Vida escolar', icon: School, count: draft.campus.links.length },
    { id: 'gallery', label: 'Galería', icon: Camera, count: draft.gallery.length },
    { id: 'readings', label: 'Lecturas', icon: BookOpen, count: draft.readings.length },
    { id: 'footer', label: 'Redes y Boletín', icon: Share2 },
    { id: 'cloud', label: 'Nube (Supabase)', icon: Database },
  ];

  const safeArticleIdx = Math.min(selectedArticleIdx, Math.max(0, draft.articles.length - 1));
  const currentArticle = draft.articles[safeArticleIdx];
  const topicOptions = filters.filter((f) => f.id !== 'all');

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `casahogar-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        updateDraft(parsed);
        setNotice({ type: 'ok', text: 'Respaldo cargado en el editor. Pulsa «Guardar y publicar» para aplicarlo.' });
      } catch {
        setNotice({ type: 'error', text: 'El archivo JSON no tiene un formato válido.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <main className="admin-page" id="contenido-admin">
      <div className="page-shell">
        <div className="admin-topbar">
          <div className="admin-header-title">
            <a href="#inicio" className="admin-back-link">
              <ArrowLeft size={14} /> Ver sitio público
            </a>
            <h1>Administración de Casa Hogar</h1>
          </div>

          <div className="admin-actions-bar">
            {isDirty && <span className="admin-mode-pill is-dirty">Cambios sin guardar</span>}
            {isDirty && (
              <button
                type="button"
                className="admin-btn"
                onClick={() => {
                  setDraft(structuredClone(content));
                  setIsDirty(false);
                  setNotice(null);
                }}
              >
                <RotateCcw size={14} /> Descartar
              </button>
            )}
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              disabled={saving}
              onClick={handleSave}
            >
              <Save size={14} /> {saving ? 'Guardando...' : 'Guardar y publicar'}
            </button>
            <button
              type="button"
              className="admin-btn"
              onClick={async () => {
                await signOutAdmin();
                refreshAuth();
              }}
              title="Cerrar sesión de administrador"
            >
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>

        {notice && (
          <div className={`admin-alert ${notice.type === 'error' ? 'admin-alert-error' : 'admin-alert-ok'}`} style={{ marginBottom: 18 }}>
            {notice.text}
          </div>
        )}
        {syncError && !notice && (
          <div className="admin-alert admin-alert-error" style={{ marginBottom: 18 }}>
            Aviso de sincronización con Supabase: {syncError}
          </div>
        )}

        <div className="admin-workspace">
          <nav className="admin-sidebar" aria-label="Secciones de administración">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`admin-tab-btn ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  <span><Icon size={15} /> {t.label}</span>
                  {t.count !== undefined && <span className="admin-count">{t.count}</span>}
                </button>
              );
            })}
          </nav>

          <div>
            {/* 1. NOTICIAS Y BLOG */}
            {activeTab === 'articles' && (
              <div className="admin-panel-card">
                <div className="admin-card-head">
                  <div>
                    <h2>Noticias y artículos del blog</h2>
                    <p>El artículo #1 es la historia principal de portada; #2 y #3 van a un costado; del #4 en adelante aparecen en «En el liceo» y todos se publican en el Blog.</p>
                  </div>
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary admin-btn-sm"
                    onClick={() => {
                      const newArt = {
                        id: `nueva-historia-${draft.articles.length + 1}`,
                        category: 'VIDA ESCOLAR',
                        filter: 'campus',
                        title: 'Nueva historia de Casa Hogar',
                        excerpt: 'Resumen breve de la noticia o actividad escolar.',
                        read: '3 min',
                        author: 'Comunidad educativa',
                        type: 'standard',
                        imageUrl: '',
                        imageAlt: 'Fotografía de la publicación',
                        caption: 'Fotografía de nuestra comunidad educativa.',
                        intro: 'Escribe aquí el párrafo de entrada del artículo.',
                        sections: [
                          { heading: 'Desarrollo de la actividad', paragraphs: ['Primer párrafo del contenido completo.'] },
                        ],
                      };
                      updateDraft((d) => {
                        d.articles.unshift(newArt);
                        return d;
                      });
                      setSelectedArticleIdx(0);
                    }}
                  >
                    <Plus size={14} /> Nueva publicación
                  </button>
                </div>

                <div className="admin-articles-split">
                  <div className="admin-article-list">
                    <div className="admin-field" style={{ marginBottom: 4 }}>
                      <input
                        type="search"
                        placeholder="Filtrar lista..."
                        value={articleFilter}
                        onChange={(e) => setArticleFilter(e.target.value)}
                      />
                    </div>
                    {draft.articles.map((art, idx) => {
                      if (articleFilter.trim() && !`${art.title} ${art.category}`.toLowerCase().includes(articleFilter.toLowerCase())) {
                        return null;
                      }
                      const slotLabel = idx === 0 ? '★ Principal portada' : idx < 3 ? `Destacada #${idx + 1}` : `Publicación #${idx + 1}`;
                      return (
                        <div
                          key={`${art.id}-${idx}`}
                          className={`admin-article-item ${safeArticleIdx === idx ? 'selected' : ''}`}
                          onClick={() => setSelectedArticleIdx(idx)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && setSelectedArticleIdx(idx)}
                        >
                          <div className="admin-article-meta">
                            <span>{slotLabel}</span>
                            <span className="admin-row-actions" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="admin-btn admin-btn-sm"
                                title="Subir posición"
                                disabled={idx === 0}
                                onClick={() => {
                                  updateDraft((d) => { d.articles = moveItem(d.articles, idx, -1); return d; });
                                  setSelectedArticleIdx(Math.max(0, idx - 1));
                                }}
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn-sm"
                                title="Bajar posición"
                                disabled={idx === draft.articles.length - 1}
                                onClick={() => {
                                  updateDraft((d) => { d.articles = moveItem(d.articles, idx, 1); return d; });
                                  setSelectedArticleIdx(Math.min(draft.articles.length - 1, idx + 1));
                                }}
                              >
                                <ArrowDown size={12} />
                              </button>
                            </span>
                          </div>
                          <strong>{art.title || 'Sin título'}</strong>
                          <span className="admin-hint">{art.category} · {art.read}</span>
                        </div>
                      );
                    })}
                  </div>

                  {currentArticle && (
                    <div className="admin-item-card" style={{ marginBottom: 0 }}>
                      <div className="admin-item-top">
                        <span className="admin-item-badge">Editando publicación #{safeArticleIdx + 1}</span>
                        <div className="admin-row-actions">
                          <a
                            href={`#/articulo/${encodeURIComponent(currentArticle.id)}`}
                            className="admin-btn admin-btn-sm"
                            title="Abrir vista del artículo"
                          >
                            Ver artículo <ExternalLink size={12} />
                          </a>
                          {draft.articles.length > 1 && (
                            <button
                              type="button"
                              className="admin-btn admin-btn-sm admin-btn-danger"
                              onClick={() => {
                                updateDraft((d) => {
                                  d.articles.splice(safeArticleIdx, 1);
                                  return d;
                                });
                                setSelectedArticleIdx(Math.max(0, safeArticleIdx - 1));
                              }}
                            >
                              <Trash2 size={13} /> Eliminar
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="admin-form-stack">
                        <div className="admin-field">
                          <label>Título del artículo</label>
                          <input
                            type="text"
                            value={currentArticle.title}
                            onChange={(e) => updateDraft((d) => { d.articles[safeArticleIdx].title = e.target.value; return d; })}
                          />
                        </div>

                        <div className="admin-grid-3">
                          <div className="admin-field">
                            <label>Enlace / ID (#/articulo/...)</label>
                            <div style={{ display: 'flex', gap: 5 }}>
                              <input
                                type="text"
                                value={currentArticle.id}
                                onChange={(e) => updateDraft((d) => { d.articles[safeArticleIdx].id = slugify(e.target.value); return d; })}
                              />
                              <button
                                type="button"
                                className="admin-btn admin-btn-sm"
                                title="Generar desde título"
                                onClick={() => updateDraft((d) => { d.articles[safeArticleIdx].id = slugify(currentArticle.title); return d; })}
                              >
                                Auto
                              </button>
                            </div>
                          </div>
                          <div className="admin-field">
                            <label>Etiqueta visible (ej. VIDA ESCOLAR)</label>
                            <input
                              type="text"
                              value={currentArticle.category}
                              onChange={(e) => updateDraft((d) => { d.articles[safeArticleIdx].category = e.target.value.toUpperCase(); return d; })}
                            />
                          </div>
                          <div className="admin-field">
                            <label>Filtro temático</label>
                            <select
                              value={currentArticle.filter}
                              onChange={(e) => updateDraft((d) => { d.articles[safeArticleIdx].filter = e.target.value; return d; })}
                            >
                              {topicOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="admin-grid-2">
                          <div className="admin-field">
                            <label>Autoría</label>
                            <input
                              type="text"
                              value={currentArticle.author || ''}
                              onChange={(e) => updateDraft((d) => { d.articles[safeArticleIdx].author = e.target.value; return d; })}
                            />
                          </div>
                          <div className="admin-field">
                            <label>Tiempo de lectura</label>
                            <input
                              type="text"
                              value={currentArticle.read || ''}
                              onChange={(e) => updateDraft((d) => { d.articles[safeArticleIdx].read = e.target.value; return d; })}
                            />
                          </div>
                        </div>

                        <ImageField
                          label="Fotografía del artículo"
                          value={currentArticle.imageUrl}
                          folder="articulos"
                          onChange={(url) => updateDraft((d) => { d.articles[safeArticleIdx].imageUrl = url; return d; })}
                        />

                        <div className="admin-grid-2">
                          <div className="admin-field">
                            <label>Texto alternativo (accesibilidad)</label>
                            <input
                              type="text"
                              value={currentArticle.imageAlt || ''}
                              onChange={(e) => updateDraft((d) => { d.articles[safeArticleIdx].imageAlt = e.target.value; return d; })}
                            />
                          </div>
                          <div className="admin-field">
                            <label>Pie de foto dentro del artículo</label>
                            <input
                              type="text"
                              value={currentArticle.caption || ''}
                              onChange={(e) => updateDraft((d) => { d.articles[safeArticleIdx].caption = e.target.value; return d; })}
                            />
                          </div>
                        </div>

                        <div className="admin-field">
                          <label>Resumen corto (tarjetas y buscador)</label>
                          <textarea
                            rows={2}
                            value={currentArticle.excerpt || ''}
                            onChange={(e) => updateDraft((d) => { d.articles[safeArticleIdx].excerpt = e.target.value; return d; })}
                          />
                        </div>

                        <div className="admin-field">
                          <label>Párrafo inicial destacado (entrada del artículo)</label>
                          <textarea
                            rows={3}
                            value={currentArticle.intro || ''}
                            onChange={(e) => updateDraft((d) => { d.articles[safeArticleIdx].intro = e.target.value; return d; })}
                          />
                        </div>

                        <div className="admin-field">
                          <div className="admin-item-top" style={{ marginBottom: 6 }}>
                            <label>Secciones del cuerpo del artículo</label>
                            <button
                              type="button"
                              className="admin-btn admin-btn-sm"
                              onClick={() => updateDraft((d) => {
                                d.articles[safeArticleIdx].sections = [
                                  ...(d.articles[safeArticleIdx].sections || []),
                                  { heading: 'Nuevo subtítulo', paragraphs: ['Contenido de la sección.'] },
                                ];
                                return d;
                              })}
                            >
                              <Plus size={12} /> Añadir sección
                            </button>
                          </div>

                          {(currentArticle.sections || []).map((sec, sIdx) => (
                            <div key={sIdx} className="admin-item-card" style={{ background: 'var(--panel)' }}>
                              <div className="admin-item-top">
                                <span className="admin-hint">Sección {sIdx + 1}</span>
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-sm admin-btn-danger"
                                  onClick={() => updateDraft((d) => {
                                    d.articles[safeArticleIdx].sections.splice(sIdx, 1);
                                    return d;
                                  })}
                                >
                                  <Trash2 size={12} /> Quitar
                                </button>
                              </div>
                              <div className="admin-form-stack">
                                <div className="admin-field">
                                  <label>Subtítulo (H2)</label>
                                  <input
                                    type="text"
                                    value={sec.heading}
                                    onChange={(e) => updateDraft((d) => {
                                      d.articles[safeArticleIdx].sections[sIdx].heading = e.target.value;
                                      return d;
                                    })}
                                  />
                                </div>
                                <div className="admin-field">
                                  <label>Párrafos (separa cada párrafo con una línea en blanco)</label>
                                  <textarea
                                    rows={4}
                                    value={(sec.paragraphs || []).join('\n\n')}
                                    onChange={(e) => updateDraft((d) => {
                                      d.articles[safeArticleIdx].sections[sIdx].paragraphs = e.target.value
                                        .split(/\n{2,}/)
                                        .map((p) => p.trim())
                                        .filter(Boolean);
                                      return d;
                                    })}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. PORTADA Y CITA */}
            {activeTab === 'hero' && (
              <>
                <div className="admin-panel-card">
                  <div className="admin-card-head">
                    <div>
                      <h2>Banner principal de portada</h2>
                      <p>Configura la imagen de fondo, el texto manuscrito y el botón audiovisual.</p>
                    </div>
                  </div>
                  <div className="admin-form-stack">
                    <ImageField
                      label="Fotografía principal del banner"
                      value={draft.hero.imageUrl}
                      folder="portada"
                      onChange={(url) => updateDraft((d) => { d.hero.imageUrl = url; return d; })}
                    />
                    <div className="admin-grid-2">
                      <div className="admin-field">
                        <label>Frase manuscrita derecha (usa Enter para saltos de línea)</label>
                        <textarea
                          rows={4}
                          value={draft.hero.handwriting}
                          onChange={(e) => updateDraft((d) => { d.hero.handwriting = e.target.value; return d; })}
                        />
                      </div>
                      <div className="admin-form-stack">
                        <div className="admin-field">
                          <label>Texto botón de video</label>
                          <input
                            type="text"
                            value={draft.hero.videoButtonTitle}
                            onChange={(e) => updateDraft((d) => { d.hero.videoButtonTitle = e.target.value; return d; })}
                          />
                        </div>
                        <div className="admin-field">
                          <label>Subtítulo botón de video (ej. 1:45 min o Próximamente)</label>
                          <input
                            type="text"
                            value={draft.hero.videoButtonSub}
                            onChange={(e) => updateDraft((d) => { d.hero.videoButtonSub = e.target.value; return d; })}
                          />
                        </div>
                        <div className="admin-field">
                          <label>URL de video o audio opcional (MP4 / YouTube)</label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={draft.hero.videoUrl || ''}
                            onChange={(e) => updateDraft((d) => { d.hero.videoUrl = e.target.value; return d; })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-panel-card">
                  <div className="admin-card-head">
                    <div>
                      <h2>Diapositivas del carrusel principal</h2>
                      <p>Los números 01, 02, 03 en la esquina inferior derecha del banner alternan estos titulares.</p>
                    </div>
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm admin-btn-primary"
                      onClick={() => updateDraft((d) => {
                        d.hero.slides.push({
                          id: `slide-${Date.now()}`,
                          eyebrow: 'COMUNIDAD EDUCATIVA',
                          titleText: 'Nuevo titular\nde portada',
                          highlight: '',
                          description: 'Descripción breve para invitar a conocer más sobre el liceo.',
                          tag: 'CASA HOGAR',
                        });
                        return d;
                      })}
                    >
                      <Plus size={13} /> Añadir diapositiva
                    </button>
                  </div>

                  {draft.hero.slides.map((sl, idx) => (
                    <div key={sl.id || idx} className="admin-item-card">
                      <div className="admin-item-top">
                        <span className="admin-item-badge">Diapositiva 0{idx + 1}</span>
                        {draft.hero.slides.length > 1 && (
                          <button
                            type="button"
                            className="admin-btn admin-btn-sm admin-btn-danger"
                            onClick={() => updateDraft((d) => { d.hero.slides.splice(idx, 1); return d; })}
                          >
                            <Trash2 size={13} /> Quitar
                          </button>
                        )}
                      </div>
                      <div className="admin-form-stack">
                        <div className="admin-grid-3">
                          <div className="admin-field">
                            <label>Antetítulo superior</label>
                            <input
                              type="text"
                              value={sl.eyebrow}
                              onChange={(e) => updateDraft((d) => { d.hero.slides[idx].eyebrow = e.target.value; return d; })}
                            />
                          </div>
                          <div className="admin-field">
                            <label>Palabra resaltada en amarillo (opcional)</label>
                            <input
                              type="text"
                              placeholder="ej. iluminan"
                              value={sl.highlight || ''}
                              onChange={(e) => updateDraft((d) => { d.hero.slides[idx].highlight = e.target.value; return d; })}
                            />
                          </div>
                          <div className="admin-field">
                            <label>Categoría asociada</label>
                            <input
                              type="text"
                              value={sl.tag || ''}
                              onChange={(e) => updateDraft((d) => { d.hero.slides[idx].tag = e.target.value; return d; })}
                            />
                          </div>
                        </div>
                        <div className="admin-grid-2">
                          <div className="admin-field">
                            <label>Titular principal (usa Enter para cada renglón)</label>
                            <textarea
                              rows={3}
                              value={sl.titleText}
                              onChange={(e) => updateDraft((d) => { d.hero.slides[idx].titleText = e.target.value; return d; })}
                            />
                          </div>
                          <div className="admin-field">
                            <label>Descripción</label>
                            <textarea
                              rows={3}
                              value={sl.description}
                              onChange={(e) => updateDraft((d) => { d.hero.slides[idx].description = e.target.value; return d; })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="admin-panel-card">
                  <div className="admin-card-head">
                    <div>
                      <h2>Tarjeta de cita inspiradora</h2>
                      <p>Aparece en la columna derecha de Historias destacadas, sobre la Agenda escolar.</p>
                    </div>
                  </div>
                  <div className="admin-form-stack">
                    <ImageField
                      label="Imagen de fondo de la cita"
                      value={draft.quote.imageUrl}
                      folder="portada"
                      onChange={(url) => updateDraft((d) => { d.quote.imageUrl = url; return d; })}
                    />
                    <div className="admin-field">
                      <label>Frase / Cita</label>
                      <textarea
                        rows={2}
                        value={draft.quote.text}
                        onChange={(e) => updateDraft((d) => { d.quote.text = e.target.value; return d; })}
                      />
                    </div>
                    <div className="admin-field">
                      <label>Firma o autoría</label>
                      <input
                        type="text"
                        value={draft.quote.author}
                        onChange={(e) => updateDraft((d) => { d.quote.author = e.target.value; return d; })}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 3. CINTILLO DE TITULARES */}
            {activeTab === 'ticker' && (
              <div className="admin-panel-card">
                <div className="admin-card-head">
                  <div>
                    <h2>Cintillo superior («EN CASA HOGAR»)</h2>
                    <p>Titulares breves que se desplazan horizontalmente bajo el menú principal.</p>
                  </div>
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-primary"
                    onClick={() => updateDraft((d) => {
                      d.ticker.push('Aviso  ·  Escribe aquí un nuevo titular para la comunidad');
                      return d;
                    })}
                  >
                    <Plus size={13} /> Nuevo titular
                  </button>
                </div>

                <div className="admin-form-stack">
                  {draft.ticker.map((line, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="admin-item-badge">#{idx + 1}</span>
                      <div className="admin-field" style={{ flex: 1 }}>
                        <input
                          type="text"
                          value={line}
                          onChange={(e) => updateDraft((d) => { d.ticker[idx] = e.target.value; return d; })}
                        />
                      </div>
                      <button
                        type="button"
                        className="admin-btn admin-btn-sm"
                        disabled={idx === 0}
                        onClick={() => updateDraft((d) => { d.ticker = moveItem(d.ticker, idx, -1); return d; })}
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-sm"
                        disabled={idx === draft.ticker.length - 1}
                        onClick={() => updateDraft((d) => { d.ticker = moveItem(d.ticker, idx, 1); return d; })}
                      >
                        <ArrowDown size={13} />
                      </button>
                      {draft.ticker.length > 1 && (
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-danger"
                          onClick={() => updateDraft((d) => { d.ticker.splice(idx, 1); return d; })}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. AGENDA ESCOLAR */}
            {activeTab === 'events' && (
              <div className="admin-panel-card">
                <div className="admin-card-head">
                  <div>
                    <h2>Agenda escolar</h2>
                    <p>Próximas fechas, reuniones con familias, talleres y actividades del liceo.</p>
                  </div>
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-primary"
                    onClick={() => updateDraft((d) => {
                      d.events.push({
                        id: `evt-${Date.now()}`,
                        day: '15',
                        month: 'NOV.',
                        title: 'Nueva actividad escolar',
                        place: 'Patio central',
                        time: '9:00 a. m.',
                        description: 'Detalles sobre la actividad escolar.',
                      });
                      return d;
                    })}
                  >
                    <Plus size={13} /> Añadir evento
                  </button>
                </div>

                {draft.events.map((ev, idx) => (
                  <div key={ev.id || idx} className="admin-item-card">
                    <div className="admin-item-top">
                      <span className="admin-item-badge">Evento #{idx + 1}</span>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm"
                          disabled={idx === 0}
                          onClick={() => updateDraft((d) => { d.events = moveItem(d.events, idx, -1); return d; })}
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm"
                          disabled={idx === draft.events.length - 1}
                          onClick={() => updateDraft((d) => { d.events = moveItem(d.events, idx, 1); return d; })}
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-danger"
                          onClick={() => updateDraft((d) => { d.events.splice(idx, 1); return d; })}
                        >
                          <Trash2 size={12} /> Quitar
                        </button>
                      </div>
                    </div>
                    <div className="admin-form-stack">
                      <div className="admin-grid-3">
                        <div className="admin-field">
                          <label>Día (ej. 15)</label>
                          <input
                            type="text"
                            value={ev.day}
                            onChange={(e) => updateDraft((d) => { d.events[idx].day = e.target.value; return d; })}
                          />
                        </div>
                        <div className="admin-field">
                          <label>Mes corto (ej. NOV.)</label>
                          <input
                            type="text"
                            value={ev.month}
                            onChange={(e) => updateDraft((d) => { d.events[idx].month = e.target.value; return d; })}
                          />
                        </div>
                        <div className="admin-field">
                          <label>Horario</label>
                          <input
                            type="text"
                            value={ev.time}
                            onChange={(e) => updateDraft((d) => { d.events[idx].time = e.target.value; return d; })}
                          />
                        </div>
                      </div>
                      <div className="admin-grid-2">
                        <div className="admin-field">
                          <label>Nombre del evento</label>
                          <input
                            type="text"
                            value={ev.title}
                            onChange={(e) => updateDraft((d) => { d.events[idx].title = e.target.value; return d; })}
                          />
                        </div>
                        <div className="admin-field">
                          <label>Lugar</label>
                          <input
                            type="text"
                            value={ev.place}
                            onChange={(e) => updateDraft((d) => { d.events[idx].place = e.target.value; return d; })}
                          />
                        </div>
                      </div>
                      <div className="admin-field">
                        <label>Descripción al abrir el evento</label>
                        <textarea
                          rows={2}
                          value={ev.description || ''}
                          onChange={(e) => updateDraft((d) => { d.events[idx].description = e.target.value; return d; })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. VOCES Y PODCASTS */}
            {activeTab === 'podcasts' && (
              <>
                <div className="admin-panel-card">
                  <div className="admin-card-head">
                    <div>
                      <h2>Portada de «Voces del liceo»</h2>
                      <p>Imagen principal y textos de la tarjeta de audio en la portada.</p>
                    </div>
                  </div>
                  <div className="admin-form-stack">
                    <ImageField
                      label="Imagen de fondo de Voces del liceo"
                      value={draft.podcastMeta.posterUrl}
                      folder="podcasts"
                      onChange={(url) => updateDraft((d) => { d.podcastMeta.posterUrl = url; return d; })}
                    />
                    <div className="admin-grid-3">
                      <div className="admin-field">
                        <label>Título del póster</label>
                        <textarea
                          rows={2}
                          value={draft.podcastMeta.heading}
                          onChange={(e) => updateDraft((d) => { d.podcastMeta.heading = e.target.value; return d; })}
                        />
                      </div>
                      <div className="admin-field">
                        <label>Subtítulo</label>
                        <textarea
                          rows={2}
                          value={draft.podcastMeta.subtitle}
                          onChange={(e) => updateDraft((d) => { d.podcastMeta.subtitle = e.target.value; return d; })}
                        />
                      </div>
                      <div className="admin-field">
                        <label>Insignia inferior (ej. Nuevos episodios)</label>
                        <input
                          type="text"
                          value={draft.podcastMeta.badge}
                          onChange={(e) => updateDraft((d) => { d.podcastMeta.badge = e.target.value; return d; })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-panel-card">
                  <div className="admin-card-head">
                    <div>
                      <h2>Episodios y audios</h2>
                      <p>Puedes pegar un enlace directo a un audio MP3, video MP4 o enlace externo.</p>
                    </div>
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm admin-btn-primary"
                      onClick={() => updateDraft((d) => {
                        d.podcasts.push({
                          id: `pod-${Date.now()}`,
                          title: 'Nuevo episodio del liceo',
                          time: '12 min',
                          mediaUrl: '',
                          description: 'Conversación con estudiantes y docentes.',
                        });
                        return d;
                      })}
                    >
                      <Plus size={13} /> Añadir episodio
                    </button>
                  </div>

                  {draft.podcasts.map((pod, idx) => (
                    <div key={pod.id || idx} className="admin-item-card">
                      <div className="admin-item-top">
                        <span className="admin-item-badge">Episodio #{idx + 1}</span>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-danger"
                          onClick={() => updateDraft((d) => { d.podcasts.splice(idx, 1); return d; })}
                        >
                          <Trash2 size={12} /> Quitar
                        </button>
                      </div>
                      <div className="admin-form-stack">
                        <div className="admin-grid-3">
                          <div className="admin-field">
                            <label>Título del episodio</label>
                            <input
                              type="text"
                              value={pod.title}
                              onChange={(e) => updateDraft((d) => { d.podcasts[idx].title = e.target.value; return d; })}
                            />
                          </div>
                          <div className="admin-field">
                            <label>Duración o estado</label>
                            <input
                              type="text"
                              value={pod.time}
                              onChange={(e) => updateDraft((d) => { d.podcasts[idx].time = e.target.value; return d; })}
                            />
                          </div>
                          <div className="admin-field">
                            <label>URL de audio/video (MP3, MP4 o enlace)</label>
                            <input
                              type="text"
                              placeholder="https://..."
                              value={pod.mediaUrl || ''}
                              onChange={(e) => updateDraft((d) => { d.podcasts[idx].mediaUrl = e.target.value; return d; })}
                            />
                          </div>
                        </div>
                        <div className="admin-field">
                          <label>Descripción del episodio</label>
                          <input
                            type="text"
                            value={pod.description || ''}
                            onChange={(e) => updateDraft((d) => { d.podcasts[idx].description = e.target.value; return d; })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 6. VIDA ESCOLAR */}
            {activeTab === 'campus' && (
              <>
                <div className="admin-panel-card">
                  <div className="admin-card-head">
                    <div>
                      <h2>Sección «Vida escolar» y tarjeta editorial</h2>
                      <p>Personaliza la tarjeta principal de Vida escolar y el recuadro espiritual junto a la galería.</p>
                    </div>
                  </div>
                  <div className="admin-form-stack">
                    <ImageField
                      label="Fotografía principal de Vida escolar"
                      value={draft.campus.imageUrl}
                      folder="campus"
                      onChange={(url) => updateDraft((d) => { d.campus.imageUrl = url; return d; })}
                    />
                    <div className="admin-grid-3">
                      <div className="admin-field">
                        <label>Texto manuscrito sobre la foto</label>
                        <textarea
                          rows={3}
                          value={draft.campus.handwriting}
                          onChange={(e) => updateDraft((d) => { d.campus.handwriting = e.target.value; return d; })}
                        />
                      </div>
                      <div className="admin-field">
                        <label>Texto del botón</label>
                        <input
                          type="text"
                          value={draft.campus.ctaText}
                          onChange={(e) => updateDraft((d) => { d.campus.ctaText = e.target.value; return d; })}
                        />
                      </div>
                      <div className="admin-field">
                        <label>Descripción al hacer clic</label>
                        <textarea
                          rows={3}
                          value={draft.campus.modalExcerpt}
                          onChange={(e) => updateDraft((d) => { d.campus.modalExcerpt = e.target.value; return d; })}
                        />
                      </div>
                    </div>

                    <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '8px 0' }} />

                    <ImageField
                      label="Imagen vertical junto a Galería"
                      value={draft.campus.storyImageUrl}
                      folder="campus"
                      onChange={(url) => updateDraft((d) => { d.campus.storyImageUrl = url; return d; })}
                    />
                    <div className="admin-grid-3">
                      <div className="admin-field">
                        <label>Encabezado superior</label>
                        <input
                          type="text"
                          value={draft.campus.storyKicker}
                          onChange={(e) => updateDraft((d) => { d.campus.storyKicker = e.target.value; return d; })}
                        />
                      </div>
                      <div className="admin-field">
                        <label>Primera palabra resaltada</label>
                        <input
                          type="text"
                          value={draft.campus.storyQuoteHighlight}
                          onChange={(e) => updateDraft((d) => { d.campus.storyQuoteHighlight = e.target.value; return d; })}
                        />
                      </div>
                      <div className="admin-field">
                        <label>Continuación de la frase</label>
                        <textarea
                          rows={2}
                          value={draft.campus.storyQuoteRest}
                          onChange={(e) => updateDraft((d) => { d.campus.storyQuoteRest = e.target.value; return d; })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-panel-card">
                  <div className="admin-card-head">
                    <div>
                      <h2> Tarjetas laterales de Vida escolar</h2>
                      <p>Enlaces rápidos con miniatura que acompañan la sección.</p>
                    </div>
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm admin-btn-primary"
                      onClick={() => updateDraft((d) => {
                        d.campus.links.push({
                          id: `camp-${Date.now()}`,
                          title: 'Nueva experiencia escolar',
                          date: 'Vida escolar',
                          imageUrl: '',
                          imageAlt: 'Actividad escolar',
                          excerpt: 'Descripción de la actividad.',
                        });
                        return d;
                      })}
                    >
                      <Plus size={13} /> Añadir elemento
                    </button>
                  </div>
                  {draft.campus.links.map((item, idx) => (
                    <div key={item.id || idx} className="admin-item-card">
                      <div className="admin-item-top">
                        <span className="admin-item-badge">Elemento #{idx + 1}</span>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-danger"
                          onClick={() => updateDraft((d) => { d.campus.links.splice(idx, 1); return d; })}
                        >
                          <Trash2 size={12} /> Quitar
                        </button>
                      </div>
                      <div className="admin-form-stack">
                        <div className="admin-grid-2">
                          <div className="admin-field">
                            <label>Título</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateDraft((d) => { d.campus.links[idx].title = e.target.value; return d; })}
                            />
                          </div>
                          <div className="admin-field">
                            <label>Etiqueta o área</label>
                            <input
                              type="text"
                              value={item.date}
                              onChange={(e) => updateDraft((d) => { d.campus.links[idx].date = e.target.value; return d; })}
                            />
                          </div>
                        </div>
                        <ImageField
                          label="Miniatura"
                          value={item.imageUrl}
                          folder="campus"
                          onChange={(url) => updateDraft((d) => { d.campus.links[idx].imageUrl = url; return d; })}
                        />
                        <div className="admin-field">
                          <label>Texto descriptivo al abrir</label>
                          <textarea
                            rows={2}
                            value={item.excerpt || ''}
                            onChange={(e) => updateDraft((d) => { d.campus.links[idx].excerpt = e.target.value; return d; })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 7. GALERÍA */}
            {activeTab === 'gallery' && (
              <div className="admin-panel-card">
                <div className="admin-card-head">
                  <div>
                    <h2>Galería fotográfica</h2>
                    <p>Las primeras 4 imágenes alimentan el mosaico de portada y todas se exhiben en la página #/galeria.</p>
                  </div>
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-primary"
                    onClick={() => updateDraft((d) => {
                      d.gallery.push({
                        id: `gal-${Date.now()}`,
                        imageUrl: '',
                        alt: 'Fotografía de Casa Hogar',
                        caption: 'Actividad en Casa Hogar',
                      });
                      return d;
                    })}
                  >
                    <Plus size={13} /> Añadir fotografía
                  </button>
                </div>

                {draft.gallery.map((photo, idx) => (
                  <div key={photo.id || idx} className="admin-item-card">
                    <div className="admin-item-top">
                      <span className="admin-item-badge">Fotografía #{idx + 1} {idx < 4 ? '· Visible en portada' : ''}</span>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm"
                          disabled={idx === 0}
                          onClick={() => updateDraft((d) => { d.gallery = moveItem(d.gallery, idx, -1); return d; })}
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm"
                          disabled={idx === draft.gallery.length - 1}
                          onClick={() => updateDraft((d) => { d.gallery = moveItem(d.gallery, idx, 1); return d; })}
                        >
                          <ArrowDown size={12} />
                        </button>
                        {draft.gallery.length > 1 && (
                          <button
                            type="button"
                            className="admin-btn admin-btn-sm admin-btn-danger"
                            onClick={() => updateDraft((d) => { d.gallery.splice(idx, 1); return d; })}
                          >
                            <Trash2 size={12} /> Quitar
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="admin-form-stack">
                      <ImageField
                        label="Imagen"
                        value={photo.imageUrl}
                        folder="galeria"
                        onChange={(url) => updateDraft((d) => { d.gallery[idx].imageUrl = url; return d; })}
                      />
                      <div className="admin-grid-2">
                        <div className="admin-field">
                          <label>Descripción accesible (alt)</label>
                          <input
                            type="text"
                            value={photo.alt || ''}
                            onChange={(e) => updateDraft((d) => { d.gallery[idx].alt = e.target.value; return d; })}
                          />
                        </div>
                        <div className="admin-field">
                          <label>Pie de foto en el visor</label>
                          <input
                            type="text"
                            value={photo.caption || ''}
                            onChange={(e) => updateDraft((d) => { d.gallery[idx].caption = e.target.value; return d; })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 8. LECTURAS RECOMENDADAS */}
            {activeTab === 'readings' && (
              <div className="admin-panel-card">
                <div className="admin-card-head">
                  <div>
                    <h2>Lecturas recomendadas</h2>
                    <p>Libros, guías y textos sugeridos para estudiantes y familias.</p>
                  </div>
                  <button
                    type="button"
                    className="admin-btn admin-btn-sm admin-btn-primary"
                    onClick={() => updateDraft((d) => {
                      d.readings.push({
                        id: `read-${Date.now()}`,
                        category: 'LECTURA',
                        name: 'Nuevo libro recomendado',
                        author: 'Selección del liceo',
                        imageUrl: '',
                        imageAlt: 'Portada del libro',
                        synopsis: 'Breve reseña o motivo de recomendación.',
                        externalUrl: '',
                      });
                      return d;
                    })}
                  >
                    <Plus size={13} /> Añadir lectura
                  </button>
                </div>

                {draft.readings.map((book, idx) => (
                  <div key={book.id || idx} className="admin-item-card">
                    <div className="admin-item-top">
                      <span className="admin-item-badge">Lectura #{idx + 1}</span>
                      <button
                        type="button"
                        className="admin-btn admin-btn-sm admin-btn-danger"
                        onClick={() => updateDraft((d) => { d.readings.splice(idx, 1); return d; })}
                      >
                        <Trash2 size={12} /> Quitar
                      </button>
                    </div>
                    <div className="admin-form-stack">
                      <div className="admin-grid-3">
                        <div className="admin-field">
                          <label>Categoría</label>
                          <input
                            type="text"
                            value={book.category}
                            onChange={(e) => updateDraft((d) => { d.readings[idx].category = e.target.value.toUpperCase(); return d; })}
                          />
                        </div>
                        <div className="admin-field">
                          <label>Título</label>
                          <input
                            type="text"
                            value={book.name}
                            onChange={(e) => updateDraft((d) => { d.readings[idx].name = e.target.value; return d; })}
                          />
                        </div>
                        <div className="admin-field">
                          <label>Autor o colección</label>
                          <input
                            type="text"
                            value={book.author}
                            onChange={(e) => updateDraft((d) => { d.readings[idx].author = e.target.value; return d; })}
                          />
                        </div>
                      </div>
                      <ImageField
                        label="Portada"
                        value={book.imageUrl}
                        folder="lecturas"
                        onChange={(url) => updateDraft((d) => { d.readings[idx].imageUrl = url; return d; })}
                      />
                      <div className="admin-grid-2">
                        <div className="admin-field">
                          <label>Sinopsis o comentario</label>
                          <textarea
                            rows={2}
                            value={book.synopsis || ''}
                            onChange={(e) => updateDraft((d) => { d.readings[idx].synopsis = e.target.value; return d; })}
                          />
                        </div>
                        <div className="admin-field">
                          <label>Enlace externo o PDF (opcional)</label>
                          <input
                            type="url"
                            placeholder="https://..."
                            value={book.externalUrl || ''}
                            onChange={(e) => updateDraft((d) => { d.readings[idx].externalUrl = e.target.value; return d; })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 9. REDES Y BOLETÍN */}
            {activeTab === 'footer' && (
              <>
                <div className="admin-panel-card">
                  <div className="admin-card-head">
                    <div>
                      <h2>Pie de página y redes sociales</h2>
                      <p>Enlaces oficiales del liceo y textos del pie de página.</p>
                    </div>
                  </div>
                  <div className="admin-form-stack">
                    <div className="admin-grid-3">
                      <div className="admin-field">
                        <label>Instagram URL</label>
                        <input
                          type="url"
                          value={draft.footer.instagramUrl}
                          onChange={(e) => updateDraft((d) => { d.footer.instagramUrl = e.target.value; return d; })}
                        />
                      </div>
                      <div className="admin-field">
                        <label>YouTube URL</label>
                        <input
                          type="url"
                          value={draft.footer.youtubeUrl}
                          onChange={(e) => updateDraft((d) => { d.footer.youtubeUrl = e.target.value; return d; })}
                        />
                      </div>
                      <div className="admin-field">
                        <label>Facebook URL</label>
                        <input
                          type="url"
                          value={draft.footer.facebookUrl}
                          onChange={(e) => updateDraft((d) => { d.footer.facebookUrl = e.target.value; return d; })}
                        />
                      </div>
                    </div>
                    <div className="admin-grid-2">
                      <div className="admin-field">
                        <label>Título de suscripción</label>
                        <input
                          type="text"
                          value={draft.footer.subscribeHeading}
                          onChange={(e) => updateDraft((d) => { d.footer.subscribeHeading = e.target.value; return d; })}
                        />
                      </div>
                      <div className="admin-field">
                        <label>Descripción de suscripción</label>
                        <input
                          type="text"
                          value={draft.footer.subscribeText}
                          onChange={(e) => updateDraft((d) => { d.footer.subscribeText = e.target.value; return d; })}
                        />
                      </div>
                    </div>
                    <div className="admin-grid-2">
                      <div className="admin-field">
                        <label>Texto de derechos (izquierda)</label>
                        <input
                          type="text"
                          value={draft.footer.copyright}
                          onChange={(e) => updateDraft((d) => { d.footer.copyright = e.target.value; return d; })}
                        />
                      </div>
                      <div className="admin-field">
                        <label>Lema inferior (derecha)</label>
                        <input
                          type="text"
                          value={draft.footer.motto}
                          onChange={(e) => updateDraft((d) => { d.footer.motto = e.target.value; return d; })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin-panel-card">
                  <div className="admin-card-head">
                    <div>
                      <h2>Correos suscritos al boletín</h2>
                      <p>Personas que dejaron su correo en «Mantente al día» ({subscribers.length} registros).</p>
                    </div>
                    {subscribers.length > 0 && (
                      <button
                        type="button"
                        className="admin-btn admin-btn-sm"
                        onClick={() => {
                          navigator.clipboard?.writeText(subscribers.map((s) => s.email).join(', '));
                          setNotice({ type: 'ok', text: 'Lista de correos copiada al portapapeles.' });
                        }}
                      >
                        <Copy size={13} /> Copiar correos
                      </button>
                    )}
                  </div>
                  {subsLoading ? (
                    <p className="admin-hint">Consultando suscriptores...</p>
                  ) : subscribers.length === 0 ? (
                    <p className="admin-hint">Aún no hay correos registrados.</p>
                  ) : (
                    <table className="admin-sub-table">
                      <thead>
                        <tr>
                          <th>Correo electrónico</th>
                          <th>Fecha</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers.map((sub) => (
                          <tr key={sub.id}>
                            <td>{sub.email}</td>
                            <td>{sub.created_at ? new Date(sub.created_at).toLocaleDateString('es') : '—'}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                className="admin-btn admin-btn-sm admin-btn-danger"
                                onClick={async () => {
                                  await removeSubscriber(sub.id);
                                  setSubscribers((prev) => prev.filter((item) => item.id !== sub.id));
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {/* 10. BASE DE DATOS EN LA NUBE (SUPABASE) Y RESPALDO */}
            {activeTab === 'cloud' && (
              <>
                <div className="admin-panel-card">
                  <div className="admin-card-head">
                    <div>
                      <h2>Base de datos en la nube (Supabase)</h2>
                      <p>Conecta tu proyecto Supabase para que todas las ediciones y fotografías se publiquen en línea para todos los visitantes.</p>
                    </div>
                  </div>

                  <div className="admin-form-stack">
                    <div className="admin-grid-2">
                      <div className="admin-field">
                        <label>Supabase Project URL</label>
                        <input
                          type="url"
                          placeholder="https://tu-proyecto.supabase.co"
                          value={sbUrl}
                          onChange={(e) => setSbUrl(e.target.value)}
                        />
                      </div>
                      <div className="admin-field">
                        <label>Supabase Anon Public Key</label>
                        <input
                          type="text"
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                          value={sbKey}
                          onChange={(e) => setSbKey(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="admin-actions-bar">
                      <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        onClick={async () => {
                          saveSupabaseConfig({ url: sbUrl, anonKey: sbKey });
                          await refreshAuth();
                          const res = await refreshFromCloud();
                          if (res.ok) {
                            setNotice({
                              type: 'ok',
                              text: res.hasData
                                ? 'Conectado a Supabase: se cargó el contenido publicado en la nube.'
                                : 'Conectado a Supabase. Pulsa «Guardar y publicar» para subir el contenido inicial.',
                            });
                          } else if (!sbUrl && !sbKey) {
                            setNotice({ type: 'ok', text: 'Modo local activado.' });
                          } else {
                            setNotice({ type: 'error', text: `Revisa la URL, Anon Key o que hayas ejecutado el SQL inicial: ${res.error}` });
                          }
                        }}
                      >
                        <Cloud size={14} /> Guardar conexión
                      </button>

                      {isSupabaseConfigured() && (
                        <>
                          <button
                            type="button"
                            className="admin-btn"
                            onClick={async () => {
                              const res = await refreshFromCloud();
                              if (res.ok && res.hasData) {
                                setIsDirty(false);
                                setNotice({ type: 'ok', text: 'Contenido sincronizado desde la nube.' });
                              } else {
                                setNotice({ type: 'error', text: res.error || 'Aún no hay contenido guardado en la tabla site_content.' });
                              }
                            }}
                          >
                            Traer desde la nube
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            onClick={async () => {
                              clearSupabaseConfig();
                              setSbUrl('');
                              setSbKey('');
                              await refreshAuth();
                              setNotice({ type: 'ok', text: 'Desconectado de Supabase en este navegador.' });
                            }}
                          >
                            Desconectar
                          </button>
                        </>
                      )}
                    </div>

                    <div className="admin-item-card" style={{ marginTop: 8 }}>
                      <div className="admin-item-top">
                        <strong>Script SQL inicial para Supabase (también en supabase/schema.sql)</strong>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm"
                          onClick={() => {
                            navigator.clipboard?.writeText(SCHEMA_SQL_SNIPPET);
                            setSqlCopied(true);
                            setTimeout(() => setSqlCopied(false), 2500);
                          }}
                        >
                          {sqlCopied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar SQL</>}
                        </button>
                      </div>
                      <p className="admin-hint" style={{ marginBottom: 8 }}>
                        1) Crea un proyecto gratis en Supabase y añade tu usuario administrador en Authentication → Users. 2) Ejecuta este SQL en SQL Editor para crear las tablas y el bucket de imágenes. 3) Pega arriba tu Project URL y Anon Key (o ponlas en <code>.env</code> al publicar en Vercel).
                      </p>
                      <pre className="admin-sql-pre">{SCHEMA_SQL_SNIPPET}</pre>
                    </div>
                  </div>
                </div>

                <div className="admin-panel-card">
                  <div className="admin-card-head">
                    <div>
                      <h2>Credenciales de acceso y respaldos</h2>
                      <p>Actualiza la contraseña del administrador o descarga una copia completa en JSON.</p>
                    </div>
                  </div>

                  <div className="admin-grid-2">
                    <form
                      className="admin-form-stack"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newPassword && !newEmail) return;
                        const res = await updateAdminCredentials({ email: newEmail, newPassword });
                        if (res.ok) {
                          setNewPassword('');
                          setNotice({ type: 'ok', text: 'Credenciales de administrador actualizadas.' });
                        } else {
                          setNotice({ type: 'error', text: res.error });
                        }
                      }}
                    >
                      <div className="admin-field">
                        <label>Nuevo correo (opcional)</label>
                        <input
                          type="email"
                          placeholder={user?.email || 'admin@casahogar.edu'}
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                      </div>
                      <div className="admin-field">
                        <label>Nueva contraseña</label>
                        <input
                          type="password"
                          minLength={6}
                          placeholder="Mínimo 6 caracteres"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="admin-btn">
                        <Lock size={13} /> Actualizar contraseña
                      </button>
                    </form>

                    <div className="admin-form-stack">
                      <div className="admin-field">
                        <label>Copia de seguridad local (.json)</label>
                        <div className="admin-actions-bar">
                          <button type="button" className="admin-btn" onClick={handleExportJson}>
                            <Download size={13} /> Exportar JSON
                          </button>
                          <input
                            ref={importInputRef}
                            type="file"
                            accept="application/json"
                            style={{ display: 'none' }}
                            onChange={handleImportJson}
                          />
                          <button type="button" className="admin-btn" onClick={() => importInputRef.current?.click()}>
                            <Upload size={13} /> Importar JSON
                          </button>
                        </div>
                      </div>
                      <div className="admin-field">
                        <label>Restablecer demostración original</label>
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger"
                          onClick={async () => {
                            if (!window.confirm('¿Restaurar todo el sitio al contenido original de fábrica?')) return;
                            await resetToFactoryContent();
                            setIsDirty(false);
                            setNotice({ type: 'ok', text: 'Contenido original restaurado.' });
                          }}
                        >
                          <RotateCcw size={13} /> Restaurar contenido de fábrica
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

