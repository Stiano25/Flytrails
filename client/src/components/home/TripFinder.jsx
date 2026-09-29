import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import {
  Binoculars,
  Briefcase,
  CalendarClock,
  Check,
  ChevronDown,
  Globe,
  Heart,
  Luggage,
  Minus,
  MoonStar,
  Mountain,
  Plus,
  Search,
  Shuffle,
  Star,
  Tent,
  User,
  Users,
  Waves,
} from 'lucide-react';
import { findTripType, tripTypes } from '../../data/tripTypes.js';
import { BEST_MONTHS, SEASONS, seasonFor } from '../../data/seasons.js';
import { trackFinder } from '../../lib/trackFinder.js';
import { useWhatsappLink } from '../../hooks/useWhatsappLink.js';
import { openWhatsapp } from '../../lib/whatsapp.js';
import FinderPicker from './FinderPicker.jsx';

const TYPE_ICONS = {
  safari: Binoculars,
  beach: Waves,
  hiking: Mountain,
  camping: Tent,
  honeymoon: Heart,
  family: Users,
  group: Briefcase,
  international: Globe,
  halal: MoonStar,
};

/** Word used inside the sentence: "I'd like a [safari] trip". */
const TYPE_WORD = {
  safari: 'safari',
  beach: 'beach',
  hiking: 'hiking',
  camping: 'camping',
  honeymoon: 'honeymoon',
  family: 'family',
  group: 'group',
  international: 'international',
  halal: 'halal-friendly',
};

/** Flexible date choices, shown above the month tiles. `prefix` is the word before the token. */
const FLEXIBLE = [
  { value: 'next3', label: 'Next 3 months', token: 'the next 3 months', prefix: 'in ' },
  { value: 'next6', label: 'Next 6 months', token: 'the next 6 months', prefix: 'in ' },
  { value: 'flexible', label: 'I’m flexible', token: 'any time', prefix: '' },
];

const PRESETS = [
  { label: 'Solo', count: 1, note: '1 person', Icon: User },
  { label: 'Couple', count: 2, note: '2 people', Icon: Heart },
  { label: 'Family', count: 4, note: '4 people', Icon: Users },
  { label: 'Group', count: 8, note: '5+ people', Icon: Briefcase },
];

const MAX_GROUP = 20;
const STEPS = ['type', 'when', 'who'];
const PICKER_WIDTH = { type: 900, when: 780, who: 640 };

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/** Next 12 months starting with the current one. */
function upcomingMonths() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return { value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`, date };
  });
}

const monthLong = (value) => {
  const [y, m] = value.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'long' });
};
const groupText = (n) => (n >= MAX_GROUP ? `${MAX_GROUP}+` : String(n));
const isMonth = (when) => /^\d{4}-\d{2}$/.test(when);

/**
 * "Hi Flytrails! I'd like to plan a safari trip in December 2026 for 2 people. Could you share options and prices?"
 * Parts that weren't chosen are left out.
 */
function whatsappMessage({ type, month, flexible, group }) {
  let wish = type ? `plan ${/^[aeiou]/i.test(type) ? 'an' : 'a'} ${type} trip` : 'plan a trip';
  if (month) wish += ` in ${month}`;
  else if (flexible) wish += ` ${flexible.prefix}${flexible.token}`;
  if (group) wish += ` for ${group === 1 ? '1 person' : `${groupText(group)} people`}`;
  return `Hi Flytrails! I'd like to ${wish}. Could you share options and prices?`;
}

/** Arrow keys move between options in a grid (reads the live column count, so it works at every breakpoint). */
function onGridKeyDown(e) {
  const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: 'up', ArrowDown: 'down' }[e.key];
  if (!delta) return;
  const grid = e.currentTarget;
  const items = [...grid.querySelectorAll('[data-grid-item]')];
  const index = items.indexOf(document.activeElement);
  if (index < 0) return;
  const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length || 1;
  const step = delta === 'up' ? -cols : delta === 'down' ? cols : delta;
  const next = items[index + step];
  if (next) {
    e.preventDefault();
    next.focus();
  }
}

