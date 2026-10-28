create table if not exists public.custom_trip_requests (
  id uuid default gen_random_uuid() primary key,
  reference_number text unique not null default ('CT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  trip_type text,
  destination text,
  travel_dates text,
  adults int not null default 1 check (adults > 0),
  children int not null default 0 check (children >= 0),
  budget text,
  special_requests text,
  source text not null default 'custom_trip',
  status text not null default 'new'
    check (status in ('new', 'under_review', 'quote_draft', 'quote_sent', 'customer_confirmed', 'customer_declined', 'closed')),
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists custom_trip_requests_status_created_idx
  on public.custom_trip_requests (status, created_at desc);

create table if not exists public.custom_trip_quotes (
  id uuid default gen_random_uuid() primary key,
  request_id uuid not null references public.custom_trip_requests(id) on delete cascade,
  version int not null default 1,
  validity_date date,
  itinerary text,
  inclusions text,
  exclusions text,
  terms text,
  total numeric(12,2) not null default 0 check (total >= 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (request_id, version)
);

create table if not exists public.custom_trip_quote_items (
  id uuid default gen_random_uuid() primary key,
  quote_id uuid not null references public.custom_trip_quotes(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  sort_order int not null default 0
);

alter table public.custom_trip_requests enable row level security;
alter table public.custom_trip_quotes enable row level security;
alter table public.custom_trip_quote_items enable row level security;

create policy "Public can submit custom trip requests"
  on public.custom_trip_requests
  for insert
  to anon, authenticated
  with check (
    char_length(customer_name) between 2 and 120
    and customer_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    and char_length(customer_phone) between 7 and 30
  );

create policy "Staff read custom trip requests"
  on public.custom_trip_requests
  for select
  to authenticated
  using (public.is_staff_active());

create policy "Staff update custom trip requests"
  on public.custom_trip_requests
  for update
  to authenticated
  using (public.is_staff_active())
  with check (public.is_staff_active());

create policy "Staff delete custom trip requests"
  on public.custom_trip_requests
  for delete
  to authenticated
  using (public.is_staff_active());

create policy "Staff manage custom trip quotes"
  on public.custom_trip_quotes
  for all
  to authenticated
  using (public.is_staff_active())
  with check (public.is_staff_active());

create policy "Staff manage custom trip quote items"
  on public.custom_trip_quote_items
  for all
  to authenticated
  using (public.is_staff_active())
  with check (public.is_staff_active());
