import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mountain, Instagram, Facebook, MessageCircle, Video } from 'lucide-react';
import { useWhatsappLink } from '../hooks/useWhatsappLink.js';

const quickLinks = [
  { to: '/trips', label: 'All Trips' },
  { to: '/accommodations', label: 'Accommodations' },
  { to: '/upcoming-trips', label: 'Upcoming' },
  { to: '/membership', label: 'Membership' },
  { to: '/contact', label: 'Contact' },
];

const categories = [
  { to: '/trips?category=Hiking', label: 'Hiking' },
  { to: '/trips?category=Beach', label: 'Beach' },
  { to: '/trips?category=Safari', label: 'Safari' },
  { to: '/trips?category=International', label: 'International' },
  { to: '/trips?category=Halal Trips', label: 'Halal Trips' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const whatsappHref = useWhatsappLink();

  function handleNewsletter(e) {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <footer className="border-t border-white/10 bg-brand-dark/95 text-brand-light backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="mb-10 flex flex-col items-start gap-2 border-b border-white/10 pb-10">
          <div className="flex items-center gap-2">
            <img 
              src="/images/flytrailsnewlogo.png"
              alt="Flytrails Logo" 
              className="h-8 w-auto max-w-[200px] object-contain object-left"
            />
          </div>
          <p className="text-sm font-light text-brand-light/80">Adventure awaits. Community travels.</p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-display text-lg font-bold text-accent">Quick links</h3>
            <ul className="mt-4 space-y-2 text-sm font-light">
              {quickLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-brand-light/80 transition hover:text-accent">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-accent">Trip categories</h3>
            <ul className="mt-4 space-y-2 text-sm font-light">
              {categories.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-brand-light/80 transition hover:text-accent">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-accent">Contact</h3>
            <p className="mt-4 text-sm font-light text-brand-light/80">Nairobi, Kenya</p>
            <p className="text-sm font-light text-brand-light/80">hello@flytrails.com</p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 font-medium text-accent transition hover:underline"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              WhatsApp
            </a>

            <div className="mt-4 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 p-2 text-brand-light/70 transition hover:border-accent/50 hover:text-accent"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" strokeWidth={1.75} />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 p-2 text-brand-light/70 transition hover:border-accent/50 hover:text-accent"
                aria-label="TikTok"
              >
                <Video className="h-5 w-5" strokeWidth={1.75} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 p-2 text-brand-light/70 transition hover:border-accent/50 hover:text-accent"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" strokeWidth={1.75} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-accent">Newsletter</h3>
            <p className="mt-3 text-sm font-extralight text-brand-light/75">Trip drops &amp; member perks — no spam.</p>
            <form onSubmit={handleNewsletter} className="mt-4 flex flex-col gap-2">
              <label htmlFor="footer-email" className="sr-only">
                Email
              </label>
              <input
                id="footer-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full rounded-xl border border-white/20 bg-brand-dark/50 px-3 py-2.5 text-sm text-brand-light placeholder:text-brand-light/40 backdrop-blur-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                type="submit"
                className="rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-brand-dark transition hover:bg-accent/90"
              >
                Subscribe
              </button>
            </form>
            {submitted && <p className="mt-2 text-xs font-medium text-accent">Thanks — you&apos;re on the list.</p>}
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-8">
          <p className="text-center text-sm font-extralight text-brand-light/55">© 2026 Flytrails. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
