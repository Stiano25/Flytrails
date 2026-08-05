import { Link } from 'react-router-dom';
import { MapPin, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { formatKes } from '../utils/formatters.js';
import { isTripExpired } from '../utils/tripStatus.js';

export default function TripCard({ trip, className = '' }) {
  const expired = isTripExpired(trip.nextDeparture);
  const almostFull = !expired && trip.spotsLeft <= 3 && trip.spotsLeft > 0;
  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-3xl border shadow-lg backdrop-blur-xl transition duration-300 ${
        expired
          ? 'border-brand-dark/10 bg-white/15'
          : 'border-white/30 bg-white/25 hover:-translate-y-1 hover:border-accent/35 hover:shadow-xl'
      } ${className}`}
    >
      <Link to={`/trips/${trip.slug}`} className="relative aspect-[4/3] overflow-hidden">
        <img
          src={trip.image}
          alt={trip.title}
          width="400"
          height="300"
          className={`h-full w-full object-cover transition-transform duration-500 ${
            expired ? 'grayscale' : 'group-hover:scale-105'
          }`}
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/50 to-transparent opacity-80" />
        {expired && <div className="absolute inset-0 bg-brand-dark/35" aria-hidden />}
        <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-white/20 bg-primary/90 px-3 py-1 text-xs font-bold text-brand-light backdrop-blur-sm">
          {trip.category}
        </span>
        {expired && (
          <span className="absolute right-3 top-3 z-10 inline-flex items-center rounded-full border border-emerald-400/50 bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            Adventure accomplished
          </span>
        )}
        {almostFull && (
          <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-white/25 bg-accent px-2.5 py-1 text-xs font-bold text-brand-dark backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Few spots
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className={expired ? 'opacity-60' : ''}>
          <h3 className={`font-display text-xl font-bold ${expired ? 'text-brand-dark/70' : 'text-brand-dark'}`}>
            {trip.title}
          </h3>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-light text-brand-dark/75">
            <MapPin className="h-4 w-4 shrink-0 text-primary/90" aria-hidden />
            {trip.location}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-light text-brand-dark/80">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-brand-dark/50" aria-hidden />
              {trip.duration}
            </span>
            <span aria-hidden className="text-brand-dark/30">
              ·
            </span>
            <span className={`font-bold ${expired ? 'text-brand-dark/50' : 'text-primary'}`}>
              {formatKes(trip.price)}
            </span>
          </div>
          {!expired && (
            <p className="mt-2 text-xs font-extralight text-brand-dark/60">
              {trip.spotsLeft === 0 ? 'Sold out' : `${trip.spotsLeft} spots left`}
            </p>
          )}
        </div>
        {expired && (
          <p className="mt-2 text-xs font-bold text-emerald-700">Adventure accomplished</p>
        )}
        <Link
          to={`/trips/${trip.slug}`}
          className={`mt-4 inline-flex w-fit items-center gap-1 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
            expired
              ? 'border-brand-dark/20 bg-brand-dark/40 text-white/90 opacity-60 hover:bg-brand-dark/50'
              : 'border-primary/30 bg-primary/90 text-white hover:bg-primary'
          }`}
        >
          View details
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
