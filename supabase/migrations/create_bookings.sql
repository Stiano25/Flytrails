-- ══════════════════════════════════════════════════════════════════════════════
-- Bookings table — stores every trip booking initiated via M-Pesa STK Push
-- ══════════════════════════════════════════════════════════════════════════════

create table if not exists public.bookings (
  id                  uuid default gen_random_uuid() primary key,
  ticket_number       text unique not null,                         -- e.g. "FLY-20261024-A3X7"

  -- Trip reference
  trip_id             uuid not null references public.trips(id) on delete restrict,
  trip_title          text not null,                                -- snapshot (survives trip edits)
  trip_departure      text,                                        -- snapshot of next_departure

  -- Customer details
  customer_name       text not null,
  customer_email      text not null,
  customer_phone      text not null,                               -- 2547XXXXXXXX format
  slots               int not null default 1 check (slots > 0),

  -- Payment
  amount              numeric(10,2) not null,                      -- total = price × slots
  mpesa_checkout_id   text,                                        -- CheckoutRequestID from STK push
  mpesa_receipt       text,                                        -- MpesaReceiptNumber from callback
  payment_status      text not null default 'pending'
                        check (payment_status in ('pending', 'completed', 'failed', 'cancelled')),

  -- Timestamps
  created_at          timestamptz not null default now(),
  paid_at             timestamptz
);

-- Fast lookup when Safaricom callback arrives with CheckoutRequestID
create index if not exists idx_bookings_checkout
  on public.bookings(mpesa_checkout_id);

-- Fast lookup by trip
create index if not exists idx_bookings_trip
  on public.bookings(trip_id);

-- ── Row-Level Security ───────────────────────────────────────────────────────
alter table public.bookings enable row level security;

-- Staff can see & manage all bookings
create policy "Staff read all bookings"
  on public.bookings
  for select
  to authenticated
  using (public.is_staff_active());

create policy "Staff update bookings"
  on public.bookings
  for update
  to authenticated
  using (public.is_staff_active())
  with check (public.is_staff_active());

create policy "Staff delete bookings"
  on public.bookings
  for delete
  to authenticated
  using (public.is_staff_active());

-- The server (service role) bypasses RLS for inserts from the API.
-- No public/anon read policy — customers only see their booking via the API response,
-- not by querying Supabase directly.
