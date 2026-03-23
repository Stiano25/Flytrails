import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, Crown } from 'lucide-react';

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

const faqs = [
  {
    q: 'How do I pay for Elite or VIP?',
    a: 'After you reach out via our contact form, we send M-Pesa or bank details and activate your perks within 24 hours.',
  },
  {
    q: 'Do discounts stack with early-bird pricing?',
    a: "Member discounts apply to the public trip price; we'll always quote you the best eligible rate.",
  },
  {
    q: 'Can I upgrade mid-year?',
    a: 'Yes — upgrades are prorated for the remaining months of your membership year.',
  },
  {
    q: 'Is the community forum moderated?',
    a: 'Yes — our team keeps discussions respectful, helpful, and spam-free.',
  },
];

export default function Membership() {
  const [open, setOpen] = useState(-1);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,169,106,0.08),transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6">
        <p className="flex justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary/90">
          <Crown className="h-4 w-4" aria-hidden />
          Membership
        </p>
        <h1 className="mt-3 text-center font-display text-4xl font-bold text-brand-dark md:text-5xl">Join the Flytrails family</h1>
        <p className="mx-auto mt-4 max-w-2xl text-center font-light text-brand-dark/75">
          Early access, discounts, and a community that travels together — pick the tier that fits your year.
        </p>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-3xl border p-8 backdrop-blur-xl ${
                t.popular
                  ? 'border-accent/50 bg-white/45 shadow-xl ring-2 ring-accent/30'
                  : 'border-white/35 bg-white/25 shadow-lg'
              }`}
            >
              {t.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-bold text-brand-dark shadow-md">
                  Most popular
                </span>
              )}
              <h2 className="font-display text-2xl font-bold text-brand-dark">{t.name}</h2>
              <p className="mt-2 font-display text-3xl font-bold text-primary">{t.price}</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm font-light text-brand-dark/85">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className={`mt-8 block rounded-xl py-3 text-center text-sm font-bold transition ${
                  t.popular ? 'bg-primary text-accent shadow-md hover:bg-primary/90' : 'border border-primary/40 bg-white/40 text-primary backdrop-blur-sm hover:bg-white/60'
                }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>

        <section className="mt-20">
          <h2 className="text-center font-display text-2xl font-bold text-brand-dark md:text-3xl">Membership FAQs</h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-2">
            {faqs.map((f, i) => (
              <div key={f.q} className="overflow-hidden rounded-2xl border border-white/35 bg-white/25 backdrop-blur-md">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-sm font-semibold text-brand-dark transition hover:bg-white/30"
                  onClick={() => setOpen(open === i ? -1 : i)}
                  aria-expanded={open === i}
                >
                  {f.q}
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-primary transition ${open === i ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
                {open === i && (
                  <p className="border-t border-brand-dark/10 px-4 py-3 text-sm font-light text-brand-dark/75">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
