import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { localImages } from '../../data/localImages.js';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white';

export default function HomeHero() {
  const ref = useRef(null);

  /** Track the real navbar height so the hero fills exactly the rest of the screen (CSS holds a fallback). */
  useEffect(() => {
    const header = document.querySelector('header');
    const section = ref.current;
    if (!header || !section || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      section.style.setProperty('--nav-h', `${header.getBoundingClientRect().height}px`);
    });
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="home-hero relative isolate flex overflow-hidden bg-brand-dark"
      aria-labelledby="home-hero-title"
    >
      <img
        src={localImages.international}
        alt=""
        width="1149"
        height="1369"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_45%]"
        decoding="async"
        fetchpriority="high"
      />
      {/* Scrims: darken only the lower-left where the copy sits, keep the sunset visible. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-brand-dark/90 via-brand-dark/50 to-brand-dark/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 hidden bg-gradient-to-r from-brand-dark/60 via-brand-dark/20 to-transparent md:block"
        aria-hidden
      />

      <div className="hero-fade mx-auto flex w-full max-w-7xl flex-col justify-end px-4 pb-10 pt-8 sm:pb-14 md:px-6 md:pb-20 lg:pb-24 [@media(max-height:500px)]:py-5">
        <div className="max-w-2xl">
          <h1
            id="home-hero-title"
            className="font-display text-[clamp(2.25rem,min(7vw,11svh),5rem)] font-bold leading-[1.05] tracking-tight text-white text-balance"
          >
            Your Passport to Paradise
          </h1>
          <p className="mt-4 max-w-xl font-sans text-lg [@media(max-height:500px)]:mt-2 font-light leading-relaxed text-white/90 md:mt-5 md:text-xl">
            Tailor-made trips and group adventures, planned with care.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4 [@media(max-height:500px)]:mt-4">
            <Link
              to="/custom-tours"
              className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-brand-dark shadow-lg transition-colors duration-200 hover:bg-[#e0bb82] sm:w-auto ${focusRing}`}
            >
              Plan my trip
            </Link>
            <Link
              to="/trips"
              className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-white/60 bg-white/5 px-8 text-base font-medium text-white transition-colors duration-200 hover:border-white hover:bg-white/15 sm:w-auto ${focusRing}`}
            >
              Explore trips
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
