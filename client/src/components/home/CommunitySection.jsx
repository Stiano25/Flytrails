import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, CircleCheck } from 'lucide-react';
import { useSubmit } from '../../hooks/useApi.js';
import { api } from '../../data/api.js';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const TIERS = [
  { name: 'Explorer', price: 'Free', perk: 'Trip drops and member news in your inbox' },
  { name: 'Elite', price: 'KES 2,500 / year', perk: 'Early access, 5% off trips, members-only day hikes', popular: true },
  { name: 'VIP', price: 'KES 6,000 / year', perk: '10% off, a yearly airport transfer, luxury previews' },
];

/**
 * The Flytrails community (membership) with one obvious action: join free with an email. Everyone starts
 * as an Explorer through the existing newsletter sign-up; the paid tiers sit alongside as the upgrade path.
 * This replaces the separate membership cards and "Stay inspired" newsletter sections.
 */
export default function CommunitySection() {
  const { submit, loading } = useSubmit();
  const [state, setState] = useState({ status: 'idle', message: '' });

  async function join(e) {
    e.preventDefault();
    const email = String(new FormData(e.target).get('email') || '').trim();
    const result = await submit(() => api.subscribeNewsletter(email));
    if (result.success) {
      e.target.reset();
      setState({ status: 'done', message: '' });
    } else {
      setState({ status: 'error', message: result.error || 'We couldn’t add you just now. Please try again.' });
    }
  }

  return (
    <section aria-labelledby="community-title" className="bg-brand-bg py-16 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-[1fr_minmax(0,26rem)] md:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b5650d]">Community</p>
          <h2 id="community-title" className="mt-2 text-3xl font-semibold tracking-tight text-brand-dark md:text-4xl">
            Travel with people <span className="font-light italic">who get it</span>
          </h2>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-brand-dark/70">
            Join free as an Explorer to hear about new trips before anyone else. Upgrade whenever you want the perks.
          </p>

          {state.status === 'done' ? (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-3 text-[15px] font-medium text-primary" role="status">
              <CircleCheck className="h-5 w-5" aria-hidden />
              You’re in. Watch your inbox for the next trip drop.
            </p>
          ) : (
            <form onSubmit={join} className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row" aria-label="Join the Flytrails community">
              <label className="flex-1">
                <span className="sr-only">Email address</span>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-full border border-brand-dark/15 bg-white px-5 py-3 text-[15px] text-brand-dark placeholder:text-brand-dark/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand-orange px-6 text-[15px] font-semibold text-brand-dark transition-colors hover:bg-[#f4a53f] disabled:opacity-60 ${ring}`}
              >
                {loading ? 'Joining…' : 'Join free'}
              </button>
            </form>
          )}
          {state.status === 'error' && (
            <p className="mt-2 text-sm text-red-700" role="alert">
              {state.message}
            </p>
          )}
        </div>

        <div className="rounded-[22px] border border-brand-dark/10 bg-white p-2 shadow-[0_18px_40px_-28px_rgba(13,27,42,0.5)]">
          <ul className="divide-y divide-brand-dark/10">
            {TIERS.map((t) => (
              <li key={t.name} className="flex items-start justify-between gap-4 px-4 py-4">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-brand-dark">
                    {t.name}
                    {t.popular && (
                      <span className="rounded-full bg-brand-orange/20 px-2 py-0.5 text-[11px] font-semibold text-[#8a4d08]">Most popular</span>
                    )}
                  </p>
                  <p className="mt-0.5 flex items-start gap-1.5 text-sm text-brand-dark/65">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {t.perk}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-brand-dark">{t.price}</p>
              </li>
            ))}
          </ul>
          <Link
            to="/membership"
            className={`m-2 flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl bg-brand-bg text-sm font-semibold text-primary transition-colors hover:bg-brand-dark/[0.06] ${ring}`}
          >
            Compare memberships
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
