import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGalleryImages } from '../hooks/useApi.js';
import { buildAlbums } from '../components/gallery/albums.js';
import AlbumCover from '../components/gallery/AlbumCover.jsx';
import AlbumViewer from '../components/gallery/AlbumViewer.jsx';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/**
 * Gallery as trip albums: one screen with a row of album covers (one per destination). Tap a cover to flip
 * through it stories-style; each album ends with "Plan a trip like this".
 */
export default function Gallery() {
  const { data: images, loading } = useGalleryImages();
  const albums = useMemo(() => buildAlbums(images), [images]);
  const [open, setOpen] = useState(null);
  const rowRef = useRef(null);
  const opener = useRef(null);
  const photoCount = albums.reduce((n, a) => n + a.photos.length, 0);

  function scroll(dir) {
    const row = rowRef.current;
    if (!row) return;
    row.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function close() {
    setOpen(null);
    requestAnimationFrame(() => opener.current?.focus({ preventScroll: true }));
  }

  return (
    <div className="flex min-h-[calc(100svh-4.5rem)] flex-col bg-brand-bg">
      <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-4 px-4 pb-4 pt-[clamp(1.25rem,4svh,2.5rem)] md:px-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-brand-dark md:text-4xl">
            Trip <span className="font-light italic">albums</span>
          </h1>
          <p className="mt-1 text-sm text-brand-dark/65">
            {loading && !albums.length ? 'Loading albums…' : `${albums.length} trips · ${photoCount} photos · tap an album to flip through it`}
          </p>
        </div>
        <div className="hidden gap-2 md:flex">
          <button type="button" onClick={() => scroll(-1)} aria-label="Scroll albums left" className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-dark/15 bg-white text-brand-dark hover:border-brand-dark/40 ${ring}`}>
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Scroll albums right" className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-dark/15 bg-white text-brand-dark hover:border-brand-dark/40 ${ring}`}>
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <ul
        ref={rowRef}
        className="scrollbar-hide flex min-h-0 flex-1 snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1rem,calc((100vw-80rem)/2+1.5rem))] pb-[clamp(1.25rem,4svh,2.5rem)] pt-3"
        style={{ scrollPaddingInline: 'max(1rem, calc((100vw - 80rem) / 2 + 1.5rem))' }}
        aria-label="Trip albums"
      >
        {(loading && !albums.length ? Array.from({ length: 4 }) : albums).map((album, i) => (
          <li key={album?.id || i} className="h-[clamp(18rem,62svh,36rem)] shrink-0 snap-start" style={{ aspectRatio: '3 / 4' }}>
            {album ? (
              <AlbumCover
                album={album}
                className="h-full w-full"
                onOpen={(e) => {
                  opener.current = e?.currentTarget || document.activeElement;
                  setOpen(i);
                }}
              />
            ) : (
              <span className="block h-full w-full animate-pulse rounded-2xl bg-brand-dark/10" aria-hidden />
            )}
          </li>
        ))}
      </ul>

      {open !== null && <AlbumViewer albums={albums} startAlbum={open} onClose={close} />}
    </div>
  );
}
