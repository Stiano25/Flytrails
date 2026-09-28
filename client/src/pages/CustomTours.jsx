import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Users, UserRound, Heart, CarFront, MessageCircle } from 'lucide-react';
import { useWhatsappLink } from '../hooks/useWhatsappLink.js';
import { tripTypes } from '../data/tripTypes.js';
import PageHeader from '../components/site/PageHeader.jsx';

const services = [
  {
    title: 'Corporate trips',
    text: 'Team-building safaris, offsites, and executive retreats with seamless logistics.',
    Icon: Building2,
  },
  {
    title: 'Family safaris',
    text: 'Kid-friendly pacing, family rooms, and guides who love curious questions.',
    Icon: UserRound,
  },
  {
    title: 'Group bookings',
    text: 'Clubs, schools, and friends — private departures with shared memories.',
    Icon: Users,
  },
  {
    title: 'Honeymoons',
    text: 'Beach & bush combos, surprise touches, and space for just the two of you.',
    Icon: Heart,
  },
  {
    title: 'Airport & hotel transfers',
    text: 'Reliable pickups across Nairobi and coastal hubs — start trips stress-free.',
    Icon: CarFront,
  },
];

const inputClass =
  'mt-1.5 w-full rounded-xl border border-brand-dark/15 bg-white px-3.5 py-3 text-[15px] text-brand-dark transition placeholder:text-brand-dark/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25';
const labelClass = 'text-sm font-semibold text-brand-dark';

/** Open-ended choices from the home trip finder (?when=next3). */
const WHEN_TEXT = { next3: 'Within the next 3 months', next6: 'Within the next 6 months', flexible: 'Flexible dates' };

/** '2026-10' -> 'October 2026' (the home trip finder passes months this way). */
function monthLabel(value) {
  const m = /^(\d{4})-(\d{2})$/.exec(value || '');
  if (!m) return '';
  return new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export default function CustomTours() {
  const [sent, setSent] = useState(false);
  const [searchParams] = useSearchParams();
  const formRef = useRef(null);
  // Pre-fill from the home page trip finder (?type=safari&month=2026-10&group=4).
  const [form, setForm] = useState(() => ({
    name: '',
    email: '',
    phone: '',
    tripType: tripTypes.some((t) => t.value === searchParams.get('type')) ? searchParams.get('type') : '',
    destination: '',
    dates: monthLabel(searchParams.get('month')) || WHEN_TEXT[searchParams.get('when')] || '',
    groupSize: searchParams.get('group') || '',
    budget: '',
    requests: '',
  }));
  const whatsappHref = useWhatsappLink();
  const fromFinder = ['type', 'month', 'when', 'group', 'start'].some((k) => searchParams.has(k));

  // Coming from the finder: skip past the service cards straight to the form.
  useEffect(() => {
    if (!fromFinder || !formRef.current) return;
    const id = requestAnimationFrame(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      formRef.current.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      formRef.current.querySelector('input[name="name"]')?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [fromFinder]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Private & custom"
        title="Your trip,"
        accent="planned around you"
        description="Dates, budget, group and where you dream of going. We design it across Kenya, East Africa and selected international hubs."
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:px-6 lg:grid-cols-[20rem_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm font-semibold text-brand-dark">We plan trips for</p>
          <ul className="mt-3 space-y-3">
            {services.map(({ title, text, Icon }) => (
              <li key={title} className="flex gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-[#b5650d]">
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <span>
                  <span className="block text-[15px] font-medium text-brand-dark">{title}</span>
                  <span className="block text-sm text-brand-dark/60">{text}</span>
                </span>
              </li>
            ))}
          </ul>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-brand-dark/15 px-5 text-sm font-semibold text-brand-dark transition-colors hover:border-brand-dark/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Rather chat? WhatsApp us
          </a>
        </aside>

        <div id="inquiry" ref={formRef} className="scroll-mt-24 rounded-[22px] border border-brand-dark/10 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(13,27,42,0.5)] md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-brand-dark">
            Tell us <span className="font-light italic">about your trip</span>
          </h2>
          {sent ? (
            <p className="mt-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-4 text-brand-dark" role="status">
              We&apos;ll reach out within 24 hours via WhatsApp!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col text-sm sm:col-span-2">
                <span className={labelClass}>Full name</span>
                <input
                  required
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col text-sm">
                <span className={labelClass}>Email</span>
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col text-sm">
                <span className={labelClass}>Phone (WhatsApp)</span>
                <input
                  required
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col text-sm">
                <span className={labelClass}>Trip type</span>
                <select name="tripType" value={form.tripType} onChange={handleChange} className={inputClass}>
                  <option value="">Select</option>
                  {tripTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-sm">
                <span className={labelClass}>Destination</span>
                <input name="destination" value={form.destination} onChange={handleChange} placeholder="e.g. Maasai Mara and Diani" className={inputClass} />
              </label>
              <label className="flex flex-col text-sm">
                <span className={labelClass}>Travel dates</span>
                <input name="dates" value={form.dates} onChange={handleChange} placeholder="e.g. October 2026, or 12–19 Oct" className={inputClass} />
              </label>
              <label className="flex flex-col text-sm">
                <span className={labelClass}>Group size</span>
                <input name="groupSize" value={form.groupSize} onChange={handleChange} placeholder="e.g. 2 adults, 1 child" className={inputClass} />
              </label>
              <label className="flex flex-col text-sm">
                <span className={labelClass}>Budget range (KES)</span>
                <select name="budget" value={form.budget} onChange={handleChange} className={inputClass}>
                  <option value="">Select</option>
                  <option value="under50k">Under 50,000</option>
                  <option value="50-150k">50,000 – 150,000</option>
                  <option value="150-400k">150,000 – 400,000</option>
                  <option value="400k+">400,000+</option>
                </select>
              </label>
              <label className="flex flex-col text-sm sm:col-span-2">
                <span className={labelClass}>Special requests</span>
                <textarea name="requests" value={form.requests} onChange={handleChange} rows={4} className={inputClass} />
              </label>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand-orange px-7 text-[15px] font-semibold text-brand-dark transition-colors hover:bg-[#f4a53f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Send inquiry
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
