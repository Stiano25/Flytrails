import { Link, Navigate, useParams } from 'react-router-dom';
import { MessageCircle, ChevronRight, Star } from 'lucide-react';
import { useAccommodation } from '../hooks/useApi.js';
import { useWhatsappLink } from '../hooks/useWhatsappLink.js';

function formatKes(value) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function AccommodationDetail() {
  const { slug } = useParams();
  const { data: item, loading, error } = useAccommodation(slug);
  const fallbackWhatsapp = useWhatsappLink();

  if (!loading && (error || !item)) {
    return <Navigate to="/404" replace />;
  }
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-5 md:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-2/3 max-w-md rounded-lg bg-neutral-200" />
          <div className="aspect-[16/10] w-full rounded-3xl bg-neutral-200 sm:aspect-[21/9]" />
          <div className="h-4 w-full max-w-lg rounded bg-neutral-100" />
        </div>
      </div>
    );
  }

  const directWhatsapp = item.bookingWhatsapp ? `https://wa.me/${item.bookingWhatsapp}` : fallbackWhatsapp;
  const message = encodeURIComponent(`Hello Flytrails, I would like to book a stay at ${item.title}.`);
  const bookStayHref = `${directWhatsapp}${directWhatsapp.includes('?') ? '&' : '?'}text=${message}`;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-5 sm:pb-20 sm:pt-8 md:px-6 md:pb-16 md:pt-12">
      <nav className="mb-5 flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-brand-dark/70 sm:mb-6 sm:text-sm" aria-label="Breadcrumb">
        <Link to="/" className="shrink-0 hover:text-primary">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50 sm:h-4 sm:w-4" />
        <Link to="/accommodations" className="shrink-0 hover:text-primary">Accommodations</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50 sm:h-4 sm:w-4" />
        <span className="min-w-0 max-w-[min(100%,12rem)] truncate font-medium text-brand-dark sm:max-w-none sm:whitespace-normal">{item.title}</span>
      </nav>

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_min(320px,100%)] lg:items-start lg:gap-10">
        <aside className="order-1 lg:sticky lg:order-2 lg:top-24">
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs uppercase tracking-wider text-brand-dark/60">From</p>
            <p className="mt-1 font-display text-2xl font-bold text-primary sm:text-3xl">{formatKes(item.priceFrom)}</p>
            <p className="text-sm text-brand-dark/60">per night / package</p>
            <a
              href={bookStayHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              Book stay
            </a>
          </div>
        </aside>

        <section className="order-2 min-w-0 lg:order-1">
          {item.image && (
            <div className="overflow-hidden rounded-2xl bg-neutral-100 sm:rounded-3xl">
              <img src={item.image} alt={item.title} className="aspect-[4/3] w-full object-cover sm:aspect-[16/9] sm:max-h-[min(56vh,480px)] md:max-h-[420px]" />
            </div>
          )}
          <h1 className="mt-5 font-display text-2xl font-bold leading-tight text-brand-dark sm:mt-6 sm:text-3xl md:text-4xl">{item.title}</h1>
          <p className="mt-2 text-sm text-brand-dark/75 sm:text-base">{item.location}</p>
          {item.rating ? (
            <p className="mt-2 inline-flex items-center gap-1 text-sm text-amber-600">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              {item.rating}/5
            </p>
          ) : null}

          <p className="mt-4 text-sm leading-relaxed text-brand-dark/85 sm:mt-5 sm:text-base">{item.description || item.shortDescription}</p>

          {item.amenities?.length ? (
            <div className="mt-6">
              <h2 className="font-semibold text-brand-dark">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.amenities.map((amenity) => (
                  <span key={amenity} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {item.gallery?.length ? (
            <div className="mt-8">
              <h2 className="font-semibold text-brand-dark">Gallery</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
                {item.gallery.map((url, index) => (
                  <img
                    key={`${url}-${index}`}
                    src={url}
                    alt={`${item.title} — gallery ${index + 1}`}
                    className="aspect-square w-full rounded-lg object-cover sm:rounded-xl"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
