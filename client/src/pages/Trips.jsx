import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Compass, Luggage, RotateCcw } from 'lucide-react';
import { useTrips } from '../hooks/useApi.js';
import { tripTypes } from '../data/tripTypes.js';
import { TripCard, typeFor } from '../components/home/TripsShowcase.jsx';
import PageHeader from '../components/site/PageHeader.jsx';
import NextStep from '../components/site/NextStep.jsx';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const selectClass =
  'min-h-[44px] rounded-full border border-brand-dark/15 bg-white px-4 pr-9 text-sm font-medium text-brand-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25';

function nextMonths() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return { value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) };
  });
}

/**
 * All trips, filtered the same way the home finder asks: what kind of trip, which month, how many people.
 * Reads the finder's parameters (?type=safari&month=2026-10&group=4, and older ?category=Hiking links),
 * splits upcoming departures from past trips, and never dead-ends: with no match it offers to plan the trip.
 */
export default function Trips() {
  const [params, setParams] = useSearchParams();
  const { data, loading } = useTrips();
  const months = useMemo(nextMonths, []);

  const type = params.get('type') || typeFor({ category: params.get('category') || '' }) || '';
  const month = params.get('month') || '';
  const group = Number.parseInt(params.get('group') || '', 10) || 0;
  const view = params.get('view') === 'past' ? 'past' : 'upcoming';

  function set(key, value) {
    const next = new URLSearchParams(params);
    next.delete('category');
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const trips = data || [];
  const isPast = (t) => t.nextDeparture && new Date(t.nextDeparture) < today;
  const inView = trips.filter((t) => (view === 'past' ? isPast(t) : !isPast(t)));
  const shown = inView
    .filter((t) => !type || typeFor(t) === type)
    .filter((t) => !month || (t.nextDeparture && t.nextDeparture.slice(0, 7) === month))
    .filter((t) => !group || view === 'past' || !t.spotsLeft || t.spotsLeft >= group)
    .sort((a, b) =>
      view === 'past'
        ? new Date(b.nextDeparture) - new Date(a.nextDeparture)
        : new Date(a.nextDeparture || '2999-01-01') - new Date(b.nextDeparture || '2999-01-01')
    );

  const filtersOn = Boolean(type || month || group);
  const planParams = new URLSearchParams({ plan: '1', ...(type ? { type } : {}) });
  const planHref = `/?${planParams}`;

  return (
    <div>
      <PageHeader
        eyebrow="Trips"
        title="Find your"
        accent="next trip"
        description="Filter the way the trip finder asks: what kind of trip, when, and how many of you."
      >
        <div className="mx-auto max-w-6xl space-y-4 px-4 pb-5 md:px-6">
          <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Trip type">
            {[{ value: '', label: 'All trips' }, ...tripTypes].map((t) => {
              const selected = type === t.value;
              return (
                <button
                  key={t.value || 'all'}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => set('type', t.value)}
                  className={`inline-flex min-h-[40px] shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-150 ${ring} ${
                    selected ? 'border-brand-orange bg-brand-orange text-brand-dark' : 'border-brand-dark/15 bg-white text-brand-dark/80 hover:border-brand-dark/40'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label>
              <span className="sr-only">Month</span>
              <select value={month} onChange={(e) => set('month', e.target.value)} className={selectClass}>
                <option value="">Any month</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Group size</span>
              <select value={group || ''} onChange={(e) => set('group', e.target.value)} className={selectClass}>
                <option value="">Any group size</option>
                {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20].map((n) => (
                  <option key={n} value={n}>
                    {n === 1 ? '1 person' : `${n} people`}
                  </option>
                ))}
              </select>
            </label>
            <div className="ml-auto inline-flex rounded-full bg-brand-dark/[0.06] p-1" role="tablist" aria-label="Upcoming or past trips">
              {[
                ['upcoming', 'Upcoming'],
                ['past', 'Past trips'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={view === value}
                  onClick={() => set('view', value === 'past' ? 'past' : '')}
                  className={`min-h-[36px] rounded-full px-4 text-sm font-medium transition-colors ${ring} ${
                    view === value ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-dark/60 hover:text-brand-dark'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6" aria-live="polite">
        {loading && !trips.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-80 animate-pulse rounded-[22px] bg-brand-dark/[0.06]" />
            ))}
          </ul>
        ) : shown.length ? (
          <>
            <p className="mb-5 text-sm text-brand-dark/60">
              {shown.length} {view === 'past' ? 'past' : 'upcoming'} {shown.length === 1 ? 'trip' : 'trips'}
            </p>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((trip) => (
                <li key={trip.id}>
                  <TripCard trip={trip} past={view === 'past'} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          // Never a dead end: nothing published (or nothing matching) becomes an invitation to plan it.
          <div className="mx-auto max-w-xl rounded-[22px] border border-brand-dark/10 bg-white px-6 py-10 text-center shadow-[0_18px_40px_-28px_rgba(13,27,42,0.5)]">
            <Compass className="mx-auto h-10 w-10 text-brand-orange" strokeWidth={1.5} aria-hidden />
            <p className="mt-4 text-xl font-semibold text-brand-dark">
              {trips.length
                ? 'Nothing matches that just yet.'
                : view === 'past'
                  ? 'Past trips will show here.'
                  : 'New departures are on the way.'}
            </p>
            <p className="mt-2 text-[15px] text-brand-dark/65">
              Tell us what you have in mind and we’ll plan it around your dates, whether or not it’s on the calendar.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                to={planHref}
                className={`inline-flex min-h-[48px] items-center gap-2 rounded-full bg-brand-orange px-6 text-[15px] font-semibold text-brand-dark transition-colors hover:bg-[#f4a53f] ${ring}`}
              >
                <Luggage className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                Plan my trip
              </Link>
              {filtersOn && (
                <button
                  type="button"
                  onClick={() => setParams(view === 'past' ? { view: 'past' } : {}, { replace: true })}
                  className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-sm font-medium text-brand-dark/70 hover:text-brand-dark ${ring}`}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      <NextStep
        title="Don’t see the one?"
        text="Private and custom trips are planned around your dates, budget and group."
        secondary={{ to: '/custom-tours', label: 'Private & custom tours' }}
      />
    </div>
  );
}
