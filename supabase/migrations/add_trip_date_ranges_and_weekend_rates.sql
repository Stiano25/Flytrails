alter table public.trips
  add column if not exists date_mode text not null default 'single'
    check (date_mode in ('single', 'range')),
  add column if not exists date_start date,
  add column if not exists date_end date;

update public.trips
set date_start = next_departure
where date_start is null
  and next_departure is not null;

alter table public.trips
  add constraint trips_date_range_check
  check (date_end is null or (date_start is not null and date_end >= date_start));

alter table public.accommodations
  add column if not exists weekday_price numeric(10,2),
  add column if not exists weekend_price numeric(10,2),
  add column if not exists weekend_days jsonb not null default '["friday", "saturday", "sunday"]'::jsonb;

update public.accommodations
set weekday_price = price_from
where weekday_price is null;

alter table public.accommodations
  add constraint accommodations_weekday_price_check check (weekday_price >= 0),
  add constraint accommodations_weekend_price_check check (weekend_price is null or weekend_price >= 0);
