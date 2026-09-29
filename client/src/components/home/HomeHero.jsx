import { useLayoutEffect, useRef } from 'react';
import TripFinder from './TripFinder.jsx';

/**
 * Keep the whole hero inside one screen: if the content is taller than the hero's
 * min-height (100svh, i.e. the screen with browser toolbars showing), shrink the headline
 * step by step until it fits. Spacing already scales with screen height in CSS.
 */
function useFitToScreen(ref) {
  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return undefined;
    let frame = 0;
    const fit = () => {
      const limit = parseFloat(getComputedStyle(section).minHeight) || window.innerHeight;
      let scale = 1;
      section.style.setProperty('--headline-scale', '1');
      while (section.scrollHeight > limit && scale > 0.5) {
        scale = Math.round((scale - 0.06) * 100) / 100;
        section.style.setProperty('--headline-scale', String(scale));
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

const FALLBACK_HERO = '/images/hero-palm-coast.jpg';

export default function HomeHero() {
  const ref = useRef(null);
  useFitToScreen(ref);

  return (
    <section
      ref={ref}
      className="home-hero relative isolate flex overflow-hidden bg-brand-dark"
      aria-labelledby="home-hero-title"
    >
      {/* Hot-air balloons at dawn. Framed so the glowing envelope sits behind the centred copy on phones.
          Falls back to the palm coast photo if the balloon image is missing. */}
      <img
        src="/images/hero-balloons.jpg"
        onError={(e) => {
          if (!e.currentTarget.src.endsWith(FALLBACK_HERO)) e.currentTarget.src = FALLBACK_HERO;
        }}
        alt=""
        width="2400"
        height="1600"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_40%] md:object-center"
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

      <div className="hero-fade mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 pb-[clamp(0.25rem,3.5svh,2.5rem)] pt-[calc(var(--nav-h)+clamp(0.5rem,2.5svh,1.5rem))] text-center md:px-6">
        <p className="text-[calc(clamp(0.7rem,min(2.8vw,1.9svh),0.95rem)*var(--headline-scale,1))] font-medium uppercase tracking-[0.35em] text-white/85 [text-shadow:0_1px_12px_rgba(13,27,42,0.5)]">
          Curated African Journeys
        </p>
        <h1 id="home-hero-title" className="mt-[clamp(0.25rem,1svh,0.75rem)] font-sans text-white text-balance [text-shadow:0_2px_24px_rgba(13,27,42,0.35)]">
          <span className="block font-script text-[calc(clamp(5rem,min(24vw,17svh),11.5rem)*var(--headline-scale,1))] font-normal leading-[1.05]">
            Adventures
          </span>
          <span className="mt-[0.15em] block text-[calc(clamp(1.2rem,min(5vw,4svh),2.25rem)*var(--headline-scale,1))] font-normal italic leading-tight text-white/90">
            planned properly, memories guaranteed.
          </span>
        </h1>
        <TripFinder />
      </div>
    </section>
  );
}
