import { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import {
  Binoculars,
  Briefcase,
  Check,
  ChevronDown,
  Globe,
  Heart,
  Luggage,
  Minus,
  Mountain,
  Plus,
  Search,
  Shuffle,
  Tent,
  User,
  Users,
  Waves,
} from 'lucide-react';
import { findTripType, tripTypes } from '../../data/tripTypes.js';
import { seasonHint } from '../../data/seasons.js';
import { trackFinder } from '../../lib/trackFinder.js';
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
};

const PRESETS = [
  { label: 'Solo', count: 1, note: '1 person', Icon: User },
  { label: 'Couple', count: 2, note: '2 people', Icon: Heart },
  { label: 'Family', count: 4, note: '4 people', Icon: Users },
  { label: 'Group', count: 8, note: '5+ people', Icon: Briefcase },
];

const MAX_GROUP = 20;
const STEPS = ['type', 'when', 'who'];

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

function Token({ tokenRef, filled, onClick, children, label }) {
  return (
    <button
      ref={tokenRef}
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label={label}
      className={`group/token mx-0.5 inline-flex items-baseline gap-1 rounded-lg px-1.5 py-0.5 font-semibold underline decoration-2 underline-offset-[6px] transition-colors duration-150 hover:bg-accent/15 active:scale-[0.98] ${ring} ${
        filled ? 'text-primary decoration-accent' : 'text-brand-dark/55 decoration-brand-dark/25 decoration-dashed'
      }`}
    >
      {children}
      <ChevronDown
        className="h-4 w-4 translate-y-0.5 self-center opacity-70 transition-transform duration-150 group-hover/token:translate-y-1"
        strokeWidth={2.5}
        aria-hidden
      />
    </button>
  );
}

export default function TripFinder() {
  const navigate = useNavigate();
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

  const monthWord = answered.when && plan.when && plan.when !== 'flexible' ? monthLong(plan.when) : '';
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
    if (answered.when && plan.when && plan.when !== 'flexible') params.set('month', plan.when);
    if (answered.who) params.set('group', groupText(plan.group));
    trackFinder('submit', Object.fromEntries(params));
    navigate(`/custom-tours?${params.toString() || 'start=1'}#inquiry`);
  }

  const article = answered.type && type ? (/^[aeiou]/i.test(TYPE_WORD[type.value]) ? 'an' : 'a') : '';

  const pickers = {
    type: {
      title: 'What kind of trip?',
      subtitle: 'Pick the one that sounds most like you.',
      body: (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" onKeyDown={onGridKeyDown}>
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
                  className={`group relative aspect-[4/3] overflow-hidden rounded-2xl text-left transition-transform duration-150 active:scale-[0.98] ${ring} ${
                    selected ? 'ring-[3px] ring-accent ring-offset-2 ring-offset-[#fbfaf7]' : ''
                  }`}
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
          </div>
          <button
            type="button"
            aria-pressed={answered.type && !plan.type}
            onClick={() => choose('type', { type: '' })}
            className={`mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-dark/25 text-[15px] font-medium text-brand-dark transition-colors duration-150 hover:border-brand-dark/50 hover:bg-brand-dark/[0.03] ${ring}`}
          >
            <Shuffle className="h-4 w-4" aria-hidden />
            Not sure yet, help me choose
          </button>
        </>
      ),
    },
    when: {
      title: 'When would you like to go?',
      subtitle: 'A month is enough to start planning.',
      body: (
        <>
          <button
            type="button"
            aria-pressed={answered.when && plan.when === 'flexible'}
            onClick={() => choose('when', { when: 'flexible' })}
            className={`mb-3 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border text-[15px] font-medium transition-colors duration-150 active:scale-[0.99] ${ring} ${
              answered.when && plan.when === 'flexible'
                ? 'border-primary bg-primary text-white'
                : 'border-dashed border-brand-dark/25 text-brand-dark hover:border-brand-dark/50'
            }`}
          >
            <Shuffle className="h-4 w-4" aria-hidden />
            I’m flexible
          </button>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4" onKeyDown={onGridKeyDown}>
            {months.map((m) => {
              const hint = seasonHint(m.date.getMonth());
              const selected = answered.when && plan.when === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  data-grid-item
                  aria-pressed={selected}
                  aria-label={`${m.date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}${hint ? `, ${hint.label}` : ''}`}
                  onClick={() => choose('when', { when: m.value })}
                  className={`flex min-h-[76px] flex-col items-start justify-between rounded-2xl border px-3 py-2.5 text-left transition-colors duration-150 active:scale-[0.98] ${ring} ${
                    selected ? 'border-primary bg-primary text-white' : 'border-brand-dark/10 bg-white text-brand-dark hover:border-brand-dark/35'
                  }`}
                >
                  <span className="flex w-full items-baseline justify-between gap-1">
                    <span className="text-lg font-semibold leading-none">{m.date.toLocaleDateString('en-GB', { month: 'short' })}</span>
                    <span className={`text-xs ${selected ? 'text-white/70' : 'text-brand-dark/45'}`}>{m.date.getFullYear()}</span>
                  </span>
                  {hint ? (
                    <span
                      className={`mt-2 inline-flex items-center rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
                        selected ? 'bg-white/15 text-white' : hint.tone === 'peak' ? 'bg-accent/20 text-[#7a5418]' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {hint.label}
                    </span>
                  ) : (
                    <span className="mt-2 h-[18px]" aria-hidden />
                  )}
                </button>
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
    <div className="mt-[clamp(1rem,3.5svh,2.5rem)] w-full max-w-4xl font-inter">
      <form
        ref={barRef}
        onSubmit={submit}
        aria-label="Plan a trip"
        className="flex flex-col gap-3 rounded-3xl bg-white/95 p-4 text-brand-dark shadow-[0_18px_50px_-12px_rgba(13,27,42,0.55)] backdrop-blur sm:flex-row sm:items-center sm:gap-4 sm:rounded-full sm:py-2.5 sm:pl-7 sm:pr-2.5"
      >
        <p className="text-balance text-center text-[17px] leading-[1.9] text-brand-dark/80 sm:flex-1 sm:text-left sm:text-lg sm:leading-[1.7]">
          I’d like {article}{' '}
          <Token
            tokenRef={typeRef}
            filled={answered.type && Boolean(plan.type)}
            onClick={() => open('type')}
            label={`Trip type: ${answered.type && type ? type.label : 'not chosen'}. Change`}
          >
            {answered.type && type ? TYPE_WORD[type.value] : 'any kind of'}
          </Token>{' '}
          trip {!(answered.when && plan.when === 'flexible') && 'in '}
          <Token
            tokenRef={whenRef}
            filled={answered.when}
            onClick={() => open('when')}
            label={`When: ${answered.when ? (plan.when === 'flexible' ? 'flexible' : monthWord) : 'not chosen'}. Change`}
          >
            {answered.when ? (plan.when === 'flexible' ? 'any time' : monthWord) : 'any month'}
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
        title={active ? pickers[active].title : ''}
        subtitle={active ? pickers[active].subtitle : ''}
        onClose={close}
      >
        {active ? pickers[active].body : null}
      </FinderPicker>
    </div>
  );
}
