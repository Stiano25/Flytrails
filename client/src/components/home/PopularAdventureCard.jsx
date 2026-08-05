import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatKes, truncate } from '../../utils/formatters.js';
import { isTripExpired } from '../../utils/tripStatus.js';
import { MapPin, Clock, Users, Star, ChevronRight } from 'lucide-react';

export default function PopularAdventureCard({ trip, index }) {
  const expired = isTripExpired(trip.nextDeparture);
  const dateStr = new Date(trip.nextDeparture).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
        type: 'spring',
        stiffness: 120,
        damping: 18,
      }}
      whileHover={expired ? undefined : { y: -6, transition: { duration: 0.22 } }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Link
        to={`/trips/${trip.slug}`}
        className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border shadow-lg backdrop-blur-xl transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          expired
            ? 'border-brand-dark/10 bg-white/10'
            : 'border-white/25 bg-white/15 hover:border-accent/40 hover:shadow-xl hover:shadow-primary/10'
        }`}
      >
        {!expired && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}

        <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[3/2]">
          <img
            src={trip.image}
            alt=""
            width="360"
            height="240"
            className={`h-full w-full object-cover transition duration-500 ${
              expired ? 'grayscale' : 'group-hover:scale-105'
            }`}
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          {expired && <div className="absolute inset-0 bg-brand-dark/35" aria-hidden />}

          <span className="absolute left-2.5 top-2.5 z-10 rounded-full border border-white/25 bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-dark backdrop-blur-sm">
            {trip.category}
          </span>
          {expired ? (
            <span className="absolute right-2.5 top-2.5 z-10 rounded-full border border-emerald-400/50 bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              Adventure accomplished
            </span>
          ) : (
            <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-0.5 rounded-full border border-white/20 bg-black/35 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
              4.9
            </div>
          )}

          <div
            className={`absolute bottom-2 left-2 right-2 z-10 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-white/95 ${
              expired ? 'opacity-60' : ''
            }`}
          >
            <span className="flex items-center gap-0.5 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{trip.location.split(',')[0]}</span>
            </span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3 shrink-0" />
              {trip.duration}
            </span>
            {!expired && (
              <span className="flex items-center gap-0.5">
                <Users className="h-3 w-3 shrink-0" />
                {trip.spotsLeft} spots
              </span>
            )}
          </div>
        </div>

        <div className="relative flex flex-1 flex-col p-3.5 sm:p-4">
          <div className={expired ? 'opacity-60' : ''}>
            <h3
              className={`font-display text-base font-bold leading-snug line-clamp-2 sm:text-[17px] ${
                expired
                  ? 'text-brand-dark/70'
                  : 'text-brand-dark transition-colors group-hover:text-primary'
              }`}
            >
              {trip.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-xs font-light leading-relaxed text-brand-dark/70 group-hover:text-brand-dark/85">
              {truncate(trip.description, 90)}
            </p>
          </div>

          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
            <div>
              <div className={`flex items-baseline gap-1.5 ${expired ? 'opacity-60' : ''}`}>
                <span
                  className={`font-display text-lg font-bold sm:text-xl ${
                    expired ? 'text-brand-dark/50' : 'text-primary'
                  }`}
                >
                  {formatKes(trip.price)}
                </span>
                <span className="text-[10px] font-extralight text-brand-dark/55">pp</span>
              </div>
              {expired ? (
                <p className="text-[10px] font-bold text-emerald-700">Adventure accomplished</p>
              ) : (
                <p className="text-[10px] font-extralight text-brand-dark/55">Next {dateStr}</p>
              )}
            </div>
            <span
              className={`inline-flex items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white transition ${
                expired ? 'bg-brand-dark/40 opacity-60' : 'bg-primary/90 group-hover:bg-primary'
              }`}
            >
              Details
              <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </div>

          {!expired && trip.spotsLeft <= 3 && trip.spotsLeft > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-red-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
              Only {trip.spotsLeft} left
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
