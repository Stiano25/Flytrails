import { Link } from 'react-router-dom';
import { Compass, Heart, Shield, Sparkles } from 'lucide-react';
import { localImages } from '../data/localImages.js';
import { useSiteContent } from '../hooks/useApi.js';

const values = [
  {
    title: 'Community',
    text: 'We design trips where strangers become friends — shared meals, inside jokes, and group photos worth framing.',
    Icon: Heart,
  },
  {
    title: 'Adventure',
    text: 'From summit sunrises to first lion sightings, we chase moments that remind you you\'re alive.',
    Icon: Compass,
  },
  {
    title: 'Integrity',
    text: 'Clear pricing, honest timelines, and local partners who are paid fairly — no bait-and-switch.',
    Icon: Shield,
  },
];

const team = [
  {
    name: 'Hamza Hassan',
    role: 'Director & Founder',
    avatar: localImages.founder,
  },
  {
    name: 'Wanjiku M.',
    role: 'Operations Lead',
    avatar: localImages.savannah,
  },
  {
    name: 'David O.',
    role: 'Lead Safari Guide',
    avatar: localImages.lionSafari,
  },
];

export default function About() {
  const { data: content } = useSiteContent();
  const storyBody = content?.about_story_body;
  const mission = content?.about_mission;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(27,67,50,0.08),transparent_55%)]" />
      <section className="relative h-[min(45vh,400px)] overflow-hidden">
        <img src={localImages.about} alt="Flytrails travellers" className="h-full w-full object-cover animate-video-effect" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/40 to-brand-dark/25" />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <h1 className="text-center font-display text-4xl font-bold text-brand-light drop-shadow md:text-5xl lg:text-6xl">
            About Flytrails
          </h1>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-16 md:px-6">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary/90">
          <Sparkles className="h-4 w-4" aria-hidden />
          Our story
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-brand-dark md:text-4xl">Who we are</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:items-center">
          <div className="glass-surface-strong space-y-4 rounded-3xl p-8 font-light leading-relaxed text-brand-dark/85">
            {storyBody ? (
              storyBody.split('\n').filter(Boolean).map((para, i) => <p key={i}>{para}</p>)
            ) : (
              <>
                <p>
                  Flytrails began around kitchen-table maps and voice notes from friends asking, &ldquo;Where should we go next?&rdquo; We
                  wanted East African travel that felt premium without being pretentious — small groups, local expertise, and room for
                  spontaneity.
                </p>
                <p>
                  Today we run scheduled departures and custom journeys across Kenya, Tanzania, and hand-picked international city breaks —
                  always with the same promise: you&apos;ll feel looked after, not herded.
                </p>
              </>
            )}
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/35 bg-white/20 shadow-xl backdrop-blur-xl">
            <img src={localImages.founder} alt="Hamza Hassan, Director & Founder" className="aspect-[4/5] w-full object-cover" />
            <p className="border-t border-white/25 bg-white/30 px-4 py-3 text-center text-sm font-semibold text-brand-dark backdrop-blur-sm">
              Hamza Hassan — Director & Founder
            </p>
          </div>
        </div>

        <blockquote className="glass-surface mt-14 rounded-3xl border-l-4 border-accent p-6 font-display text-xl font-light italic text-brand-dark shadow-lg md:p-10 md:text-2xl">
          &ldquo;{mission || 'Travel should widen your world and deepen your roots — we build every itinerary with that in mind.'}&rdquo;
        </blockquote>
      </section>

      <section className="relative bg-primary/95 py-16 text-brand-light backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">Our values</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {values.map(({ title, text, Icon }) => (
              <div key={title} className="rounded-3xl border border-white/20 bg-brand-dark/25 p-6 backdrop-blur-md">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/20 text-accent">
                  <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-accent">{title}</h3>
                <p className="mt-3 text-sm font-light text-brand-light/90">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-16 md:px-6">
        <h2 className="text-center font-display text-3xl font-bold text-brand-dark md:text-4xl">The team</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {team.map((m) => (
            <div
              key={m.name}
              className="rounded-3xl border border-white/35 bg-white/25 p-6 text-center shadow-lg backdrop-blur-xl"
            >
              <img
                src={m.avatar}
                alt={`${m.name}, ${m.role}`}
                className="mx-auto h-24 w-24 rounded-full object-cover ring-2 ring-white/40"
              />
              <h3 className="mt-4 font-display text-lg font-bold text-brand-dark">{m.name}</h3>
              <p className="text-sm font-extralight text-brand-dark/65">{m.role}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link
            to="/trips"
            className="inline-block rounded-xl bg-primary px-10 py-3.5 font-bold text-accent shadow-lg transition hover:bg-primary/90"
          >
            Ready to travel with us?
          </Link>
        </div>
      </section>
    </div>
  );
}
