import { Check, MessageCircle } from 'lucide-react';
import { WHATSAPP_URL } from '../config.js';
import PageHeader from '../components/site/PageHeader.jsx';
import FaqGuide from '../components/site/FaqGuide.jsx';
import JoinFreeForm from '../components/site/JoinFreeForm.jsx';
import NextStep from '../components/site/NextStep.jsx';

const tiers = [
  {
    name: 'Explorer',
    price: 'Free',
    features: ['Newsletter access', 'Trip announcements', 'Community forum access'],
    popular: false,
  },
  {
    name: 'Elite',
    price: 'KES 2,500/year',
    features: [
      'Early trip access (48hrs before public)',
      '5% discount on all trips',
      'Members-only day trips',
      'Priority WhatsApp support',
    ],
    popular: true,
  },
  {
    name: 'VIP',
    price: 'KES 6,000/year',
    features: [
      'Everything in Elite',
      '10% discount on all trips',
      'Free airport transfer once/year',
      'Exclusive luxury & international trips',
      'Personal trip concierge',
    ],
    popular: false,
  },
];

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/** WhatsApp with the request already written, matching how paid memberships are set up (M-Pesa or bank details). */
const joinLink = (tier) => `${WHATSAPP_URL}?text=${encodeURIComponent(`Hi Flytrails, I'd like to join the ${tier} membership.`)}`;

/** Membership: the three tiers side by side, each with a real way to join, then the membership questions. */
export default function Membership() {
  return (
    <div>
      <PageHeader
        eyebrow="Membership"
        title="Travel more,"
        accent="pay less"
        description="Start free as an Explorer. Upgrade when you want early access and member discounts."
      />

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <ul className="grid gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <li
              key={t.name}
              className={`relative flex flex-col rounded-[22px] border bg-white p-7 shadow-[0_18px_40px_-28px_rgba(13,27,42,0.5)] ${
                t.popular ? 'border-brand-orange ring-1 ring-brand-orange' : 'border-brand-dark/10'
              }`}
            >
              {t.popular && (
                <span className="absolute -top-3 left-7 rounded-full bg-brand-orange px-3 py-1 text-xs font-semibold text-brand-dark">Most popular</span>
              )}
              <h2 className="text-xl font-semibold text-brand-dark">{t.name}</h2>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-primary">{t.price}</p>
              <ul className="mt-6 flex-1 space-y-3 text-[15px] text-brand-dark/75">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {t.price === 'Free' ? (
                  <JoinFreeForm stacked />
                ) : (
                  <a
                    href={joinLink(t.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex min-h-[48px] items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-colors ${ring} ${
                      t.popular ? 'bg-brand-orange text-brand-dark hover:bg-[#f4a53f]' : 'border border-brand-dark/20 text-brand-dark hover:border-brand-dark/45'
                    }`}
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    Join {t.name} on WhatsApp
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-sm text-brand-dark/55">Paid memberships are activated within 24 hours of payment by M-Pesa or bank transfer.</p>
      </section>

      <FaqGuide only="membership" title="Membership" accent="questions" />

      <NextStep title="Members travel first." text="Plan your next trip and we’ll apply your member rate." />
    </div>
  );
}
