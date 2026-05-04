import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Compass } from 'lucide-react';
import TripCard from '../components/TripCard.jsx';
import PageHero from '../components/PageHero.jsx';
import { useTrips } from '../hooks/useApi.js';

const categories = ['Hiking', 'Camping', 'Safari', 'International', 'Women-Only', 'Beach', 'Group Experiences'];
import { pageHeroImages } from '../data/pageHeroImages.js';
import { parseDurationDays, durationBucket, matchesBudget } from '../utils/formatters.js';

const budgetOptions = [
  { value: '', label: 'Any budget' },
  { value: 'under10k', label: 'Under 10k' },
  { value: '10k-30k', label: '10k – 30k' },
  { value: '30k+', label: '30k+' },
];

const difficultyOptions = ['', 'Easy', 'Moderate', 'Hard'];

const inputClass = 'glass-input mt-1.5 w-full min-w-[140px]';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-brand-dark/70';

export default function Trips() {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || '';

  const [category, setCategory] = useState(categoryFromUrl);
  const [duration, setDuration] = useState('');
  const [budget, setBudget] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const { data: tripsData, loading } = useTrips();
  const allTrips = tripsData || [];

  useEffect(() => {
    setCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  const filtered = useMemo(() => {
    return allTrips.filter((t) => {
      if (category && t.category !== category) return false;
      const days = parseDurationDays(t.duration);
      if (duration) {
        const b = durationBucket(days);
        if (duration === '1-2' && b !== '1-2') return false;
        if (duration === '3-5' && b !== '3-5') return false;
        if (duration === '6+' && b !== '6+') return false;
      }
      if (!matchesBudget(t.price, budget)) return false;
      if (difficulty && t.difficulty !== difficulty) return false;
      return true;
    });
  }, [allTrips, category, duration, budget, difficulty]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(27,67,50,0.06),transparent_50%)]" />
      <PageHero
        imageUrl={pageHeroImages.trips}
        imageAlt="Kenya savanna at sunrise — wide open plains and acacia trees"
        title="All adventures"
        subtitle="Filter by what matters — all pricing in KES per person."
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 md:px-6">
        <div className="glass-surface-strong rounded-3xl p-4 md:p-6">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <SlidersHorizontal className="h-5 w-5 shrink-0" aria-hidden />
            <span className="font-display text-sm font-bold uppercase tracking-wide text-brand-dark">Filters</span>
          </div>
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            <label className="flex flex-col text-sm">
              <span className={labelClass}>Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm">
              <span className={labelClass}>Duration</span>
              <select value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass}>
                <option value="">Any</option>
                <option value="1-2">1–2 days</option>
                <option value="3-5">3–5 days</option>
                <option value="6+">6+ days</option>
              </select>
            </label>
            <label className="flex flex-col text-sm">
              <span className={labelClass}>Budget</span>
              <select value={budget} onChange={(e) => setBudget(e.target.value)} className={inputClass}>
                {budgetOptions.map((o) => (
                  <option key={o.value || 'any'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm">
              <span className={labelClass}>Difficulty</span>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={inputClass}>
                <option value="">Any</option>
                {difficultyOptions.filter(Boolean).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <p className="mt-8 text-sm font-light text-brand-dark/80">
          <Compass className="mr-1.5 inline-block h-4 w-4 align-text-bottom text-primary" aria-hidden />
          {loading ? (
            <span className="text-brand-dark/50">Loading trips…</span>
          ) : (
            <><span className="font-semibold text-brand-dark">{filtered.length}</span> trip{filtered.length === 1 ? '' : 's'} found</>
          )}
        </p>

        {filtered.length === 0 ? (
          <div className="glass-surface mt-10 px-6 py-16 text-center">
            <p className="text-lg font-light text-brand-dark/85">No trips match those filters.</p>
            <button
              type="button"
              onClick={() => {
                setCategory('');
                setDuration('');
                setBudget('');
                setDifficulty('');
              }}
              className="mt-4 text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {filtered.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
