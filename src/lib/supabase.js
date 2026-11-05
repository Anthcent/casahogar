import { createClient } from '@supabase/supabase-js';

const CONFIG_STORAGE_KEY = 'casahogar_supabase_config';
export const MEDIA_BUCKET = 'casahogar-media';

let cachedClient = null;
let cachedSignature = '';

function readEnvConfig() {
  const url = (import.meta.env?.VITE_SUPABASE_URL || '').trim();
  const anonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY || '').trim();
  return { url, anonKey };
}

function readStoredConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return { url: '', anonKey: '' };
    const parsed = JSON.parse(raw);
    return {
      url: String(parsed?.url || '').trim(),
      anonKey: String(parsed?.anonKey || '').trim(),
    };
  } catch {
    return { url: '', anonKey: '' };
  }
}

export function getSupabaseConfig() {
  const stored = readStoredConfig();
  const env = readEnvConfig();
  if (stored.url && stored.anonKey) {
    return { ...stored, source: 'admin' };
  }
  if (env.url && env.anonKey) {
    return { ...env, source: 'env' };
  }
  return { url: '', anonKey: '', source: 'none' };
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && /^https?:\/\//i.test(url));
}

export function saveSupabaseConfig({ url, anonKey }) {
  const cleanUrl = String(url || '').trim().replace(/\/+$/, '');
  const cleanKey = String(anonKey || '').trim();
  try {
    if (!cleanUrl && !cleanKey) {
      localStorage.removeItem(CONFIG_STORAGE_KEY);
    } else {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({ url: cleanUrl, anonKey: cleanKey }));
    }
  } catch {
    // Ignore storage quota / file:// privacy restrictions
  }
  cachedClient = null;
  cachedSignature = '';
}

export function clearSupabaseConfig() {
  saveSupabaseConfig({ url: '', anonKey: '' });
}

export function getSupabase() {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !/^https?:\/\//i.test(url)) return null;
  const sig = `${url}::${anonKey}`;
  if (cachedClient && cachedSignature === sig) return cachedClient;

  cachedClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'casahogar_supabase_auth',
    },
  });
  cachedSignature = sig;
  return cachedClient;
}

function compressImageToDataUrl(file, maxWidth = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(String(reader.result));
      img.onload = () => {
        try {
          const ratio = img.width > maxWidth ? maxWidth / img.width : 1;
          const width = Math.max(1, Math.round(img.width * ratio));
          const height = Math.max(1, Math.round(img.height * ratio));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          let out = canvas.toDataURL('image/webp', quality);
          if (!out.startsWith('data:image/webp')) {
            out = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(out);
        } catch {
          resolve(String(reader.result));
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadMediaFile(file, folder = 'general') {
  if (!file) throw new Error('Selecciona una imagen válida.');
  const supabase = getSupabase();
  if (supabase) {
    const ext = (file.name.split('.').pop() || 'webp').toLowerCase().replace(/[^a-z0-9]/g, '') || 'webp';
    const safeFolder = folder.replace(/[^a-z0-9_-]/gi, '') || 'general';
    const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (!error) {
      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      if (data?.publicUrl) return { url: data.publicUrl, mode: 'cloud' };
    }
    throw new Error(error?.message || 'No se pudo subir la imagen al bucket casahogar-media en Supabase.');
  }
  const dataUrl = await compressImageToDataUrl(file);
  return { url: dataUrl, mode: 'local' };
}

