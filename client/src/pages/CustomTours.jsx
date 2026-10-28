import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageCircle, Users, UserRound, Heart, CarFront, Building2 } from 'lucide-react';
import { useWhatsappLink } from '../hooks/useWhatsappLink.js';
import { tripTypes } from '../data/tripTypes.js';
import { api } from '../data/api.js';
import { normalizeWhatsAppNumber } from '../lib/phone.js';
import PageHeader from '../components/site/PageHeader.jsx';

const inputClass = 'mt-1.5 w-full rounded-xl border border-brand-dark/15 bg-white px-3.5 py-3 text-[15px] text-brand-dark transition placeholder:text-brand-dark/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25';
const labelClass = 'text-sm font-semibold text-brand-dark';
const services = [
  ['Corporate trips', 'Team-building safaris and executive retreats.', Building2],
  ['Family safaris', 'Kid-friendly pacing and family rooms.', UserRound],
  ['Group bookings', 'Private departures for clubs, schools, and friends.', Users],
  ['Honeymoons', 'Beach and bush combinations made for two.', Heart],
  ['Transfers', 'Reliable airport and hotel pickups.', CarFront],
];

export default function CustomTours() {
  const [searchParams] = useSearchParams();
  const formRef = useRef(null);
  const [sent, setSent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(() => ({
    name: '', email: '', phone: '',
    tripType: tripTypes.some((t) => t.value === searchParams.get('type')) ? searchParams.get('type') : '',
    destination: '',
    adults: searchParams.get('group') || '2', children: '0', budget: '', specialRequests: '',
  }));
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const whatsappHref = useWhatsappLink();
  const fromFinder = ['type', 'month', 'when', 'group'].some((key) => searchParams.has(key));

  useEffect(() => {
    if (!fromFinder || !formRef.current) return undefined;
    const id = requestAnimationFrame(() => formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    return () => cancelAnimationFrame(id);
  }, [fromFinder]);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!dateStart || !dateEnd) {
      setError('Please choose both a start date and an end date.');
      return;
    }
    if (dateEnd < dateStart) {
      setError('The end date must be on or after the start date.');
      return;
    }
    const travelDates = `${dateStart} to ${dateEnd}`;
    setSubmitting(true);
    try {
      const result = await api.submitCustomTrip({ ...form, travelDates, customerPhone: normalizeWhatsAppNumber(form.phone) });
      setSent(result.referenceNumber);
    } catch (submitError) {
      setError(submitError.message || 'We could not submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Custom Trip" title="Your trip," accent="planned around you" description="Start with a few simple choices. Our team will turn them into a tailored itinerary and quotation." />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:px-6 lg:grid-cols-[20rem_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm font-semibold text-brand-dark">Built around your plans</p>
          <ul className="mt-3 space-y-3">
            {services.map(([title, text, Icon]) => (
              <li key={title} className="flex gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-[#b5650d]"><Icon className="h-4 w-4" aria-hidden /></span>
                <span><span className="block text-[15px] font-medium text-brand-dark">{title}</span><span className="block text-sm text-brand-dark/60">{text}</span></span>
              </li>
            ))}
          </ul>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-brand-dark/15 px-5 text-sm font-semibold text-brand-dark">
            <MessageCircle className="h-4 w-4" aria-hidden /> Rather chat? WhatsApp us
          </a>
        </aside>

        <div id="inquiry" ref={formRef} className="scroll-mt-24 rounded-[22px] border border-brand-dark/10 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(13,27,42,0.5)] md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-brand-dark">Tell us <span className="font-light italic">about your Custom Trip</span></h2>
          {sent ? (
            <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-4 text-brand-dark" role="status">
              <p className="font-semibold">Request received.</p>
              <p className="mt-1 text-sm">Your reference is <strong>{sent}</strong>. Our team will review it and contact you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col text-sm sm:col-span-2"><span className={labelClass}>Full name</span><input required name="name" autoComplete="name" value={form.name} onChange={handleChange} className={inputClass} /></label>
              <label className="flex flex-col text-sm"><span className={labelClass}>Email</span><input required type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} /></label>
              <label className="flex flex-col text-sm"><span className={labelClass}>WhatsApp number</span><input required name="phone" type="tel" autoComplete="tel" placeholder="e.g. 0712 345 678" value={form.phone} onChange={handleChange} className={inputClass} /><span className="mt-1 text-xs text-brand-dark/55">We use this to send your quotation directly to you.</span></label>
              <label className="flex flex-col text-sm"><span className={labelClass}>Trip type</span><select required name="tripType" value={form.tripType} onChange={handleChange} className={inputClass}><option value="">Select</option>{tripTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>
              <label className="flex flex-col text-sm"><span className={labelClass}>Destination or region</span><input required name="destination" value={form.destination} onChange={handleChange} placeholder="e.g. Maasai Mara and Diani" className={inputClass} /></label>
              <fieldset className="flex flex-col text-sm sm:col-span-2">
                <legend className={labelClass}>Travel dates</legend>
                <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col text-xs font-medium text-brand-dark/70">
                    Start date
                    <input
                      required
                      type="date"
                      value={dateStart}
                      onChange={(event) => setDateStart(event.target.value)}
                      min={new Date().toISOString().slice(0, 10)}
                      className={inputClass}
                    />
                  </label>
                  <label className="flex flex-col text-xs font-medium text-brand-dark/70">
                    End date
                    <input
                      required
                      type="date"
                      value={dateEnd}
                      onChange={(event) => setDateEnd(event.target.value)}
                      min={dateStart || new Date().toISOString().slice(0, 10)}
                      className={inputClass}
                    />
                  </label>
                </div>
              </fieldset>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col text-sm"><span className={labelClass}>Adults</span><input required min="1" type="number" name="adults" value={form.adults} onChange={handleChange} className={inputClass} /></label>
                <label className="flex flex-col text-sm"><span className={labelClass}>Children</span><input min="0" type="number" name="children" value={form.children} onChange={handleChange} className={inputClass} /></label>
              </div>
              <label className="flex flex-col text-sm"><span className={labelClass}>Budget range (KES)</span><select name="budget" value={form.budget} onChange={handleChange} className={inputClass}><option value="">Select</option><option>Under 50,000</option><option>50,000 – 150,000</option><option>150,000 – 400,000</option><option>400,000+</option><option>Not sure yet</option></select></label>
              <label className="flex flex-col text-sm sm:col-span-2"><span className={labelClass}>Special requests</span><textarea name="specialRequests" value={form.specialRequests} onChange={handleChange} rows={4} placeholder="Tell us what would make this trip special." className={inputClass} /></label>
              {error && <p className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
              <div className="sm:col-span-2"><button disabled={submitting} type="submit" className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand-orange px-7 text-[15px] font-semibold text-brand-dark disabled:cursor-wait disabled:opacity-60">{submitting ? 'Sending request…' : 'Send Custom Trip request'}</button></div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
