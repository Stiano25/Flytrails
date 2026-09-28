import { Images } from 'lucide-react';

/** An album cover: the first photo, the place and region, and how many photos are inside, with a small stack behind. */
export default function AlbumCover({ album, onOpen, className = '' }) {
  const cover = album.photos[0];
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${album.title} album, ${album.photos.length} ${album.photos.length === 1 ? 'photo' : 'photos'}`}
      className={`group relative block text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${className}`}
    >
      {/* Two prints peeking out behind the cover. */}
      <span className="absolute inset-x-3 -top-1.5 bottom-3 rounded-2xl bg-white/70 shadow-sm transition-transform duration-200 group-hover:-translate-y-1" aria-hidden />
      <span className="absolute inset-x-1.5 -top-0.5 bottom-1.5 rounded-2xl bg-white/85 shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5" aria-hidden />
      <span className="relative block h-full overflow-hidden rounded-2xl bg-brand-dark shadow-[0_18px_40px_-24px_rgba(13,27,42,0.7)]">
        <img
          src={cover.url}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/10 to-transparent" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-dark">
          <Images className="h-3.5 w-3.5" aria-hidden />
          {album.photos.length}
        </span>
        <span className="absolute inset-x-0 bottom-0 p-4">
          <span className="block text-lg font-semibold leading-tight text-white">{album.title}</span>
          <span className="mt-0.5 block text-xs italic text-white/75">{album.region}</span>
        </span>
      </span>
    </button>
  );
}
