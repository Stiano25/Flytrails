import { useLayoutEffect, useRef } from 'react';
import TripFinder from './TripFinder.jsx';

/**
 * Keep the whole hero inside one screen: if the content is taller than the hero's
 * min-height (100svh, i.e. the screen with browser toolbars showing), shrink the quote
 * step by step until it fits. Spacing already scales with screen height in CSS.
 */
function useFitToScreen(ref) {
  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return undefined;
    let frame = 0;
    const fit = () => {
      section.style.setProperty('--quote-scale', '1');
      const limit = parseFloat(getComputedStyle(section).minHeight) || window.innerHeight;
      let scale = 1;
      while (section.scrollHeight > limit + 1 && scale > 0.62) {
        scale = Math.round((scale - 0.06) * 100) / 100;
        section.style.setProperty('--quote-scale', String(scale));
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    fit();
    document.fonts?.ready.then(schedule);
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
    };
  }, [ref]);
}

export default function HomeHero() {
  const ref = useRef(null);
  useFitToScreen(ref);

  return (
    <section
      ref={ref}
      className="home-hero relative isolate flex overflow-hidden bg-brand-dark"
      aria-labelledby="home-hero-title"
    >
      <img
        src="/images/hero-palm-coast.jpg"
        alt=""
        width="1332"
        height="749"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[60%_60%]"
        decoding="async"
        fetchpriority="high"
      />
      {/* Dark gradient: heavier at the top (navbar) and bottom, a lighter band through the middle, plus a soft pool behind the copy. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to bottom, rgba(13,27,42,0.7) 0%, rgba(13,27,42,0.45) 30%, rgba(13,27,42,0.45) 60%, rgba(13,27,42,0.8) 100%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 65% 50% at 50% 50%, rgba(13,27,42,0.35), transparent 75%)' }}
        aria-hidden
      />

      <div className="hero-fade mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-4 pb-[clamp(0.25rem,3.5svh,2.5rem)] pt-[calc(var(--nav-h)+clamp(0.5rem,2.5svh,1.5rem))] text-center md:px-6">
        <figure className="max-w-4xl">
          <blockquote
            className="font-serif text-[calc(clamp(1.625rem,min(7vw,6.2svh),4.25rem)*var(--quote-scale,1))] font-normal leading-[1.1] tracking-[-0.01em] text-white text-balance [text-shadow:0_2px_24px_rgba(13,27,42,0.35)]"
          >
            <p>
              &ldquo;There is a kind of magicness about going far away and then coming back all changed.&rdquo;
            </p>
          </blockquote>
          <figcaption className="mt-[clamp(0.5rem,2svh,1.25rem)] font-sans text-xs font-medium uppercase tracking-[0.2em] text-accent md:text-sm">
            Kate Douglas Wiggin
          </figcaption>
        </figure>
        <h1
          id="home-hero-title"
          className="mt-[clamp(0.5rem,2.2svh,1.5rem)] max-w-xl font-sans text-base font-light leading-snug text-white/90 sm:text-lg md:text-xl"
        >
          Tailor-made trips and group adventures, planned with care.
        </h1>
        <TripFinder />
      </div>
    </section>
  );
}
