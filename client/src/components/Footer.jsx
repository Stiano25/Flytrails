import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { SITE_EMAIL, SITE_PHONE_DISPLAY } from '../config.js';
import { useWhatsappLink } from '../hooks/useWhatsappLink.js';
import { useSiteContent } from '../hooks/useApi.js';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange';

const COLUMNS = [
  {
    title: 'Plan',
    links: [
      { to: '/?plan=1', label: 'Trip finder' },
      { to: '/trips', label: 'All trips' },
      { to: '/upcoming-trips', label: 'Upcoming departures' },
      { to: '/custom-tours', label: 'Private & custom tours' },
      { to: '/accommodations', label: 'Stays' },
    ],
  },
  {
    title: 'Discover',
    links: [
      { to: '/gallery', label: 'Trip albums' },
      { to: '/reviews', label: 'Traveller stories' },
      { to: '/blog', label: 'Travel guides' },
      { to: '/about', label: 'About us' },
    ],
  },
  {
    title: 'Community',
    links: [
      { to: '/membership', label: 'Membership' },
      { to: '/reviews', label: 'Share your story' },
      { to: '/contact', label: 'Contact' },
      { to: '/terms', label: 'Terms & conditions' },
    ],
  },
];

/** Social profiles come from the admin's site content (social_instagram, social_tiktok, social_facebook); none are shown until set. */
const SOCIALS = [
  { key: 'social_instagram', label: 'Instagram', Icon: Instagram },
  { key: 'social_tiktok', label: 'TikTok', Icon: null },
  { key: 'social_facebook', label: 'Facebook', Icon: Facebook },
];

export default function Footer() {
  const whatsappHref = useWhatsappLink();
  const { data: content } = useSiteContent();
  const phone = content?.contact_phone || SITE_PHONE_DISPLAY;
  const email = content?.contact_email || SITE_EMAIL;
  const address = content?.contact_address || 'Nairobi, Kenya';
  const socials = SOCIALS.filter((s) => /^https?:\/\//.test(content?.[s.key] || ''));

  return (
    <footer className="bg-brand-dark text-white">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col items-start gap-5 border-b border-white/10 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <img src="/images/flytrailsnewlogo.png" alt="Flytrails" className="h-9 w-auto brightness-0 invert" />
            <p className="mt-3 text-[15px] italic text-white/70">{content?.site_tagline || 'Explore. Connect. Experience.'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-10 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange">{col.title}</h2>
              <ul className="mt-4 space-y-2.5 text-[15px]">
                {col.links.map((l) => (
                  <li key={`${col.title}-${l.label}`}>
                    <Link to={l.to} className={`text-white/70 transition-colors hover:text-white ${ring}`}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2 md:col-span-1">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange">Talk to us</h2>
            <ul className="mt-4 space-y-2.5 text-[15px] text-white/70">
              <li>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 transition-colors hover:text-white ${ring}`}>
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  WhatsApp us
                </a>
              </li>
              <li>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className={`inline-flex items-center gap-2 transition-colors hover:text-white ${ring}`}>
                  <Phone className="h-4 w-4" aria-hidden />
                  {phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className={`inline-flex items-center gap-2 break-all transition-colors hover:text-white ${ring}`}>
                  <Mail className="h-4 w-4 shrink-0" aria-hidden />
                  {email}
                </a>
              </li>
              <li className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden />
                {address}
              </li>
            </ul>
            {socials.length > 0 && (
              <ul className="mt-5 flex gap-2" aria-label="Social media">
                {socials.map(({ key, label, Icon }) => (
                  <li key={key}>
                    <a
                      href={content[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:border-white/40 hover:text-white ${ring}`}
                    >
                      {Icon ? <Icon className="h-4 w-4" aria-hidden /> : <span className="text-xs font-semibold">TT</span>}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-sm text-white/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Flytrails. All rights reserved.</p>
          <p>
            <Link to="/terms" className={`hover:text-white ${ring}`}>
              Terms & conditions
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
