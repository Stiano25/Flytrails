# Flytrails — image checklist

**Primary source:** all illustrative photos use **Unsplash** URLs in code (`images.unsplash.com`). Replace with your own files under `client/public/images/` when ready — then update the paths in the files below.

**Contact — location:** uses an **Unsplash** image of Nairobi (`config.js` → `CONTACT_LOCATION_IMAGE`); the image links to Google Maps in a new tab (no map iframe).

**Suggested export settings (web):** JPEG or WebP, **width 1920px** for heroes, **1200–1600px** for trip cards, **800px** for thumbs/gallery tiles, **~80%** quality. Always keep **alt text** meaningful in JSX.

---

## 1. Brand & chrome

| Asset | Purpose | Current | Replace with |
|-------|---------|---------|--------------|
| Favicon | Browser tab | `client/public/favicon.svg` | Optional: `favicon.ico` + SVG |
| Logo | If you switch from text logo | — | e.g. `public/images/logo.svg` + dark variant |

---

## 2. Home page

### Hero carousel (`client/src/components/home/HeroCarousel.jsx`)

| # | Role | Suggested subject | Current Unsplash (reference) |
|---|------|-------------------|------------------------------|
| 1 | Hiking / peaks | Mt Kenya or trail | `photo-1589556264800-07ae6b5a3d0b` |
| 2 | Safari | Mara / wildlife | `photo-1516426122078-c23e763b01e2` |
| 3 | Beach / coast | Diani / ocean | `photo-1507525428034-b723cf961d3e` |
| 4 | International | City / Dubai-style | `photo-1512453979798-5ea266f8880c` |

### Category strip (`client/src/components/home/CategoryScroller.jsx`)

| # | Category | Suggested subject | Current ref ID |
|---|----------|-------------------|----------------|
| 1 | East Africa | Savanna / Kenya wide | `1547471080-4ccac87e992e` |
| 2 | Hiking | Mountain | `1589556264800-07ae6b5a3d0b` |
| 3 | Safari | Wildlife | `1516426122078-c23e763b01e2` |
| 4 | Beach | Ocean | `1507525428034-b723cf961d3e` |
| 5 | International | Travel / road | `1488085061387-42e27b586017` |
| 6 | Women-only | Group / coast | `1506905925346-21bda4d32df4` |

### “Popular adventures” cards

Uses **`client/src/data/trips.js`** → field `image` per trip (8 trips). See section 5.

### “Moments worth sharing” (first 9 gallery items)

Uses **`client/src/data/galleryImages.js`** → first 9 entries. See section 6.

### Bottom CTA band (`client/src/pages/Home.jsx`)

| Role | Suggested | Current ref |
|------|-----------|---------------|
| Full-width mood background | Mountains / landscape | `photo-1469474968028-56623f04eac6` |

---

## 3. Trips data — one hero image per trip (`client/src/data/trips.js`)

| Trip | Slug | Suggested real photo | Unsplash ref (placeholder) |
|------|------|----------------------|----------------------------|
| Mt Kenya Sirimon | `mt-kenya-sirimon` | Mt Kenya / hiking | `1589556264800-07ae6b5a3d0b` |
| Diani Beach | `diani-beach-escape` | Beach / coast | `1507525428034-b723cf961d3e` |
| Maasai Mara | `maasai-mara-classic` | Safari / plains | `1516426122078-c23e763b01e2` |
| Zanzibar | `zanzibar-stone-town-spice` | Stone Town / island | `1586861635167-e5223aadc9fe` |
| Amboseli | `amboseli-elephants` | Elephants / Kili view | `1564760055772-d63b2a4ad1b2` |
| Lamu | `lamu-cultural-islands` | Lamu / dhow | `1506905925346-21bda4d32df4` |
| Kilimanjaro | `kilimanjaro-machame` | Kili / trek | `1544735716-392fe2489ffa` |
| Dubai | `dubai-weekender` | Dubai skyline | `1512453979798-5ea266f8880c` |

---

## 4. Gallery page (`client/src/data/galleryImages.js`)

**22 images** — each needs: **landscape photo** + **caption (location label)**.  
Unsplash IDs used (replace with your own files 1–22 if you prefer):

