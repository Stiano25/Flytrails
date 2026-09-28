import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Luggage } from 'lucide-react';
import { useStories } from '../postcards/stories.js';
import Postcard, { PostcardFull, Stars, StoriesBackdrop, StoryFilters } from '../postcards/Postcard.jsx';
import FinderPicker from './FinderPicker.jsx';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

/**
 * "Stories from the trail": reviews as a stack of porcelain postcards over a blurred slice of the hero photo.
 * One postcard at a time (swipe, buttons or arrow keys) with two cards stacked neatly behind it.
 * Filters follow the hero trip finder, every postcard offers "Plan a trip like this", and the section ends
 * by sending people back to plan their own trip.
 */
export default function TestimonialsSection() {
  const { stories, filters, average, ratedCount } = useStories();
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState('all');
  const [fromPlan, setFromPlan] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [openStory, setOpenStory] = useState(null);
  const lastOpener = useRef(null);

  const shown = filter === 'all' ? stories : stories.filter((s) => s.types.includes(filter));
  const current = shown[Math.min(index, shown.length - 1)];
  const activeLabel = filters.find((f) => f.value === filter)?.label;

  // When someone picks a trip type in the hero finder, show matching postcards (if we have any).
  useEffect(() => {
    const onFinder = (e) => {
      if (e.detail?.step !== 'choose:type') return;
      if (e.detail.type && filters.some((f) => f.value === e.detail.type)) {
        setFilter(e.detail.type);
        setFromPlan(true);
        setIndex(0);
      }
    };
    window.addEventListener('flytrails:finder', onFinder);
    return () => window.removeEventListener('flytrails:finder', onFinder);
  }, [filters]);

  function go(step) {
    if (!shown.length) return;
    setDirection(step);
    setIndex((i) => (i + step + shown.length) % shown.length);
  }

  function chooseFilter(value) {
    setFilter(value);
    setFromPlan(false);
    setIndex(0);
  }

  function openFull(story) {
    lastOpener.current = document.activeElement;
    setOpenStory(story);
  }

  function closeFull() {
    setOpenStory(null);
    requestAnimationFrame(() => lastOpener.current?.focus({ preventScroll: true }));
  }

  if (!stories.length || !current) return null;

  const slide = reduce ? 0 : 60;

  return (
    <section aria-labelledby="postcards-title" className="relative isolate overflow-hidden py-20 text-white md:py-28">
      <StoriesBackdrop />
      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Postcards from our travellers</p>
          <h2 id="postcards-title" className="mt-3 font-headline text-5xl font-semibold tracking-tight md:text-6xl">
            Stories from the trail
          </h2>
          {average > 0 && (
            <div className="glass-panel mx-auto mt-6 inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-2xl px-5 py-3">
              <span className="font-headline text-4xl font-semibold leading-none">{average.toFixed(1)}</span>
              <span className="text-left">
                <Stars value={Math.round(average)} className="h-4 w-4" />
                <span className="block text-sm text-white/70">from {ratedCount} reviews</span>
              </span>
              <Link
                to="/reviews"
                className={`inline-flex items-center gap-1 text-sm font-semibold text-white underline decoration-accent decoration-2 underline-offset-4 hover:text-white/80 ${ring}`}
              >
                Read them all
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          )}
        </div>

        {filters.length > 1 && (
          <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-3">
            <StoryFilters filters={filters} total={stories.length} value={filter} onChange={chooseFilter} tone="dark" />
            {fromPlan && activeLabel && (
              <p className="text-sm text-white/65" aria-live="polite">
                Showing {activeLabel.toLowerCase()} stories to match your plan.{' '}
                <button type="button" onClick={() => chooseFilter('all')} className={`font-semibold text-white underline underline-offset-4 ${ring}`}>
                  Show all
                </button>
              </p>
            )}
          </div>
        )}

        {/* The stack: two blank cards squared up neatly behind the current postcard. */}
        <div
          className="relative mx-auto mt-12 max-w-3xl"
          role="group"
          aria-roledescription="carousel"
          aria-label="Traveller postcards"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') go(1);
            if (e.key === 'ArrowLeft') go(-1);
          }}
        >
          {shown.length > 1 && (
            <>
              <span className="porcelain absolute inset-x-10 -bottom-6 top-6 rounded-[22px] opacity-40" aria-hidden />
              <span className="porcelain absolute inset-x-5 -bottom-3 top-3 rounded-[22px] opacity-70" aria-hidden />
            </>
          )}
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * slide }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * slide }}
              transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
              drag={reduce || shown.length < 2 ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.35}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70) go(1);
                else if (info.offset.x > 70) go(-1);
              }}
              className="relative cursor-grab active:cursor-grabbing"
              aria-label={`Postcard ${Math.min(index, shown.length - 1) + 1} of ${shown.length}, from ${current.name}`}
            >
              <Postcard
                story={current}
                lines={7}
                onOpen={openFull}
                preferredType={filter !== 'all' ? filter : undefined}
                className="sm:min-h-[21rem]"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {shown.length > 1 && (
          <div className="mx-auto mt-12 flex max-w-3xl items-center gap-4">
            <button
              type="button"
              onClick={() => go(-1)}
              className={`inline-flex min-h-[48px] shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-4 text-sm font-medium text-white backdrop-blur transition-colors duration-150 hover:bg-white/15 active:scale-95 ${ring}`}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
              <span className="hidden sm:inline">Previous</span>
              <span className="sr-only sm:hidden">Previous story</span>
            </button>
            <div className="flex flex-1 items-center gap-3">
              <span className="text-sm tabular-nums text-white/70" aria-live="polite">
                {String(Math.min(index, shown.length - 1) + 1).padStart(2, '0')} / {String(shown.length).padStart(2, '0')}
              </span>
              <span className="relative h-px flex-1 bg-white/15" aria-hidden>
                <span
                  className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-300 motion-reduce:transition-none"
                  style={{ width: `${((Math.min(index, shown.length - 1) + 1) / shown.length) * 100}%` }}
                />
              </span>
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              className={`inline-flex min-h-[48px] shrink-0 items-center gap-1.5 rounded-full bg-white px-5 text-sm font-semibold text-brand-dark transition-colors duration-150 hover:bg-white/90 active:scale-95 ${ring}`}
            >
              Next story
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        )}

        {/* Guide the next step: from reading someone else's story to starting your own. */}
        <div className="glass-panel mx-auto mt-14 flex max-w-3xl flex-col items-center gap-5 rounded-3xl px-6 py-7 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-lg font-semibold">Your postcard starts with three taps.</p>
            <p className="mt-1 text-[15px] text-white/65">Tell us the trip, the month and who’s coming. We plan the rest.</p>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-3 sm:items-end">
            <Link
              to="/?plan=1"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-brand-dark transition-colors duration-150 hover:bg-[#e0bb82] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Luggage className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              Plan my trip
            </Link>
            <Link to="/reviews" className={`inline-flex items-center gap-1 text-sm font-medium text-white/75 underline-offset-4 hover:text-white hover:underline ${ring}`}>
              Read all {stories.length} stories
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      <FinderPicker
        open={Boolean(openStory)}
        stepKey={openStory?.id || 'none'}
        width={640}
        title={openStory ? `A postcard from ${openStory.name}` : ''}
        subtitle={openStory ? `${openStory.place}${openStory.when ? ` · ${openStory.when}` : ''}` : ''}
        onClose={closeFull}
      >
        {openStory && <PostcardFull story={openStory} />}
      </FinderPicker>
    </section>
  );
}
