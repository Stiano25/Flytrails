import { useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { useWhatsappLink } from '../hooks/useWhatsappLink.js';

export default function ReserveModal({ open, onClose, tripTitle }) {
  const focusTrapRef = useFocusTrap(open);
  const whatsappHref = useWhatsappLink();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-dark/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reserve-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={focusTrapRef}
        className="max-w-md rounded-3xl border border-white/35 bg-white/90 p-6 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="reserve-title" className="font-display text-xl font-bold text-brand-dark">
            Reserve via WhatsApp
          </h2>
          <button
            onClick={onClose}
            className="rounded-full border border-brand-dark/10 p-2 text-brand-dark transition hover:bg-white/80"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm font-light text-brand-dark/80">
          Complete your booking for <strong className="font-semibold text-brand-dark">{tripTitle}</strong> by messaging our team.
          We&apos;ll confirm availability and send payment details.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-accent shadow-md"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Open WhatsApp
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brand-dark/15 bg-white/60 px-4 py-3 text-sm font-medium text-brand-dark backdrop-blur-sm transition hover:bg-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
