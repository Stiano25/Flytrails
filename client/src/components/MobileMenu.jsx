import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink } from 'react-router-dom';
import { ChevronDown, Luggage, X } from 'lucide-react';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-orange';

/**
 * Phone and tablet menu: a full-height sheet (sized with dvh and safe-area insets) with 48px rows,
 * the desktop dropdown groups as accordions, and one "Plan my trip" pinned at the bottom.
 * Locks page scroll, traps focus, and closes on Escape or when a link is chosen.
 */
export default function MobileMenu({ open, onClose, primaryLinks, groups }) {
  const [expanded, setExpanded] = useState('');
  const sheetRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const previouslyFocused = document.activeElement;
    requestAnimationFrame(() => sheetRef.current?.querySelector('button, a')?.focus());
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !sheetRef.current) return;
      const items = [...sheetRef.current.querySelectorAll('a, button')].filter((el) => el.offsetParent !== null);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open) return null;

  const row = ({ isActive }) =>
    `flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-[17px] font-medium transition-colors ${ring} ${
      isActive ? 'bg-brand-orange/15 text-brand-dark' : 'text-brand-dark hover:bg-brand-bg'
    }`;

  return createPortal(
    <div
      ref={sheetRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="picker-fade fixed inset-0 z-[70] flex h-[100dvh] flex-col bg-white pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] lg:hidden"
    >
      <div className="flex items-center justify-between border-b border-brand-dark/10 px-4 py-3">
        <Link to="/" onClick={onClose} className={`rounded-lg ${ring}`} aria-label="Flytrails home">
          <img src="/images/flytrailsnewlogo.png" alt="Flytrails" className="h-10 w-auto" />
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className={`inline-flex h-12 w-12 items-center justify-center rounded-full text-brand-dark hover:bg-brand-bg ${ring}`}
        >
          <X className="h-6 w-6" aria-hidden />
        </button>
      </div>

      <nav aria-label="Main" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
        <ul className="space-y-1">
          {primaryLinks.map(({ to, label, end, Icon }) => (
            <li key={to}>
              <NavLink to={to} end={end} onClick={onClose} className={row}>
                <Icon className="h-5 w-5 text-brand-dark/50" aria-hidden />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <ul className="mt-2 space-y-1 border-t border-brand-dark/10 pt-2">
          {groups.map(({ label, items }) => {
            const isOpen = expanded === label;
            const panelId = `mobile-group-${label.toLowerCase()}`;
            return (
              <li key={label}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setExpanded(isOpen ? '' : label)}
                  className={`flex min-h-[48px] w-full items-center justify-between rounded-xl px-3 text-[17px] font-medium text-brand-dark hover:bg-brand-bg ${ring}`}
                >
                  {label}
                  <ChevronDown className={`h-5 w-5 text-brand-dark/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
                </button>
                <ul id={panelId} hidden={!isOpen} className="mb-2 ml-3 space-y-0.5 border-l border-brand-dark/10 pl-3">
                  {items.map(({ to, label: itemLabel, Icon }) => (
                    <li key={to}>
                      <NavLink to={to} onClick={onClose} className={row}>
                        <Icon className="h-5 w-5 text-brand-dark/45" aria-hidden />
                        {itemLabel}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-brand-dark/10 p-4">
        <Link
          to="/?plan=1"
          onClick={onClose}
          className={`flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-brand-orange text-[16px] font-semibold text-brand-dark hover:bg-[#f4a53f] ${ring}`}
        >
          <Luggage className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          Plan my trip
        </Link>
      </div>
    </div>,
    document.body
  );
}
