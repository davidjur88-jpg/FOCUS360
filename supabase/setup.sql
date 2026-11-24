-- ============================================================================
-- FOCUS360 STUDIO — Supabase setup script
-- Paste this WHOLE file into Supabase > SQL Editor > New query, then click Run.
-- It is safe to run more than once.
--
-- What it creates:
--   projects      your portfolio items
--   testimonials  client quotes
--   messages      enquiries sent from the website contact form
--   portfolio     a public storage bucket for your images
--
-- Security: visitors can only READ published projects/testimonials and SEND a
-- message. Only the FIRST user account created in your project (you) can add,
-- edit or delete anything, or read messages — even if sign-ups are left on.
-- ============================================================================

-- ---------- Who is the admin? The first user account created in this project.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select auth.uid() is not null
     and auth.uid() = (select id from auth.users order by created_at asc limit 1);
$$;

-- ---------- Tables
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  category    text not null default 'General',
  year        text,
  client      text,
  summary     text,
  description text,
  services    text,
  image_url   text,
  gallery     text[] not null default '{}',
  ratio       text not null default 'portrait' check (ratio in ('portrait','square','landscape')),
  featured    boolean not null default false,
  published   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  quote       text not null,
  name        text not null,
  role        text,
  published   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 200),
  email       text not null check (char_length(email) between 3 and 320),
  phone       text check (phone is null or char_length(phone) <= 60),
  service     text check (service is null or char_length(service) <= 200),
  message     text not null check (char_length(message) between 1 and 5000),
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------- Row Level Security
alter table public.projects     enable row level security;
alter table public.testimonials enable row level security;
alter table public.messages     enable row level security;

drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects" on public.projects
  for select to anon, authenticated using (published = true);

drop policy if exists "Admin full access to projects" on public.projects;
create policy "Admin full access to projects" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read published testimonials" on public.testimonials;
create policy "Public can read published testimonials" on public.testimonials
  for select to anon, authenticated using (published = true);

drop policy if exists "Admin full access to testimonials" on public.testimonials;
create policy "Admin full access to testimonials" on public.testimonials
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone can send a message" on public.messages;
create policy "Anyone can send a message" on public.messages
  for insert to anon, authenticated with check (true);

drop policy if exists "Admin full access to messages" on public.messages;
create policy "Admin full access to messages" on public.messages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Permissions (newer Supabase projects require these explicitly)
grant usage on schema public to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant select on public.projects, public.testimonials to anon;
grant insert on public.messages to anon;
grant select, insert, update, delete on public.projects, public.testimonials, public.messages to authenticated;

-- ---------- Image storage (public bucket, max 10 MB per image)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update
  set public = true,
      file_size_limit = 10485760,
      allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "Public can view portfolio images" on storage.objects;
create policy "Public can view portfolio images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'portfolio');

drop policy if exists "Admin can upload portfolio images" on storage.objects;
create policy "Admin can upload portfolio images" on storage.objects
  for insert to authenticated with check (bucket_id = 'portfolio' and public.is_admin());

drop policy if exists "Admin can update portfolio images" on storage.objects;
create policy "Admin can update portfolio images" on storage.objects
  for update to authenticated using (bucket_id = 'portfolio' and public.is_admin());

drop policy if exists "Admin can delete portfolio images" on storage.objects;
create policy "Admin can delete portfolio images" on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio' and public.is_admin());
