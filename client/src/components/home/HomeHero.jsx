import { Link } from 'react-router-dom';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white';

export default function HomeHero() {
  return (
    <section className="home-hero relative isolate flex overflow-hidden bg-brand-dark" aria-labelledby="home-hero-title">
      <img
        src="/images/hero-palm-coast.jpg"
        alt=""
        width="1332"
        height="749"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[60%_60%]"
        decoding="async"
        fetchpriority="high"
      />
      {/* Dark gradient: heavier at the top (navbar) and bottom, a lighter band through the middle, plus a soft pool behind the copy. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to bottom, rgba(13,27,42,0.7) 0%, rgba(13,27,42,0.45) 30%, rgba(13,27,42,0.45) 60%, rgba(13,27,42,0.8) 100%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 65% 50% at 50% 50%, rgba(13,27,42,0.35), transparent 75%)' }}
        aria-hidden
      />

      <div className="hero-fade mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-4 pb-10 pt-[calc(var(--nav-h)+1.5rem)] text-center md:px-6 [@media(max-height:500px)]:pb-4 [@media(max-height:500px)]:pt-[calc(var(--nav-h)+0.5rem)]">
        <figure className="max-w-4xl">
          <blockquote
            className="font-serif text-[clamp(2rem,min(5.6vw,7.5svh),4.25rem)] font-normal leading-[1.1] tracking-[-0.01em] text-white text-balance [text-shadow:0_2px_24px_rgba(13,27,42,0.35)]"
          >
            <p>
              &ldquo;There is a kind of magicness about going far away and then coming back all changed.&rdquo;
            </p>
          </blockquote>
          <figcaption className="mt-5 font-sans text-xs font-medium uppercase tracking-[0.2em] text-accent md:text-sm [@media(max-height:500px)]:mt-2">
            Kate Douglas Wiggin
          </figcaption>
        </figure>
        <h1
          id="home-hero-title"
          className="mt-6 max-w-xl font-sans text-lg font-light leading-relaxed text-white/90 md:text-xl [@media(max-height:500px)]:mt-2"
        >
          Tailor-made trips and group adventures, planned with care.
        </h1>
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
