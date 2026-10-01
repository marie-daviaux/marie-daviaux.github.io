-- Schéma commun à appliquer séparément dans chaque projet Supabase.
create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_not_empty check (length(trim(name)) > 0),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null default '',
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_title_not_empty check (length(trim(title)) > 0),
  constraint projects_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.project_categories (
  project_id uuid not null references public.projects(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (project_id, category_id)
);

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null unique,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists projects_public_order_idx
  on public.projects (is_published, sort_order, created_at desc);
create index if not exists project_images_project_order_idx
  on public.project_images (project_id, sort_order);
create index if not exists project_categories_category_idx
  on public.project_categories (category_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.projects enable row level security;
alter table public.project_categories enable row level security;
alter table public.project_images enable row level security;

drop policy if exists "categories_are_public" on public.categories;
create policy "categories_are_public"
on public.categories for select
to anon, authenticated
using (true);

drop policy if exists "projects_visible_when_published" on public.projects;
create policy "projects_visible_when_published"
on public.projects for select
to anon, authenticated
using (is_published or (select auth.role()) = 'authenticated');

drop policy if exists "project_categories_visible_when_project_is_visible" on public.project_categories;
create policy "project_categories_visible_when_project_is_visible"
on public.project_categories for select
to anon, authenticated
using (
  (select auth.role()) = 'authenticated'
  or exists (
    select 1 from public.projects
    where projects.id = project_categories.project_id
      and projects.is_published
  )
);

drop policy if exists "project_images_visible_when_project_is_visible" on public.project_images;
create policy "project_images_visible_when_project_is_visible"
on public.project_images for select
to anon, authenticated
using (
  (select auth.role()) = 'authenticated'
  or exists (
    select 1 from public.projects
    where projects.id = project_images.project_id
      and projects.is_published
  )
);

drop policy if exists "authenticated_manage_categories" on public.categories;
create policy "authenticated_manage_categories"
on public.categories for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_manage_projects" on public.projects;
create policy "authenticated_manage_projects"
on public.projects for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_manage_project_categories" on public.project_categories;
create policy "authenticated_manage_project_categories"
on public.project_categories for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_manage_project_images" on public.project_images;
create policy "authenticated_manage_project_images"
on public.project_images for all
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-images',
  'project-images',
  true,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public_read_project_images" on storage.objects;
create policy "public_read_project_images"
on storage.objects for select
to public
using (bucket_id = 'project-images');

drop policy if exists "authenticated_upload_project_images" on storage.objects;
create policy "authenticated_upload_project_images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'project-images');

drop policy if exists "authenticated_update_project_images" on storage.objects;
create policy "authenticated_update_project_images"
on storage.objects for update
to authenticated
using (bucket_id = 'project-images')
with check (bucket_id = 'project-images');

drop policy if exists "authenticated_delete_project_images" on storage.objects;
create policy "authenticated_delete_project_images"
on storage.objects for delete
to authenticated
using (bucket_id = 'project-images');
