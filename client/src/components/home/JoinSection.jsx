import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Map,
  Mountain,
  Trees,
  Waves,
  Globe,
  Users,
} from 'lucide-react';

const joinOptions = [
  {
    label: 'Exploring East Africa',
    sub: 'Kenya & Tanzania',
    query: '',
    Icon: Map,
  },
  {
    label: 'Hiking',
    sub: 'Peaks & trails',
    query: 'Hiking',
    Icon: Mountain,
  },
  {
    label: 'On safari',
    sub: 'Savannah & wildlife',
    query: 'Safari',
    Icon: Trees,
  },
  {
    label: 'At the beach',
    sub: 'Coast & islands',
    query: 'Beach',
    Icon: Waves,
  },
  {
    label: 'Going international',
    sub: 'City & multi-country',
    query: 'International',
    Icon: Globe,
  },
  {
    label: 'In women-only groups',
    sub: 'Curated trips',
    query: 'Women-Only',
    Icon: Users,
  },
];

export default function JoinSection() {
  return (
    <section className="relative border-b border-white/20 py-14 md:py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(27,67,50,0.08),transparent_55%)]" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/85">Pick a vibe</p>
          <h2 className="mt-3 font-display text-2xl font-bold text-brand-dark md:text-3xl lg:text-4xl">
            Join the people who are
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm font-extralight text-brand-dark/65 md:text-base">
            Tap an activity to see matching trips — no stock photos, just where you want to go next.
          </p>
        </motion.div>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {joinOptions.map(({ label, sub, query, Icon }, index) => (
            <motion.li
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <Link
                to={query ? `/trips?category=${encodeURIComponent(query)}` : '/trips'}
                className="group flex h-full min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border border-white/35 bg-white/25 px-3 py-5 text-center shadow-md backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-accent/45 hover:bg-white/40 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:min-h-[132px]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/15 group-hover:text-primary md:h-14 md:w-14">
                  <Icon className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="font-display text-sm font-semibold leading-tight text-brand-dark group-hover:text-primary md:text-[15px]">
                  {label}
                </span>
                <span className="text-[11px] font-extralight leading-snug text-brand-dark/55 md:text-xs">{sub}</span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
