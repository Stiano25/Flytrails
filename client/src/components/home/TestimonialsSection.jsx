import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useCustomerReviews, useTestimonials } from '../../hooks/useApi.js';
import { findTripType } from '../../data/tripTypes.js';
import FinderPicker from './FinderPicker.jsx';

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

const MAX_PREVIEW = 260;

function tidy(text) {
  return String(text || '').replace(/^[\s⭐★*]+/, '').trim();
}

function toStory({ id, name, text, detail = '', photo = '', rating = null, date = null, reply = '' }, index) {
  const haystack = `${detail} ${text}`;
  const types = Object.keys(TYPE_HINTS).filter((k) => TYPE_HINTS[k].test(haystack));
  const match = PLACES.find(([re]) => re.test(haystack));
  const place = match?.[1] || 'Kenya';
  const stamp = photo || match?.[2] || STAMP_FALLBACKS[index % STAMP_FALLBACKS.length];
  const when = date
    ? new Date(date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : detail.match(/\b(20\d{2})\b/)?.[1] || '';
  return { id, name, text, stamp, rating, when, place, reply, types };
}

function Stars({ value = 5, className = 'h-3.5 w-3.5' }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${className} ${i < value ? 'fill-accent text-accent' : 'text-brand-dark/20'}`} strokeWidth={1.5} aria-hidden />
      ))}
    </span>
  );
}

/** Perforated stamp: the traveller's photo, or a photo of the place they went. */
function Stamp({ story, className = '' }) {
  return (
    <span className={`postcard-stamp block shrink-0 rotate-2 shadow-sm ${className}`} aria-hidden>
      <img src={story.stamp} alt="" loading="lazy" className="h-full w-full object-cover" />
    </span>
  );
}

function Postmark({ story }) {
  return (
    <span
      className="pointer-events-none flex h-[84px] w-[84px] -rotate-12 flex-col items-center justify-center rounded-full border-[1.5px] border-primary/45 text-center text-primary/60"
      aria-hidden
    >
      <span className="max-w-[74px] truncate text-[9px] font-semibold uppercase tracking-[0.06em]">{story.place}</span>
      <span className="my-0.5 h-px w-10 bg-primary/35" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em]">{story.when}</span>
    </span>
  );
}

function Postcard({ story, index, onOpen }) {
  const long = story.text.length > MAX_PREVIEW;
  const tilt = index % 2 === 0 ? 'rotate-[-0.8deg]' : 'rotate-[0.8deg]';
  return (
    <li className="w-[min(86vw,23rem)] shrink-0 snap-center sm:w-[36rem]">
      <article
        className={`postcard-paper relative flex h-full flex-col rounded-md border border-[#e7dcc6] p-5 shadow-[0_18px_40px_-20px_rgba(13,27,42,0.45)] transition duration-200 hover:-translate-y-1 hover:rotate-0 motion-reduce:rotate-0 motion-reduce:transition-none sm:min-h-[19rem] sm:flex-row sm:gap-6 sm:p-7 ${tilt}`}
      >
        {/* Message side */}
        <div className="flex min-w-0 flex-1 flex-col pr-16 sm:pr-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-dark/45">
            {story.place} {story.when ? `· ${story.when}` : ''}
          </p>
          <blockquote className="mt-3 flex-1 font-heading text-[19px] italic leading-snug text-brand-dark/90 sm:text-xl">
            <p className="line-clamp-6 whitespace-pre-line">“{long ? `${story.text.slice(0, MAX_PREVIEW).trimEnd()}…` : story.text}”</p>
          </blockquote>
          {long && (
            <button
              type="button"
              onClick={() => onOpen(story)}
              className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full text-sm font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Read the full postcard
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          )}
          {/* Phone: signature under the message */}
          <div className="mt-5 flex items-end justify-between gap-3 border-t border-dashed border-[#d9ccb2] pt-3 sm:hidden">
            <p className="font-script text-[28px] leading-none text-primary">{story.name}</p>
            {story.rating ? <Stars value={story.rating} /> : null}
          </div>
        </div>

        {/* Address side: divider, stamp, postmark, signature on ruled lines */}
        <div className="hidden w-44 shrink-0 flex-col border-l border-[#d9ccb2] pl-6 sm:flex">
          <div className="relative flex justify-end">
            <Stamp story={story} className="h-[104px] w-[86px]" />
            <span className="absolute -left-2 top-12">
              <Postmark story={story} />
            </span>
          </div>
          <div className="mt-auto">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-dark/40">From</p>
            <p className="mt-1 border-b border-[#d9ccb2] pb-1 font-script text-[30px] leading-tight text-primary">{story.name}</p>
            <div className="mt-2.5 border-b border-[#d9ccb2] pb-1.5">
              {story.rating ? <Stars value={story.rating} /> : <span className="text-xs text-brand-dark/45">Flytrails traveller</span>}
            </div>
          </div>
        </div>

        {/* Phone: stamp in the corner */}
        <Stamp story={story} className="absolute right-4 top-4 h-[68px] w-[56px] sm:hidden" />
      </article>
    </li>
  );
}

export default function TestimonialsSection() {
  const { data: testimonials } = useTestimonials();
  const { data: reviews } = useCustomerReviews();
  const reduce = useReducedMotion();
  const trackRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [fromPlan, setFromPlan] = useState(false);
  const [openStory, setOpenStory] = useState(null);
  const lastOpener = useRef(null);

  const stories = useMemo(() => {
    const fromTestimonials = (testimonials || []).map((t) =>
      toStory({ id: `t-${t.id}`, name: t.authorName, text: tidy(t.quote), detail: t.authorDetail, photo: t.authorImageUrl }, 0)
    );
    const fromReviews = (reviews || []).map((r, i) =>
      toStory({ id: `r-${r.id}`, name: r.authorName, text: tidy(r.body), rating: r.rating, date: r.createdAt, reply: r.adminReply }, i)
    );
    return [...fromTestimonials, ...fromReviews].filter((s) => s.text);
  }, [testimonials, reviews]);

  const rated = (reviews || []).filter((r) => r.rating);
  const average = rated.length ? rated.reduce((sum, r) => sum + r.rating, 0) / rated.length : 0;

  const filters = useMemo(() => {
    const counts = {};
    stories.forEach((s) => s.types.forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
    // Only offer a filter when it has at least two stories behind it.
    return Object.entries(counts)
      .filter(([value, count]) => findTripType(value) && count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count, label: FILTER_LABELS[value] || findTripType(value).label }));
  }, [stories]);

  const shown = filter === 'all' ? stories : stories.filter((s) => s.types.includes(filter));

  // When someone picks a trip type in the hero finder, show matching postcards (if we have any).
  useEffect(() => {
    const onFinder = (e) => {
      if (e.detail?.step !== 'choose:type') return;
      const type = e.detail.type;
      if (type && filters.some((f) => f.value === type)) {
        setFilter(type);
        setFromPlan(true);
      }
    };
    window.addEventListener('flytrails:finder', onFinder);
    return () => window.removeEventListener('flytrails:finder', onFinder);
  }, [filters]);

  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0, behavior: 'auto' });
  }, [filter]);

  function scrollByCard(dir) {
    const track = trackRef.current;
    const card = track?.querySelector('li');
    if (!track || !card) return;
    track.scrollBy({ left: dir * (card.getBoundingClientRect().width + 24), behavior: reduce ? 'auto' : 'smooth' });
  }

  function openFull(story) {
    lastOpener.current = document.activeElement;
    setOpenStory(story);
  }

  function closeFull() {
    setOpenStory(null);
    requestAnimationFrame(() => lastOpener.current?.focus({ preventScroll: true }));
  }

  if (!stories.length) return null;

  const activeLabel = filters.find((f) => f.value === filter)?.label;

  return (
    <section aria-labelledby="postcards-title" className="relative overflow-hidden bg-[#f4efe4] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6326]">Postcards from our travellers</p>
            <h2 id="postcards-title" className="mt-2 font-heading text-[2.6rem] font-semibold leading-[1.02] text-brand-dark md:text-6xl">
              Stories from the trail
            </h2>
            {average > 0 && (
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-brand-dark/75">
                <Stars value={Math.round(average)} className="h-4 w-4" />
                <span>
                  <strong className="font-semibold text-brand-dark">{average.toFixed(1)}</strong> average from {rated.length} reviews
                </span>
                <Link
                  to="/reviews"
                  className="inline-flex items-center gap-1 font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Read them all
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </p>
            )}
          </div>
          <div className="hidden gap-2 md:flex">
            {[
              [-1, 'Previous postcards', ChevronLeft],
              [1, 'Next postcards', ChevronRight],
            ].map(([dir, label, Icon]) => (
              <button
                key={label}
                type="button"
                onClick={() => scrollByCard(dir)}
                aria-label={label}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-brand-dark/15 bg-white text-brand-dark transition-colors duration-150 hover:border-brand-dark/40 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Icon className="h-5 w-5" aria-hidden />
              </button>
            ))}
          </div>
        </div>

        {filters.length > 1 && (
          <div className="mt-8">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" role="group" aria-label="Filter postcards by trip">
              {[{ value: 'all', label: 'All stories', count: stories.length }, ...filters].map((f) => {
                const selected = filter === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setFilter(f.value);
                      setFromPlan(false);
                    }}
                    className={`inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-150 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      selected ? 'border-primary bg-primary text-white' : 'border-brand-dark/15 bg-white/70 text-brand-dark hover:border-brand-dark/40'
                    }`}
                  >
                    {f.label}
                    <span className={`text-xs tabular-nums ${selected ? 'text-white/70' : 'text-brand-dark/45'}`}>{f.count}</span>
                  </button>
                );
              })}
            </div>
            {fromPlan && activeLabel && (
              <p className="mt-3 text-sm text-brand-dark/65" aria-live="polite">
                Showing {activeLabel.toLowerCase()} stories to match your plan.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setFilter('all');
                    setFromPlan(false);
                  }}
                  className="font-semibold text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  Show all
                </button>
              </p>
            )}
          </div>
        )}
      </div>

      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label="Traveller postcards"
        className="scrollbar-hide mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto px-[max(1rem,calc((100vw-80rem)/2+1.5rem))] pb-10 pt-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
      >
        {shown.map((story, i) => (
          <Postcard key={story.id} story={story} index={i} onOpen={openFull} />
        ))}
      </ul>

      <FinderPicker
        open={Boolean(openStory)}
        stepKey={openStory?.id || 'none'}
        width={640}
        title={openStory ? `A postcard from ${openStory.name}` : ''}
        subtitle={openStory ? `${openStory.place}${openStory.when ? ` · ${openStory.when}` : ''}` : ''}
        onClose={closeFull}
      >
        {openStory && (
          <div className="postcard-paper rounded-lg border border-[#e7dcc6] p-5 sm:p-6">
            {openStory.rating ? <Stars value={openStory.rating} className="h-4 w-4" /> : null}
            <p className="mt-3 whitespace-pre-line font-heading text-xl italic leading-relaxed text-brand-dark/90">{openStory.text}</p>
            <p className="mt-5 font-script text-[34px] leading-none text-primary">{openStory.name}</p>
            {openStory.reply && (
              <div className="mt-5 border-l-2 border-accent pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-dark/50">Flytrails replied</p>
                <p className="mt-1 text-[15px] text-brand-dark/80">{openStory.reply}</p>
              </div>
            )}
          </div>
        )}
      </FinderPicker>
    </section>
  );
}
