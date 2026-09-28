import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

const PHONE = '(max-width: 639px)';

function useIsPhone() {
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia(PHONE).matches);
  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const on = () => setPhone(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return phone;
}

/**
 * Shell for the trip finder pickers: a bottom sheet on phones (drag handle, swipe down to close)
 * and a panel anchored to the finder bar on larger screens, with a caret pointing at the word
 * being edited. Traps focus, closes on Escape or backdrop, and locks page scroll while open.
 */
export default function FinderPicker({ open, anchorRef, tokenRef, stepKey, title, subtitle, onClose, children }) {
  const phone = useIsPhone();
  const reduce = useReducedMotion();
  const panelRef = useRef(null);
  const dragControls = useDragControls();
  const [pos, setPos] = useState(null);

  // Desktop: place the panel below the bar if it fits, otherwise above; clamp to the viewport.
  useLayoutEffect(() => {
    if (!open || phone) return undefined;
    const place = () => {
      const bar = anchorRef.current?.getBoundingClientRect();
      const panel = panelRef.current;
      if (!bar || !panel) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const width = Math.min(760, vw - 32);
      const left = Math.min(Math.max(bar.left + bar.width / 2 - width / 2, 16), vw - width - 16);
      const natural = panel.scrollHeight;
      const below = vh - bar.bottom - 24;
      const above = bar.top - 24;
      const placeBelow = natural <= below || below >= above;
      const token = tokenRef.current?.getBoundingClientRect();
      const caret = token ? Math.min(Math.max(token.left + token.width / 2 - left, 28), width - 28) : width / 2;
      setPos({
        width,
        left,
        caret,
        placeBelow,
        maxHeight: Math.max(placeBelow ? below : above, 240),
        top: placeBelow ? bar.bottom + 12 : undefined,
        bottom: placeBelow ? undefined : vh - bar.top + 12,
      });
    };
    place();
    const id = requestAnimationFrame(place);
    window.addEventListener('resize', place);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', place);
    };
  }, [open, phone, stepKey, anchorRef, tokenRef]);

  // Scroll lock, Escape, and a focus trap that re-reads focusable items (content changes per step).
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll('button:not([disabled]), [href], input')].filter(
        (el) => el.offsetParent !== null && el.tabIndex !== -1
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!panelRef.current.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
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
    };
  }, [open, onClose]);

  // Move focus into the picker on every step: the current choice if there is one, else the first option.
  useEffect(() => {
    if (!open) return undefined;
    const id = requestAnimationFrame(() => {
      const body = panelRef.current?.querySelector('[data-picker-body]');
      body?.scrollTo({ top: 0 });
      const target = body?.querySelector('[aria-pressed="true"]') || body?.querySelector('button:not([disabled])');
      target?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [open, stepKey]);

  const duration = reduce ? 0 : 0.2;

  const header = (
    <div className="flex items-start justify-between gap-3 px-5 pt-1 sm:px-6 sm:pt-5">
      <div className="min-w-0">
        <h2 id="finder-picker-title" className="font-inter text-xl font-semibold tracking-tight text-brand-dark sm:text-[22px]">
          {title}
        </h2>
        {subtitle ? <p className="mt-1 text-sm text-brand-dark/60">{subtitle}</p> : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="-mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-brand-dark/60 transition-colors duration-150 hover:bg-brand-dark/5 hover:text-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        <X className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );

  // Keyed on the step so each new question mounts at once (focus can move straight into it) and fades in.
  const body = (
    <div
      key={stepKey}
      data-picker-body
      className="picker-fade min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-4 sm:px-6 sm:pb-6"
    >
      {children}
    </div>
  );

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] font-inter">
          <motion.div
            className={`absolute inset-0 ${phone ? 'bg-brand-dark/55' : 'bg-brand-dark/25'}`}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            aria-hidden
          />
          {phone ? (
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="finder-picker-title"
              className="absolute inset-x-0 bottom-0 flex max-h-[85svh] flex-col rounded-t-3xl bg-[#fbfaf7] pb-[env(safe-area-inset-bottom,0px)] shadow-2xl"
              initial={reduce ? { opacity: 0 } : { y: '100%' }}
              animate={reduce ? { opacity: 1 } : { y: 0 }}
              exit={reduce ? { opacity: 0 } : { y: '100%' }}
              transition={{ duration: reduce ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
              drag={reduce ? false : 'y'}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              dragListener={false}
              dragControls={dragControls}
              onDragEnd={(_, info) => {
                if (info.offset.y > 90 || info.velocity.y > 600) onClose();
              }}
            >
              {/* Drag handle: swipe down to close. */}
              <div
                className="flex cursor-grab touch-none justify-center pb-2 pt-3 active:cursor-grabbing"
                onPointerDown={(e) => {
                  if (!reduce) dragControls.start(e);
                }}
                aria-hidden
              >
                <span className="h-1.5 w-11 rounded-full bg-brand-dark/20" />
              </div>
              {header}
              {body}
            </motion.div>
          ) : (
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="finder-picker-title"
              className="absolute flex flex-col rounded-3xl bg-[#fbfaf7] shadow-[0_24px_70px_-18px_rgba(13,27,42,0.6)]"
              style={
                pos
                  ? { left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight }
                  : { left: -9999, top: 0, width: 760, visibility: 'hidden' }
              }
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: pos?.placeBelow === false ? 6 : -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration }}
            >
              {pos && (
                <motion.span
                  className={`absolute h-4 w-4 rotate-45 bg-[#fbfaf7] ${pos.placeBelow ? '-top-2' : '-bottom-2'}`}
                  animate={{ left: pos.caret - 8 }}
                  transition={{ duration }}
                  aria-hidden
                />
              )}
              {header}
              {body}
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
