import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSwipe } from '../../hooks/useSwipe.js';
import { localImages } from '../../data/localImages.js';

const slides = [
  {
    title: 'Hiking',
    subtitle:
      'Mt Kenya to Kilimanjaro — expert guides, small groups, and trails that stay with you.',
    image: localImages.hiking,
    cta: { to: '/trips?category=Hiking', label: 'Explore hiking' },
  },
  {
    title: 'Savannah',
    subtitle:
      'Open plains, golden light, and wildlife moments with crews who know the Mara by heart.',
    image: localImages.lionSafari,
    cta: { to: '/trips?category=Safari', label: 'Explore safari' },
  },
  {
    title: 'Beach',
    subtitle:
      'Indian Ocean calm — Diani, Lamu, Zanzibar — slow days and clear water between adventures.',
    image: localImages.beach,
    cta: { to: '/trips?category=Beach', label: 'Explore coast' },
  },
  {
    title: 'World',
    subtitle:
      'City breaks and longer escapes abroad — halal-friendly stays and Flytrails pacing end to end.',
    image: localImages.baliInternational,
    cta: { to: '/trips?category=International', label: 'Explore trips' },
  },
];

const trust = [
  { label: 'Rated excellent', sub: '4.9★ from travellers' },
  { label: 'Trusted since 2022', sub: 'Kenya-based team' },
  { label: 'Small groups', sub: 'Real connections' },
];

export default function HeroCarousel() {
  const [i, setI] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const nextSrc = slides[(i + 1) % slides.length].image;
    const img = new Image();
    img.src = nextSrc;
  }, [i]);

  const next = useCallback(() => setI((x) => (x + 1) % slides.length), []);
  const prev = useCallback(() => setI((x) => (x - 1 + slides.length) % slides.length), []);

  const swipeHandlers = useSwipe(next, prev);

  useEffect(() => {
    if (!isAutoPlaying || reducedMotion) return;
    const id = setInterval(next, 8000);
    return () => clearInterval(id);
  }, [next, isAutoPlaying, reducedMotion]);

  const handleUserInteraction = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const slide = slides[i];

  return (
    <section
      className="relative min-h-[min(92vh,880px)] overflow-hidden bg-brand-dark"
      {...swipeHandlers}
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={i}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.6 }}
          >
            <img
              src={slide.image}
              alt=""
              width="1920"
              height="1080"
              className={`absolute inset-0 h-full w-full object-cover ${
                reducedMotion ? '' : 'animate-video-effect'
              }`}
              decoding="async"
              fetchPriority="high"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/60 to-brand-dark/35" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-transparent to-brand-dark/35" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
          }}
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[min(92vh,880px)] max-w-7xl flex-col justify-center px-4 pb-28 pt-24 md:px-6 md:pb-24 md:pt-28 lg:pb-20">
        <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-10 xl:gap-12">
          <div className="flex min-w-0 flex-1 flex-col justify-center lg:max-w-[58%] lg:flex-[0.58]">
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                transition={{ duration: reducedMotion ? 0 : 0.35 }}
              >
                <h1 className="font-beauty text-[clamp(4.75rem,20vw,12.5rem)] leading-[0.92] text-brand-light drop-shadow-md">
                  {slide.title}
                </h1>
                <p className="mt-7 max-w-xl font-sans text-lg font-extralight leading-relaxed text-brand-light/90 md:text-xl">
                  {slide.subtitle}
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                  <Link
                    to={slide.cta.to}
                    className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-3.5 text-sm font-bold tracking-wide text-brand-dark shadow-lg transition hover:bg-accent/90 hover:shadow-xl"
                  >
                    {slide.cta.label}
                  </Link>
                  <Link
                    to="/custom-tours"
                    className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-8 py-3.5 text-sm font-light text-brand-light backdrop-blur-md transition hover:bg-white/20"
                  >
                    Request a custom trip
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 grid gap-4 border-t border-white/15 pt-8 sm:grid-cols-3">
              {trust.map((t) => (
                <div key={t.label} className="text-left">
                  <p className="font-display text-base font-bold text-brand-light md:text-lg">{t.label}</p>
                  <p className="mt-1 font-sans text-sm font-extralight text-brand-light/70">{t.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-full shrink-0 lg:max-w-[40%] lg:flex-[0.42]">
            <div className="relative overflow-hidden rounded-3xl border border-white/25 bg-white/10 shadow-2xl backdrop-blur-xl">
              <div className="relative aspect-[4/5] max-h-[min(52vh,420px)] w-full sm:aspect-[16/11] sm:max-h-none lg:aspect-[4/5] lg:max-h-[min(58vh,440px)]">
                <AnimatePresence initial={false} mode="wait">
                  <motion.img
                    key={i}
                    src={slide.image}
                    alt={slide.title}
                    width="800"
                    height="1000"
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={{ opacity: 0, scale: reducedMotion ? 1 : 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.45 }}
                    loading="eager"
                    decoding="async"
                  />
                </AnimatePresence>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-brand-dark/20" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <p className="font-beauty text-[clamp(2.5rem,8vw,4.5rem)] leading-none text-white drop-shadow-lg">
                    {slide.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-white/15 bg-black/20 px-3 py-3 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => {
                    prev();
                    handleUserInteraction();
                  }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-brand-light transition hover:bg-white/20"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex flex-1 justify-center gap-1.5 px-1">
                  {slides.map((_, j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => {
                        setI(j);
                        handleUserInteraction();
                      }}
                      className={`h-2 rounded-full transition-all ${j === i ? 'w-8 bg-accent' : 'w-2 bg-white/35 hover:bg-white/50'}`}
                      aria-label={`Go to slide ${j + 1}`}
                      aria-current={j === i ? 'true' : 'false'}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    next();
                    handleUserInteraction();
                  }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-brand-light transition hover:bg-white/20"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
