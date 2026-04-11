-- Testimonials for public site + admin CRUD (run in Supabase SQL Editor or via CLI)

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author_name text not null,
  author_detail text,
  author_image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists testimonials_sort_idx on public.testimonials (sort_order asc, created_at desc);

alter table public.testimonials enable row level security;

-- Anyone can read published testimonials
create policy "Public read active testimonials"
  on public.testimonials
  for select
  to anon, authenticated
  using (is_active = true);

-- Logged-in admins see drafts too
create policy "Authenticated read all testimonials"
  on public.testimonials
  for select
  to authenticated
  using (true);

create policy "Authenticated insert testimonials"
  on public.testimonials
  for insert
  to authenticated
  with check (true);

create policy "Authenticated update testimonials"
  on public.testimonials
  for update
  to authenticated
  using (true);

create policy "Authenticated delete testimonials"
  on public.testimonials
  for delete
  to authenticated
  using (true);