/**
 * A tappable blank in the sentence, shown as a pill that never breaks across lines:
 * dashed orange outline until chosen, then solid brand orange and slightly larger.
 */
function Token({ tokenRef, filled, onClick, children, label }) {
  return (
    <button
      ref={tokenRef}
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label={label}
      className={`group/token mx-0.5 inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-0.5 align-middle leading-snug transition-colors duration-150 active:scale-[0.97] ${ring} ${
        filled
          ? 'border-brand-orange bg-brand-orange text-[1.08em] font-semibold text-brand-dark shadow-sm hover:border-[#f4a53f] hover:bg-[#f4a53f]'
          : 'border-dashed border-brand-orange/70 font-medium text-brand-dark/65 hover:bg-brand-orange/10 hover:text-brand-dark'
      }`}
    >
      {children}
      <ChevronDown
        className="h-4 w-4 shrink-0 opacity-70 transition-transform duration-150 group-hover/token:translate-y-0.5"
        strokeWidth={2.5}
        aria-hidden
      />
    </button>
  );
}

export default function TripFinder() {
  const whatsappHref = useWhatsappLink();
  const [searchParams, setSearchParams] = useSearchParams();
  const reduce = useReducedMotion();
  const months = useMemo(upcomingMonths, []);
  const [plan, setPlan] = useState({ type: '', when: '', group: 2 });
  const [answered, setAnswered] = useState({ type: false, when: false, who: false });
  const [active, setActive] = useState(null);
  const [pulse, setPulse] = useState(0);
  const barRef = useRef(null);
  const typeRef = useRef(null);
  const whenRef = useRef(null);
  const whoRef = useRef(null);
  const tokenRefs = useMemo(() => ({ type: typeRef, when: whenRef, who: whoRef }), []);
  const lastToken = useRef('type');

  const type = findTripType(plan.type);
  const flexible = FLEXIBLE.find((f) => f.value === plan.when);
  const bestMonths = (answered.type && BEST_MONTHS[plan.type]) || null;

  const open = (step) => {
    lastToken.current = step;
    setActive(step);
    trackFinder(`open:${step}`);
  };

  const close = useCallback(
    ({ pulseButton = false } = {}) => {
      setActive(null);
      const step = lastToken.current;
      requestAnimationFrame(() => tokenRefs[step]?.current?.focus({ preventScroll: true }));
      if (pulseButton && !reduce) setPulse((n) => n + 1);
    },
    [reduce, tokenRefs]
  );

  // Links elsewhere on the site point to /?plan=1 (optionally &type=safari, e.g. "Plan a trip like this" on a postcard):
  // glide back to the finder, pre-select the trip type if given, then open the next question.
  useEffect(() => {
    if (searchParams.get('plan') !== '1') return undefined;
    const linkedType = findTripType(searchParams.get('type'))?.value;
    setSearchParams({}, { replace: true });
    const next = linkedType ? 'when' : 'type';
    if (linkedType) {
      setPlan((p) => ({ ...p, type: linkedType }));
      setAnswered((a) => ({ ...a, type: true }));
      trackFinder('choose:type', { type: linkedType, from: 'link' });
    }
    const openNext = () => {
      lastToken.current = next;
      setActive(next);
      trackFinder(`open:${next}`, { from: 'link' });
    };
    if (reduce || window.scrollY < 4) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      openNext();
      return undefined;
    }
    // Open the picker once the scroll has arrived (it locks page scroll while open). Not cancelled on
    // re-render on purpose: clearing the query string above re-runs this effect straight away.
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const started = performance.now();
    const wait = () => {
      if (window.scrollY < 4 || performance.now() - started > 1200) openNext();
      else requestAnimationFrame(wait);
    };
    requestAnimationFrame(wait);
    return undefined;
  }, [searchParams, setSearchParams, reduce]);

  /** Progressive disclosure: after a choice, open the next unanswered question; otherwise close. */
  const choose = (step, patch) => {
    const nextAnswered = { ...answered, [step]: true };
    setPlan((p) => ({ ...p, ...patch }));
    setAnswered(nextAnswered);
    trackFinder(`choose:${step}`, patch);
    const next = STEPS.slice(STEPS.indexOf(step) + 1).find((s) => !nextAnswered[s]);
    if (next) {
      lastToken.current = next;
      setActive(next);
      trackFinder(`open:${next}`);
    } else {
      lastToken.current = step;
      close({ pulseButton: true });
    }
  };

  const monthWord = answered.when && isMonth(plan.when) ? monthLong(plan.when) : '';
  const whenToken = answered.when ? monthWord || flexible?.token : '';
  const whenPrefix = answered.when && flexible ? flexible.prefix : 'in ';

  const buttonLabel = (() => {
    const parts = ['Plan my'];
    if (monthWord) parts.push(monthWord);
    parts.push(answered.type && type ? type.noun : 'trip');
    if (answered.who) parts.push(`for ${groupText(plan.group)}`);
    return parts.join(' ');
  })();

  function submit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (answered.type && plan.type) params.set('type', plan.type);
    if (answered.when && isMonth(plan.when)) params.set('month', plan.when);
    if (answered.when && flexible) params.set('when', flexible.value);
    if (answered.who) params.set('group', groupText(plan.group));
    trackFinder('submit', { ...Object.fromEntries(params), to: 'whatsapp' });
    const [year, month] = answered.when && isMonth(plan.when) ? plan.when.split('-').map(Number) : [];
    openWhatsapp(
      whatsappHref,
      whatsappMessage({
        type: answered.type && type ? TYPE_WORD[type.value] : '',
        month: year ? new Date(year, month - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '',
        flexible: answered.when ? flexible : null,
        group: answered.who ? plan.group : 0,
      })
    );
  }

  const article = answered.type && type ? (/^[aeiou]/i.test(TYPE_WORD[type.value]) ? 'an' : 'a') : '';

  const tileBase = `group relative overflow-hidden text-left transition-transform duration-150 active:scale-[0.97] ${ring}`;
  const selectedRing = 'ring-[3px] ring-accent ring-offset-2 ring-offset-[#fbfaf7]';

  const pickers = {
    type: {
      title: 'What kind of trip?',
      subtitle: 'Pick the one that sounds most like you.',
      body: (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5" onKeyDown={onGridKeyDown}>
          {tripTypes.map((t) => {
            const Icon = TYPE_ICONS[t.value];
            const selected = answered.type && plan.type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                data-grid-item
                aria-pressed={selected}
                onClick={() => choose('type', { type: t.value, ...(t.value === 'honeymoon' && !answered.who ? { group: 2 } : {}) })}
                className={`${tileBase} aspect-[4/3] rounded-2xl ${selected ? selectedRing : ''}`}
              >
                <img
                  src={t.image}
                  alt=""
                  width="480"
                  height="360"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.05]"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/20 to-transparent" />
                <span className="absolute left-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-primary">
                  {selected ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> : <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />}
                </span>
                <span className="absolute inset-x-0 bottom-0 p-3 text-[15px] font-semibold leading-tight text-white">{t.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            data-grid-item
            aria-pressed={answered.type && !plan.type}
            onClick={() => choose('type', { type: '' })}
            className={`${tileBase} flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-dark/20 bg-white text-center text-brand-dark hover:border-brand-dark/45 ${
              answered.type && !plan.type ? selectedRing : ''
            }`}
          >
            <Shuffle className="h-5 w-5 text-primary" aria-hidden />
            <span className="px-2 text-[15px] font-semibold leading-tight">Not sure yet</span>
            <span className="-mt-1 text-xs text-brand-dark/55">Help me choose</span>
          </button>
        </div>
      ),
    },
    when: {
      title: 'When would you like to go?',
      subtitle: 'Pick a month, or keep it open.',
      body: (
        <>
          <div className="flex flex-wrap gap-2">
            {FLEXIBLE.map((f) => {
              const selected = answered.when && plan.when === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => choose('when', { when: f.value })}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-[15px] font-medium transition-colors duration-150 active:scale-[0.97] ${ring} ${
                    selected ? 'border-primary bg-primary text-white' : 'border-brand-dark/15 bg-white text-brand-dark hover:border-brand-dark/40'
                  }`}
                >
                  {f.value === 'flexible' ? <Shuffle className="h-4 w-4" aria-hidden /> : <CalendarClock className="h-4 w-4" aria-hidden />}
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Legend for the colour strip on each month tile. */}
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-brand-dark/65" aria-label="Seasons">
            {Object.values(SEASONS).map((s) => (
              <li key={s.label} className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-4 rounded-full ${s.strip}`} aria-hidden />
                {s.label}
              </li>
            ))}
            {bestMonths && (
              <li className="inline-flex items-center gap-1.5 font-medium text-brand-dark/80">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden />
                Good time for {type.noun}
              </li>
            )}
          </ul>

          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8" onKeyDown={onGridKeyDown}>
            {months.map((m, i) => {
              const monthIndex = m.date.getMonth();
              const season = seasonFor(monthIndex);
              const good = bestMonths?.includes(monthIndex);
              const selected = answered.when && plan.when === m.value;
              const newYear = i === 0 || monthIndex === 0;
              return (
                <div key={m.value} className="contents">
                  {newYear && (
                    <p className="col-span-full mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-dark/50 first:mt-0">
                      {m.date.getFullYear()}
                    </p>
                  )}
                  <button
                    type="button"
                    data-grid-item
                    aria-pressed={selected}
                    aria-label={`${m.date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}, ${season.label}${
                      good ? `, good time for ${type.noun}` : ''
                    }`}
                    onClick={() => choose('when', { when: m.value })}
                    className={`${tileBase} h-[72px] rounded-xl sm:h-[68px] ${selected ? selectedRing : ''}`}
                  >
                    <img
                      src={season.image}
                      alt=""
                      width="320"
                      height="240"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.06]"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/35 to-brand-dark/10" />
                    {(selected || good) && (
                      <span className="absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-brand-dark">
                        {selected ? (
                          <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden />
                        ) : (
                          <Star className="h-3 w-3 fill-brand-dark" strokeWidth={0} aria-hidden />
                        )}
                      </span>
                    )}
                    <span className="absolute bottom-3 left-2.5 text-base font-semibold text-white">
                      {m.date.toLocaleDateString('en-GB', { month: 'short' })}
                    </span>
                    <span className={`absolute inset-x-0 bottom-0 h-1.5 ${season.strip}`} aria-hidden />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ),
    },
    who: {
      title: 'How many people?',
      subtitle: 'Tap a quick pick or set an exact number.',
      body: (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4" onKeyDown={onGridKeyDown}>
            {PRESETS.map(({ label, count, note, Icon }) => {
              const selected = answered.who && plan.group === count;
              return (
                <button
                  key={label}
                  type="button"
                  data-grid-item
                  aria-pressed={selected}
                  onClick={() => choose('who', { group: count })}
                  className={`flex min-h-[64px] items-center gap-3 rounded-2xl border px-4 text-left transition-colors duration-150 active:scale-[0.98] ${ring} ${
                    selected ? 'border-primary bg-primary text-white' : 'border-brand-dark/10 bg-white text-brand-dark hover:border-brand-dark/35'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  <span>
                    <span className="block font-semibold leading-tight">{label}</span>
                    <span className={`text-xs ${selected ? 'text-white/75' : 'text-brand-dark/50'}`}>{note}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-brand-dark/10 bg-white px-4 py-3">
            <div>
              <p className="font-semibold text-brand-dark">Exact number</p>
              <p className="text-sm text-brand-dark/55">Including you</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPlan((p) => ({ ...p, group: Math.max(1, p.group - 1) }))}
                disabled={plan.group <= 1}
                aria-label="One fewer person"
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-dark/20 text-brand-dark transition-colors duration-150 hover:border-brand-dark/50 active:scale-95 disabled:opacity-30 ${ring}`}
              >
                <Minus className="h-4 w-4" aria-hidden />
              </button>
              <span className="w-10 text-center text-xl font-semibold tabular-nums text-brand-dark" aria-live="polite">
                {groupText(plan.group)}
              </span>
              <button
                type="button"
                onClick={() => setPlan((p) => ({ ...p, group: Math.min(MAX_GROUP, p.group + 1) }))}
                disabled={plan.group >= MAX_GROUP}
                aria-label="One more person"
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-dark/20 text-brand-dark transition-colors duration-150 hover:border-brand-dark/50 active:scale-95 disabled:opacity-30 ${ring}`}
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => choose('who', { group: plan.group })}
            className={`mt-4 flex min-h-[48px] w-full items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-primary/90 active:scale-[0.99] ${ring}`}
          >
            Done
          </button>
        </>
      ),
    },
  };

  return (
    <div className="mt-[clamp(1rem,3.5svh,2.5rem)] w-full max-w-4xl font-sans">
      <form
        ref={barRef}
        onSubmit={submit}
        aria-label="Plan a trip"
        className="flex flex-col gap-3 rounded-3xl bg-white/95 p-4 text-brand-dark shadow-[0_18px_50px_-12px_rgba(13,27,42,0.55)] backdrop-blur sm:flex-row sm:items-center sm:gap-4 sm:rounded-full sm:py-2.5 sm:pl-7 sm:pr-2.5"
      >
        <p className="text-balance text-center text-[17px] leading-[2.3] text-brand-dark/80 sm:flex-1 sm:text-left sm:text-lg sm:leading-[2.1]">
          I’d like {article}{' '}
          <Token
            tokenRef={typeRef}
            filled={answered.type && Boolean(plan.type)}
            onClick={() => open('type')}
            label={`Trip type: ${answered.type && type ? type.label : 'not chosen'}. Change`}
          >
            {answered.type && type ? TYPE_WORD[type.value] : 'any kind of'}
          </Token>{' '}
          trip {whenPrefix}
          <Token
            tokenRef={whenRef}
            filled={answered.when}
            onClick={() => open('when')}
            label={`When: ${whenToken || 'not chosen'}. Change`}
          >
            {whenToken || 'any month'}
          </Token>{' '}
          for{' '}
          <Token
            tokenRef={whoRef}
            filled={answered.who}
            onClick={() => open('who')}
            label={`Travellers: ${answered.who ? groupText(plan.group) : 'not chosen'}. Change`}
          >
            {answered.who ? `${groupText(plan.group)} ${plan.group === 1 ? 'person' : 'people'}` : 'how many'}
          </Token>
          .
        </p>
        <button
          key={pulse}
          type="submit"
          className={`group/btn inline-flex min-h-[52px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-accent px-6 text-base font-semibold text-brand-dark transition-colors duration-150 hover:bg-[#e0bb82] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark sm:rounded-full ${
            pulse ? 'finder-pulse' : ''
          }`}
        >
          <Luggage className="h-5 w-5 shrink-0 transition-transform duration-150 group-hover/btn:-rotate-6" strokeWidth={1.75} aria-hidden />
          <span className="truncate">{buttonLabel}</span>
        </button>
      </form>

      <div className="mt-[clamp(0.5rem,2svh,1.25rem)] flex justify-center">
        <Link
          to="/trips"
          onClick={() => trackFinder('explore')}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/50 bg-white/5 px-6 text-[15px] font-medium text-white transition-colors duration-150 hover:border-white hover:bg-white/15 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <Search className="h-4 w-4" strokeWidth={2} aria-hidden />
          Explore trips
        </Link>
      </div>

      <FinderPicker
        open={Boolean(active)}
        anchorRef={barRef}
        tokenRef={tokenRefs[active || lastToken.current]}
        stepKey={active || 'none'}
        width={PICKER_WIDTH[active] || 760}
        title={active ? pickers[active].title : ''}
        subtitle={active ? pickers[active].subtitle : ''}
        onClose={close}
      >
        {active ? pickers[active].body : null}
      </FinderPicker>
    </div>
  );
}
