import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock, Luggage, MapPin } from 'lucide-react';
import { useTrips } from '../hooks/useApi.js';
import PageHeader from '../components/site/PageHeader.jsx';
import NextStep from '../components/site/NextStep.jsx';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const formatKes = (n) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n || 0);

function daysUntil(iso) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(iso) - today) / 86400000);
}

/** Next departures grouped by month, each with how soon it leaves and how many seats remain. */
export default function UpcomingTrips() {
  const { data, loading } = useTrips();
  const upcoming = (data || [])
    .filter((t) => t.nextDeparture && daysUntil(t.nextDeparture) >= 0)
    .sort((a, b) => new Date(a.nextDeparture) - new Date(b.nextDeparture));

  const byMonth = upcoming.reduce((acc, trip) => {
    const key = new Date(trip.nextDeparture).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    (acc[key] ||= []).push(trip);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        eyebrow="Departures"
        title="Upcoming"
        accent="trips"
        description="Group trips with fixed dates. Seats are limited, so book early for popular months."
        actions={
          <Link to="/trips?view=past" className={`inline-flex items-center gap-1 text-sm font-semibold text-primary underline decoration-brand-orange decoration-2 underline-offset-4 ${ring}`}>
            See past trips
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        }
      />

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        {loading && !data ? (
          <div className="space-y-4" aria-hidden>
            {[0, 1].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-[22px] bg-brand-dark/[0.06]" />
            ))}
          </div>
        ) : upcoming.length ? (
          Object.entries(byMonth).map(([month, trips]) => (
            <div key={month} className="mb-10 last:mb-0">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#b5650d]">{month}</h2>
              <ul className="space-y-4">
                {trips.map((trip) => {
                  const days = daysUntil(trip.nextDeparture);
                  const soldOut = trip.spotsLeft === 0;
                  const almostFull = trip.spotsLeft > 0 && trip.spotsLeft <= 3;
                  return (
                    <li key={trip.id}>
                      <Link
                        to={`/trips/${trip.slug}`}
                        className={`group flex flex-col overflow-hidden rounded-[22px] border border-brand-dark/10 bg-white shadow-[0_18px_40px_-30px_rgba(13,27,42,0.5)] transition hover:-translate-y-0.5 sm:flex-row ${ring}`}
                      >
                        <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-brand-dark/10 sm:aspect-auto sm:w-64">
                          {trip.image && <img src={trip.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />}
                          {(soldOut || almostFull) && (
                            <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${soldOut ? 'bg-brand-dark text-white' : 'bg-brand-orange text-brand-dark'}`}>
                              {soldOut ? 'Sold out' : `${trip.spotsLeft} seats left`}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                          <div>
                            <p className="text-lg font-semibold text-brand-dark group-hover:text-primary">{trip.title}</p>
                            {trip.location && (
                              <p className="mt-1 inline-flex items-center gap-1 text-sm text-brand-dark/60">
                                <MapPin className="h-3.5 w-3.5" aria-hidden />
                                {trip.location}
                              </p>
                            )}
                            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-brand-dark/70">
                              <CalendarClock className="h-4 w-4 text-brand-dark/45" aria-hidden />
                              {new Date(trip.nextDeparture).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                              <span className="italic text-brand-dark/55">· {days === 0 ? 'leaves today' : `in ${days} ${days === 1 ? 'day' : 'days'}`}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                            {trip.price ? (
                              <p className="text-sm text-brand-dark/60">
                                From <strong className="text-base font-semibold text-brand-dark">{formatKes(trip.price)}</strong>
                              </p>
                            ) : null}
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                              View trip
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        ) : (
          <div className="mx-auto max-w-xl rounded-[22px] border border-brand-dark/10 bg-white px-6 py-10 text-center shadow-[0_18px_40px_-28px_rgba(13,27,42,0.5)]">
            <CalendarClock className="mx-auto h-10 w-10 text-brand-orange" strokeWidth={1.5} aria-hidden />
            <p className="mt-4 text-xl font-semibold text-brand-dark">The next dates are being set.</p>
            <p className="mt-2 text-[15px] text-brand-dark/65">Tell us when suits you and we’ll plan around it, or join free to hear about new departures first.</p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/?plan=1" className={`inline-flex min-h-[48px] items-center gap-2 rounded-full bg-brand-orange px-6 text-[15px] font-semibold text-brand-dark hover:bg-[#f4a53f] ${ring}`}>
                <Luggage className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                Plan my trip
              </Link>
              <Link to="/membership" className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-sm font-medium text-brand-dark/75 hover:text-brand-dark ${ring}`}>
                Join free for trip drops
              </Link>
            </div>
          </div>
        )}
      </section>

      <NextStep title="None of these dates work?" text="Private trips run on your dates, with your group." secondary={{ to: '/custom-tours', label: 'Private & custom tours' }} />
    </div>
  );
}
