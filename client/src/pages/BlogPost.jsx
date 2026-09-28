import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Clock, Luggage } from 'lucide-react';
import BlogShareBar from '../components/BlogShareBar.jsx';
import { useBlogPost, useBlogPosts } from '../hooks/useApi.js';
import { typeFor } from '../components/home/TripsShowcase.jsx';
import NextStep from '../components/site/NextStep.jsx';
import { formatPostDate } from './Blog.jsx';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/** A guide as a calm reading page that ends by turning the reading into a trip. */
export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, loading, error } = useBlogPost(slug);
  const { data: allPosts } = useBlogPosts();
  const more = (allPosts || []).filter((p) => p.slug && p.slug !== slug).slice(0, 3);
  const sections = post?.sections?.length ? post.sections : null;

  if (!loading && (error || !post)) return <Navigate to="/404" replace />;
  if (loading) return <div className="mx-auto h-[60vh] max-w-3xl animate-pulse px-4 py-10" aria-hidden />;

  const type = typeFor({ category: post.category || '' });
  const planHref = type ? `/?plan=1&type=${type}` : '/?plan=1';

  return (
    <div>
      <article>
        <header className="mx-auto max-w-3xl px-4 pt-8 md:pt-12">
          <Link to="/blog" className={`inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark/60 hover:text-primary ${ring}`}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All guides
          </Link>
          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-dark/55">
            {post.category && <span className="font-semibold uppercase tracking-[0.16em] text-[#b5650d]">{post.category}</span>}
            {post.date && <span>{formatPostDate(post.date)}</span>}
            {post.readTime && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {post.readTime}
              </span>
            )}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-brand-dark md:text-5xl">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg italic leading-relaxed text-brand-dark/70">{post.excerpt}</p>}
          <div className="mt-6">
            <BlogShareBar title={post.title} slug={post.slug} />
          </div>
        </header>

        {post.image && (
          <div className="mx-auto mt-8 max-w-5xl px-4">
            <img src={post.image} alt="" className="aspect-[16/9] w-full rounded-[22px] object-cover" />
          </div>
        )}

        <div className="mx-auto max-w-[68ch] px-4 py-10 text-[17px] leading-[1.8] text-brand-dark/85">
          {sections ? (
            sections.map((s, si) => (
              <section key={`${s.heading}-${si}`} className="mt-10 first:mt-0">
                {s.heading && <h2 className="text-2xl font-semibold leading-snug tracking-tight text-brand-dark">{s.heading}</h2>}
                {s.body.map((block, i) =>
                  typeof block === 'string' ? (
                    <p key={i} className="mt-4 whitespace-pre-line">
                      {block}
                    </p>
                  ) : block?.type === 'image' && block.url ? (
                    <figure key={i} className="my-8 -mx-4 sm:mx-0">
                      <img src={block.url} alt={block.alt || ''} className="w-full rounded-[18px] object-cover" loading="lazy" />
                      {block.caption && <figcaption className="mt-2 text-center text-sm italic text-brand-dark/55">{block.caption}</figcaption>}
                    </figure>
                  ) : null
                )}
              </section>
            ))
          ) : (
            <p className="whitespace-pre-line">{post.excerpt}</p>
          )}

          {post.closing && <p className="mt-10 border-l-2 border-brand-orange pl-5 italic text-brand-dark/75">{post.closing}</p>}

          {post.gallery?.length > 0 && (
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {post.gallery.map((url, index) => (
                <img key={`${url}-${index}`} src={url} alt="" className="aspect-square w-full rounded-[14px] object-cover" loading="lazy" />
              ))}
            </div>
          )}

          {/* Turn reading into planning. */}
          <div className="mt-12 flex flex-col items-start gap-4 rounded-[22px] border border-brand-dark/10 bg-brand-bg p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-brand-dark">Want to do this yourself?</p>
              <p className="text-[15px] text-brand-dark/65">We’ll plan it around your dates and your group.</p>
            </div>
            <Link
              to={planHref}
              className={`inline-flex min-h-[48px] shrink-0 items-center gap-2 rounded-full bg-brand-orange px-6 text-[15px] font-semibold text-brand-dark transition-colors hover:bg-[#f4a53f] ${ring}`}
            >
              <Luggage className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              Plan a trip like this
            </Link>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section aria-labelledby="more-guides" className="border-t border-brand-dark/10 bg-brand-bg py-12">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 id="more-guides" className="text-2xl font-semibold tracking-tight text-brand-dark">
              More <span className="font-light italic">guides</span>
            </h2>
            <ul className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <li key={p.slug}>
                  <Link to={`/blog/${p.slug}`} className={`group block ${ring}`}>
                    <div className="aspect-[16/10] overflow-hidden rounded-[18px] bg-brand-dark/10">
                      <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    </div>
                    <p className="mt-3 font-semibold leading-snug text-brand-dark group-hover:text-primary">{p.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <NextStep />
    </div>
  );
}
