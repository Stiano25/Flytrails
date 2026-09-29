import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, CircleCheck, Clock, Luggage, MapPin } from 'lucide-react';
import { findTripType } from '../../data/tripTypes.js';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const monthYear = (iso) => new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

const CATEGORY_HINTS = [
  ['hiking', /hik|trek|mountain|climb/],
  ['camping', /camp/],
  ['safari', /safari|game/],
  ['beach', /beach|island|coast/],
  ['international', /international|abroad/],
  ['honeymoon', /honeymoon/],
  ['family', /family/],
  ['group', /group|corporate|team/],
  ['halal', /halal/],
];

/** Finder trip type for a trip's admin category ("Group Experiences" -> "group"), if there is one. */
export function typeFor(trip) {
  const category = String(trip.category || '').toLowerCase();
  return findTripType(category)?.value || CATEGORY_HINTS.find(([, re]) => re.test(category))?.[0];
}

export function TripCard({ trip, past }) {
  const planHref = typeFor(trip) ? `/?plan=1&type=${typeFor(trip)}` : '/?plan=1';
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-brand-dark/10 bg-white shadow-[0_18px_40px_-28px_rgba(13,27,42,0.5)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-26px_rgba(13,27,42,0.55)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-dark/10">
        {trip.image && (
          <img
            src={trip.image}
            alt=""
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04] ${past ? 'saturate-[0.85]' : ''}`}
          />
        )}
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            past ? 'bg-white/90 text-brand-dark' : 'bg-brand-orange text-brand-dark'
          }`}
        >
          {past ? (
            <>
              <CircleCheck className="h-3.5 w-3.5" aria-hidden />
              Completed · {monthYear(trip.nextDeparture)}
            </>
          ) : (
            <>
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              {trip.nextDeparture ? formatDate(trip.nextDeparture) : 'Dates on request'}
            </>
          )}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-snug text-brand-dark">{trip.title}</h3>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brand-dark/60">
          {trip.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {trip.location}
            </span>
          )}
          {trip.duration && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {trip.duration}
            </span>
          )}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          {past ? (
            <Link
              to={planHref}
              className={`inline-flex min-h-[40px] items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.06] px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 ${ring}`}
            >
              <Luggage className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Plan something similar
            </Link>
          ) : (
            <>
              <p className="text-sm text-brand-dark/60">
                {trip.price ? (
                  <>
                    From <strong className="text-base font-semibold text-brand-dark">KES {Number(trip.price).toLocaleString()}</strong>
                  </>
                ) : null}
                {trip.spotsLeft > 0 && trip.spotsLeft <= 5 && (
                  <span className="ml-2 font-medium italic text-[#b5650d]">{trip.spotsLeft} spots left</span>
                )}
              </p>
              <Link
                to={`/trips/${trip.slug}`}
                className={`inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary/90 ${ring}`}
              >
                View trip
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * One featured-trips section: upcoming departures when there are any, otherwise recent trips that have
 * already run (clearly marked as completed, with "Plan something similar"). Hidden when there are no trips.
 */
export default function TripsShowcase({ trips }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dated = (trips || []).filter((t) => t.nextDeparture);
  const upcoming = dated
    .filter((t) => new Date(t.nextDeparture) >= today)
    .sort((a, b) => new Date(a.nextDeparture) - new Date(b.nextDeparture));
  const past = dated
    .filter((t) => new Date(t.nextDeparture) < today)
    .sort((a, b) => new Date(b.nextDeparture) - new Date(a.nextDeparture));

  const isPast = upcoming.length === 0;
  const list = (isPast ? past : upcoming).slice(0, 3);
  if (!list.length) return null;

  return (
    <section aria-labelledby="trips-title" className="bg-brand-bg py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b5650d]">{isPast ? 'Recently completed' : 'Next departures'}</p>
            <h2 id="trips-title" className="mt-2 text-3xl font-semibold tracking-tight text-brand-dark md:text-4xl">
              {isPast ? (
                <>
                  Past <span className="font-light italic">adventures</span>
                </>
              ) : (
                <>
                  Upcoming <span className="font-light italic">trips</span>
                </>
              )}
            </h2>
          </div>
          <Link
            to={isPast ? '/trips' : '/upcoming-trips'}
            className={`inline-flex items-center gap-1 text-sm font-semibold text-primary underline decoration-brand-orange decoration-2 underline-offset-4 hover:text-primary/80 ${ring}`}
          >
            {isPast ? 'See all trips' : 'All departures'}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((trip) => (
            <li key={trip.id}>
              <TripCard trip={trip} past={isPast} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
