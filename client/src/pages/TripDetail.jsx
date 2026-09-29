import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Check, ChevronDown, Clock, Gauge, Luggage, MapPin, MessageCircle, Users, X } from 'lucide-react';
import { useTrip } from '../hooks/useApi.js';
import ReserveModal from '../components/ReserveModal.jsx';
import { useWhatsappLink } from '../hooks/useWhatsappLink.js';
import { isTripExpired } from '../utils/tripStatus.js';
import { typeFor } from '../components/home/TripsShowcase.jsx';
import NextStep from '../components/site/NextStep.jsx';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const formatKes = (n) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n || 0);
const longDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

function Section({ title, accent, children }) {
  return (
    <section className="border-t border-brand-dark/10 py-8 first:border-t-0 first:pt-0">
      <h2 className="text-2xl font-semibold tracking-tight text-brand-dark">
        {title} {accent && <span className="font-light italic">{accent}</span>}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * One trip, laid out to help people decide: the key facts first, then the story, the day-by-day plan and
 * what's included. Booking stays in reach (a sticky panel on desktop, a bar at the bottom on phones);
 * trips that have already run switch to "Plan something similar".
 */
export default function TripDetail() {
  const { slug } = useParams();
  const { data: trip, loading, error } = useTrip(slug);
  const [openDay, setOpenDay] = useState(0);
  const [openFaq, setOpenFaq] = useState(-1);
  const [reserveOpen, setReserveOpen] = useState(false);
  const whatsapp = useWhatsappLink();

  if (!loading && (error || !trip)) return <Navigate to="/404" replace />;
  if (loading) return <div className="h-[70vh] animate-pulse bg-brand-bg" aria-hidden />;

  const past = trip.nextDeparture && isTripExpired(trip.nextDeparture);
  const type = typeFor(trip);
  const similarHref = type ? `/?plan=1&type=${type}` : '/?plan=1';
  const askHref = `${whatsapp.split('?')[0]}?text=${encodeURIComponent(`Hi Flytrails, I have a question about ${trip.title}.`)}`;
  const seatsPct = trip.spotsTotal ? Math.round((trip.spotsLeft / trip.spotsTotal) * 100) : 0;

  const facts = [
    { Icon: CalendarDays, label: past ? 'Ran on' : 'Departs', value: trip.nextDeparture ? longDate(trip.nextDeparture) : 'Dates on request' },
    { Icon: Clock, label: 'Duration', value: trip.duration },
    { Icon: Users, label: 'Group', value: trip.spotsTotal ? `Up to ${trip.spotsTotal}` : null },
    { Icon: Gauge, label: 'Difficulty', value: trip.difficulty },
  ].filter((f) => f.value);

  const action = past ? (
    <Link to={similarHref} className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-brand-orange text-[15px] font-semibold text-brand-dark hover:bg-[#f4a53f] ${ring}`}>
      <Luggage className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      Plan something similar
    </Link>
  ) : (
    <button
      type="button"
      onClick={() => setReserveOpen(true)}
      disabled={trip.spotsLeft === 0}
      className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-brand-orange text-[15px] font-semibold text-brand-dark hover:bg-[#f4a53f] disabled:cursor-not-allowed disabled:bg-brand-dark/10 disabled:text-brand-dark/50 ${ring}`}
    >
      {trip.spotsLeft === 0 ? 'Sold out' : 'Reserve my spot'}
    </button>
  );

  return (
    <div className="pb-24 lg:pb-0">
      <header className="relative isolate overflow-hidden bg-brand-dark text-white">
        {trip.image && <img src={trip.image} alt="" className={`absolute inset-0 -z-10 h-full w-full object-cover ${past ? 'saturate-[0.8]' : ''}`} />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-dark/90 via-brand-dark/45 to-brand-dark/20" />
        <div className="mx-auto flex min-h-[min(48vh,420px)] max-w-6xl flex-col justify-between px-4 pb-8 pt-6 md:px-6 md:pb-10">
          <Link to="/trips" className={`inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium backdrop-blur hover:bg-white/20 ${ring}`}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All trips
          </Link>
          <div>
            <p className="flex flex-wrap items-center gap-2 text-sm text-white/80">
              {trip.category && <span className="rounded-full bg-brand-orange px-3 py-0.5 text-xs font-semibold text-brand-dark">{trip.category}</span>}
              {past && <span className="rounded-full bg-white/90 px-3 py-0.5 text-xs font-semibold text-brand-dark">Completed</span>}
              {trip.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" aria-hidden />
                  {trip.location}
                </span>
              )}
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">{trip.title}</h1>
          </div>
        </div>
      </header>

      {/* Key facts first. */}
      <div className="border-b border-brand-dark/10 bg-brand-bg">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-4 px-4 py-5 md:grid-cols-4 md:px-6">
          {facts.map(({ Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#b5650d]" aria-hidden />
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-brand-dark/50">{label}</dt>
                <dd className="text-[15px] font-medium text-brand-dark">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:px-6 lg:grid-cols-[1fr_20rem]">
        <div>
          {trip.description && (
            <Section title="The" accent="trip">
              <p className="whitespace-pre-line text-[17px] leading-[1.8] text-brand-dark/80">{trip.description}</p>
            </Section>
          )}

          {trip.highlights?.length > 0 && (
            <Section title="Highlights">
              <ul className="grid gap-3 sm:grid-cols-2">
                {trip.highlights.map((h) => (
                  <li key={h} className="flex gap-2.5 text-[15px] text-brand-dark/80">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {trip.itinerary?.length > 0 && (
            <Section title="Day by" accent="day">
              <ol className="relative space-y-2 border-l border-brand-dark/15 pl-6">
                {trip.itinerary.map((d, i) => {
                  const open = openDay === i;
                  return (
                    <li key={`${d.day}-${d.title}`} className="relative">
                      <span className={`absolute -left-[31px] top-3.5 h-3 w-3 rounded-full border-2 ${open ? 'border-brand-orange bg-brand-orange' : 'border-brand-dark/30 bg-white'}`} aria-hidden />
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenDay(open ? -1 : i)}
                        className={`flex w-full items-center justify-between gap-3 py-2.5 text-left ${ring}`}
                      >
                        <span>
                          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#b5650d]">Day {d.day}</span>
                          <span className="text-[16px] font-medium text-brand-dark">{d.title}</span>
                        </span>
                        <ChevronDown className={`h-5 w-5 shrink-0 text-brand-dark/40 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
                      </button>
                      {open && d.description && <p className="pb-3 text-[15px] leading-relaxed text-brand-dark/70">{d.description}</p>}
                    </li>
                  );
                })}
              </ol>
            </Section>
          )}

          {(trip.included?.length > 0 || trip.notIncluded?.length > 0) && (
            <Section title="What’s" accent="included">
              <div className="grid gap-6 sm:grid-cols-2">
                {trip.included?.length > 0 && (
                  <ul className="space-y-2.5">
                    {trip.included.map((x) => (
                      <li key={x} className="flex gap-2.5 text-[15px] text-brand-dark/80">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
                        {x}
                      </li>
                    ))}
                  </ul>
                )}
                {trip.notIncluded?.length > 0 && (
                  <ul className="space-y-2.5">
                    {trip.notIncluded.map((x) => (
                      <li key={x} className="flex gap-2.5 text-[15px] text-brand-dark/60">
                        <X className="mt-1 h-4 w-4 shrink-0 text-brand-dark/35" aria-hidden />
                        {x}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Section>
          )}

          {trip.faqs?.length > 0 && (
            <Section title="Good to" accent="know">
              <ul className="divide-y divide-brand-dark/10 border-y border-brand-dark/10">
                {trip.faqs.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <li key={f.question}>
                      <button type="button" aria-expanded={open} onClick={() => setOpenFaq(open ? -1 : i)} className={`flex w-full items-center justify-between gap-4 py-4 text-left font-medium text-brand-dark ${ring}`}>
                        {f.question}
                        <ChevronDown className={`h-5 w-5 shrink-0 text-brand-dark/40 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
                      </button>
                      {open && <p className="pb-4 text-[15px] leading-relaxed text-brand-dark/70">{f.answer}</p>}
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}
        </div>

        {/* Desktop: booking stays beside the reading. */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-[22px] border border-brand-dark/10 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(13,27,42,0.5)]">
            {trip.price ? (
              <p className="text-sm text-brand-dark/60">
                From <span className="block text-3xl font-semibold tracking-tight text-brand-dark">{formatKes(trip.price)}</span>
                <span className="italic">per person</span>
              </p>
            ) : null}
            {!past && trip.spotsTotal > 0 && (
              <div className="mt-5">
                <div className="flex justify-between text-xs text-brand-dark/60">
                  <span>Seats left</span>
                  <span className="tabular-nums">
                    {trip.spotsLeft} / {trip.spotsTotal}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-brand-dark/10">
                  <div className="h-full rounded-full bg-brand-orange" style={{ width: `${seatsPct}%` }} />
                </div>
              </div>
            )}
            <div className="mt-6 space-y-3">
              {action}
              <a href={askHref} target="_blank" rel="noopener noreferrer" className={`flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-brand-dark/15 text-sm font-semibold text-brand-dark hover:border-brand-dark/40 ${ring}`}>
                <MessageCircle className="h-4 w-4" aria-hidden />
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* Phones and tablets: a booking bar that stays at the bottom. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-dark/10 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-4">
          {trip.price ? (
            <p className="shrink-0 text-xs text-brand-dark/60">
              From
              <span className="block text-lg font-semibold text-brand-dark">{formatKes(trip.price)}</span>
            </p>
          ) : null}
          <div className="flex-1">{action}</div>
        </div>
      </div>

      <NextStep
        title={past ? 'Missed this one?' : 'Not quite the right dates?'}
        text="We can run a trip like this privately, on your dates, for your group."
        primary={{ to: '/custom-tours', label: 'Plan it privately' }}
      />

      <ReserveModal open={reserveOpen} onClose={() => setReserveOpen(false)} tripTitle={trip.title} />
    </div>
  );
}
