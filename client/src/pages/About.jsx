import { Compass, Heart, Shield } from 'lucide-react';
import { localImages } from '../data/localImages.js';
import { useSiteContent } from '../hooks/useApi.js';
import PageHeader from '../components/site/PageHeader.jsx';
import NextStep from '../components/site/NextStep.jsx';

const values = [
  {
    title: 'Community',
    text: 'We design trips where strangers become friends: shared meals, inside jokes, and group photos worth framing.',
    Icon: Heart,
  },
  {
    title: 'Adventure',
    text: 'From summit sunrises to first lion sightings, we chase moments that remind you you’re alive.',
    Icon: Compass,
  },
  {
    title: 'Integrity',
    text: 'Clear pricing, honest timelines, and local partners who are paid fairly. No bait-and-switch.',
    Icon: Shield,
  },
];

/** Only real portraits are shown; everyone else gets their initials until a photo is added. */
const team = [
  { name: 'Hamza Hassan', role: 'Director & Founder', avatar: localImages.founder },
  { name: 'Wanjiku M.', role: 'Operations Lead', avatar: null },
  { name: 'David O.', role: 'Lead Safari Guide', avatar: null },
];

const initials = (name) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .replace(/[^A-Z]/gi, '')
    .slice(0, 2)
    .toUpperCase();

export default function About() {
  const { data: content } = useSiteContent();
  const storyBody = content?.about_story_body;
  const mission = content?.about_mission || 'Small groups. Real guides. Genuine places.';

  return (
    <div>
      <PageHeader eyebrow="About" title="Travel that feels" accent="looked after" description={mission} />

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1fr_22rem] md:px-6 md:py-16">
        <div className="max-w-[62ch] space-y-4 text-[17px] leading-[1.8] text-brand-dark/80">
          <h2 className="text-2xl font-semibold tracking-tight text-brand-dark">
            Our <span className="font-light italic">story</span>
          </h2>
          {storyBody ? (
            storyBody
              .split('\n')
              .filter(Boolean)
              .map((para, i) => <p key={i}>{para}</p>)
          ) : (
            <p>
              Flytrails runs small-group departures and custom journeys across Kenya, Tanzania and beyond, always with the same promise: you’ll
              feel looked after, not herded.
            </p>
          )}
        </div>
        <figure className="self-start">
          <img
            src={localImages.founder}
            alt="Hamza Hassan, Director and Founder of Flytrails"
            className="aspect-[4/5] w-full rounded-[22px] object-cover object-top shadow-[0_24px_48px_-28px_rgba(13,27,42,0.6)]"
          />
          <figcaption className="mt-3 text-sm text-brand-dark/60">
            <span className="font-semibold text-brand-dark">Hamza Hassan</span> · Director & Founder
          </figcaption>
        </figure>
      </section>

      <section aria-labelledby="values-title" className="border-y border-brand-dark/10 bg-brand-bg py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 id="values-title" className="text-2xl font-semibold tracking-tight text-brand-dark">
            What we <span className="font-light italic">stand for</span>
          </h2>
          <ul className="mt-8 grid gap-8 md:grid-cols-3">
            {values.map(({ title, text, Icon }) => (
              <li key={title}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-orange/15 text-[#b5650d]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-4 text-lg font-semibold text-brand-dark">{title}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-brand-dark/70">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="team-title" className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <h2 id="team-title" className="text-2xl font-semibold tracking-tight text-brand-dark">
          The <span className="font-light italic">team</span>
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {team.map((m) => (
            <li key={m.name} className="flex items-center gap-4">
              {m.avatar ? (
                <img src={m.avatar} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover object-top" />
              ) : (
                <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white" aria-hidden>
                  {initials(m.name)}
                </span>
              )}
              <div>
                <p className="font-semibold text-brand-dark">{m.name}</p>
                <p className="text-sm text-brand-dark/60">{m.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <NextStep title="Come travel with us." secondary={{ to: '/reviews', label: 'Read traveller stories' }} />
    </div>
  );
}
