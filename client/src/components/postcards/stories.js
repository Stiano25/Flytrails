import { useMemo } from 'react';
import { useCustomerReviews, useTestimonials } from '../../hooks/useApi.js';
import { findTripType } from '../../data/tripTypes.js';

/** Words in a story that tell us what kind of trip it was (matches the trip finder's types). */
const TYPE_HINTS = {
  hiking: /hik|mount kenya|mt\.? kenya|kilimanjaro|ololokwe|summit|climb|elephant hill|trek|waterfall/i,
  safari: /maasai mara|\bmara\b|samburu|safari|game drive|wildlife|lion|giraffe/i,
  group: /\bgroup\b|friends|birthday|\bteam\b/i,
  family: /\bkids?\b|family|children/i,
  camping: /\bcamp/i,
  beach: /beach|diani|zanzibar|watamu|coast|lamu/i,
  honeymoon: /honeymoon|anniversary/i,
  halal: /halal/i,
};

/** Places we can recognise in a story: name for the postmark, photo for the stamp. */
const PLACES = [
  [/hell.?s gate/i, 'Hell’s Gate', '/images/trip-types/family.jpg'],
  [/mount kenya|mt\.? kenya/i, 'Mount Kenya', '/images/trip-types/hiking.jpg'],
  [/maasai mara|\bmara\b/i, 'Maasai Mara', '/images/trip-types/safari.jpg'],
  [/samburu/i, 'Samburu', '/images/seasons/migration.jpg'],
  [/ololokwe/i, 'Ololokwe', '/images/seasons/dry.jpg'],
  [/tigoni/i, 'Tigoni', '/images/seasons/long-rains.jpg'],
  [/kilimanjaro/i, 'Kilimanjaro', '/images/trip-types/hiking.jpg'],
  [/diani/i, 'Diani', '/images/trip-types/beach.jpg'],
  [/zanzibar/i, 'Zanzibar', '/images/trip-types/honeymoon.jpg'],
];

/** Filter labels that read better for stories than the finder's wording. */
const FILTER_LABELS = { group: 'Group trips' };

/** Stamp photos for stories we can't place, used in turn so neighbouring postcards differ. */
const STAMP_FALLBACKS = ['/images/trip-types/group.jpg', '/images/trip-types/camping.jpg', '/images/trip-types/international.jpg'];

const tidy = (text) => String(text || '').replace(/^[\s⭐★*]+/, '').trim();

function toStory({ id, name, text, detail = '', photo = '', rating = null, date = null, reply = '' }, index) {
  const haystack = `${detail} ${text}`;
  const types = Object.keys(TYPE_HINTS).filter((k) => TYPE_HINTS[k].test(haystack));
  const match = PLACES.find(([re]) => re.test(haystack));
  const when = date
    ? new Date(date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : detail.match(/\b(20\d{2})\b/)?.[1] || '';
  return {
    id,
    name,
    text,
    rating,
    when,
    reply,
    types,
    place: match?.[1] || 'Kenya',
    stamp: photo || match?.[2] || STAMP_FALLBACKS[index % STAMP_FALLBACKS.length],
  };
}

/**
 * Testimonials and approved customer reviews as one list of postcard stories (read-only),
 * plus the average rating and the trip filters that have at least two stories behind them.
 */
export function useStories() {
  const { data: testimonials, loading: loadingT } = useTestimonials();
  const { data: reviews, loading: loadingR } = useCustomerReviews();

  return useMemo(() => {
    const stories = [
      ...(testimonials || []).map((t, i) =>
        toStory({ id: `t-${t.id}`, name: t.authorName, text: tidy(t.quote), detail: t.authorDetail, photo: t.authorImageUrl }, i)
      ),
      ...(reviews || []).map((r, i) =>
        toStory({ id: `r-${r.id}`, name: r.authorName, text: tidy(r.body), rating: r.rating, date: r.createdAt, reply: r.adminReply }, i)
      ),
    ].filter((s) => s.text);

    const rated = (reviews || []).filter((r) => r.rating);
    const average = rated.length ? rated.reduce((sum, r) => sum + r.rating, 0) / rated.length : 0;

    const counts = {};
    stories.forEach((s) => s.types.forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
    const filters = Object.entries(counts)
      .filter(([value, count]) => findTripType(value) && count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count, label: FILTER_LABELS[value] || findTripType(value).label }));

    return { stories, filters, average, ratedCount: rated.length, loading: loadingT || loadingR };
  }, [testimonials, reviews, loadingT, loadingR]);
}
