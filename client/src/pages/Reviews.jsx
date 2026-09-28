import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleCheck, Luggage, PenLine, Star } from 'lucide-react';
import { useSubmit } from '../hooks/useApi.js';
import { api } from '../data/api.js';
import { useStories } from '../components/postcards/stories.js';
import Postcard, { PostcardFull, Stars, StoryFilters } from '../components/postcards/Postcard.jsx';
import FinderPicker from '../components/home/FinderPicker.jsx';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const fieldClass =
  'mt-1.5 w-full rounded-xl border border-brand-dark/15 bg-white px-3.5 py-3 text-[15px] text-brand-dark transition placeholder:text-brand-dark/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25';
const labelClass = 'text-sm font-semibold text-brand-dark';

const RATING_WORDS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

/** Sentence starters that help people write a useful review. */
const PROMPTS = [
  { label: 'Where did you go?', text: 'We went to ' },
  { label: 'Best moment', text: 'The best moment was ' },
  { label: 'Would you recommend us?', text: 'I’d recommend Flytrails because ' },
];

/** Guided review form: stars first, then the story (with prompts), then who it's from. */
function ShareStoryForm({ onDone }) {
  const { submit, loading } = useSubmit();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const bodyRef = useRef(null);

  function addPrompt(text) {
    setBody((b) => (b.trim() ? `${b.trimEnd()}\n${text}` : text));
    requestAnimationFrame(() => {
      const el = bodyRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const result = await submit(() =>
      api.submitCustomerReview({
        authorName: name.trim(),
        authorEmail: String(fd.get('authorEmail') || '').trim(),
        rating: rating || '',
        body: body.trim(),
      })
    );
    setStatus(
      result.success
        ? { state: 'sent', message: '' }
        : { state: 'error', message: result.error || 'We couldn’t send your review. Please try again.' }
    );
  }

  if (status.state === 'sent') {
    return (
      <div className="py-6 text-center">
        <CircleCheck className="mx-auto h-12 w-12 text-primary" strokeWidth={1.5} aria-hidden />
        <p className="mt-4 text-xl font-semibold text-brand-dark">Thank you{name ? `, ${name.split(' ')[0]}` : ''}.</p>
        <p className="mx-auto mt-2 max-w-sm text-[15px] text-brand-dark/70">
          Your postcard is with our team. Once it’s approved it will appear on this page.
        </p>
        <button
          type="button"
          onClick={onDone}
          className={`mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-primary px-6 text-[15px] font-semibold text-white hover:bg-primary/90 ${ring}`}
        >
          Back to the stories
        </button>
      </div>
    );
  }

  const shownRating = hover || rating;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset>
        <legend className={labelClass}>How was your trip?</legend>
        <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? 's' : ''}, ${RATING_WORDS[n - 1]}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-150 hover:scale-110 active:scale-95 ${ring}`}
            >
              <Star
                className={`h-8 w-8 transition-colors duration-150 ${n <= shownRating ? 'fill-accent text-accent' : 'text-brand-dark/25'}`}
                strokeWidth={1.5}
                aria-hidden
              />
            </button>
          ))}
          <span className="ml-2 text-sm font-medium text-brand-dark/65" aria-live="polite">
            {shownRating ? RATING_WORDS[shownRating - 1] : 'Tap a star'}
          </span>
        </div>
      </fieldset>

      <div>
        <label htmlFor="review-body" className={labelClass}>
          Your story
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {PROMPTS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => addPrompt(p.text)}
              className={`inline-flex min-h-[36px] items-center rounded-full border border-brand-dark/15 bg-white px-3 text-sm text-brand-dark/80 transition-colors duration-150 hover:border-primary/50 hover:text-primary ${ring}`}
            >
              + {p.label}
            </button>
          ))}
        </div>
        <textarea
          id="review-body"
          ref={bodyRef}
          name="body"
          required
          rows={6}
          minLength={10}
          maxLength={5000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell future travellers what it was really like."
          className={fieldClass}
        />
        <p className="mt-1 text-right text-xs tabular-nums text-brand-dark/45">{body.length} / 5000</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="review-name" className={labelClass}>
            Your name
          </label>
          <input
            id="review-name"
            name="authorName"
            required
            maxLength={120}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="review-email" className={labelClass}>
            Email <span className="font-normal text-brand-dark/50">(optional, never shown)</span>
          </label>
          <input id="review-email" name="authorEmail" type="email" maxLength={200} autoComplete="email" className={fieldClass} />
        </div>
      </div>

      {status.state === 'error' && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {status.message}
        </p>
      )}

      <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-xs text-brand-dark/55">Every review is read by our team before it’s published.</p>
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-brand-dark transition-colors duration-150 hover:bg-[#e0bb82] disabled:opacity-60 sm:w-auto ${ring}`}
        >
          <PenLine className="h-4 w-4" aria-hidden />
          {loading ? 'Sending…' : 'Send my postcard'}
        </button>
      </div>
    </form>
  );
}

