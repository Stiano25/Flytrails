import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Luggage, Quote, Star } from 'lucide-react';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export function Stars({ value = 5, className = 'h-3.5 w-3.5' }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${className} ${i < value ? 'fill-accent text-accent' : 'text-brand-dark/20'}`} strokeWidth={1.5} aria-hidden />
      ))}
    </span>
  );
}

/** Perforated stamp: the traveller's photo, or a photo of the place they went. */
function Stamp({ story, className = '' }) {
  return (
    <span className={`postcard-stamp block shrink-0 rotate-[3deg] ${className}`} aria-hidden>
      <img src={story.stamp} alt="" className="h-full w-full object-cover" />
    </span>
  );
}

/** Embossed double-ring postmark with the place and month. */
function Postmark({ story }) {
  return (
    <span
      className="postmark pointer-events-none flex h-[82px] w-[82px] -rotate-12 flex-col items-center justify-center rounded-full text-center text-primary/50"
      aria-hidden
    >
      <span className="max-w-[70px] truncate text-[9px] font-semibold uppercase tracking-[0.08em]">{story.place}</span>
      <span className="my-1 h-px w-10 bg-primary/30" />
      <span className="text-[9px] font-semibold uppercase tracking-[0.1em]">{story.when}</span>
    </span>
  );
}

/** Link that sends people back to the home trip finder with this story's trip type already chosen. */
export function planLink(story, preferredType) {
  const type = preferredType && story.types.includes(preferredType) ? preferredType : story.types[0];
  return type ? `/?plan=1&type=${type}` : '/?plan=1';
}

/**
 * A traveller story as a porcelain postcard: message on the left; stamp, postmark and sender on the right
 * (on phones the stamp sits in the corner and the sender moves under the message).
 * `lines` clamps the message; when it is cut, "Read the full postcard" calls `onOpen`.
 * With `fill`, the card takes its parent's height instead and the message fades out at the bottom
 * (used by the full-screen photo stack, where the space depends on the screen).
 * Every card ends with "Plan a trip like this", guiding readers from someone's story to their own.
 */
export default function Postcard({ story, lines = 6, fill = false, onOpen, preferredType, className = '' }) {
  const long = fill ? story.text.length > 160 : story.text.length > lines * 55;
  const clamp = fill
    ? story.text.length < 320
      ? {}
      : { maskImage: 'linear-gradient(to bottom, #000 72%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, #000 72%, transparent)' }
    : { display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical' };
  // In the full-screen stack, short stories are set large like a pull quote so the card never looks empty.
  const size = !fill
    ? 'text-[15px] leading-relaxed sm:text-[17px]'
    : story.text.length < 140
      ? 'text-[clamp(1.15rem,2.6vw,2rem)] leading-snug justify-center'
      : story.text.length < 320
        ? 'text-[clamp(1rem,1.9vw,1.4rem)] leading-relaxed justify-center'
        : 'text-[15px] leading-relaxed sm:text-[17px]';
  return (
    <article className={`porcelain relative flex flex-col rounded-[22px] p-5 sm:flex-row sm:gap-7 sm:p-8 ${fill ? 'h-full' : ''} ${className}`}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col pr-16 sm:pr-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-dark/45">
          {story.place}
          {story.when ? ` · ${story.when}` : ''}
        </p>
        <Quote className="mt-3 h-6 w-6 shrink-0 fill-accent/25 text-accent sm:mt-4 sm:h-7 sm:w-7" strokeWidth={1.25} aria-hidden />
        <blockquote className={`mt-2 flex flex-col italic text-brand-dark/85 ${size} ${fill ? 'min-h-0 flex-1 overflow-hidden' : 'flex-1'}`}>
          <p className="overflow-hidden whitespace-pre-line" style={clamp}>
            {story.text}
          </p>
        </blockquote>
        <div className="mt-4 flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            to={planLink(story, preferredType)}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.06] px-4 text-sm font-semibold text-primary transition-colors duration-150 hover:border-primary/50 hover:bg-primary/10 active:scale-[0.98] ${ring}`}
          >
            <Luggage className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Plan a trip like this
          </Link>
          {long && onOpen && (
            <button
              type="button"
              onClick={() => onOpen(story)}
              className={`inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-brand-dark/70 underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-brand-dark ${ring}`}
            >
              Read the full postcard
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
        <div className="mt-4 flex shrink-0 items-end justify-between gap-3 border-t border-brand-dark/10 pt-3 sm:hidden">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-dark/40">From</p>
            <p className="font-semibold text-brand-dark">{story.name}</p>
          </div>
          {story.rating ? <Stars value={story.rating} /> : null}
        </div>
      </div>

      <div className="hidden w-44 shrink-0 flex-col border-l border-brand-dark/10 pl-7 sm:flex">
        <div className="relative flex justify-end">
          <Stamp story={story} className="h-[100px] w-[82px]" />
          <span className="absolute -left-3 top-12">
            <Postmark story={story} />
          </span>
        </div>
        <div className="mt-auto pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-dark/40">From</p>
          <p className="mt-1 border-b border-brand-dark/10 pb-2 text-[17px] font-semibold leading-tight text-brand-dark">{story.name}</p>
          <div className="mt-2.5 border-b border-brand-dark/10 pb-2">
            {story.rating ? <Stars value={story.rating} /> : <span className="text-xs text-brand-dark/45">Flytrails traveller</span>}
          </div>
        </div>
      </div>

      <Stamp story={story} className="absolute right-5 top-5 h-[66px] w-[54px] sm:hidden" />
    </article>
  );
}

