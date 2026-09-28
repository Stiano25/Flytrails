import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Luggage, Search } from 'lucide-react';
import { tripTypes } from '../../data/tripTypes.js';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white';

/** Next 12 months as { value: '2026-10', label: 'October 2026' }. */
function upcomingMonths() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return {
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    };
  });
}

const groupSizes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];

function Field({ id, label, value, onChange, children, className = '' }) {
  return (
    <label
      htmlFor={id}
      className={`group relative flex min-w-0 cursor-pointer flex-col justify-center rounded-2xl px-4 py-2.5 text-left transition-colors duration-150 hover:bg-brand-dark/[0.04] focus-within:bg-brand-dark/[0.04] focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary/70 md:rounded-full md:px-6 ${className}`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-dark/60">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none truncate bg-transparent pr-6 text-[15px] font-medium text-brand-dark outline-none"
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-4 top-1/2 mt-2 h-4 w-4 -translate-y-1/2 text-brand-dark/50 md:right-5"
        aria-hidden
      />
    </label>
  );
}

export default function TripFinder() {
  const navigate = useNavigate();
  const months = useMemo(upcomingMonths, []);
  const [type, setType] = useState('');
  const [month, setMonth] = useState('');
  const [group, setGroup] = useState('2');

  function handleSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (month) params.set('month', month);
    if (group) params.set('group', group);
    navigate(`/custom-tours?${params.toString()}#inquiry`);
  }

  return (
    <div className="mt-9 w-full max-w-3xl [@media(max-height:500px)]:mt-4">
      <form
        onSubmit={handleSubmit}
        aria-label="Plan a trip"
        className="grid grid-cols-2 gap-1 rounded-3xl bg-white/95 p-2 text-brand-dark shadow-[0_18px_50px_-12px_rgba(13,27,42,0.55)] backdrop-blur md:flex md:items-center md:gap-0 md:rounded-full md:p-2"
      >
        <Field id="finder-type" label="Trip type" value={type} onChange={setType} className="col-span-2 md:flex-[1.3]">
          <option value="">Any kind of trip</option>
          {tripTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Field>
        <span className="hidden h-8 w-px shrink-0 bg-brand-dark/10 md:block" aria-hidden />
        <Field id="finder-month" label="When" value={month} onChange={setMonth} className="md:flex-1">
          <option value="">Flexible</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Field>
        <span className="hidden h-8 w-px shrink-0 bg-brand-dark/10 md:block" aria-hidden />
        <Field id="finder-group" label="Travellers" value={group} onChange={setGroup} className="md:flex-[0.8]">
          {groupSizes.map((n) => (
            <option key={n} value={n}>
              {n === '1' ? '1 person' : `${n} people`}
            </option>
          ))}
        </Field>
        <button
          type="submit"
          className="group/btn col-span-2 mt-1 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-accent px-7 text-base font-semibold text-brand-dark transition-colors duration-150 hover:bg-[#e0bb82] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark md:ml-1 md:mt-0 md:shrink-0 md:rounded-full"
        >
          <Luggage className="h-5 w-5 transition-transform duration-150 group-hover/btn:-rotate-6" strokeWidth={1.75} aria-hidden />
          Plan my trip
        </button>
      </form>

      <div className="mt-5 flex justify-center [@media(max-height:500px)]:mt-3">
        <Link
          to="/trips"
          className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/50 bg-white/5 px-6 text-[15px] font-medium text-white transition-colors duration-150 hover:border-white hover:bg-white/15 ${focusRing}`}
        >
          <Search className="h-4 w-4" strokeWidth={2} aria-hidden />
          Explore trips
        </Link>
      </div>
    </div>
  );
}
