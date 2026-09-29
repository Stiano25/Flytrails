import { useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, ExternalLink, MapPin, MessageCircle, Star } from 'lucide-react';
import { useAccommodation } from '../hooks/useApi.js';
import { useWhatsappLink } from '../hooks/useWhatsappLink.js';
import NextStep from '../components/site/NextStep.jsx';
import { DEMO_STAY } from '../data/devFixtures.js';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const formatKes = (n) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n || 0);

/**
 * One stay: photos first, the key facts, what's there, and a booking chat that is always in reach
 * (a panel beside the text on desktop, a bar at the bottom on phones).
 */
export default function AccommodationDetail() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const demo = import.meta.env.DEV && slug === 'demo' && params.get('demo') === '1';
  const { data, loading, error } = useAccommodation(demo ? null : slug);
  const item = demo ? DEMO_STAY : data;
  const whatsapp = useWhatsappLink();
  const [photo, setPhoto] = useState(0);

  if (!demo && !loading && (error || !item)) return <Navigate to="/404" replace />;
  if (!item) return <div className="h-[70vh] animate-pulse bg-brand-bg" aria-hidden />;

  const photos = [item.image, ...(item.gallery || [])].filter(Boolean).filter((u, i, a) => a.indexOf(u) === i);
  const chatHref = `${item.bookingWhatsapp ? `https://wa.me/${item.bookingWhatsapp}` : whatsapp.split('?')[0]}?text=${encodeURIComponent(
    `Hello Flytrails, I would like to book a stay at ${item.title}.`
  )}`;

  const actions = (
    <>
      <a
        href={chatHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-brand-orange text-[15px] font-semibold text-brand-dark hover:bg-[#f4a53f] ${ring}`}
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        Check dates on WhatsApp
      </a>
      {item.bookingLink && (
        <a
          href={item.bookingLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-brand-dark/15 text-sm font-semibold text-brand-dark hover:border-brand-dark/40 ${ring}`}
        >
          Book online
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      )}
    </>
  );

  return (
    <div className="pb-24 lg:pb-0">
      {demo && (
        <p className="bg-brand-orange/20 px-4 py-2 text-center text-sm font-medium text-brand-dark">
          Development preview with placeholder content. This page is not available on the live site.
        </p>
      )}

      <div className="mx-auto max-w-6xl px-4 pt-6 md:px-6">
        <Link to="/accommodations" className={`inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark/60 hover:text-primary ${ring}`}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All stays
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-brand-dark md:text-4xl">{item.title}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-brand-dark/65">
          {item.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" aria-hidden />
              {item.location}
            </span>
          )}
          {item.rating ? (
            <span className="inline-flex items-center gap-1 font-medium text-brand-dark">
              <Star className="h-4 w-4 fill-brand-orange text-brand-orange" aria-hidden />
              {item.rating} / 5
            </span>
          ) : null}
          {item.priceFrom > 0 && (
            <span>
              From <strong className="font-semibold text-brand-dark">{formatKes(item.priceFrom)}</strong> <span className="italic">/ night</span>
            </span>
          )}
        </p>

        {photos.length > 0 && (
          <div className="mt-6">
            <img src={photos[photo]} alt="" className="aspect-[16/9] w-full rounded-[22px] object-cover" />
            {photos.length > 1 && (
              <ul className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto" aria-label="Photos">
                {photos.map((url, i) => (
                  <li key={url} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setPhoto(i)}
                      aria-label={`Show photo ${i + 1}`}
                      aria-pressed={photo === i}
                      className={`block h-16 w-24 overflow-hidden rounded-xl ${ring} ${photo === i ? 'ring-2 ring-brand-orange ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
                    >
                      <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:px-6 lg:grid-cols-[1fr_20rem]">
        <div>
          {(item.description || item.shortDescription) && (
            <p className="whitespace-pre-line text-[17px] leading-[1.8] text-brand-dark/80">{item.description || item.shortDescription}</p>
          )}
          {item.amenities?.length > 0 && (
            <section className="mt-10 border-t border-brand-dark/10 pt-8">
              <h2 className="text-2xl font-semibold tracking-tight text-brand-dark">
                What’s <span className="font-light italic">there</span>
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {item.amenities.map((a) => (
                  <li key={a} className="flex gap-2.5 text-[15px] text-brand-dark/80">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-3 rounded-[22px] border border-brand-dark/10 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(13,27,42,0.5)]">
            <p className="text-lg font-semibold text-brand-dark">Want to stay here?</p>
            <p className="text-sm text-brand-dark/60">Send your dates and group size and we’ll confirm availability.</p>
            {actions}
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-dark/10 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-xl">{actions}</div>
      </div>

      <NextStep title="Make it part of a trip." text="We plan the route, transfers and activities around your stay." />
    </div>
  );
}
