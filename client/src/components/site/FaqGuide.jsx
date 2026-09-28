import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, MessageCircle, Search } from 'lucide-react';
import { FAQ_GROUPS, FALLBACK_FAQS, groupFor } from '../../data/faqs.js';
import { WHATSAPP_URL } from '../../config.js';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

function Action({ action }) {
  const cls = `mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline decoration-brand-orange decoration-2 underline-offset-4 hover:text-primary/80 ${ring}`;
  if (action.href) {
    return (
      <a href={action.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {action.label}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </a>
    );
  }
  return (
    <Link to={action.to} className={cls}>
      {action.label}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

/**
 * FAQs as a guide rather than a wall: questions grouped by the stage a traveller is at, a search box,
 * one answer open at a time, and every answer ending in the next useful step. Uses the admin FAQs when
 * there are any, otherwise answers restated from the site's published terms. `only` limits it to one group.
 */
export default function FaqGuide({ faqs, only, title = 'Questions, answered', accent = 'before you ask' }) {
  const items = useMemo(() => {
    const fromAdmin = (faqs || []).map((f) => ({ group: groupFor(f.question), q: f.question, a: f.answer, action: { label: 'Plan my trip', to: '/?plan=1' } }));
    const list = fromAdmin.length ? fromAdmin : FALLBACK_FAQS;
    return only ? list.filter((f) => f.group === only) : list;
  }, [faqs, only]);

  const groups = FAQ_GROUPS.filter((g) => items.some((f) => f.group === g.id));
  const [group, setGroup] = useState(groups[0]?.id);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(0);
  const baseId = useId();

  const q = query.trim().toLowerCase();
  const shown = q
    ? items.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(q))
    : items.filter((f) => only || f.group === group);

  if (!items.length) return null;

  return (
    <section aria-labelledby={`${baseId}-title`} className="bg-white py-16 md:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[18rem_1fr] md:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b5650d]">FAQ</p>
          <h2 id={`${baseId}-title`} className="mt-2 text-3xl font-semibold tracking-tight text-brand-dark">
            {title} <span className="font-light italic">{accent}</span>
          </h2>
          <label className="relative mt-6 block">
            <span className="sr-only">Search questions</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-dark/40" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(0);
              }}
              placeholder="Search, e.g. refund"
              className="w-full rounded-full border border-brand-dark/15 bg-brand-bg py-2.5 pl-10 pr-4 text-[15px] text-brand-dark placeholder:text-brand-dark/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </label>
          {!only && !q && groups.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-2 md:flex-col md:items-start" role="group" aria-label="Question topics">
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={group === g.id}
                  onClick={() => {
                    setGroup(g.id);
                    setOpen(0);
                  }}
                  className={`inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-medium transition-colors duration-150 ${ring} ${
                    group === g.id ? 'bg-primary text-white' : 'bg-brand-bg text-brand-dark/75 hover:bg-brand-dark/[0.06] hover:text-brand-dark'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          )}
          <p className="mt-6 hidden text-sm text-brand-dark/60 md:block">
            Can’t find it?{' '}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={`font-semibold text-primary underline underline-offset-4 ${ring}`}>
              Ask us on WhatsApp
            </a>
          </p>
        </div>

        <div>
          {shown.length ? (
            <ul className="divide-y divide-brand-dark/10 border-y border-brand-dark/10">
              {shown.map((f, i) => {
                const expanded = open === i;
                const id = `${baseId}-${i}`;
                return (
                  <li key={f.q}>
                    <h3>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={`${id}-panel`}
                        id={`${id}-button`}
                        onClick={() => setOpen(expanded ? -1 : i)}
                        className={`flex w-full items-center justify-between gap-4 py-4 text-left text-[16px] font-medium text-brand-dark transition-colors hover:text-primary ${ring}`}
                      >
                        {f.q}
                        <ChevronDown className={`h-5 w-5 shrink-0 text-brand-dark/45 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} aria-hidden />
                      </button>
                    </h3>
                    <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-button`} hidden={!expanded} className="pb-5 pr-8">
                      <p className="text-[15px] leading-relaxed text-brand-dark/75">{f.a}</p>
                      {f.action && <Action action={f.action} />}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-[22px] bg-brand-bg px-6 py-8 text-center">
              <p className="font-medium text-brand-dark">No answer for “{query}” yet.</p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white hover:bg-primary/90 ${ring}`}
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                Ask us on WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
