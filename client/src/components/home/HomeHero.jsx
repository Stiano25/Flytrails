import { Link } from 'react-router-dom';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white';

export default function HomeHero() {
  return (
    <section className="home-hero relative isolate flex overflow-hidden bg-brand-dark" aria-labelledby="home-hero-title">
      <img
        src="/images/hero-sunset-beach.jpg"
        alt=""
        width="1170"
        height="780"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_55%]"
        decoding="async"
        fetchpriority="high"
      />
      {/* Scrims: even base tint, a soft pool behind the centred copy, and a top band so the transparent navbar reads. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-brand-dark/15" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 55%, rgba(13,27,42,0.5), transparent 72%)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-brand-dark/60 to-transparent"
        aria-hidden
      />

      <div className="hero-fade mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-4 pb-10 pt-[calc(var(--nav-h)+1.5rem)] text-center md:px-6 [@media(max-height:500px)]:pb-4 [@media(max-height:500px)]:pt-[calc(var(--nav-h)+0.5rem)]">
        <h1
          id="home-hero-title"
          className="font-serif text-[clamp(2.75rem,min(9vw,12svh),6.5rem)] font-medium leading-[1.02] tracking-[-0.01em] text-white text-balance [text-shadow:0_2px_24px_rgba(13,27,42,0.35)]"
        >
          Your Passport to Paradise
        </h1>
        <p className="mt-5 max-w-xl font-sans text-lg font-light leading-relaxed text-white/90 md:text-xl [@media(max-height:500px)]:mt-2">
          Tailor-made trips and group adventures, planned with care.
        </p>
        <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center sm:gap-4 [@media(max-height:500px)]:mt-4">
          <Link
            to="/custom-tours"
            className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-brand-dark shadow-lg transition-colors duration-200 hover:bg-[#e0bb82] sm:w-auto ${focusRing}`}
          >
            Plan my trip
          </Link>
          <Link
            to="/trips"
            className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-white/60 bg-white/5 px-8 text-base font-medium text-white transition-colors duration-200 hover:border-white hover:bg-white/15 sm:w-auto ${focusRing}`}
          >
            Explore trips
          </Link>
        </div>
      </div>
    </section>
  );
}
