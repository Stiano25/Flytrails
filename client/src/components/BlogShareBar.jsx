import { useState, useCallback, useMemo, useEffect } from 'react';
import { Share2, MessageCircle, Link2 } from 'lucide-react';
import { SITE_ORIGIN } from '../config.js';
import Toast from './Toast.jsx';

function useShareUrl(slug) {
  return useMemo(() => {
    const path = `/blog/${slug}`;
    if (typeof window === 'undefined') return `${SITE_ORIGIN || ''}${path}`;
    const base = (SITE_ORIGIN || window.location.origin || '').replace(/\/$/, '');
    return `${base}${path}`;
  }, [slug]);
}

/**
 * Sharing helpers for blog posts: native share (Stories / Status on many phones),
 * WhatsApp with prefilled text, and copy link for Instagram link stickers or Status paste.
 */
export default function BlogShareBar({ title, slug, compact = false, className = '' }) {
  const shareUrl = useShareUrl(slug);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  const shareText = useMemo(
    () => `${title}\n${shareUrl}\n\n— Flytrails`,
    [title, shareUrl],
  );

  const showToast = useCallback((message) => {
    setToast({ show: true, message });
  }, []);

  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast((s) => ({ ...s, show: false })), 5200);
    return () => clearTimeout(t);
  }, [toast.show]);

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title,
        text: `${title} — Flytrails`,
        url: shareUrl,
      });
    } catch (e) {
      if (e?.name !== 'AbortError') {
        showToast('Share did not open. Try Copy link or WhatsApp below.');
      }
    }
  };

  const handleWhatsApp = () => {
    const href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast(
        'Link copied — paste it on Instagram Stories (link sticker) or WhatsApp Status.',
      );
    } catch {
      showToast('Could not copy automatically. Copy the address from your browser bar.');
    }
  };

  const btnBase =
    'inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-white/50 px-3 py-2.5 text-sm font-semibold text-primary backdrop-blur-sm transition hover:bg-white/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
  const iconOnly = compact ? 'p-2.5' : '';

  return (
    <>
      <div
        className={`flex flex-wrap items-center gap-2 ${compact ? '' : 'rounded-2xl border border-white/40 bg-white/30 p-4 backdrop-blur-md'} ${className}`}
      >
        {!compact && (
          <p className="w-full text-xs font-medium text-brand-dark/65">
            Share to Instagram Stories, WhatsApp Status, or chats — use{' '}
            <span className="font-bold text-brand-dark">Share</span> on your phone for the quick
            sheet, or the buttons below.
          </p>
        )}
        {canNativeShare && (
          <button type="button" className={`${btnBase} ${iconOnly}`} onClick={handleNativeShare}>
            <Share2 className="h-4 w-4 shrink-0" aria-hidden />
            {!compact && 'Share'}
            {compact && <span className="sr-only">Share (Instagram, WhatsApp, and more)</span>}
          </button>
        )}
        <button
          type="button"
          className={`${btnBase} ${iconOnly}`}
          onClick={handleWhatsApp}
          aria-label="Share via WhatsApp with this link prefilled"
        >
          <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
          {!compact && 'WhatsApp'}
          {compact && <span className="sr-only">WhatsApp</span>}
        </button>
        <button
          type="button"
          className={`${btnBase} ${iconOnly}`}
          onClick={handleCopyLink}
          aria-label="Copy link for Instagram Stories or WhatsApp Status"
        >
          <Link2 className="h-4 w-4 shrink-0" aria-hidden />
          {!compact && 'Copy link'}
          {compact && <span className="sr-only">Copy link for Stories or Status</span>}
        </button>
      </div>
      <Toast
        message={toast.message}
        show={toast.show}
        variant="success"
        onClose={() => setToast((s) => ({ ...s, show: false }))}
      />
    </>
  );
}
