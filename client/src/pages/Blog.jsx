import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { useBlogPosts } from '../hooks/useApi.js';
import PageHeader from '../components/site/PageHeader.jsx';
import NextStep from '../components/site/NextStep.jsx';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export const formatPostDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

function PostMeta({ post, light }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${light ? 'text-white/75' : 'text-brand-dark/55'}`}>
      {post.category && <span className="font-semibold uppercase tracking-[0.14em]">{post.category}</span>}
      {post.date && <span>{formatPostDate(post.date)}</span>}
      {post.readTime && (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {post.readTime}
        </span>
      )}
    </p>
  );
}

/** Journal: the latest guide leads full-width, the rest follow in a calm grid; categories filter in place. */
export default function Blog() {
  const { data, loading } = useBlogPosts();
  const posts = (data || []).filter((p) => p.slug?.trim());
  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))];
  const [category, setCategory] = useState('');
  const shown = category ? posts.filter((p) => p.category === category) : posts;
  const [lead, ...rest] = shown;

  return (
    <div>
      <PageHeader eyebrow="Journal" title="Travel" accent="guides & tips" description="Practical advice from our guides and travellers, before you go.">
        {categories.length > 1 && (
          <div className="mx-auto max-w-6xl px-4 pb-5 md:px-6">
            <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Categories">
              {['', ...categories].map((c) => (
                <button
                  key={c || 'all'}
                  type="button"
                  aria-pressed={category === c}
                  onClick={() => setCategory(c)}
                  className={`inline-flex min-h-[40px] shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors ${ring} ${
                    category === c ? 'border-primary bg-primary text-white' : 'border-brand-dark/15 bg-white text-brand-dark/80 hover:border-brand-dark/40'
                  }`}
                >
                  {c || 'All guides'}
                </button>
              ))}
            </div>
          </div>
        )}
      </PageHeader>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        {loading && !posts.length ? (
          <div className="h-80 animate-pulse rounded-[22px] bg-brand-dark/[0.06]" aria-hidden />
        ) : !lead ? (
          <p className="rounded-[22px] bg-brand-bg px-6 py-10 text-center text-brand-dark/70">New guides are being written. Check back soon.</p>
        ) : (
          <>
            <Link
              to={`/blog/${lead.slug}`}
              className={`group relative block overflow-hidden rounded-[22px] bg-brand-dark shadow-[0_24px_48px_-28px_rgba(13,27,42,0.6)] ${ring}`}
            >
              <div className="aspect-[4/3] sm:aspect-[21/9]">
                <img src={lead.image} alt="" className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.03]" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
                <PostMeta post={lead} light />
                <h2 className="mt-2 max-w-3xl text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">{lead.title}</h2>
                {lead.excerpt && <p className="mt-3 hidden max-w-2xl text-[15px] text-white/80 sm:block">{lead.excerpt}</p>}
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-brand-orange decoration-2 underline-offset-4">
                  Read the guide
                  <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </Link>

            {rest.length > 0 && (
              <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <li key={post.slug}>
                    <Link to={`/blog/${post.slug}`} className={`group block ${ring}`}>
                      <div className="aspect-[16/10] overflow-hidden rounded-[18px] bg-brand-dark/10">
                        <img src={post.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                      </div>
                      <div className="mt-4">
                        <PostMeta post={post} />
                        <h2 className="mt-1.5 text-lg font-semibold leading-snug text-brand-dark group-hover:text-primary">{post.title}</h2>
                        {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-brand-dark/65">{post.excerpt}</p>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <NextStep title="Read enough?" text="Turn the guide into a trip. Tell us when and who’s coming." secondary={{ to: '/gallery', label: 'See trip albums' }} />
    </div>
  );
}
