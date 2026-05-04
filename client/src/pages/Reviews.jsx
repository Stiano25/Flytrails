import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import { pageHeroImages } from '../data/pageHeroImages.js';
import Toast from '../components/Toast.jsx';
import { useCustomerReviews, useSubmit } from '../hooks/useApi.js';
import { api } from '../data/api.js';

const fieldClass = 'glass-input mt-1.5 w-full';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-brand-dark/70';

function Stars({ value }) {
  if (!value) return null;
  return (
    <span className="flex items-center gap-0.5 text-accent" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < value ? 'fill-current' : 'text-brand-dark/20'}`} strokeWidth={1.5} />
      ))}
    </span>
  );
}

export default function Reviews() {
  const { data: reviews, loading, error } = useCustomerReviews();
  const { submit, loading: submitting } = useSubmit();
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast((s) => ({ ...s, show: false })), 5500);
    return () => clearTimeout(t);
  }, [toast.show]);

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const result = await submit(() =>
      api.submitCustomerReview({
        authorName: String(fd.get('authorName') || '').trim(),
        authorEmail: String(fd.get('authorEmail') || '').trim(),
        rating: fd.get('rating') || '',
        body: String(fd.get('body') || '').trim(),
      }),
    );

    if (result.success) {
      e.target.reset();
      setToast({ show: true, variant: 'success', message: result.message || 'Review submitted.' });
    } else {
      setToast({ show: true, variant: 'error', message: result.error || 'Could not submit review.' });
    }
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(27,67,50,0.07),transparent_55%)]" />
      <PageHero
        imageUrl={pageHeroImages.trips}
        imageAlt="Flytrails travellers"
        title="Reviews"
        subtitle="Read what travellers say — and share your own experience after a trip with us."
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,380px)] lg:items-start">
          <div>
            <h2 className="font-display text-2xl font-bold text-brand-dark md:text-3xl">Published reviews</h2>
            <p className="mt-2 text-sm font-light text-brand-dark/70">
              New submissions are checked by our team before they appear here. We may respond publicly below your review.
            </p>

            {loading && <p className="mt-8 text-sm text-brand-dark/60">Loading…</p>}
            {error && <p className="mt-8 text-sm text-red-700">{error}</p>}
            {!loading && !error && (!reviews || reviews.length === 0) && (
              <p className="mt-8 rounded-2xl border border-white/40 bg-white/30 px-6 py-8 text-center text-sm text-brand-dark/70 backdrop-blur-sm">
                No published reviews yet — be the first to leave one.
              </p>
            )}

            <ul className="mt-8 space-y-6">
              {(reviews || []).map((r) => (
                <li key={r.id} className="glass-surface-strong rounded-3xl p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-bold text-brand-dark">{r.authorName}</p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-brand-dark/50">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : ''}
                      </p>
                    </div>
                    <Stars value={r.rating} />
                  </div>
                  <p className="mt-4 text-sm font-light leading-relaxed text-brand-dark/85 md:text-base">{r.body}</p>
                  {r.adminReply ? (
                    <div className="mt-5 border-l-4 border-accent bg-primary/8 px-4 py-3 rounded-r-xl">
                      <p className="text-xs font-bold uppercase tracking-wide text-primary">Flytrails</p>
                      <p className="mt-2 text-sm font-light leading-relaxed text-brand-dark/90">{r.adminReply}</p>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <aside className="lg:sticky lg:top-28">
            <form onSubmit={handleSubmit} className="glass-surface-strong space-y-4 rounded-3xl p-6 md:p-8">
              <h2 className="font-display text-xl font-bold text-brand-dark">Leave a review</h2>
              <p className="text-sm font-light text-brand-dark/70">
                Tell us about your trip. We read every submission; approved reviews show on this page.
              </p>
              <label className="flex flex-col text-sm">
                <span className={labelClass}>Your name</span>
                <input name="authorName" required maxLength={120} className={fieldClass} />
              </label>
              <label className="flex flex-col text-sm">
                <span className={labelClass}>Email (optional)</span>
                <input name="authorEmail" type="email" maxLength={200} className={fieldClass} />
              </label>
              <label className="flex flex-col text-sm">
                <span className={labelClass}>Rating (optional)</span>
                <select name="rating" className={fieldClass} defaultValue="">
                  <option value="">No rating</option>
                  <option value="5">5 — Excellent</option>
                  <option value="4">4 — Very good</option>
                  <option value="3">3 — Good</option>
                  <option value="2">2 — Fair</option>
                  <option value="1">1 — Poor</option>
                </select>
              </label>
              <label className="flex flex-col text-sm">
                <span className={labelClass}>Your experience</span>
                <textarea name="body" required rows={6} minLength={10} maxLength={5000} className={fieldClass} />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-accent shadow-md transition hover:bg-primary/90 disabled:opacity-60"
              >
                {submitting ? 'Sending…' : 'Submit review'}
              </button>
            </form>
          </aside>
        </div>
      </div>

      <Toast show={toast.show} message={toast.message} variant={toast.variant} onClose={() => setToast((t) => ({ ...t, show: false }))} />
    </div>
  );
}
