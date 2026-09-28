import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import MobileMenu from './MobileMenu.jsx';
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
  Star,
  Luggage,
} from 'lucide-react';

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
  { to: '/reviews', label: 'Reviews', Icon: Star },
];

const aboutLinks = [
  { to: '/membership', label: 'Membership', Icon: Crown },
  { to: '/about', label: 'About', Icon: Info },
];

/**
 * Desktop menu: opens on hover (with a short close delay so diagonal mouse moves don't shut it),
 * on click/tap, and from the keyboard (Enter, Space, ArrowDown); Escape or clicking elsewhere closes it.
 */
function Dropdown({ label, items, openMenu, setOpenMenu, overlay }) {
  const isOpen = openMenu === label;
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const closeTimer = useRef(0);
  const openedByHover = useRef(false);
  const menuId = `menu-${label.toLowerCase()}`;

  useEffect(() => {
    if (!isOpen) return undefined;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpenMenu('');
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpenMenu('');
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, setOpenMenu]);

  function focusItem(index) {
    requestAnimationFrame(() => wrapRef.current?.querySelectorAll('[role="menu"] a')[index]?.focus());
  }

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => {
        clearTimeout(closeTimer.current);
        if (!isOpen) openedByHover.current = true;
        setOpenMenu(label);
      }}
      onMouseLeave={() => {
        openedByHover.current = false;
        closeTimer.current = setTimeout(() => setOpenMenu(''), 160);
      }}
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget)) setOpenMenu('');
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={menuId}
        // Hover (or a tablet tap, which fires a synthetic hover first) has already opened it: keep it open.
        onClick={() => {
          if (openedByHover.current) {
            openedByHover.current = false;
            setOpenMenu(label);
            return;
          }
          setOpenMenu(isOpen ? '' : label);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpenMenu(label);
            focusItem(0);
          }
        }}
        className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange ${
          overlay ? 'text-white/90 hover:text-white' : 'text-brand-dark/75 hover:text-primary'
        }`}
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {isOpen && (
        <div className="absolute left-1/2 top-full z-50 w-60 -translate-x-1/2 pt-2">
          <div
            id={menuId}
            role="menu"
            aria-label={label}
            className="picker-fade rounded-2xl border border-brand-dark/10 bg-white p-2 shadow-xl"
            onKeyDown={(e) => {
              const links = [...e.currentTarget.querySelectorAll('a')];
              const i = links.indexOf(document.activeElement);
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                links[(i + 1) % links.length]?.focus();
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                links[(i - 1 + links.length) % links.length]?.focus();
              }
            }}
          >
            {items.map(({ to, label: itemLabel, Icon }) => (
              <NavLink
                key={to}
                to={to}
                role="menuitem"
                onClick={() => setOpenMenu('')}
                className="block rounded-xl px-3 py-2.5 text-sm text-brand-dark/80 transition-colors hover:bg-brand-bg hover:text-primary focus-visible:bg-brand-bg focus-visible:text-primary focus-visible:outline-none"
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-brand-dark/45" aria-hidden />
                  {itemLabel}
                </span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [openMenu, setOpenMenu] = useState('');
  const lastY = useRef(0);
  const isHome = useLocation().pathname === '/';
  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      // Tuck the bar away while scrolling down, bring it back as soon as the user scrolls up.
      if (Math.abs(y - lastY.current) > 6) {
        setHidden(y > lastY.current && y > 120);
        lastY.current = y;
      }
    };
    lastY.current = window.scrollY;
    setHidden(false);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  /** Transparent over the home hero until the page moves or the mobile menu opens. */
  const overlay = isHome && !scrolled && !open;

  return (
    <header
      className={`${isHome ? 'fixed inset-x-0' : 'sticky'} top-0 z-50 border-b transition-all duration-300 ${
        hidden && !open && !openMenu ? '-translate-y-full' : 'translate-y-0'
      } ${
        overlay
          ? 'border-transparent bg-transparent'
          : scrolled
            ? 'border-white/35 bg-white/80 shadow-lg shadow-primary/5 backdrop-blur-xl'
            : 'border-white/25 bg-white/45 backdrop-blur-xl'
      }`}
    >
      <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 md:px-6 lg:grid-cols-[1fr_auto_1fr]" aria-label="Main">
        <Link to="/" className="flex shrink-0 items-center gap-2 justify-self-start text-brand-dark" aria-label="Flytrails home">
          <img 
            src="/images/flytrailsnewlogo.png"
            alt="Flytrails" 
            className={`h-11 w-auto transition duration-300 md:h-12 ${overlay ? 'brightness-0 invert' : ''}`}
          />
        </Link>

        <div className="hidden items-center justify-center gap-1 lg:flex">
          {primaryLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange ${
                  overlay
                    ? isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/90 hover:text-white'
                    : isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-brand-dark/75 hover:text-primary'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <Dropdown overlay={overlay} label="Explore" items={exploreLinks} openMenu={openMenu} setOpenMenu={setOpenMenu} />
          <Dropdown overlay={overlay} label="Discover" items={discoverLinks} openMenu={openMenu} setOpenMenu={setOpenMenu} />
          <Dropdown overlay={overlay} label="Community" items={aboutLinks} openMenu={openMenu} setOpenMenu={setOpenMenu} />
        </div>

        <div className="flex items-center justify-end gap-2">
          {/* One quiet utility on the right: straight to the trip finder. */}
          <Link
            to="/?plan=1"
            className={`hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors lg:inline-flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange ${
              overlay
                ? 'border-white/40 text-white hover:bg-white/10'
                : 'border-brand-dark/15 text-brand-dark hover:border-brand-orange hover:text-brand-dark'
            }`}
          >
            <Luggage className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Plan my trip
          </Link>
          <button
            type="button"
            className={`inline-flex items-center justify-center rounded-full border p-2.5 backdrop-blur-sm transition lg:hidden ${
              overlay
                ? 'border-white/40 bg-white/10 text-white hover:bg-white/20'
                : 'border-white/40 bg-white/30 text-brand-dark hover:bg-white/50'
            }`}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
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

      <MobileMenu
        open={open}
        onClose={closeMenu}
        primaryLinks={primaryLinks}
        groups={[
          { label: 'Explore', items: exploreLinks },
          { label: 'Discover', items: discoverLinks },
          { label: 'Community', items: aboutLinks },
        ]}
      />
    </header>
  );
}
