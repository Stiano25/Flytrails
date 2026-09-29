import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import JoinFreeForm from '../site/JoinFreeForm.jsx';

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

          <JoinFreeForm className="mt-6" />
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
