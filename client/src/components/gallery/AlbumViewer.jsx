import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Luggage, X } from 'lucide-react';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

/**
 * Full-screen, stories-style album viewer. Tap the right side (or swipe left, →, or the arrow button) for
 * the next photo, the left side for the previous one; swipe down or Escape closes. The bars at the top
 * show where you are; nothing advances on its own. After the last photo comes a closing card with
 * "Plan a trip like this" and the next album.
 */
export default function AlbumViewer({ albums, startAlbum, onClose }) {
  const [albumIdx, setAlbumIdx] = useState(startAlbum);
  const [photoIdx, setPhotoIdx] = useState(0);
  const dialogRef = useRef(null);
  const start = useRef(null);
  const swiped = useRef(false);

  const album = albums[albumIdx];
  const photos = album?.photos || [];
  const atEnd = photoIdx >= photos.length;
  const photo = photos[Math.min(photoIdx, photos.length - 1)];
  const nextAlbum = albums[albumIdx + 1];

  function next() {
    if (!atEnd) setPhotoIdx((i) => i + 1);
    else if (nextAlbum) openAlbum(albumIdx + 1);
  }

  function prev() {
    if (photoIdx > 0) setPhotoIdx((i) => i - 1);
    else if (albumIdx > 0) {
      setAlbumIdx(albumIdx - 1);
      setPhotoIdx(albums[albumIdx - 1].photos.length - 1);
    }
  }

  function openAlbum(i) {
    setAlbumIdx(i);
    setPhotoIdx(0);
  }

  // Scroll lock, keyboard, focus trap.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'Tab' && dialogRef.current) {
        const items = [...dialogRef.current.querySelectorAll('button, [href]')].filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  // Preload only the next photo.
  useEffect(() => {
    const upcoming = photos[photoIdx + 1] || nextAlbum?.photos[0];
    if (upcoming) new Image().src = upcoming.url;
  }, [photoIdx, photos, nextAlbum]);

  function onPointerDown(e) {
    start.current = { x: e.clientX, y: e.clientY, t: Date.now() };
  }

  function onPointerUp(e) {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    swiped.current = Math.abs(dx) > 50 || dy > 90;
    if (dy > 90 && Math.abs(dy) > Math.abs(dx)) onClose();
    else if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
  }

  /** Tap zones: ignore the click that ends a swipe (the swipe already moved). */
  const tap = (fn) => () => {
    if (swiped.current) swiped.current = false;
    else fn();
  };

  if (!album) return null;
  const planHref = album.type ? `/?plan=1&type=${album.type}` : '/?plan=1';

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${album.title} album`}
      tabIndex={-1}
      className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-black text-white outline-none"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* Soft blurred copy of the photo fills the edges on wide screens. */}
      {!atEnd && <img src={photo.url} alt="" className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-3xl" aria-hidden />}

      <div className="relative z-20 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
        <div className="flex gap-1" aria-hidden>
          {photos.map((p, i) => (
            <span key={p.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
              <span className={`block h-full rounded-full bg-white transition-[width] duration-300 motion-reduce:transition-none ${i <= photoIdx ? 'w-full' : 'w-0'}`} />
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">{album.title}</p>
            <p className="text-xs text-white/65">
              {album.region} · {atEnd ? `${photos.length} ${photos.length === 1 ? 'photo' : 'photos'}` : `${photoIdx + 1} of ${photos.length}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close album"
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20 ${ring}`}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-2 py-3 sm:px-20">
        {atEnd ? (
          <div className="picker-fade mx-auto max-w-sm text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-white/60">That was</p>
            <p className="mt-2 text-4xl font-semibold">
              {album.title.split(' ').slice(0, -1).join(' ')} <span className="font-light italic">{album.title.split(' ').slice(-1)}</span>
            </p>
            <p className="mt-3 text-white/70">Want photos like these of your own? Tell us when and who’s coming.</p>
            <div className="mt-7 flex flex-col items-center gap-3">
              <Link
                to={planHref}
                onClick={onClose}
                className={`inline-flex min-h-[48px] items-center gap-2 rounded-full bg-brand-orange px-6 text-[15px] font-semibold text-brand-dark transition-colors hover:bg-[#f4a53f] ${ring}`}
              >
                <Luggage className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                Plan a trip like this
              </Link>
              {nextAlbum && (
                <button
                  type="button"
                  onClick={() => openAlbum(albumIdx + 1)}
                  className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/30 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10 ${ring}`}
                >
                  Next album: {nextAlbum.title}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
          </div>
        ) : (
          <img
            key={photo.id}
            src={photo.url}
            alt={photo.caption || album.title}
            className="picker-fade max-h-full max-w-full select-none rounded-lg object-contain shadow-2xl"
            draggable={false}
          />
        )}

        {/* Tap zones (phones and tablets): left third goes back, the rest goes forward. */}
        {!atEnd && (
          <>
            <button type="button" onClick={tap(prev)} aria-label="Previous photo" className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize focus-visible:outline-none sm:hidden" />
            <button type="button" onClick={tap(next)} aria-label="Next photo" className="absolute inset-y-0 right-0 w-2/3 cursor-e-resize focus-visible:outline-none sm:hidden" />
          </>
        )}

        {/* Desktop arrows. */}
        <button
          type="button"
          onClick={prev}
          disabled={photoIdx === 0 && albumIdx === 0}
          aria-label="Previous photo"
          className={`absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20 disabled:opacity-30 sm:inline-flex ${ring}`}
        >
          <ChevronLeft className="h-6 w-6" aria-hidden />
        </button>
        <button
          type="button"
          onClick={next}
          disabled={atEnd && !nextAlbum}
          aria-label={atEnd ? 'Next album' : 'Next photo'}
          className={`absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20 disabled:opacity-30 sm:inline-flex ${ring}`}
        >
          <ChevronRight className="h-6 w-6" aria-hidden />
        </button>
      </div>

      {!atEnd && (
        <p className="relative z-20 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-sm text-white/85">
          {photo.caption}
        </p>
      )}
    </div>,
    document.body
  );
}
