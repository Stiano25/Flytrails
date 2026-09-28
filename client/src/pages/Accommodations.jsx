import { Link } from 'react-router-dom';
import { BedDouble, Luggage, MapPin, MessageCircle, Star } from 'lucide-react';
import { useAccommodations } from '../hooks/useApi.js';
import { useWhatsappLink } from '../hooks/useWhatsappLink.js';
import PageHeader from '../components/site/PageHeader.jsx';
import NextStep from '../components/site/NextStep.jsx';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const formatKes = (value) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value || 0);

/** Where you'll stay: stays as cards with details and a direct booking chat. Never an empty page. */
export default function Accommodations() {
  const { data, loading } = useAccommodations();
  const whatsapp = useWhatsappLink();
  const stays = data || [];
  const bookHref = (item) =>
    `${item.bookingWhatsapp ? `https://wa.me/${item.bookingWhatsapp}` : whatsapp.split('?')[0]}?text=${encodeURIComponent(`Hello Flytrails, I would like to book a stay at ${item.title}.`)}`;

  return (
    <div>
      <PageHeader eyebrow="Stays" title="Handpicked" accent="places to stay" description="Chosen for comfort, location and the experience around them." />

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        {loading && !stays.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-96 animate-pulse rounded-[22px] bg-brand-dark/[0.06]" />
            ))}
          </ul>
        ) : stays.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stays.map((item) => (
              <li key={item.id}>
                <article className="flex h-full flex-col overflow-hidden rounded-[22px] border border-brand-dark/10 bg-white shadow-[0_18px_40px_-28px_rgba(13,27,42,0.5)]">
                  <Link to={`/accommodations/${item.slug}`} className={`group block aspect-[4/3] overflow-hidden bg-brand-dark/10 ${ring}`}>
                    {item.image && (
                      <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-semibold leading-snug text-brand-dark">
                        <Link to={`/accommodations/${item.slug}`} className={`hover:text-primary ${ring}`}>
                          {item.title}
                        </Link>
                      </h2>
                      {item.rating ? (
                        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-dark">
                          <Star className="h-4 w-4 fill-brand-orange text-brand-orange" aria-hidden />
                          {item.rating}
                        </span>
                      ) : null}
                    </div>
                    {item.location && (
                      <p className="mt-1 inline-flex items-center gap-1 text-sm text-brand-dark/60">
                        <MapPin className="h-3.5 w-3.5" aria-hidden />
                        {item.location}
                      </p>
                    )}
                    {(item.shortDescription || item.description) && (
                      <p className="mt-3 line-clamp-3 text-sm text-brand-dark/70">{item.shortDescription || item.description}</p>
                    )}
                    {item.amenities?.length ? (
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {item.amenities.slice(0, 4).map((a) => (
                          <li key={a} className="rounded-full bg-brand-bg px-2.5 py-1 text-xs font-medium text-brand-dark/70">
                            {a}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                      {item.priceFrom > 0 ? (
                        <p className="text-sm text-brand-dark/60">
                          From <strong className="text-base font-semibold text-brand-dark">{formatKes(item.priceFrom)}</strong>
                        </p>
                      ) : (
                        <span />
                      )}
                      <a
                        href={bookHref(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90 ${ring}`}
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden />
                        Book stay
                      </a>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-auto max-w-xl rounded-[22px] border border-brand-dark/10 bg-white px-6 py-10 text-center shadow-[0_18px_40px_-28px_rgba(13,27,42,0.5)]">
            <BedDouble className="mx-auto h-10 w-10 text-brand-orange" strokeWidth={1.5} aria-hidden />
            <p className="mt-4 text-xl font-semibold text-brand-dark">We book stays as part of your trip.</p>
            <p className="mt-2 text-[15px] text-brand-dark/65">Tell us where and when, and we’ll suggest places that fit your group and budget.</p>
            <Link
              to="/?plan=1"
              className={`mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-brand-orange px-6 text-[15px] font-semibold text-brand-dark hover:bg-[#f4a53f] ${ring}`}
            >
              <Luggage className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              Plan my trip
            </Link>
          </div>
        )}
      </section>

      <NextStep title="Stay sorted, trip planned." text="We match stays to your route, group and budget." />
    </div>
  );
}
