-- Customer reviews: public submit (pending); staff approve, reply, hide.
-- Run after admin_staff_rls.sql (requires public.is_staff_active()).

create table if not exists public.customer_reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_email text,
  rating int check (rating is null or (rating >= 1 and rating <= 5)),
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  admin_reply text,
  admin_replied_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists customer_reviews_status_created_idx
  on public.customer_reviews (status asc, created_at desc);

alter table public.customer_reviews enable row level security;

create policy "Public read approved customer_reviews"
  on public.customer_reviews
  for select
  to anon, authenticated
  using (status = 'approved');

create policy "Public insert customer_reviews pending"
  on public.customer_reviews
  for insert
  to anon, authenticated
  with check (status = 'pending');

create policy "Staff read all customer_reviews"
  on public.customer_reviews
  for select
  to authenticated
  using (public.is_staff_active());

create policy "Staff update customer_reviews"
  on public.customer_reviews
  for update
  to authenticated
  using (public.is_staff_active())
  with check (public.is_staff_active());

create policy "Staff delete customer_reviews"
  on public.customer_reviews
  for delete
  to authenticated
  using (public.is_staff_active());
