import { useEffect } from 'react';
import { Link } from 'react-router-dom';
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
        className="picker-fade w-full max-w-md rounded-[22px] bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="reserve-title" className="text-xl font-semibold tracking-tight text-brand-dark">
            Reserve your spot
          </h2>
          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-dark/70 transition hover:bg-brand-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-[15px] text-brand-dark/75">
          Complete your booking for <strong className="font-semibold text-brand-dark">{tripTitle}</strong> by messaging our team.
          Your message is already written: send it and we’ll confirm your seat and share payment details.
        </p>
        <p className="mt-3 text-xs text-brand-dark/55">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="font-medium text-primary underline underline-offset-2 hover:text-primary/80" onClick={onClose}>
            Terms & Conditions
          </Link>
          .
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={`${whatsappHref.split('?')[0]}?text=${encodeURIComponent(`Hi Flytrails, I'd like to reserve a spot on ${tripTitle}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-brand-orange px-5 text-center text-[15px] font-semibold text-brand-dark hover:bg-[#f4a53f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Send on WhatsApp
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-brand-dark/15 px-5 text-sm font-medium text-brand-dark transition hover:border-brand-dark/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Not yet
          </button>
        </div>
      </div>
    </div>
  );
}
