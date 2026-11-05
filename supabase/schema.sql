-- Esquema de base de datos en la nube para Casa Hogar (Supabase / PostgreSQL)
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase.

-- 1. Tabla principal de contenido editorial del sitio (CMS completo)
create table if not exists public.site_content (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.site_content enable row level security;

drop policy if exists "Lectura publica de contenido" on public.site_content;
create policy "Lectura publica de contenido"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Administradores pueden insertar contenido" on public.site_content;
create policy "Administradores pueden insertar contenido"
  on public.site_content
  for insert
  to authenticated
  with check (true);

drop policy if exists "Administradores pueden actualizar contenido" on public.site_content;
create policy "Administradores pueden actualizar contenido"
  on public.site_content
  for update
  to authenticated
  using (true)
  with check (true);

-- 2. Tabla de suscriptores del boletín ("Mantente al día" en el pie de página)
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Visitantes pueden suscribirse al boletin" on public.newsletter_subscribers;
create policy "Visitantes pueden suscribirse al boletin"
  on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (char_length(trim(email)) > 3 and position('@' in email) > 1);

drop policy if exists "Administradores pueden ver suscriptores" on public.newsletter_subscribers;
create policy "Administradores pueden ver suscriptores"
  on public.newsletter_subscribers
  for select
  to authenticated
  using (true);

drop policy if exists "Administradores pueden eliminar suscriptores" on public.newsletter_subscribers;
create policy "Administradores pueden eliminar suscriptores"
  on public.newsletter_subscribers
  for delete
  to authenticated
  using (true);

-- 3. Bucket de almacenamiento público para fotografías y portadas subidas desde Admin
insert into storage.buckets (id, name, public)
values ('casahogar-media', 'casahogar-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Lectura publica de imagenes Casa Hogar" on storage.objects;
create policy "Lectura publica de imagenes Casa Hogar"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'casahogar-media');

drop policy if exists "Administradores pueden subir imagenes Casa Hogar" on storage.objects;
create policy "Administradores pueden subir imagenes Casa Hogar"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'casahogar-media');

drop policy if exists "Administradores pueden actualizar imagenes Casa Hogar" on storage.objects;
create policy "Administradores pueden actualizar imagenes Casa Hogar"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'casahogar-media');

drop policy if exists "Administradores pueden borrar imagenes Casa Hogar" on storage.objects;
create policy "Administradores pueden borrar imagenes Casa Hogar"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'casahogar-media');

