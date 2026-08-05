import { Link } from 'react-router-dom';
import { CalendarClock, ChevronRight, MapPin } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import { useTrips } from '../hooks/useApi.js';
import { pageHeroImages } from '../data/pageHeroImages.js';
import useCountdown from '../hooks/useCountdown.js';
import { isTripExpired } from '../utils/tripStatus.js';

function formatKes(n) {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n);
}

function Countdown({ date }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(date);
  if (expired) {
    return <span className="text-sm font-bold text-emerald-700">Adventure accomplished</span>;
  }
  return (
    <div className="grid grid-cols-4 gap-2 text-center text-sm md:gap-3">
      {[
        [days, 'days'],
        [hours, 'hrs'],
        [minutes, 'min'],
        [seconds, 'sec'],
      ].map(([val, lab]) => (
        <div key={lab} className="rounded-xl border border-white/30 bg-white/30 px-2 py-2 backdrop-blur-sm md:px-3">
          <span className="block font-display text-lg font-bold text-primary md:text-xl">{val}</span>
          <span className="text-[10px] font-extralight uppercase tracking-wide text-brand-dark/55">{lab}</span>
        </div>
      ))}
    </div>
  );
}

export default function UpcomingTrips() {
  const { data: tripsData } = useTrips();
  const sorted = [...(tripsData || [])].sort(
    (a, b) => new Date(a.nextDeparture) - new Date(b.nextDeparture)
  );

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(212,169,106,0.08),transparent_45%)]" />
      <PageHero
        imageUrl={pageHeroImages.upcoming}
        imageAlt="Mountain trail above the clouds — East Africa hiking"
        title="Upcoming trips"
        subtitle="Sorted by departure — countdown to the next adventure."
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 md:px-6">
        <div className="space-y-6">
          {sorted.map((trip) => {
            const expired = isTripExpired(trip.nextDeparture);
            const almostFull = !expired && trip.spotsLeft <= 3 && trip.spotsLeft > 0;
            const soldOut = !expired && trip.spotsLeft === 0;
            return (
              <article
                key={trip.id}
                className={`overflow-hidden rounded-3xl border shadow-lg backdrop-blur-xl md:flex ${
                  expired
                    ? 'border-brand-dark/10 bg-white/15'
                    : 'border-white/35 bg-white/25'
                }`}
              >
                <Link
                  to={`/trips/${trip.slug}`}
                  className="relative block aspect-[16/10] md:w-80 md:shrink-0 md:aspect-auto md:min-h-[240px]"
                >
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className={`h-full w-full object-cover ${expired ? 'grayscale' : ''}`}
                  />
                  {expired && <div className="absolute inset-0 bg-brand-dark/35" aria-hidden />}
                  {expired && (
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      Adventure accomplished
                    </span>
                  )}
                  {soldOut && (
                    <span className="absolute left-3 top-3 rounded-full bg-brand-dark/90 px-3 py-1 text-xs font-bold text-brand-light backdrop-blur-sm">
                      Sold Out
                    </span>
                  )}
                  {almostFull && (
                    <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-brand-dark">
                      Almost full
                    </span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
                  <div className={expired ? 'opacity-60' : ''}>
                    <h2
                      className={`font-display text-xl font-bold md:text-2xl ${
                        expired ? 'text-brand-dark/70' : 'text-brand-dark'
                      }`}
                    >
                      <Link
                        to={`/trips/${trip.slug}`}
                        className={`transition ${expired ? 'hover:text-brand-dark/80' : 'hover:text-primary'}`}
                      >
                        {trip.title}
                      </Link>
                    </h2>
                    <p className="mt-2 flex items-center gap-1.5 font-light text-brand-dark/75">
                      <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      {trip.location}
                    </p>
                    {!expired && (
                      <p className="mt-3 flex items-center gap-2 text-sm font-extralight text-brand-dark/65">
                        <CalendarClock className="h-4 w-4 text-brand-dark/45" aria-hidden />
                        Departs{' '}
                        {new Date(trip.nextDeparture).toLocaleDateString('en-KE', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                  {expired && (
                    <p className="mt-3 flex items-center gap-2 text-sm font-bold text-emerald-700">
                      <CalendarClock className="h-4 w-4 text-emerald-600" aria-hidden />
                      Adventure accomplished
                    </p>
                  )}
                  <div className="mt-6 flex flex-col gap-4 border-t border-brand-dark/10 pt-6 md:flex-row md:items-center md:justify-between">
                    <Countdown date={trip.nextDeparture} />
                    <div className={`text-left md:text-right ${expired ? 'opacity-60' : ''}`}>
                      <p className="text-xs font-extralight text-brand-dark/60">
                        {expired || soldOut ? '—' : `${trip.spotsLeft} spots left`}
                      </p>
                      <p
                        className={`font-display text-2xl font-bold ${
                          expired ? 'text-brand-dark/50' : 'text-primary'
                        }`}
                      >
                        {formatKes(trip.price)}
                      </p>
                      <Link
                        to={`/trips/${trip.slug}`}
                        className={`mt-2 inline-flex items-center gap-1 text-sm font-semibold hover:underline ${
                          expired ? 'text-brand-dark/60' : 'text-primary'
                        }`}
                      >
                        View details
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
