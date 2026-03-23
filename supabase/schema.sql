-- ============================================================
-- Flytrails — Supabase Schema
-- Run this in the Supabase SQL Editor (flytrails project)
-- ============================================================

-- 1. TRIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS trips (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  title         text NOT NULL,
  location      text NOT NULL,
  category      text NOT NULL,
  duration      text NOT NULL,
  price         integer NOT NULL,
  spots_total   integer NOT NULL DEFAULT 20,
  spots_left    integer NOT NULL DEFAULT 20,
  difficulty    text NOT NULL DEFAULT 'Easy',
  next_departure date,
  description   text NOT NULL DEFAULT '',
  highlights    jsonb NOT NULL DEFAULT '[]',
  itinerary     jsonb NOT NULL DEFAULT '[]',
  included      jsonb NOT NULL DEFAULT '[]',
  not_included  jsonb NOT NULL DEFAULT '[]',
  faqs          jsonb NOT NULL DEFAULT '[]',
  image_url     text,
  is_active     boolean NOT NULL DEFAULT true,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- 2. GALLERY IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url         text NOT NULL,
  location    text NOT NULL,
  tags        text[] NOT NULL DEFAULT '{}',
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. BLOG POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,
  title        text NOT NULL,
  excerpt      text NOT NULL DEFAULT '',
  category     text NOT NULL,
  read_time    text,
  date         date NOT NULL DEFAULT now()::date,
  image_url    text,
  featured     boolean NOT NULL DEFAULT false,
  sections     jsonb NOT NULL DEFAULT '[]',
  closing      text,
  is_published boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- 4. SITE CONTENT (editable page texts)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_content (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text UNIQUE NOT NULL,
  value      text NOT NULL,
  section    text NOT NULL,
  label      text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- STORAGE BUCKETS (public)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('gallery', 'gallery', true),
  ('trips',   'trips',   true),
  ('blog',    'blog',    true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE trips         ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content  ENABLE ROW LEVEL SECURITY;

-- Public can read all active content
CREATE POLICY "public_read_trips"          ON trips         FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_gallery"        ON gallery_images FOR SELECT USING (true);
CREATE POLICY "public_read_blog_posts"     ON blog_posts    FOR SELECT USING (is_published = true);
CREATE POLICY "public_read_site_content"   ON site_content  FOR SELECT USING (true);

-- Authenticated (admin) can do everything
CREATE POLICY "admin_all_trips"         ON trips         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_gallery"       ON gallery_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_blog_posts"    ON blog_posts    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_site_content"  ON site_content  FOR ALL USING (auth.role() = 'authenticated');

-- Storage policies
CREATE POLICY "public_read_gallery_storage" ON storage.objects FOR SELECT USING (bucket_id IN ('gallery', 'trips', 'blog'));
CREATE POLICY "admin_write_storage" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "admin_delete_storage" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_trips
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_blog_posts
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_site_content
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED: SITE CONTENT
-- ============================================================
INSERT INTO site_content (key, value, section, label) VALUES
  ('contact_phone',     '+254 712 345 678',           'contact', 'Phone Number'),
  ('contact_whatsapp',  '254712345678',                'contact', 'WhatsApp Number (digits only)'),
  ('contact_email',     'hello@flytrails.com',         'contact', 'Email Address'),
  ('contact_address',   'Nairobi, Kenya',              'contact', 'Address'),
  ('home_hero_tagline', 'Discover Africa, One Adventure at a Time', 'home', 'Hero Tagline'),
  ('home_hero_sub',     'Expert-guided small-group trips across Kenya, Tanzania, and beyond.', 'home', 'Hero Subheadline'),
  ('about_story_heading', 'Our Story',                'about', 'Story Heading'),
  ('about_story_body',  'Flytrails was founded by a small team of East Africa enthusiasts who believe travel should be authentic, personal, and thoughtfully planned. We started with one van and a passion for the trails of Mt Kenya. Today we lead groups from across Africa and the world to experiences that leave a mark.', 'about', 'Story Body'),
  ('about_mission',     'Small groups. Real guides. Genuine places.',  'about', 'Mission Statement'),
  ('site_tagline',      'Your journey, our expertise.',               'global', 'Site Tagline')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- SEED: TRIPS (existing 8 trips)
-- ============================================================
INSERT INTO trips (slug, title, location, category, duration, price, spots_total, spots_left, difficulty, next_departure, description, highlights, itinerary, included, not_included, faqs, sort_order) VALUES
(
  'mt-kenya-sirimon',
  'Mt Kenya Sirimon Trek',
  'Mt Kenya National Park, Kenya',
  'Hiking',
  '5 days',
  28500, 14, 5, 'Moderate',
  '2026-04-12',
  'Ascend Africa''s second-highest peak via the scenic Sirimon route. Alpine moorland, dramatic peaks, and sunrise views over the Kenyan highlands — with expert mountain guides and comfortable mountain huts.',
  '["Sirimon route — gentler acclimatisation","Overnight at Old Moses & Shipton''s camps","Summit attempt at Point Lenana (4,985m)","Small group (max 14) with certified guides"]',
  '[{"day":1,"title":"Nairobi to Nanyuki","description":"Group meet-up, transfer to Sirimon gate, hike to Old Moses camp."},{"day":2,"title":"Old Moses to Shipton","description":"Cross moorland and Mackinder Valley with views of Batian and Nelion."},{"day":3,"title":"Acclimatisation day","description":"Short hikes around Shipton''s; gear check and briefing for summit."},{"day":4,"title":"Summit morning","description":"Pre-dawn push to Point Lenana; descend and celebrate as a team."},{"day":5,"title":"Return to Nairobi","description":"Breakfast, transfer back — optional coffee stop in Nanyuki."}]',
  '["Park fees","Mountain guides & porters","Meals on mountain","Group transport from Nairobi","Camp/hut fees"]',
  '["Personal gear & sleeping bag rental","Tips for crew","Travel insurance","Snacks & drinks"]',
  '[{"question":"Do I need prior hiking experience?","answer":"Moderate fitness is enough; we include an acclimatisation day and brief you on pacing."},{"question":"What about altitude?","answer":"We follow a conservative itinerary. Tell us about any health conditions before booking."}]',
  1
),
(
  'diani-beach-escape',
  'Diani Beach Escape',
  'Diani, Kenya',
  'Beach',
  '4 days',
  42000, 20, 12, 'Easy',
  '2026-05-03',
  'Powder-white sands, turquoise water, and a laid-back coastal vibe. Stay in a boutique resort, enjoy a dhow sunset sail, and optional snorkelling at Kisite-Mpunguti.',
  '["Beachfront boutique stay","Sunset dhow cruise","Optional marine park snorkel","Community beach cleanup hour"]',
  '[{"day":1,"title":"Arrival & welcome","description":"Transfer from Ukunda airstrip; sunset walk on the beach."},{"day":2,"title":"Coastal day","description":"Relax, pool, optional spa — group lunch at a local spot."},{"day":3,"title":"Ocean & culture","description":"Half-day snorkel trip or village visit; evening dhow cruise."},{"day":4,"title":"Departure","description":"Breakfast and transfers — leave refreshed."}]',
  '["3 nights accommodation (twin share)","Breakfast daily","One dhow cruise","Airport/strip transfers"]',
  '["Flights to Diani","Lunch & dinner except where stated","Marine park fees for optional snorkel"]',
  '[{"question":"Is this family friendly?","answer":"Yes — we can arrange adjoining rooms on request."}]',
  2
),
(
  'maasai-mara-classic',
  'Maasai Mara Classic Safari',
  'Maasai Mara, Kenya',
  'Safari',
  '4 days',
  89500, 8, 2, 'Easy',
  '2026-07-18',
  'Big cats, endless plains, and golden sunsets. Game drives in a 4x4 land cruiser, stay in a comfortable tented camp, and learn from Maasai community partners.',
  '["Multiple full-day game drives","Tented camp with en-suite","Visit to a Maasai manyatta","Small vehicle ratio"]',
  '[{"day":1,"title":"Nairobi to Mara","description":"Scenic drive or optional flight; afternoon game drive."},{"day":2,"title":"Full day Mara","description":"Sunrise to sunset exploring the reserve."},{"day":3,"title":"Mara & community","description":"Morning drive; cultural visit; evening sundowner."},{"day":4,"title":"Return","description":"Final short drive; return to Nairobi after breakfast."}]',
  '["Transport in 4x4","Park fees","Accommodation & meals on safari","Professional driver-guide"]',
  '["Tips","Balloon safari (optional)","Drinks at camp bar"]',
  '[{"question":"Best time to see migration?","answer":"Roughly July–October for river crossings; wildlife is great year-round."}]',
  3
),
(
  'zanzibar-stone-town-spice',
  'Zanzibar — Stone Town & Spice',
  'Zanzibar, Tanzania',
  'International',
  '6 days',
  125000, 12, 7, 'Easy',
  '2026-08-22',
  'Explore UNESCO Stone Town''s alleys, spice farms, and north-coast beaches. A perfect blend of history, flavour, and Indian Ocean relaxation.',
  '["Stone Town walking tour","Spice farm lunch","Beach extension in Kendwa","Ferry/flight coordination support"]',
  '[{"day":1,"title":"Arrive Zanzibar","description":"Meet & greet; intro walk near your hotel."},{"day":2,"title":"Stone Town","description":"Historical tour, doors, markets, sunset at Forodhani."},{"day":3,"title":"Spice route","description":"Spice farm visit and local cooking demo."},{"day":4,"title":"Beach transfer","description":"Move to north coast; free afternoon."},{"day":5,"title":"Island day","description":"Optional snorkelling or relax by the sea."},{"day":6,"title":"Departure","description":"Transfers to airport or ferry."}]',
  '["5 nights accommodation","Breakfast daily","Tours as listed","Group transfers on Zanzibar"]',
  '["International flights","Visas","Lunch/dinner unless stated","Personal expenses"]',
  '[{"question":"Visa for Tanzania?","answer":"Many nationalities can get e-visa; we send a checklist after you book."}]',
  4
),
(
  'amboseli-elephants',
  'Amboseli Elephants & Kilimanjaro Views',
  'Amboseli, Kenya',
  'Safari',
  '3 days',
  52000, 10, 4, 'Easy',
  '2026-06-07',
  'Iconic herds against the backdrop of Mt Kilimanjaro. Short drive from Nairobi, big skies, and incredible elephant photography.',
  '["Kilimanjaro viewpoints","Elephant research talk (when available)","Sundowner with the group"]',
  '[{"day":1,"title":"To Amboseli","description":"Drive from Nairobi; afternoon game drive."},{"day":2,"title":"Full day park","description":"Morning and afternoon drives; picnic lunch in the park."},{"day":3,"title":"Final drive & return","description":"Sunrise shoot; breakfast; drive back to Nairobi."}]',
  '["Transport","Park fees","Lodge/camp stay","Meals on safari"]',
  '["Tips","Drinks","Personal gear"]',
  '[{"question":"Camera gear?","answer":"Bring zoom lens if you have one; we share shot tips during the trip."}]',
  5
),
(
  'lamu-cultural-islands',
  'Lamu Women''s Island Escape',
  'Lamu, Kenya',
  'Women-Only',
  '5 days',
  68000, 12, 8, 'Easy',
  '2026-09-14',
  'A women-only small-group journey: Swahili architecture, dhow sailing, and slow island time. Stay in Lamu Old Town with a dedicated female lead guide and supportive community vibe.',
  '["Women-only group (18+)","Heritage guesthouse stay","Dhow day trip","Swahili cooking session","Car-free old town walks"]',
  '[{"day":1,"title":"Arrival","description":"Boat transfer; settle in Lamu Old Town."},{"day":2,"title":"Town & history","description":"Guided walk of UNESCO site; free evening."},{"day":3,"title":"Shela & beach","description":"Dhow to Shela; beach time and optional yoga."},{"day":4,"title":"Island flavours","description":"Cooking class and sunset on the waterfront."},{"day":5,"title":"Departure","description":"Breakfast and boat to airport."}]',
  '["Accommodation","Breakfast daily","Activities listed","Local guide"]',
  '["Flights Lamu–Nairobi","Lunch/dinner","Tips"]',
  '[{"question":"How do we reach Lamu?","answer":"We help you book flights from Nairobi or Mombasa; timings shared in welcome pack."}]',
  6
),
(
  'kilimanjaro-machame',
  'Kilimanjaro Machame Route',
  'Kilimanjaro, Tanzania',
  'Hiking',
  '7 days',
  195000, 12, 6, 'Hard',
  '2026-10-05',
  'The "Whiskey Route" — varied scenery from rainforest to arctic summit. Full mountain crew, quality tents, and a paced summit night for the roof of Africa.',
  '["Machame route — high success rate","Professional mountain crew","Nutritious meals on mountain","Pre-trek briefing in Moshi"]',
  '[{"day":1,"title":"Moshi","description":"Arrive, gear check, team dinner."},{"day":2,"title":"Machame gate — camp","description":"Hike through rainforest to first camp."},{"day":3,"title":"Shira plateau","description":"Emerging onto heath and moorland."},{"day":4,"title":"Barranco","description":"Great views; prep for summit push."},{"day":5,"title":"Karanga","description":"Shorter day for acclimatisation."},{"day":6,"title":"Barafu & summit","description":"Summit night to Uhuru Peak; descent to Mweka."},{"day":7,"title":"Out & celebration","description":"Exit park; certificate ceremony; optional hotel night."}]',
  '["Park fees","Camping equipment","All meals on mountain","Guides, cooks, porters","Transfers from Moshi"]',
  '["Flights to Tanzania","Visa","Tips for crew","Sleeping bag rental","Travel insurance"]',
  '[{"question":"Training needed?","answer":"We recommend cardio and hill training 8–12 weeks before; we send a plan."}]',
  7
),
(
  'dubai-weekender',
  'Dubai Weekender',
  'Dubai, UAE',
  'Halal',
  '5 days',
  185000, 16, 9, 'Easy',
  '2026-11-20',
  'Halal-friendly hotels, desert safari, skyline views, and curated dining — a premium city break with Flytrails group pacing and local hosts.',
  '["4★ halal-friendly stay","Desert safari evening","Old Dubai souks & creek","Group airport transfers"]',
  '[{"day":1,"title":"Arrive Dubai","description":"Meet at airport; check-in; evening stroll at Dubai Marina."},{"day":2,"title":"Icons","description":"Burj Khalifa area, Dubai Mall, fountain show."},{"day":3,"title":"Old Dubai","description":"Abra ride, gold & spice souks, Al Fahidi."},{"day":4,"title":"Desert","description":"Afternoon desert safari, dinner, entertainment."},{"day":5,"title":"Departure","description":"Breakfast and transfer out."}]',
  '["Hotel with breakfast","Desert safari","Group transfers","Guided day as listed"]',
  '["International flights","Visa fees","Lunch/dinner","Attraction tickets not listed"]',
  '[{"question":"Is everything halal?","answer":"We select halal-certified or Muslim-friendly venues; dietary needs noted on booking."}]',
  8
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED: BLOG POSTS (existing 6 posts)
-- ============================================================
INSERT INTO blog_posts (slug, title, excerpt, category, read_time, date, featured, sections, closing) VALUES
(
  'packing-guide-maasai-mara',
  'What to Pack for Maasai Mara (Year-Round)',
  'Layers, lenses, and little things that make safari mornings easier — without overpacking.',
  'Safari', '6 min read', '2025-02-10', true,
  '[{"heading":"Start with layers","body":["Mornings and evenings on the Mara can be cool, even when midday is warm. Pack a light fleece, a windbreaker, and a breathable long-sleeve for sun protection.","Neutral colours (khaki, olive, tan) are practical — they hide dust and blend in on drives."]},{"heading":"Gear that matters","body":["Binoculars: if you have one, bring it. If not, don''t stress — our vehicles are set up for spotting.","Camera: zoom lens if you shoot; a phone with a decent telephoto works for many guests.","Power: a small power bank for long game-drive days."]},{"heading":"Don''t forget","body":["Reusable water bottle, sunscreen, lip balm, and a wide-brim hat.","A soft duffel is easier than a rigid suitcase in camp vehicles."]}]',
  'You''ll get a full checklist PDF when you book — Flytrails keeps group sizes small so logistics stay human.'
),
(
  'best-time-mt-kenya',
  'Best Time to Hike Mt Kenya',
  'Dry seasons, crowds, and how to pick a window that matches your fitness and schedule.',
  'Hiking', '5 min read', '2025-01-22', true,
  '[{"heading":"Dry seasons","body":["January–February and July–October offer the most stable weather on the mountain. Trails are firmer, views clearer, and summit mornings less likely to be socked in by storms."]},{"heading":"Shoulder months","body":["March and November can work with flexible dates — you may get short showers, but trails are quieter. We adjust pacing and add buffer days when needed."]},{"heading":"Your fitness window","body":["Pick dates that match your training schedule, not only the weather. A prepared hiker in a wetter week often has a better experience than a rushed hiker in perfect skies."]}]',
  'Questions? Ask us on WhatsApp — we''ll match you to a departure that fits.'
),
(
  'solo-female-travel-east-africa',
  'Solo Female Travel in East Africa: Tips',
  'Safety, community, and how group travel can be the perfect first step.',
  'Travel Tips', '7 min read', '2024-12-05', false,
  '[]', null
),
(
  'first-group-trip',
  'What to Expect on Your First Group Trip',
  'Pacing, personalities, and why the first day always feels like a reunion.',
  'Community', '4 min read', '2024-11-18', false,
  '[]', null
),
(
  'budget-travel-kenya',
  'Budget Travel Tips for Kenya',
  'Smart splurges, local eats, and how to stretch your shilling without missing the magic.',
  'Budget', '8 min read', '2024-10-30', false,
  '[]', null
),
(
  'zanzibar-guide',
  'A Short Guide to Zanzibar',
  'Stone Town, spices, and the beaches worth the extra ferry ride.',
  'International', '6 min read', '2024-09-12', false,
  '[]', null
)
ON CONFLICT (slug) DO NOTHING;