/** Full story, shown inside a dialog. */
export function PostcardFull({ story }) {
  return (
    <div className="porcelain rounded-[20px] p-5 sm:p-7">
      {story.rating ? <Stars value={story.rating} className="h-4 w-4" /> : null}
      <p className="mt-3 whitespace-pre-line text-[16px] leading-relaxed text-brand-dark/85 sm:text-[17px]">{story.text}</p>
      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-dark/40">From</p>
      <p className="font-semibold text-brand-dark">{story.name}</p>
      {story.reply && (
        <div className="mt-5 rounded-xl border-l-2 border-accent bg-primary/[0.05] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">Flytrails replied</p>
          <p className="mt-1 text-[15px] text-brand-dark/80">{story.reply}</p>
        </div>
      )}
    </div>
  );
}

/** Trip filter chips; `tone` is 'dark' on the deep background, 'light' on cream. `singleLine` keeps them on one scrollable row. */
export function StoryFilters({ filters, total, value, onChange, tone = 'light', singleLine = false }) {
  const idle =
    tone === 'dark'
      ? 'border-white/15 bg-white/[0.06] text-white/85 backdrop-blur hover:border-white/35 hover:bg-white/10'
      : 'border-brand-dark/15 bg-white/70 text-brand-dark hover:border-brand-dark/40';
  const active = tone === 'dark' ? 'border-white bg-white text-brand-dark' : 'border-primary bg-primary text-white';
  return (
    <div
      className={`scrollbar-hide flex max-w-full gap-2 overflow-x-auto pb-1 ${singleLine ? '' : '-mx-4 px-4 sm:mx-0 sm:flex-wrap sm:px-0'}`}
      role="group"
      aria-label="Filter stories by trip"
    >
      {[{ value: 'all', label: 'All stories', count: total }, ...filters].map((f) => {
        const selected = value === f.value;
        return (
          <button
            key={f.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(f.value)}
            className={`inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-150 active:scale-[0.97] ${ring} ${
              selected ? active : idle
            }`}
          >
            {f.label}
            <span className={`text-xs tabular-nums ${selected ? 'opacity-60' : 'opacity-50'}`}>{f.count}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Section background: a blurred slice of the hero's palm-coast photo under a deep tint. */
const PALM_COAST = '/images/hero-palm-coast.jpg';
export const HIKERS_PHOTO = '/images/stories-hikers.jpg';

/**
 * Dark photo backdrop for white text. Default: a blurred slice of the palm coast. With `photo`
 * (e.g. the hikers resting on the trail) the picture stays sharp under a heavier gradient so text stays AA;
 * if that photo is missing it falls back to the blurred default.
 */
export function StoriesBackdrop({ photo, position = '50% 50%' }) {
  const [failed, setFailed] = useState(false);
  const sharp = photo && !failed;
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <img
        src={sharp ? photo : PALM_COAST}
        onError={() => setFailed(true)}
        alt=""
        decoding="async"
        loading="lazy"
        style={sharp ? { objectPosition: position } : undefined}
        className={sharp ? 'h-full w-full object-cover' : 'h-full w-full scale-110 object-cover object-[50%_65%] blur-2xl'}
      />
      <div
        className={`absolute inset-0 bg-gradient-to-b ${
          sharp ? 'from-brand-dark/85 via-brand-dark/70 to-brand-dark/90' : 'from-brand-dark/85 via-brand-dark/75 to-brand-dark/90'
        }`}
      />
    </div>
  );
}
