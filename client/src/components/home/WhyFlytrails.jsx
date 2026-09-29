import { Link } from 'react-router-dom';
import { ArrowRight, Crown, Luggage, MessageCircle, Star, Users } from 'lucide-react';
import { useStories } from '../postcards/stories.js';
import { useWhatsappLink } from '../../hooks/useWhatsappLink.js';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';
const linkClass = `font-medium text-white underline decoration-brand-orange decoration-2 underline-offset-4 hover:text-white/80 ${ring}`;

/**
 * "Why travel with Flytrails": a compact band of proof between trips and stays. Every point comes from
 * what the site already shows (live review rating, About copy, WhatsApp contact, the membership club);
 * nothing here is a new claim. Ends with one action: plan a trip.
 */
export default function WhyFlytrails() {
  const { average, ratedCount } = useStories();
  const whatsappHref = useWhatsappLink();

  const points = [
    ratedCount > 0 && {
      Icon: Star,
      title: `${average.toFixed(1)} from ${ratedCount} reviews`,
      text: (
        <>
          Rated by the people who came.{' '}
          <Link to="/reviews" className={linkClass}>
            Read them
          </Link>
        </>
      ),
    },
    {
      Icon: Users,
      title: 'Small groups, real guides',
      text: 'Genuine places, travelled with people who know them.',
    },
    {
      Icon: MessageCircle,
      title: 'A person, not a form',
      text: (
        <>
          Ask anything before you book.{' '}
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={linkClass}>
            WhatsApp us
          </a>
        </>
      ),
    },
    {
      Icon: Crown,
      title: 'A club to travel with',
      text: (
        <>
          Join free. Elite members get early access and 5% off trips.{' '}
          <Link to="/membership" className={linkClass}>
            Membership
          </Link>
        </>
      ),
    },
  ].filter(Boolean);

  return (
    <section aria-labelledby="why-title" className="bg-brand-dark py-14 text-white md:py-16">
      <div className="mx-auto max-w-6xl px-4 text-center md:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-orange">The Flytrails way</p>
        <h2 id="why-title" className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Why travel with <span className="font-light italic">Flytrails</span>
        </h2>

        <ul className={`mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:mt-9 sm:gap-x-8 sm:gap-y-8 ${points.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3 [&>li:last-child]:col-span-2 lg:[&>li:last-child]:col-span-1'}`}>
          {points.map(({ Icon, title, text }) => (
            <li key={title} className="flex flex-col items-center">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.07] ring-1 ring-white/15">
                <Icon className="h-5 w-5 text-brand-orange" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-3 text-base font-semibold leading-snug sm:text-lg">{title}</h3>
              <p className="mt-1 max-w-[17rem] text-sm leading-relaxed text-white/75 sm:text-[15px]">{text}</p>
            </li>
          ))}
        </ul>

        <Link
          to="/?plan=1"
          className={`mt-9 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-brand-orange px-6 text-[15px] font-semibold text-brand-dark transition-colors duration-150 hover:bg-[#f4a53f] active:scale-[0.98] ${ring}`}
        >
          <Luggage className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          Plan my trip
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
