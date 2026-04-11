import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import {
  WHATSAPP_URL,
  SITE_EMAIL,
  SITE_PHONE_DISPLAY,
  CONTACT_LOCATION_IMAGE,
  GOOGLE_MAPS_LOCATION_URL,
} from '../config.js';
import { pageHeroImages } from '../data/pageHeroImages.js';
import PageHero from '../components/PageHero.jsx';
import Toast from '../components/Toast.jsx';
import { useSiteContent, useSubmit } from '../hooks/useApi.js';
import { api } from '../data/api.js';

const fieldClass = 'glass-input mt-1.5 w-full';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-brand-dark/70';

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

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(27,67,50,0.07),transparent_55%)]" />
      <PageHero
        imageUrl={pageHeroImages.trips}
        imageAlt="East Africa landscape — Flytrails"
        title="Get in touch"
        subtitle="We reply within one business day — faster on WhatsApp."
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 md:px-6">
        <div className="mt-4 grid gap-10 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="glass-surface-strong space-y-4 rounded-3xl p-6 md:p-8">
            <label className="flex flex-col text-sm">
              <span className={labelClass}>Name</span>
              <input name="name" required className={fieldClass} />
            </label>
            <label className="flex flex-col text-sm">
              <span className={labelClass}>Email</span>
              <input name="email" type="email" required className={fieldClass} />
            </label>
            <label className="flex flex-col text-sm">
              <span className={labelClass}>Phone</span>
              <input name="phone" className={fieldClass} />
            </label>
            <label className="flex flex-col text-sm">
              <span className={labelClass}>Subject</span>
              <input name="subject" required className={fieldClass} />
            </label>
            <label className="flex flex-col text-sm">
              <span className={labelClass}>Message</span>
              <textarea name="message" required rows={5} className={fieldClass} />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-accent shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send message'}
            </button>
          </form>

          <div className="space-y-5">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-3xl bg-[#25D366] px-6 py-5 text-lg font-bold text-white shadow-lg transition hover:opacity-95"
            >
              <MessageCircle className="h-6 w-6" aria-hidden />
              Chat on WhatsApp
            </a>
            <div className="glass-surface rounded-3xl p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-brand-dark">
                <Phone className="h-5 w-5 text-primary" aria-hidden />
                Phone
              </h2>
              <p className="mt-3 font-light text-brand-dark/85">{phone}</p>
            </div>
            <div className="glass-surface rounded-3xl p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-brand-dark">
                <Mail className="h-5 w-5 text-primary" aria-hidden />
                Email
              </h2>
              <a href={`mailto:${email}`} className="mt-3 block font-medium text-primary hover:underline">
                {email}
              </a>
            </div>
            <div className="glass-surface rounded-3xl p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-brand-dark">
                <MapPin className="h-5 w-5 text-primary" aria-hidden />
                Location
              </h2>
              <p className="mt-3 font-light text-brand-dark/85">{address}</p>
            </div>
            <div className="glass-surface rounded-3xl p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-brand-dark">
                <Clock className="h-5 w-5 text-primary" aria-hidden />
                Office hours
              </h2>
              <p className="mt-3 text-sm font-extralight leading-relaxed text-brand-dark/80">
                Mon–Sat: 9:00–18:00 EAT · Sun: closed (WhatsApp monitored)
              </p>
            </div>
          </div>
        </div>

        <figure className="glass-surface-strong mt-12 overflow-hidden rounded-3xl">
          <a
            href={GOOGLE_MAPS_LOCATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block"
          >
            <img
              src={CONTACT_LOCATION_IMAGE}
              alt="Nairobi — open Google Maps for directions"
              className="aspect-[21/9] max-h-[360px] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-brand-dark/0 transition group-hover:bg-brand-dark/35">
              <span className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-dark opacity-0 shadow-lg transition group-hover:opacity-100">
                <MapPin className="h-4 w-4" aria-hidden />
                Open in Google Maps
              </span>
            </div>
          </a>
          <figcaption className="border-t border-white/25 bg-white/20 px-4 py-3 text-center text-sm font-light text-brand-dark/75 backdrop-blur-sm">
            Based in <strong className="font-semibold text-brand-dark">Nairobi, Kenya</strong> — tap the image to open the map.
          </figcaption>
        </figure>
      </div>

      <Toast
        message={toast.message}
        show={toast.show}
        variant={toast.variant}
        onClose={() => setToast((s) => ({ ...s, show: false }))}
      />
    </div>
  );
}
