/**
 * Slim page header used across inner pages: eyebrow, a title with an italic accent word, one line of
 * context, and optional actions on the right. Deliberately small so the page content starts right away.
 */
export default function PageHeader({ eyebrow, title, accent, description, actions, children }) {
  return (
    <header className="border-b border-brand-dark/10 bg-brand-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-6 pt-8 sm:flex-row sm:items-end sm:justify-between md:px-6 md:pt-10">
        <div className="min-w-0">
          {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b5650d]">{eyebrow}</p>}
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-brand-dark md:text-4xl">
            {title} {accent && <span className="font-light italic">{accent}</span>}
          </h1>
          {description && <p className="mt-2 max-w-2xl text-[15px] text-brand-dark/65">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
      </div>
      {children}
    </header>
  );
}
