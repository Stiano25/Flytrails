import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStories } from '../postcards/stories.js';
import { PostcardFull, Stars, StoriesBackdrop, StoryFilters } from '../postcards/Postcard.jsx';
import PhotoStack from '../postcards/PhotoStack.jsx';
import FinderPicker from './FinderPicker.jsx';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

/**
 * "Stories from the trail": one full screen, like the hero. Reviews sit in a hand-held pile of porcelain
 * postcards over a blurred slice of the hero photo; swipe (or Next) sends the top card to the back.
 * The section always renders at full height (a blank pile while reviews load) so the page never jumps,
 * filters follow the hero trip finder, and every postcard offers "Plan a trip like this".
 */
export default function TestimonialsSection() {
  const { stories, filters, average, ratedCount, loading } = useStories();
  const [filter, setFilter] = useState('all');
  const [fromPlan, setFromPlan] = useState(false);
  const [position, setPosition] = useState(0);
  const [openStory, setOpenStory] = useState(null);
  const stackRef = useRef(null);
  const lastOpener = useRef(null);

  const shown = useMemo(() => (filter === 'all' ? stories : stories.filter((s) => s.types.includes(filter))), [stories, filter]);
  const activeLabel = filters.find((f) => f.value === filter)?.label;

  // When someone picks a trip type in the hero finder, show matching postcards (if we have any).
  useEffect(() => {
    const onFinder = (e) => {
      if (e.detail?.step !== 'choose:type') return;
      if (e.detail.type && filters.some((f) => f.value === e.detail.type)) {
        setFilter(e.detail.type);
        setFromPlan(true);
      }
    };
    window.addEventListener('flytrails:finder', onFinder);
    return () => window.removeEventListener('flytrails:finder', onFinder);
  }, [filters]);

  const onChange = useCallback((i) => setPosition(Math.max(0, i)), []);

  function chooseFilter(value) {
    setFilter(value);
    setFromPlan(false);
  }

  function openFull(story) {
    lastOpener.current = document.activeElement;
    setOpenStory(story);
  }

  function closeFull() {
    setOpenStory(null);
    requestAnimationFrame(() => lastOpener.current?.focus({ preventScroll: true }));
  }

  if (!loading && !stories.length) return null;

  const space = 'mt-[clamp(0.75rem,2.6svh,1.75rem)]';

  return (
    <section
      aria-labelledby="postcards-title"
      className="relative isolate flex h-screen min-h-[34rem] flex-col overflow-hidden text-white supports-[height:100svh]:h-[100svh] [@media(max-height:500px)]:min-h-0"
    >
      <StoriesBackdrop />
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col px-4 pb-[clamp(1rem,3svh,2rem)] pt-[clamp(1.5rem,6svh,4rem)] md:px-6">
        <header className="text-center">
          <h2 id="postcards-title" className="text-[clamp(1.9rem,min(7vw,5.5svh),3.25rem)] font-semibold leading-tight tracking-tight">
            Stories from the <span className="font-light italic">trail</span>
          </h2>
          {average > 0 && (
            <p className="mt-2 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-sm text-white/75 [@media(max-height:500px)]:hidden">
              <Stars value={Math.round(average)} className="h-3.5 w-3.5" />
              <span>
                <strong className="font-semibold text-white">{average.toFixed(1)}</strong> · {ratedCount} reviews
              </span>
              <span aria-hidden>·</span>
              <Link
                to="/reviews"
                className={`inline-flex items-center gap-1 font-medium text-white underline decoration-brand-orange decoration-2 underline-offset-4 hover:text-white/80 ${ring}`}
              >
                Read all
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </p>
          )}
        </header>

        {filters.length > 1 && (
          // Short landscape screens: skip the filters so the postcard keeps enough room.
          <div className={`${space} flex flex-col items-center gap-1.5 [@media(max-height:500px)]:hidden`}>
            <StoryFilters filters={filters} total={stories.length} value={filter} onChange={chooseFilter} tone="dark" singleLine />
            {fromPlan && activeLabel && (
              <p className="text-xs text-white/65" aria-live="polite">
                Showing {activeLabel.toLowerCase()} stories for your plan ·{' '}
                <button type="button" onClick={() => chooseFilter('all')} className={`font-semibold text-white underline underline-offset-4 ${ring}`}>
                  show all
                </button>
              </p>
            )}
          </div>
        )}

        <div
          className={`${space} relative mx-auto min-h-0 w-full max-w-3xl flex-1 pb-4 focus-visible:outline-none`}
          role="group"
          aria-roledescription="carousel"
          aria-label={`Traveller postcards, ${position + 1} of ${shown.length || 1}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') stackRef.current?.next();
            if (e.key === 'ArrowLeft') stackRef.current?.prev();
          }}
        >
          {shown.length ? (
            <PhotoStack
              ref={stackRef}
              stories={shown}
              onOpen={openFull}
              onChange={onChange}
              preferredType={filter !== 'all' ? filter : undefined}
            />
          ) : (
            // Reserved space while reviews load: a blank pile, so nothing below jumps when they arrive.
            <div className="relative h-full" aria-hidden>
              <span className="porcelain absolute inset-0 translate-y-3 rotate-[2deg] rounded-[22px] opacity-60" />
              <span className="porcelain absolute inset-0 animate-pulse rounded-[22px]" />
            </div>
          )}
        </div>

        <div className={`${space} mx-auto flex w-full max-w-3xl items-center gap-3`}>
          <button
            type="button"
            onClick={() => stackRef.current?.prev()}
            disabled={shown.length < 2}
            className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-3.5 text-sm font-medium text-white backdrop-blur transition-colors duration-150 hover:bg-white/15 active:scale-95 disabled:opacity-40 sm:px-4 ${ring}`}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
            <span className="hidden sm:inline">Previous</span>
            <span className="sr-only sm:hidden">Previous story</span>
          </button>
          <div className="flex flex-1 items-center gap-3">
            <span className="text-sm tabular-nums text-white/70" aria-live="polite">
              {String(position + 1).padStart(2, '0')} / {String(shown.length || 0).padStart(2, '0')}
            </span>
            <span className="relative h-px flex-1 bg-white/15" aria-hidden>
              <span
                className="absolute inset-y-0 left-0 bg-brand-orange transition-[width] duration-300 motion-reduce:transition-none"
                style={{ width: `${shown.length ? ((position + 1) / shown.length) * 100 : 0}%` }}
              />
            </span>
            <span className="text-xs text-white/55 sm:hidden">Swipe</span>
          </div>
          <button
            type="button"
            onClick={() => stackRef.current?.next()}
            disabled={shown.length < 2}
            className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-brand-dark transition-colors duration-150 hover:bg-white/90 active:scale-95 disabled:opacity-40 sm:px-5 ${ring}`}
          >
            Next story
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
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
