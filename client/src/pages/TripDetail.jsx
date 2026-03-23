import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Calendar,
  CalendarDays,
  Gauge,
  Users,
  MessageCircle,
} from 'lucide-react';
import { useTrip } from '../hooks/useApi.js';
import ReserveModal from '../components/ReserveModal.jsx';
import { WHATSAPP_URL } from '../config.js';

function formatKes(n) {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n);
}

const sectionClass = 'glass-surface rounded-3xl p-6 md:p-8';
const accordionBtn =
  'flex w-full items-center justify-between gap-3 bg-white/35 px-4 py-3.5 text-left font-semibold text-brand-dark backdrop-blur-sm transition hover:bg-white/50';

export default function TripDetail() {
  const { slug } = useParams();
  const { data: trip, loading, error } = useTrip(slug);
  const [openDay, setOpenDay] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [reserveOpen, setReserveOpen] = useState(false);

  if (!loading && (error || !trip)) {
    return <Navigate to="/404" replace />;
  }
  if (loading) return null;

  const pct = trip.spotsTotal ? Math.round((trip.spotsLeft / trip.spotsTotal) * 100) : 0;

  return (
    <div className="relative bg-transparent">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-transparent" />
      <div className="relative h-[min(52vh,460px)] w-full overflow-hidden">
        <img src={trip.image} alt={trip.title} className="h-full w-full object-cover animate-video-effect" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/35 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <h1 className="max-w-4xl font-display text-3xl font-bold text-brand-light drop-shadow md:text-5xl lg:text-6xl">
            {trip.title}
          </h1>
        </div>
      </div>

      <nav className="relative mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 py-4 text-sm font-light text-brand-dark/70 md:px-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
        <Link to="/trips" className="hover:text-primary">
          Trips
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
        <span className="font-medium text-brand-dark">{trip.title}</span>
      </nav>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 lg:grid-cols-[1fr_340px] lg:items-start lg:px-6">
        <div>
          <section className={sectionClass}>
            <h2 className="font-display text-2xl font-bold text-brand-dark">Overview</h2>
            <p className="mt-4 font-light leading-relaxed text-brand-dark/85">{trip.description}</p>
          </section>

          <section className={`${sectionClass} mt-8`}>
            <h2 className="font-display text-2xl font-bold text-brand-dark">Trip highlights</h2>
            <ul className="mt-4 space-y-3">
              {trip.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-brand-dark/90">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span className="font-light">{h}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${sectionClass} mt-8`}>
            <h2 className="font-display text-2xl font-bold text-brand-dark">Itinerary</h2>
            <div className="mt-4 space-y-2">
              {trip.itinerary.map((d, i) => (
                <div key={d.day} className="overflow-hidden rounded-2xl border border-white/40 bg-white/25 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setOpenDay(openDay === i ? -1 : i)}
                    className={accordionBtn}
                    aria-expanded={openDay === i}
                  >
                    <span>
                      Day {d.day}: {d.title}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-primary transition ${openDay === i ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </button>
                  {openDay === i && (
                    <p className="border-t border-brand-dark/10 px-4 py-3 text-sm font-light text-brand-dark/80">{d.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-6 md:grid-cols-2">
            <div className={sectionClass}>
              <h3 className="font-display text-xl font-bold text-brand-dark">What&apos;s included</h3>
              <ul className="mt-4 space-y-2">
                {trip.included.map((x) => (
                  <li key={x} className="flex gap-2 text-sm font-light text-brand-dark/85">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className={sectionClass}>
              <h3 className="font-display text-xl font-bold text-brand-dark">Not included</h3>
              <ul className="mt-4 space-y-2">
                {trip.notIncluded.map((x) => (
                  <li key={x} className="flex gap-2 text-sm font-light text-brand-dark/85">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-brand-dark/35" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className={`${sectionClass} mt-8`}>
            <h2 className="font-display text-2xl font-bold text-brand-dark">FAQs</h2>
            <div className="mt-4 space-y-2">
              {trip.faqs.map((f, i) => (
                <div key={f.question} className="overflow-hidden rounded-2xl border border-white/40 bg-white/25 backdrop-blur-md">
                  <button
                    type="button"
                    className={accordionBtn}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span className="text-sm font-semibold md:text-base">{f.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-primary transition ${openFaq === i ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </button>
                  {openFaq === i && (
                    <p className="border-t border-brand-dark/10 px-4 py-3 text-sm font-light text-brand-dark/75">{f.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="glass-surface-strong rounded-3xl p-6">
            <p className="text-xs font-extralight uppercase tracking-wider text-brand-dark/55">From</p>
            <p className="font-display text-3xl font-bold text-primary">{formatKes(trip.price)}</p>
            <p className="text-sm font-extralight text-brand-dark/60">per person</p>
            <ul className="mt-6 space-y-3 text-sm font-light text-brand-dark/85">
              <li className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>
                  <span className="font-semibold text-brand-dark">Duration:</span> {trip.duration}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>
                  <span className="font-semibold text-brand-dark">Difficulty:</span> {trip.difficulty}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>
                  <span className="font-semibold text-brand-dark">Group size:</span> up to {trip.spotsTotal} travellers
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>
                  <span className="font-semibold text-brand-dark">Next departure:</span>{' '}
                  {new Date(trip.nextDeparture).toLocaleDateString('en-KE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </li>
            </ul>
            <div className="mt-6">
              <div className="flex justify-between text-xs font-extralight text-brand-dark/60">
                <span>Spots left</span>
                <span>
                  {trip.spotsLeft} / {trip.spotsTotal}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-dark/10">
                <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReserveOpen(true)}
              className="mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-accent shadow-md transition hover:bg-primary/90"
            >
              Reserve your spot
            </button>
            <Link
              to="/contact"
              className="mt-3 flex w-full justify-center rounded-xl border border-primary/40 bg-white/30 py-3 text-center text-sm font-semibold text-primary backdrop-blur-sm transition hover:bg-white/50"
            >
              Ask a question
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 text-center text-sm font-semibold text-primary hover:underline"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Chat on WhatsApp
            </a>
          </div>
        </aside>
      </div>

      <ReserveModal open={reserveOpen} onClose={() => setReserveOpen(false)} tripTitle={trip.title} />
    </div>
  );
}
