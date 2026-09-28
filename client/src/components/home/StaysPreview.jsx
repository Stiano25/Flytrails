import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Star } from 'lucide-react';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/** Home preview of up to three stays. Hidden when there are none (no placeholder text for visitors). */
export default function StaysPreview({ stays }) {
  const list = (stays || []).slice(0, 3);
  if (!list.length) return null;

  return (
    <section aria-labelledby="stays-title" className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b5650d]">Where you’ll stay</p>
            <h2 id="stays-title" className="mt-2 text-3xl font-semibold tracking-tight text-brand-dark md:text-4xl">
              Handpicked <span className="font-light italic">stays</span>
            </h2>
          </div>
          <Link
            to="/accommodations"
            className={`inline-flex items-center gap-1 text-sm font-semibold text-primary underline decoration-brand-orange decoration-2 underline-offset-4 hover:text-primary/80 ${ring}`}
          >
            View all stays
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((stay) => (
            <li key={stay.id}>
              <Link
                to={`/accommodations/${stay.slug}`}
                className={`group flex h-full flex-col overflow-hidden rounded-[22px] border border-brand-dark/10 bg-white shadow-[0_18px_40px_-28px_rgba(13,27,42,0.5)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-26px_rgba(13,27,42,0.55)] ${ring}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-dark/10">
                  {stay.image && (
                    <img
                      src={stay.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  )}
                  {stay.rating ? (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-dark">
                      <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" aria-hidden />
                      {stay.rating}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-semibold leading-snug text-brand-dark group-hover:text-primary">{stay.title}</h3>
                  {stay.location && (
                    <p className="mt-1 inline-flex items-center gap-1 text-sm text-brand-dark/60">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {stay.location}
                    </p>
                  )}
                  {(stay.shortDescription || stay.description) && (
                    <p className="mt-3 line-clamp-2 text-sm text-brand-dark/70">{stay.shortDescription || stay.description}</p>
                  )}
                  {stay.priceFrom > 0 && (
                    <p className="mt-auto pt-4 text-sm text-brand-dark/60">
                      From <strong className="text-base font-semibold text-brand-dark">KES {Number(stay.priceFrom).toLocaleString()}</strong>
                      <span className="italic"> / night</span>
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
