import { build } from 'esbuild';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadDotEnv() {
  const envPath = resolve(rootDir, '.env');
  const vars = {};
  if (!existsSync(envPath)) return vars;
  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    vars[key] = val;
  }
  return vars;
}

const fileEnv = loadDotEnv();
const supabaseUrl = process.env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || fileEnv.VITE_SUPABASE_ANON_KEY || '';

await build({
  entryPoints: [resolve(rootDir, 'src/main.jsx')],
  outfile: resolve(rootDir, 'preview/bundle.js'),
  bundle: true,
  format: 'iife',
  jsx: 'automatic',
  minify: true,
  target: ['es2020'],
  define: {
    'process.env.NODE_ENV': '"production"',
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    'import.meta.env': JSON.stringify({
      VITE_SUPABASE_URL: supabaseUrl,
      VITE_SUPABASE_ANON_KEY: supabaseAnonKey,
    }),
  },
});

console.log('✓ vista-previa.html actualizada (preview/bundle.js + preview/bundle.css)');

