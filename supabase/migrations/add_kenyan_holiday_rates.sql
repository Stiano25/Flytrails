alter table public.accommodations
  add column if not exists holiday_price numeric(10,2),
  add column if not exists holiday_dates jsonb not null default '[]'::jsonb;

alter table public.accommodations
  add constraint accommodations_holiday_price_check
  check (holiday_price is null or holiday_price >= 0);