export default function Reviews() {
  const { stories, filters, average, ratedCount, loading } = useStories();
  const [filter, setFilter] = useState('all');
  const [openStory, setOpenStory] = useState(null);
  const [sharing, setSharing] = useState(false);
  const lastOpener = useRef(null);

  const shown = filter === 'all' ? stories : stories.filter((s) => s.types.includes(filter));
  // Lead with one story: a full-length, top-rated review reads best as the featured postcard.
  const featured = shown.find((s) => s.rating === 5 && s.text.length > 300 && s.text.length < 1100) || shown[0];
  const rest = shown.filter((s) => s !== featured);
  const preferredType = filter !== 'all' ? filter : undefined;

  function openDialog(setter, value) {
    lastOpener.current = document.activeElement;
    setter(value);
  }

  function closeDialog(setter, value) {
    setter(value);
    requestAnimationFrame(() => lastOpener.current?.focus({ preventScroll: true }));
  }


  return (
    <div>
      {/* Compact bar: people chose to read reviews, so get straight to them. */}
      <section className="border-b border-brand-dark/10 bg-[#f4efe4]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-brand-dark">Reviews</h1>
            {ratedCount > 0 && (
              <p className="flex items-center gap-2 text-sm text-brand-dark/70">
                <Stars value={Math.round(average)} className="h-3.5 w-3.5" />
                <span>
                  <strong className="font-semibold text-brand-dark">{average.toFixed(1)}</strong> · {ratedCount} reviews
                </span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/?plan=1" className={`inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark/75 underline-offset-4 hover:text-brand-dark hover:underline ${ring}`}>
              <Luggage className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Plan my trip
            </Link>
            <button
              type="button"
              onClick={() => openDialog(setSharing, true)}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-full bg-brand-orange px-5 text-sm font-semibold text-brand-dark transition-colors duration-150 hover:bg-[#f4a53f] active:scale-[0.98] ${ring}`}
            >
              <PenLine className="h-4 w-4" aria-hidden />
              Share your story
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[#f4efe4] pb-16 pt-6 md:pb-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          {filters.length > 1 && <StoryFilters filters={filters} total={stories.length} value={filter} onChange={setFilter} />}

          {loading && !stories.length ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-2" aria-hidden>
              {[0, 1].map((i) => (
                <div key={i} className="porcelain h-72 animate-pulse rounded-[22px]" />
              ))}
            </div>
          ) : !stories.length ? (
            <div className="porcelain mt-8 rounded-[22px] px-6 py-12 text-center">
              <p className="text-lg font-semibold text-brand-dark">No stories yet.</p>
              <p className="mt-1 text-[15px] text-brand-dark/65">Travelled with us? Yours could be the first.</p>
              <button
                type="button"
                onClick={() => openDialog(setSharing, true)}
                className={`mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-semibold text-white hover:bg-primary/90 ${ring}`}
              >
                <PenLine className="h-4 w-4" aria-hidden />
                Share your story
              </button>
            </div>
          ) : (
            <>
              {featured && (
                <div className="mt-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">Featured story</p>
                  <Postcard
                    story={featured}
                    lines={10}
                    preferredType={preferredType}
                    onOpen={(s) => openDialog(setOpenStory, s)}
                    className="sm:p-10"
                  />
                </div>
              )}
              {rest.length > 0 && (
                <ul className="mt-10 grid gap-8 lg:grid-cols-2">
                  {rest.map((story) => (
                    <li key={story.id}>
                      <Postcard story={story} lines={6} preferredType={preferredType} onOpen={(s) => openDialog(setOpenStory, s)} className="h-full" />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {stories.length > 0 && (
            <div className="porcelain mt-16 flex flex-col items-center gap-5 rounded-[22px] px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
              <div>
                <p className="text-lg font-semibold text-brand-dark">Where will your story start?</p>
                <p className="mt-1 text-[15px] text-brand-dark/65">Pick a trip, a month and who’s coming. We’ll plan the rest.</p>
              </div>
              <Link
                to="/?plan=1"
                className={`inline-flex min-h-[48px] shrink-0 items-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-brand-dark transition-colors duration-150 hover:bg-[#e0bb82] active:scale-[0.98] ${ring}`}
              >
                <Luggage className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                Plan my trip
              </Link>
            </div>
          )}
        </div>
      </section>

      <FinderPicker
        open={Boolean(openStory)}
        stepKey={openStory?.id || 'none'}
        width={640}
        title={openStory ? `A postcard from ${openStory.name}` : ''}
        subtitle={openStory ? `${openStory.place}${openStory.when ? ` · ${openStory.when}` : ''}` : ''}
        onClose={() => closeDialog(setOpenStory, null)}
      >
        {openStory && <PostcardFull story={openStory} />}
      </FinderPicker>

      <FinderPicker
        open={sharing}
        stepKey="share"
        width={600}
        title="Share your story"
        subtitle="Three quick parts: a rating, your story, and your name."
        onClose={() => closeDialog(setSharing, false)}
      >
        <ShareStoryForm onDone={() => closeDialog(setSharing, false)} />
      </FinderPicker>
    </div>
  );
}
