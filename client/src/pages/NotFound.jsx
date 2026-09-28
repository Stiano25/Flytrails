import { Link } from 'react-router-dom';
import { Compass, Luggage } from 'lucide-react';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/** A wrong turn still gets a way forward: plan a trip, browse trips, or go home. */
export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center bg-brand-bg px-4 py-20 text-center">
      <Compass className="h-12 w-12 text-brand-orange" strokeWidth={1.25} aria-hidden />
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/45">Error 404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-dark md:text-4xl">
        This trail <span className="font-light italic">doesn’t exist</span>
      </h1>
      <p className="mt-3 max-w-md text-[15px] text-brand-dark/65">The page may have moved. Here are the best ways back on track.</p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          to="/?plan=1"
          className={`inline-flex min-h-[48px] items-center gap-2 rounded-full bg-brand-orange px-6 text-[15px] font-semibold text-brand-dark hover:bg-[#f4a53f] ${ring}`}
        >
          <Luggage className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          Plan my trip
        </Link>
        <Link to="/trips" className={`inline-flex min-h-[44px] items-center rounded-full border border-brand-dark/15 px-5 text-sm font-semibold text-brand-dark hover:border-brand-dark/40 ${ring}`}>
          Browse trips
        </Link>
        <Link to="/" className={`inline-flex min-h-[44px] items-center px-3 text-sm font-medium text-brand-dark/70 hover:text-brand-dark ${ring}`}>
          Back to home
        </Link>
      </div>
    </section>
  );
}
