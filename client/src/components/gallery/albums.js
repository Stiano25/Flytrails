/**
 * Group gallery photos into trip albums by place. Gallery rows only carry a free-text location and tags,
 * so we match the location against known destinations; anything unmatched goes into "More moments".
 * `type` is the trip finder type used by "Plan a trip like this".
 */
const DESTINATIONS = [
  { id: 'mount-kenya', title: 'Mount Kenya', region: 'Kenya', type: 'hiking', match: /mt\.? ?kenya|mount kenya|point lenana|lake michaelson|4985|harris tarn/i },
  { id: 'kilimanjaro', title: 'Kilimanjaro', region: 'Tanzania', type: 'hiking', match: /kilimanjaro|kilimajaro|barafu|baranco|barranco/i },
  { id: 'maasai-mara', title: 'Maasai Mara', region: 'Kenya', type: 'safari', match: /mara/i },
  { id: 'samburu', title: 'Samburu', region: 'Kenya', type: 'safari', match: /samburu|buffalo springs/i },
  { id: 'ololokwe', title: 'Mount Ololokwe', region: 'Kenya', type: 'hiking', match: /ololokwe/i },
  { id: 'hells-gate', title: 'Hell’s Gate', region: 'Kenya', type: 'group', match: /hell.?s gate|rock climbing|up on the rocks/i },
  { id: 'waterfalls', title: 'Kanunga Falls', region: 'Kenya', type: 'hiking', match: /kanunga|waterfall/i },
  { id: 'ngare-ndare', title: 'Ngare Ndare', region: 'Kenya', type: 'hiking', match: /ngare ndare/i },
  { id: 'camping', title: 'Camp life', region: 'Kenya', type: 'camping', match: /camp life|camping|limuru/i },
];

/** "MT KENYA(Lake Michaelson)" -> "Mt Kenya (Lake Michaelson)"; keeps mixed-case captions as they are. */
function tidyCaption(text) {
  const t = String(text || '').trim().replace(/\s*\(\s*/g, ' (');
  if (t !== t.toUpperCase()) return t;
  return t.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase()).replace(/\bMt\b/g, 'Mt');
}

export function buildAlbums(images) {
  const albums = new Map();
  const sorted = [...(images || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  for (const img of sorted) {
    if (!img.url) continue;
    const dest = DESTINATIONS.find((d) => d.match.test(img.location || ''));
    const key = dest?.id || 'more';
    if (!albums.has(key)) {
      albums.set(key, {
        id: key,
        title: dest?.title || 'More moments',
        region: dest?.region || 'East Africa',
        type: dest?.type || '',
        photos: [],
      });
    }
    albums.get(key).photos.push({ id: img.id, url: img.url, caption: tidyCaption(img.location) });
  }
  // Biggest albums first; the catch-all always goes last.
  return [...albums.values()].sort((a, b) => (a.id === 'more') - (b.id === 'more') || b.photos.length - a.photos.length);
}
