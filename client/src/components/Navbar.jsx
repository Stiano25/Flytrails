import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  MapPinned,
  CalendarDays,
  Route,
  Crown,
  Images,
  Info,
  BookOpen,
  Mail,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { useWhatsappLink } from '../hooks/useWhatsappLink.js';

const primaryLinks = [
  { to: '/', label: 'Home', end: true, Icon: Home },
  { to: '/contact', label: 'Contact', Icon: Mail },
];

const exploreLinks = [
  { to: '/trips', label: 'Trips', Icon: MapPinned },
  { to: '/accommodations', label: 'Accommodations', Icon: Building2 },
  { to: '/upcoming-trips', label: 'Upcoming', Icon: CalendarDays },
  { to: '/custom-tours', label: 'Custom tours', Icon: Route },
];

const discoverLinks = [
  { to: '/gallery', label: 'Gallery', Icon: Images },
  { to: '/blog', label: 'Blog', Icon: BookOpen },
];

const aboutLinks = [
  { to: '/membership', label: 'Membership', Icon: Crown },
  { to: '/about', label: 'About', Icon: Info },
];

function Dropdown({ label, items, openMenu, setOpenMenu }) {
  const isOpen = openMenu === label;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpenMenu(label)}
      onMouseLeave={() => setOpenMenu('')}
    >
      <button
        type="button"
        className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-neutral-700 transition hover:text-primary"
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-60 rounded-2xl border border-white/40 bg-white/90 p-2 shadow-xl backdrop-blur-xl">
          {items.map(({ to, label: itemLabel, Icon }) => (
            <NavLink key={to} to={to} className="block rounded-xl px-3 py-2.5 text-sm text-neutral-700 transition hover:bg-primary/10 hover:text-primary">
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {itemLabel}
              </span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState('');
  const whatsappHref = useWhatsappLink();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-white/35 bg-white/55 shadow-lg shadow-primary/5 backdrop-blur-xl'
          : 'border-white/25 bg-white/45 backdrop-blur-xl'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6" aria-label="Main">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-brand-dark">
          <img 
            src="/images/flytrailsnewlogo.png"
            alt="Flytrails Logo" 
            className="h-11 w-auto md:h-12" 
          />
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 px-2 lg:flex xl:px-4">
          {primaryLinks.map(({ to, label, end, Icon }) => (
            <NavLink key={to} to={to} end={end} className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent">
              {({ isActive }) => (
                <motion.span
                  className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/15 text-primary shadow-inner'
                      : 'text-neutral-700 hover:text-primary'
                  }`}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                  {label}
                </motion.span>
              )}
            </NavLink>
          ))}
          <Dropdown label="Explore" items={exploreLinks} openMenu={openMenu} setOpenMenu={setOpenMenu} />
          <Dropdown label="Discover" items={discoverLinks} openMenu={openMenu} setOpenMenu={setOpenMenu} />
          <Dropdown label="Community" items={aboutLinks} openMenu={openMenu} setOpenMenu={setOpenMenu} />
        </div>

        <div className="flex items-center gap-2">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full border border-primary/30 bg-primary/90 px-5 py-2.5 text-sm font-semibold text-white shadow-md backdrop-blur-sm transition hover:bg-primary hover:shadow-lg md:inline-flex"
          >
            Book now
          </a>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/30 p-2.5 text-brand-dark backdrop-blur-sm transition hover:bg-white/50 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Toggle menu</span>
            {open ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={`overflow-hidden border-t border-white/30 bg-white/55 backdrop-blur-xl transition-all duration-300 lg:hidden ${
          open ? 'max-h-[min(85dvh,100%)] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex max-h-[min(75dvh,28rem)] flex-col gap-0.5 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {primaryLinks.map(({ to, label, end, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition ${
                  isActive ? 'bg-primary/12 text-primary' : 'text-neutral-800 hover:bg-white/40'
                }`
              }
              onClick={() => setOpen(false)}
            >
              <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
              {label}
            </NavLink>
          ))}
          <p className="mt-3 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Explore</p>
          {exploreLinks.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition ${
                  isActive ? 'bg-primary/12 text-primary' : 'text-neutral-800 hover:bg-white/40'
                }`
              }
              onClick={() => setOpen(false)}
            >
              <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
              {label}
            </NavLink>
          ))}
          <p className="mt-3 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Discover</p>
          {discoverLinks.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition ${
                  isActive ? 'bg-primary/12 text-primary' : 'text-neutral-800 hover:bg-white/40'
                }`
              }
              onClick={() => setOpen(false)}
            >
              <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
              {label}
            </NavLink>
          ))}
          <p className="mt-3 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Community</p>
          {aboutLinks.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition ${
                  isActive ? 'bg-primary/12 text-primary' : 'text-neutral-800 hover:bg-white/40'
                }`
              }
              onClick={() => setOpen(false)}
            >
              <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
              {label}
            </NavLink>
          ))}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex justify-center rounded-full border border-primary/25 bg-primary py-3 text-center text-sm font-semibold text-white shadow-md"
          >
            Book now
          </a>
        </div>
      </div>
    </header>
  );
}
