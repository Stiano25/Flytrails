import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, MessageCircle, Luggage } from 'lucide-react';
import {
  WHATSAPP_URL,
  SITE_EMAIL,
  SITE_PHONE_DISPLAY,
  GOOGLE_MAPS_LOCATION_URL,
} from '../config.js';
import PageHeader from '../components/site/PageHeader.jsx';
import Toast from '../components/Toast.jsx';
import { useSiteContent, useSubmit } from '../hooks/useApi.js';
import { api } from '../data/api.js';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const fieldClass =
  'mt-1.5 w-full rounded-xl border border-brand-dark/15 bg-white px-3.5 py-3 text-[15px] text-brand-dark transition placeholder:text-brand-dark/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25';
const labelClass = 'text-sm font-semibold text-brand-dark';

export default function Contact() {
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const { submit, loading } = useSubmit();
  const { data: content } = useSiteContent();

  const phone = content?.contact_phone || SITE_PHONE_DISPLAY;
  const email = content?.contact_email || SITE_EMAIL;
  const address = content?.contact_address || 'Nairobi, Kenya';
  const whatsappNum = content?.contact_whatsapp;
  const whatsappHref = whatsappNum ? `https://wa.me/${whatsappNum}` : WHATSAPP_URL;

  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast((s) => ({ ...s, show: false })), 5500);
    return () => clearTimeout(t);
  }, [toast.show]);

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const result = await submit(() =>
      api.submitContact({
        name: String(fd.get('name') || '').trim(),
        email: String(fd.get('email') || '').trim(),
        phone: String(fd.get('phone') || '').trim(),
        subject: String(fd.get('subject') || '').trim(),
        message: String(fd.get('message') || '').trim(),
      }),
    );

    if (result.success) {
      e.target.reset();
      setToast({
        show: true,
        variant: 'success',
        message: "Message sent — we'll get back to you soon.",
      });
    } else {
      setToast({
        show: true,
        variant: 'error',
        message:
          result.error ||
          `Something went wrong. You can also email us at ${SITE_EMAIL}.`,
      });
    }
  }

  const routes = [
    { title: 'Planning a trip?', text: 'Three quick questions and we take it from there.', to: '/?plan=1', label: 'Plan my trip', Icon: Luggage, primary: true },
    { title: 'Quick question?', text: 'The fastest way to reach us, even on Sundays.', href: whatsappHref, label: 'Chat on WhatsApp', Icon: MessageCircle },
    { title: 'Anything else?', text: 'Partnerships, press, groups: send us a message below.', anchor: '#message', label: 'Write to us', Icon: Mail },
  ];

  return (
    <div>
      <PageHeader eyebrow="Contact" title="Talk to" accent="a real person" description="We reply within one business day, and faster on WhatsApp." />

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        {/* Point people to the right channel first. */}
        <ul className="grid gap-4 md:grid-cols-3">
          {routes.map((r) => {
            const cls = `mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors ${ring} ${
              r.primary ? 'bg-brand-orange text-brand-dark hover:bg-[#f4a53f]' : 'border border-brand-dark/15 text-brand-dark hover:border-brand-dark/40'
            }`;
            const content = (
              <>
                <r.Icon className="h-4 w-4" aria-hidden />
                {r.label}
              </>
            );
            return (
              <li key={r.title} className="rounded-[22px] border border-brand-dark/10 bg-white p-6 shadow-[0_18px_40px_-30px_rgba(13,27,42,0.5)]">
                <p className="text-lg font-semibold text-brand-dark">{r.title}</p>
                <p className="mt-1 text-[15px] text-brand-dark/65">{r.text}</p>
                {r.to ? (
                  <Link to={r.to} className={cls}>
                    {content}
                  </Link>
                ) : (
                  <a href={r.href || r.anchor} {...(r.href ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={cls}>
                    {content}
                  </a>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_20rem]">
          <form id="message" onSubmit={handleSubmit} className="scroll-mt-24 space-y-4" aria-labelledby="message-title">
            <h2 id="message-title" className="text-2xl font-semibold tracking-tight text-brand-dark">
              Send a <span className="font-light italic">message</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col text-sm">
                <span className={labelClass}>Name</span>
                <input name="name" required autoComplete="name" className={fieldClass} />
              </label>
              <label className="flex flex-col text-sm">
                <span className={labelClass}>Email</span>
                <input name="email" type="email" required autoComplete="email" className={fieldClass} />
              </label>
              <label className="flex flex-col text-sm">
                <span className={labelClass}>
                  Phone <span className="font-normal text-brand-dark/50">(optional)</span>
                </span>
                <input name="phone" type="tel" autoComplete="tel" className={fieldClass} />
              </label>
              <label className="flex flex-col text-sm">
                <span className={labelClass}>Subject</span>
                <input name="subject" required className={fieldClass} />
              </label>
            </div>
            <label className="flex flex-col text-sm">
              <span className={labelClass}>Message</span>
              <textarea name="message" required rows={5} className={fieldClass} />
            </label>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex min-h-[48px] items-center justify-center rounded-full bg-primary px-7 text-[15px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 ${ring}`}
            >
              {loading ? 'Sending…' : 'Send message'}
            </button>
          </form>

          <aside aria-label="Contact details" className="space-y-5 text-[15px] text-brand-dark/75 lg:pt-12">
            <p className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <a href={`tel:${phone.replace(/\s/g, '')}`} className={`font-medium text-brand-dark hover:text-primary ${ring}`}>
                {phone}
              </a>
            </p>
            <p className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <a href={`mailto:${email}`} className={`break-all font-medium text-brand-dark hover:text-primary ${ring}`}>
                {email}
              </a>
            </p>
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                {address} ·{' '}
                <a href={GOOGLE_MAPS_LOCATION_URL} target="_blank" rel="noopener noreferrer" className={`font-medium text-primary underline underline-offset-4 ${ring}`}>
                  Open in Maps
                </a>
              </span>
            </p>
            <p className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>Mon–Sat 9:00–18:00 EAT. Sunday closed, WhatsApp still watched.</span>
            </p>
          </aside>
        </div>
      </section>

      <Toast
        message={toast.message}
        show={toast.show}
        variant={toast.variant}
        onClose={() => setToast((s) => ({ ...s, show: false }))}
      />
    </div>
  );
}