`1516426122078-c23e763b01e2`, `1589556264800-07ae6b5a3d0b`, `1507525428034-b723cf961d3e`, `1564760055772-d63b2a4ad1b2`, `1547471080-4ccac87e992e`, `1506905925346-21bda4d32df4`, `1544735716-392fe2489ffa`, `1586861635167-e5223aadc9fe`, `1483086431886-44fe2d7ca2c3`, `1516026672322-bc52d61a55d5`, `1470071459604-3b5ec3a7fe05`, `1501785887931-04e70757bbf2`, `1493246507139-2e4b2403e5b8`, `1605559424843-9e9c7157360c`, `1569154941061-e609b6c9e0f8`, `1512453979798-5ea266f8880c`, `1488085061387-42e27b586017`, `1469474968028-56623f04eac6`, `1500530854329-58648383bb59`, `1433838552652-f646a11805e0`, `1504280390367-361c6d9f16f8`

*(Note: one ID repeats for “Big cats” — swap for a distinct file if you replace assets.)*

---

## 5. Blog listing (`client/src/data/blogPosts.js`)

**6 cover images** — one per post:

| Slug (topic) | Unsplash ref (placeholder) |
|----------------|----------------------------|
| `packing-guide-maasai-mara` | `1516426122078-c23e763b01e2` |
| `best-time-mt-kenya` | `1589556264800-07ae6b5a3d0b` |
| `solo-female-travel-east-africa` | `1516026672322-bc52d61a55d5` |
| `first-group-trip` | `1529156069898-49953e39b3ac` |
| `budget-travel-kenya` | `1483086431886-44fe2d7ca2c3` |
| `zanzibar-guide` | `1586861635167-e5223aadc9fe` |

---

## 6. About page (`client/src/pages/About.jsx`)

| Asset | Purpose | Current |
|-------|---------|---------|
| Hero background | Team / nature | `photo-1529156069898-49953e39b3ac` |
| Founder / story photo | Hamza Majid Hassan | `photo-1507003211169-0a1dd7228f2d` *(generic portrait — replace with real)* |
| Team member 1 | Director | Unsplash portrait `photo-1560250097-0b93528c311c` (placeholder) |
| Team member 2 | Operations | Unsplash portrait `photo-1573496359142-b8d87734a5a2` (placeholder) |
| Team member 3 | Guide | Unsplash portrait `photo-1472099645785-5658abf4ff4e` (placeholder) |

**You should supply:** 1 real **founder headshot** (square or 4:5), **3 team photos** — until then, stock Unsplash portraits are used.

---

## 7. Optional: testimonials (if you re-enable a section)

Use **Unsplash** portrait URLs (same pattern as About team: `?w=256&h=256&fit=crop&crop=faces`) or local files under `public/images/`.

---

## 8. Count summary

| Bucket | Count |
|--------|------:|
| Hero slides | 4 |
| Category tiles | 6 |
| Trip covers (unique trips) | 8 |
| Gallery | 22 |
| Blog covers | 6 |
| About (hero + founder + 3 team) | 5 photos + 3 Unsplash portrait crops |
| Home CTA background | 1 |
| **Typical “shoot your own” minimum** | **~40+ distinct photos** if nothing is reused |

Many placeholders **reuse** the same Unsplash ID; for production you’ll want **unique** shots per trip and gallery slot.

---

## Page hero banners (Unsplash)

- `client/src/data/pageHeroImages.js` — **`trips`**, **`upcoming`**, **`homeCta`**
- **Trips** (`/trips`): `components/PageHero.jsx` + `pageHeroImages.trips`
- **Upcoming** (`/upcoming-trips`): `PageHero` + `pageHeroImages.upcoming`
- **Home** bottom CTA: `pageHeroImages.homeCta` in `pages/Home.jsx`

---

## 9. Quick find in code

- Trips: `client/src/data/trips.js` → `image`
- Gallery: `client/src/data/galleryImages.js` → `url`
- Blog: `client/src/data/blogPosts.js` → `image`
- Home hero: `client/src/components/home/HeroCarousel.jsx` → `image`
- Home categories: `client/src/components/home/CategoryScroller.jsx` → `img`
- Home CTA: `client/src/pages/Home.jsx` → bottom `<img>`
- About: `client/src/pages/About.jsx` → hero + founder `<img>`, team `avatar` URLs
