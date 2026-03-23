/**
 * Full-width hero — local image (see data/pageHeroImages.js), glass frame, homepage-aligned styling.
 */
export default function PageHero({ imageUrl, imageAlt, title, subtitle }) {
  return (
    <section className="w-full px-4 pt-6 md:px-6 md:pt-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/30 bg-white/10 shadow-2xl backdrop-blur-md md:rounded-[2rem]">
        <div className="relative h-[min(42vh,380px)] w-full overflow-hidden md:h-[min(46vh,420px)]">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="absolute inset-0 h-full w-full object-cover animate-video-effect"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-brand-dark/50 to-brand-dark/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/45 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-10 pt-6 md:px-10 md:pb-12">
          <h1 className="font-display text-4xl font-bold leading-tight text-white drop-shadow-sm md:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 max-w-2xl font-sans text-base font-extralight leading-relaxed text-white/90 md:text-lg">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
