import { useLayoutEffect, useRef } from 'react';
import TripFinder from './TripFinder.jsx';

/**
 * Keep the whole hero inside one screen: if the content is taller than the hero's
 * min-height (100svh, i.e. the screen with browser toolbars showing), shrink the headline
 * step by step and, if needed, drop the sub-line until it fits. Spacing already scales with screen height in CSS.
 */
function useFitToScreen(ref) {
  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return undefined;
    let frame = 0;
    const fit = () => {
      const limit = parseFloat(getComputedStyle(section).minHeight) || window.innerHeight;
      const overflows = () => section.scrollHeight > limit + 1;
      const shrink = (floor) => {
        let scale = 1;
        section.style.setProperty('--headline-scale', '1');
        while (overflows() && scale > floor) {
          scale = Math.round((scale - 0.06) * 100) / 100;
          section.style.setProperty('--headline-scale', String(scale));
        }
      };
      // First keep the sub-line and shrink the headline a little; if that is not enough, drop the sub-line.
      delete section.dataset.compact;
      shrink(0.8);
      if (overflows()) {
        section.dataset.compact = 'true';
        shrink(0.62);
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

      <div className="hero-fade mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 pb-[clamp(0.25rem,3.5svh,2.5rem)] pt-[calc(var(--nav-h)+clamp(0.5rem,2.5svh,1.5rem))] text-center md:px-6">
        <h1
          id="home-hero-title"
          className="font-inter text-[calc(clamp(2.125rem,min(8.4vw,7.2svh),4.75rem)*var(--headline-scale,1))] font-bold leading-[1.04] tracking-[-0.03em] text-white text-balance [text-shadow:0_2px_24px_rgba(13,27,42,0.35)]"
        >
          Adventures planned properly, memories guaranteed.
        </h1>
        <p className="hero-sub mt-[clamp(0.5rem,2svh,1.25rem)] max-w-xl font-inter text-base font-normal leading-snug text-white/85 sm:text-lg">
          Tailor-made trips and group adventures, planned with care.
        </p>
        <TripFinder />
      </div>
    </section>
  );
}
