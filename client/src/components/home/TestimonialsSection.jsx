import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useTestimonials } from '../../hooks/useApi.js';

/** Drift speed (pixels per second) — transform-based so it works in all browsers */
const AUTO_SCROLL_PX_PER_SEC = 12;
const RESUME_MS = 4000;

function StarRow() {
  return (
    <div className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-3.5 w-3.5 text-accent" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ t }) {
  return (
    <article className="flex h-full min-h-[260px] w-[min(85vw,20rem)] shrink-0 flex-col rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_12px_40px_-12px_rgba(13,27,42,0.15)] sm:min-h-[280px] sm:w-[20rem] sm:p-7 md:w-[22rem]">
      <div className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-4">
        <Quote className="h-8 w-8 shrink-0 text-primary/35" aria-hidden />
        <StarRow />
      </div>

      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-brand-dark/90 sm:text-base sm:leading-relaxed">
        {t.quote}
      </blockquote>

      <footer className="mt-6 flex items-center gap-3 border-t border-neutral-100 pt-5">
        {t.authorImageUrl ? (
          <img
            src={t.authorImageUrl}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-neutral-100 sm:h-14 sm:w-14"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white ring-2 ring-primary/10 sm:h-14 sm:w-14 sm:text-base"
            aria-hidden
          >
            {t.authorName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-brand-dark">{t.authorName}</p>
          {t.authorDetail && (
            <p className="mt-0.5 text-xs text-neutral-500 sm:text-sm">{t.authorDetail}</p>
          )}
        </div>
      </footer>
    </article>
  );
}

export default function TestimonialsSection() {
  const { data, loading, error } = useTestimonials();
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const loopWidthRef = useRef(0);
  const pauseRef = useRef(false);
  const resumeTimerRef = useRef(null);
  const lastTickRef = useRef(0);
  const rafIdRef = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const applyOffset = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transform = `translate3d(${-offsetRef.current}px,0,0)`;
  }, []);

  const measureLoop = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const half = track.scrollWidth / 2;
    loopWidthRef.current = half > 0 ? half : 0;
    const lw = loopWidthRef.current;
    if (lw > 0 && offsetRef.current >= lw) {
      offsetRef.current %= lw;
      applyOffset();
    }
  }, [applyOffset]);

  const scheduleResume = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    pauseRef.current = true;
    resumeTimerRef.current = setTimeout(() => {
      pauseRef.current = false;
      resumeTimerRef.current = null;
    }, RESUME_MS);
  }, []);

  const getStepPx = useCallback(() => {
    const track = trackRef.current;
    const first = track?.querySelector('article');
    if (!first || !track) return 340;
    const g = window.getComputedStyle(track).gap || '24px';
    const gap = parseFloat(String(g)) || 24;
    return first.getBoundingClientRect().width + gap;
  }, []);

  const scrollByDir = useCallback(
    (dir) => {
      scheduleResume();
      const lw = loopWidthRef.current;
      if (lw <= 0) return;
      const step = getStepPx();
      let next = offsetRef.current + dir * step;
      next = ((next % lw) + lw) % lw;
      offsetRef.current = next;
      applyOffset();
    },
    [applyOffset, getStepPx, scheduleResume],
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  /** Transform-based auto drift — does not use scrollLeft (avoids overflow / subpixel bugs) */
  useEffect(() => {
    if (!data?.length || reducedMotion) return;

    let cancelled = false;

    const tick = (now) => {
      if (cancelled) return;
      const dt = Math.min((now - lastTickRef.current) / 1000, 0.08);
      lastTickRef.current = now;

      const track = trackRef.current;
      if (track && loopWidthRef.current <= 0 && track.scrollWidth > 0) {
        loopWidthRef.current = track.scrollWidth / 2;
      }

      const lw = loopWidthRef.current;
      if (lw > 0 && !pauseRef.current) {
        offsetRef.current += AUTO_SCROLL_PX_PER_SEC * dt;
        if (offsetRef.current >= lw) {
          offsetRef.current -= lw;
        }
        applyOffset();
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    lastTickRef.current = performance.now();
    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [data, reducedMotion, applyOffset]);

  /** Measure after paint + on resize / images */
  useEffect(() => {
    if (!data?.length) return;
    const track = trackRef.current;
    if (!track) return;

    const ro = new ResizeObserver(() => {
      measureLoop();
      applyOffset();
    });
    ro.observe(track);

    requestAnimationFrame(() => {
      measureLoop();
      applyOffset();
    });

    const imgs = track.querySelectorAll('img');
    const onImg = () => {
      measureLoop();
      applyOffset();
    };
    imgs.forEach((img) => img.addEventListener('load', onImg));

    return () => {
      ro.disconnect();
      imgs.forEach((img) => img.removeEventListener('load', onImg));
    };
  }, [data, measureLoop, applyOffset]);

  if (loading || error || !data?.length) return null;

  const loopSlides = [...data, ...data];

  return (
    <section className="relative overflow-hidden border-t border-black/5 bg-gradient-to-b from-[#f4f1eb] via-white to-[#f8f6f2] py-16 md:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55 }}
          className="mb-10 text-center md:mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Testimonials</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-brand-dark md:text-4xl">
            What our guests say
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600 md:text-base">
            {reducedMotion
              ? 'Use the arrows to move between stories.'
              : 'Reviews from travelers who explored with Flytrails. Auto-playing carousel — use arrows anytime.'}
          </p>
        </motion.div>

        <div className="relative">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#f8f6f2] to-transparent sm:w-14 md:w-16"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#f8f6f2] to-transparent sm:w-14 md:w-16"
            aria-hidden
          />

          <button
            type="button"
            aria-label="Previous testimonial"
            onClick={() => scrollByDir(-1)}
            className="absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200/80 bg-white text-brand-dark shadow-md transition hover:border-primary/30 hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:left-1 sm:h-11 sm:w-11"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            onClick={() => scrollByDir(1)}
            className="absolute right-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200/80 bg-white text-brand-dark shadow-md transition hover:border-primary/30 hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:right-1 sm:h-11 sm:w-11"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>

          <div
            className="overflow-hidden px-10 sm:px-12 md:px-14"
            onPointerDown={scheduleResume}
            onWheel={scheduleResume}
          >
            <div
              ref={trackRef}
              className="flex w-max gap-5 will-change-transform md:gap-6"
              style={{ transform: 'translate3d(0,0,0)' }}
              role="region"
              aria-roledescription="carousel"
              aria-label="Traveler testimonials"
            >
              {loopSlides.map((t, index) => (
                <TestimonialCard key={`${t.id}-${index}`} t={t} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
