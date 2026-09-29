import { Link } from 'react-router-dom';
import { ArrowRight, Luggage } from 'lucide-react';
import { StoriesBackdrop } from '../postcards/Postcard.jsx';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

/**
 * The closing band on inner pages: every page ends with one clear next step (by default the trip finder),
 * plus an optional quieter alternative, so nobody reaches a dead end.
 */
export default function NextStep({
  title = 'Ready when you are.',
  text = 'Tell us the trip, the month and who’s coming. We’ll plan the rest.',
  primary = { to: '/?plan=1', label: 'Plan my trip' },
  secondary,
}) {
  return (
    <section className="relative isolate overflow-hidden text-white">
      <StoriesBackdrop />
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 text-center sm:flex-row sm:justify-between sm:text-left md:px-6 md:py-14">
        <div>
          <p className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</p>
          <p className="mt-1.5 max-w-xl text-[15px] text-white/70">{text}</p>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-3 sm:items-end">
          <Link
            to={primary.to}
            className={`inline-flex min-h-[48px] items-center gap-2 rounded-full bg-brand-orange px-6 text-[15px] font-semibold text-brand-dark transition-colors duration-150 hover:bg-[#f4a53f] active:scale-[0.98] ${ring}`}
          >
            <Luggage className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            {primary.label}
          </Link>
          {secondary && (
            <Link to={secondary.to} className={`inline-flex items-center gap-1 text-sm font-medium text-white/75 underline-offset-4 hover:text-white hover:underline ${ring}`}>
              {secondary.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
