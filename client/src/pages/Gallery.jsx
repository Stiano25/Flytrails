import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Images, MapPin } from 'lucide-react';
import { useGalleryImages } from '../hooks/useApi.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { useSwipe } from '../hooks/useSwipe.js';

const tabs = ['All', 'Kenya', 'East Africa', 'International', 'Hiking', 'Beach'];

export default function Gallery() {
  const [tab, setTab] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  const focusTrapRef = useFocusTrap(!!lightbox);
  const { data: galleryImages } = useGalleryImages();
  const allImages = galleryImages || [];

  const filtered =
    tab === 'All' ? allImages : allImages.filter((g) => g.tags.some((t) => t === tab));

  const indexInFiltered = lightbox ? filtered.findIndex((g) => g.id === lightbox.id) : -1;

  const goNext = useCallback(() => {
    if (indexInFiltered < 0 || !filtered.length) return;
    const next = (indexInFiltered + 1) % filtered.length;
    setLightbox(filtered[next]);
  }, [filtered, indexInFiltered]);

  const goPrev = useCallback(() => {
    if (indexInFiltered < 0 || !filtered.length) return;
    const prev = (indexInFiltered - 1 + filtered.length) % filtered.length;
    setLightbox(filtered[prev]);
  }, [filtered, indexInFiltered]);

  const swipeHandlers = useSwipe(goNext, goPrev);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox, goNext, goPrev]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(27,67,50,0.06),transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary/90">
          <Images className="h-4 w-4" aria-hidden />
          Gallery
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-brand-dark sm:text-4xl md:text-5xl">Our adventures in photos</h1>
        <p className="mt-3 max-w-xl font-light text-brand-dark/75">Moments from the road — tap to expand.</p>

        <div className="mt-8 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-sm transition ${
                tab === t
                  ? 'border-primary/40 bg-primary text-accent shadow-md'
                  : 'border-white/40 bg-white/35 text-brand-dark hover:bg-white/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-10 columns-2 gap-3 md:gap-6 lg:columns-3">
          {filtered.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setLightbox(img)}
              className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-white/25 shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              <img
                src={img.url}
                alt={img.location}
                width="400"
                height="300"
                className="w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <span className="absolute inset-0 flex items-end bg-gradient-to-t from-brand-dark/75 to-transparent p-4 opacity-0 transition group-hover:opacity-100 group-focus:opacity-100">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-light">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                  {img.location}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-brand-dark/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setLightbox(null);
            }
          }}
        >
          <div ref={focusTrapRef} className="relative max-h-[90vh] max-w-5xl" {...swipeHandlers}>
            <button
              type="button"
              className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-white/10 p-2 text-brand-light backdrop-blur-md transition hover:bg-white/20"
              onClick={() => setLightbox(null)}
              aria-label="Close lightbox"
            >
              <X className="h-6 w-6" />
            </button>
            <button
              type="button"
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-brand-light backdrop-blur-md transition hover:bg-white/20 md:left-6"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-brand-light backdrop-blur-md transition hover:bg-white/20 md:right-6"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <img
              src={lightbox.url}
              alt={lightbox.location}
              className="max-h-[85vh] w-auto rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <p id="lightbox-title" className="mt-4 text-center font-medium text-brand-light">
              {lightbox.location} ({indexInFiltered + 1} of {filtered.length})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
