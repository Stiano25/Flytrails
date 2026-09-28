import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { buildAlbums } from '../gallery/albums.js';
import AlbumCover from '../gallery/AlbumCover.jsx';
import AlbumViewer from '../gallery/AlbumViewer.jsx';

/** Home teaser for the gallery: four trip albums that open the same stories-style viewer as /gallery. */
export default function AlbumsTeaser({ images }) {
  const albums = useMemo(() => buildAlbums(images), [images]);
  const [open, setOpen] = useState(null);
  const opener = useRef(null);
  if (!albums.length) return null;

  const teaser = albums.slice(0, 4);
  return (
    <section aria-labelledby="albums-title" className="bg-brand-bg py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b5650d]">From our trips</p>
            <h2 id="albums-title" className="mt-2 text-3xl font-semibold tracking-tight text-brand-dark md:text-4xl">
              Trip <span className="font-light italic">albums</span>
            </h2>
          </div>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline decoration-brand-orange decoration-2 underline-offset-4 hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            All {albums.length} albums
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {teaser.map((album, i) => (
            <li key={album.id} style={{ aspectRatio: '3 / 4' }}>
              <AlbumCover
                album={album}
                className="h-full w-full"
                onOpen={(e) => {
                  opener.current = e?.currentTarget;
                  setOpen(i);
                }}
              />
            </li>
          ))}
        </ul>
      </div>
      {open !== null && (
        <AlbumViewer
          albums={albums}
          startAlbum={open}
          onClose={() => {
            setOpen(null);
            requestAnimationFrame(() => opener.current?.focus({ preventScroll: true }));
          }}
        />
      )}
    </section>
  );
}
