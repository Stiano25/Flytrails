import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import { useAccommodations } from '../hooks/useApi.js';
import { useWhatsappLink } from '../hooks/useWhatsappLink.js';

function formatKes(value) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function Accommodations() {
  const { data: accommodationsData, loading } = useAccommodations();
  const fallbackWhatsapp = useWhatsappLink();
  const accommodations = accommodationsData || [];

  return (
    <div>
      <PageHero
        imageUrl="/images/baliinternational.jpg"
        imageAlt="Luxury accommodation with scenic views"
        title="Accommodations"
        subtitle="Stay options selected for comfort, location, and experience."
      />

      <section className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-5 sm:pb-20 sm:pt-10 md:px-6 md:pb-16 md:pt-12">
        {loading ? (
          <p className="text-sm text-brand-dark/60 sm:text-base">Loading accommodations...</p>
        ) : accommodations.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center sm:p-8">
            <p className="text-sm text-brand-dark/70 sm:text-base">No accommodations are live right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {accommodations.map((item) => (
              <article key={item.id} className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <Link to={`/accommodations/${item.slug}`} className="block shrink-0 overflow-hidden bg-neutral-100">
                  {item.image && (
                    <div className="aspect-[4/3] w-full">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </div>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <Link to={`/accommodations/${item.slug}`} className="font-display text-lg font-bold leading-snug text-brand-dark hover:text-primary sm:text-xl">
                    {item.title}
                  </Link>
                  <p className="mt-1 text-sm text-brand-dark/70">{item.location}</p>
                  {item.rating ? <p className="mt-2 text-sm text-amber-600">Rating: {item.rating}/5</p> : null}
                  <p className="mt-3 line-clamp-3 text-sm text-brand-dark/80">{item.shortDescription || item.description}</p>
                  {item.amenities?.length ? (
                    <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                      {item.amenities.slice(0, 4).map((amenity) => (
                        <span key={amenity} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <p className="mt-4 text-sm font-semibold text-primary">From {formatKes(item.priceFrom)}</p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <Link
                      to={`/accommodations/${item.slug}`}
                      className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-primary/30 px-4 py-2.5 text-center text-sm font-semibold text-primary hover:bg-primary/5"
                    >
                      View details
                    </Link>
                    <a
                      href={`${item.bookingWhatsapp ? `https://wa.me/${item.bookingWhatsapp}` : fallbackWhatsapp}?text=${encodeURIComponent(`Hello Flytrails, I would like to book a stay at ${item.title}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-[#25D366] px-4 py-2.5 text-center text-sm font-semibold text-white hover:opacity-95"
                    >
                      Book stay
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
