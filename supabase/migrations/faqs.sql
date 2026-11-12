-- FAQs shown on the home page (all topics) and the Membership page (membership topic).
-- Safe to re-run: creates the table if missing, adds the newer columns, resets the policies,
-- and copies the site's built-in FAQs into the table once (only while it has none), so the
-- admin can edit the questions visitors already see.

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.faqs add column if not exists category text;
alter table public.faqs add column if not exists link_label text;
alter table public.faqs add column if not exists link_url text;

alter table public.faqs drop constraint if exists faqs_category_check;
alter table public.faqs add constraint faqs_category_check
  check (category is null or category in ('before', 'payments', 'trip', 'membership'));

create index if not exists faqs_sort_idx on public.faqs (sort_order asc, created_at desc);

-- ── RLS: public reads visible FAQs, active staff manage everything ───────────
alter table public.faqs enable row level security;

do $$
declare
  r record;
begin
  for r in (select policyname from pg_policies where schemaname = 'public' and tablename = 'faqs') loop
    execute format('drop policy if exists %I on public.faqs', r.policyname);
  end loop;
end $$;

grant select on public.faqs to anon, authenticated;
grant insert, update, delete on public.faqs to authenticated;

create policy "Public read active faqs"
  on public.faqs for select to anon, authenticated
  using (is_active = true);

create policy "Staff read all faqs"
  on public.faqs for select to authenticated
  using (public.is_staff_active());

create policy "Staff insert faqs"
  on public.faqs for insert to authenticated
  with check (public.is_staff_active());

create policy "Staff update faqs"
  on public.faqs for update to authenticated
  using (public.is_staff_active())
  with check (public.is_staff_active());

create policy "Staff delete faqs"
  on public.faqs for delete to authenticated
  using (public.is_staff_active());

-- ── Seed with the FAQs currently hard-coded on the site (once) ───────────────
insert into public.faqs (category, question, answer, link_label, link_url, sort_order)
select v.category, v.question, v.answer, v.link_label, v.link_url, v.sort_order
from (values
  ('before', 'Can you plan a private or custom trip for us?', 'Yes. Tell us your dates, budget and where you’d like to go, and we design itineraries for families, teams, honeymoons and celebrations across Kenya, East Africa and selected international destinations.', 'Plan my trip', '/?plan=1', 0),
  ('before', 'What documents do I need?', 'You’re responsible for valid ID or a passport, any visas you need, and vaccinations or health requirements for your destination. Flytrails isn’t responsible for denied entry due to incomplete documents.', 'Read the full terms', '/terms', 1),
  ('before', 'I have a medical condition. Can I still join?', 'Please tell us about any medical conditions that may affect your participation before the trip, so we can advise you and plan around it.', 'Chat on WhatsApp', 'whatsapp', 2),
  ('payments', 'How do I confirm my booking?', 'A booking is confirmed once the deposit or full payment specified for that trip has been received.', 'See upcoming trips', '/upcoming-trips', 3),
  ('payments', 'Can I get a refund if I cancel?', 'Cancellations you make may carry cancellation fees, and deposits are generally non-refundable. Refund timelines can also depend on third-party providers.', 'Read the full terms', '/terms', 4),
  ('payments', 'What happens if Flytrails cancels a trip?', 'You’ll be offered a full refund or the option to move to another trip.', 'Chat on WhatsApp', 'whatsapp', 5),
  ('payments', 'Why might a trip price change?', 'Prices can change because of outside costs such as fuel, park fees and exchange rates.', 'Browse trips', '/trips', 6),
  ('trip', 'Can the itinerary change once we’re travelling?', 'Occasionally, because of weather, safety concerns or government regulations. When that happens we always aim for a similar or better experience.', 'Chat on WhatsApp', 'whatsapp', 7),
  ('trip', 'Will I appear in trip photos?', 'We photograph our trips and may use the pictures in our marketing. If you’d rather not be photographed, just let the photographer know in advance.', 'See trip albums', '/gallery', 8),
  ('membership', 'How do I pay for Elite or VIP membership?', 'Reach out to us and we’ll send M-Pesa or bank details, then activate your perks within 24 hours.', 'Compare memberships', '/membership', 9),
  ('membership', 'Can I upgrade my membership mid-year?', 'Yes. Upgrades are prorated for the months left in your membership year.', 'Compare memberships', '/membership', 10),
  ('membership', 'Do member discounts stack with early-bird prices?', 'Member discounts apply to the public trip price, and we’ll always quote you the best rate you’re eligible for.', 'Browse trips', '/trips', 11),
  ('membership', 'Is the community forum moderated?', 'Yes. Our team keeps discussions respectful, helpful and free of spam.', 'Join free', '/membership', 12)
) as v(category, question, answer, link_label, link_url, sort_order)
where not exists (select 1 from public.faqs);
