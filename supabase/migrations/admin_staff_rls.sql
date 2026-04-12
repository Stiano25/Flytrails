-- Admin staff registry + RLS: only active staff can manage content (not every authenticated user).
-- Bootstrap: after deploy, insert your existing admin once (replace USER_UUID):
--   insert into public.admin_staff (user_id, role) values ('USER_UUID', 'superadmin');

-- ── Staff table ─────────────────────────────────────────────────────────────
create table if not exists public.admin_staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('superadmin', 'co_admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists admin_staff_one_superadmin
  on public.admin_staff ((true))
  where role = 'superadmin';

alter table public.admin_staff enable row level security;

-- No policies for anon/authenticated: only service role (bypasses RLS) can manage this table.

-- ── Helper for RLS policies ───────────────────────────────────────────────────
create or replace function public.is_staff_active()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_staff s
    where s.user_id = auth.uid()
      and s.is_active = true
  );
$$;

grant execute on function public.is_staff_active() to anon, authenticated;

-- ── Drop existing public table policies (replace with staff checks) ─────────
do $$
declare
  r record;
begin
  for r in (
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'trips',
        'gallery_images',
        'blog_posts',
        'accommodations',
        'site_content',
        'testimonials'
      )
  ) loop
    execute format(
      'drop policy if exists %I on %I.%I',
      r.policyname,
      r.schemaname,
      r.tablename
    );
  end loop;
end $$;

-- ── trips ────────────────────────────────────────────────────────────────────
alter table public.trips enable row level security;

create policy "Public read active trips"
  on public.trips
  for select
  to anon, authenticated
  using (is_active = true);

create policy "Staff read all trips"
  on public.trips
  for select
  to authenticated
  using (public.is_staff_active());

create policy "Staff insert trips"
  on public.trips
  for insert
  to authenticated
  with check (public.is_staff_active());

create policy "Staff update trips"
  on public.trips
  for update
  to authenticated
  using (public.is_staff_active())
  with check (public.is_staff_active());

create policy "Staff delete trips"
  on public.trips
  for delete
  to authenticated
  using (public.is_staff_active());

-- ── gallery_images ───────────────────────────────────────────────────────────
alter table public.gallery_images enable row level security;

create policy "Public read gallery images"
  on public.gallery_images
  for select
  to anon, authenticated
  using (true);

create policy "Staff insert gallery images"
  on public.gallery_images
  for insert
  to authenticated
  with check (public.is_staff_active());

create policy "Staff update gallery images"
  on public.gallery_images
  for update
  to authenticated
  using (public.is_staff_active())
  with check (public.is_staff_active());

create policy "Staff delete gallery images"
  on public.gallery_images
  for delete
  to authenticated
  using (public.is_staff_active());

-- ── blog_posts ───────────────────────────────────────────────────────────────
alter table public.blog_posts enable row level security;

create policy "Public read published blog posts"
  on public.blog_posts
  for select
  to anon, authenticated
  using (is_published = true);

create policy "Staff read all blog posts"
  on public.blog_posts
  for select
  to authenticated
  using (public.is_staff_active());

create policy "Staff insert blog posts"
  on public.blog_posts
  for insert
  to authenticated
  with check (public.is_staff_active());

create policy "Staff update blog posts"
  on public.blog_posts
  for update
  to authenticated
  using (public.is_staff_active())
  with check (public.is_staff_active());

create policy "Staff delete blog posts"
  on public.blog_posts
  for delete
  to authenticated
  using (public.is_staff_active());

-- ── accommodations ───────────────────────────────────────────────────────────
alter table public.accommodations enable row level security;

create policy "Public read active accommodations"
  on public.accommodations
  for select
  to anon, authenticated
  using (is_active = true);

create policy "Staff read all accommodations"
  on public.accommodations
  for select
  to authenticated
  using (public.is_staff_active());

create policy "Staff insert accommodations"
  on public.accommodations
  for insert
  to authenticated
  with check (public.is_staff_active());

create policy "Staff update accommodations"
  on public.accommodations
  for update
  to authenticated
  using (public.is_staff_active())
  with check (public.is_staff_active());

create policy "Staff delete accommodations"
  on public.accommodations
  for delete
  to authenticated
  using (public.is_staff_active());

-- ── site_content ─────────────────────────────────────────────────────────────
alter table public.site_content enable row level security;

create policy "Public read site content"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

create policy "Staff update site content"
  on public.site_content
  for update
  to authenticated
  using (public.is_staff_active())
  with check (public.is_staff_active());

-- ── testimonials ─────────────────────────────────────────────────────────────
alter table public.testimonials enable row level security;

create policy "Public read active testimonials"
  on public.testimonials
  for select
  to anon, authenticated
  using (is_active = true);

create policy "Staff read all testimonials"
  on public.testimonials
  for select
  to authenticated
  using (public.is_staff_active());

create policy "Staff insert testimonials"
  on public.testimonials
  for insert
  to authenticated
  with check (public.is_staff_active());

create policy "Staff update testimonials"
  on public.testimonials
  for update
  to authenticated
  using (public.is_staff_active())
  with check (public.is_staff_active());

create policy "Staff delete testimonials"
  on public.testimonials
  for delete
  to authenticated
  using (public.is_staff_active());

-- ── Storage: replace authenticated-only policies with active staff ────────────
do $$
declare
  r record;
begin
  for r in (
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
  ) loop
    execute format('drop policy if exists %I on storage.objects', r.policyname);
  end loop;
end $$;

-- Public read for listed buckets; mutations restricted to active staff.
create policy "Public read storage objects"
  on storage.objects
  for select
  to public
  using (
    bucket_id in ('gallery', 'blog', 'trips', 'accommodations', 'testimonials')
  );

create policy "Staff insert storage objects"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in ('gallery', 'blog', 'trips', 'accommodations', 'testimonials')
    and public.is_staff_active()
  );

create policy "Staff update storage objects"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id in ('gallery', 'blog', 'trips', 'accommodations', 'testimonials')
    and public.is_staff_active()
  )
  with check (
    bucket_id in ('gallery', 'blog', 'trips', 'accommodations', 'testimonials')
    and public.is_staff_active()
  );

create policy "Staff delete storage objects"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in ('gallery', 'blog', 'trips', 'accommodations', 'testimonials')
    and public.is_staff_active()
  );
