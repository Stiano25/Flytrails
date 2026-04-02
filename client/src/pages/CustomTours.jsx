import { useState } from 'react';
import { Building2, Users, UserRound, Heart, CarFront, MessageCircle } from 'lucide-react';
import { useWhatsappLink } from '../hooks/useWhatsappLink.js';

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

const inputClass = 'glass-input mt-1.5 w-full';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-brand-dark/70';

export default function CustomTours() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
    dates: '',
    groupSize: '',
    budget: '',
    requests: '',
  });
  const whatsappHref = useWhatsappLink();

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(27,67,50,0.06),transparent_50%)]" />
      <div className="relative mx-auto max-w-5xl px-4 py-12 md:px-6">
        <h1 className="font-display text-4xl font-bold text-brand-dark md:text-5xl">Private &amp; custom tours</h1>
        <p className="mt-4 max-w-3xl font-light leading-relaxed text-brand-dark/80">
          Tell us your dates, budget, and dream destinations — we design itineraries for families, teams, and celebrations
          across Kenya, East Africa, and select international hubs.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ title, text, Icon }) => (
            <div key={title} className="glass-surface rounded-3xl p-6 transition hover:border-accent/25">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-primary/10 text-primary">
                <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-brand-dark">{title}</h2>
              <p className="mt-2 text-sm font-light text-brand-dark/75">{text}</p>
            </div>
          ))}
        </div>

        <div className="glass-surface-strong mt-16 rounded-3xl p-6 md:p-10">
          <h2 className="font-display text-2xl font-bold text-brand-dark">Inquiry form</h2>
          {sent ? (
            <p className="mt-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-4 font-light text-brand-dark">
              We&apos;ll reach out within 24 hours via WhatsApp!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col text-sm sm:col-span-2">
                <span className={labelClass}>Full name</span>
                <input
                  required
                  name="name"
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
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col text-sm">
                <span className={labelClass}>Destination</span>
                <input name="destination" value={form.destination} onChange={handleChange} className={inputClass} />
              </label>
              <label className="flex flex-col text-sm">
                <span className={labelClass}>Travel dates</span>
                <input name="dates" value={form.dates} onChange={handleChange} className={inputClass} />
              </label>
              <label className="flex flex-col text-sm">
                <span className={labelClass}>Group size</span>
                <input name="groupSize" value={form.groupSize} onChange={handleChange} className={inputClass} />
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
                  className="rounded-xl bg-primary px-8 py-3 font-bold text-accent shadow-md transition hover:bg-primary/90"
                >
                  Send inquiry
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-10 text-center">
          <p className="font-light text-brand-dark/80">Prefer to chat?</p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-8 py-3 font-bold text-white shadow-md transition hover:opacity-95"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            Message us directly
          </a>
        </div>
      </div>
    </div>
  );
}
