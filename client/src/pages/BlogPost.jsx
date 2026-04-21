import { Link, useParams, Navigate } from 'react-router-dom';
import { ChevronRight, BookOpen, ArrowLeft } from 'lucide-react';
import BlogShareBar from '../components/BlogShareBar.jsx';
import { useBlogPost, useBlogPosts } from '../hooks/useApi.js';

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, loading, error } = useBlogPost(slug);
  const { data: allPosts } = useBlogPosts();
  const popular = (allPosts || []).filter((p) => p.featured).slice(0, 3);
  const full = post && post.sections?.length > 0 ? { sections: post.sections, closing: post.closing } : null;

  if (!loading && (error || !post)) {
    return <Navigate to="/404" replace />;
  }
  if (loading) return null;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(27,67,50,0.05),transparent_45%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6">
        <nav className="flex flex-wrap items-center gap-1 text-sm font-light text-brand-dark/60">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 opacity-50" aria-hidden />
          <Link to="/blog" className="hover:text-primary">
            Blog
          </Link>
          <ChevronRight className="h-4 w-4 opacity-50" aria-hidden />
          <span className="font-medium text-brand-dark">{post.title}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_300px]">
          <article className="glass-surface-strong overflow-hidden rounded-3xl">
            <img src={post.image} alt={post.title} className="aspect-[21/9] w-full object-cover" />
            <div className="p-6 md:p-10">
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <BookOpen className="h-4 w-4" aria-hidden />
                {post.category}
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold text-brand-dark md:text-4xl">{post.title}</h1>
              <p className="mt-2 text-sm font-extralight text-brand-dark/50">
                {post.date} · {post.readTime}
              </p>

              <div className="mt-6">
                <BlogShareBar title={post.title} slug={post.slug} />
              </div>

              {full ? (
                <div className="prose prose-neutral mt-10 max-w-none">
                  {full.sections.map((s) => (
                    <section key={s.heading} className="mb-8">
                      <h2 className="font-display text-2xl font-bold text-brand-dark">{s.heading}</h2>
                      {s.body.map((para, i) => (
                        <p key={i} className="mt-4 font-light leading-relaxed text-brand-dark/85">
                          {para}
                        </p>
                      ))}
                    </section>
                  ))}
                  <p className="mt-8 border-l-4 border-accent pl-4 font-light italic text-brand-dark/80">{full.closing}</p>
                </div>
              ) : (
                <div className="mt-10 space-y-4 font-light leading-relaxed text-brand-dark/85">
                  <p>{post.excerpt}</p>
                  <p>
                    Full article coming soon — for now, browse our trips or message us on WhatsApp for personalised tips on this
                    destination.
                  </p>
                </div>
              )}

              <Link
                to="/blog"
                className="mt-10 inline-flex items-center gap-2 font-semibold text-primary transition hover:gap-3 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back to blog
              </Link>
            </div>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-28">
            <div className="glass-surface rounded-3xl p-6">
              <h3 className="font-display font-bold text-brand-dark">Popular</h3>
              <ul className="mt-3 space-y-2 text-sm font-light">
                {popular.map((p) => (
                  <li key={p.slug}>
                    <Link to={`/blog/${p.slug}`} className="text-primary hover:underline">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              to="/trips"
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-center text-sm font-bold text-accent shadow-md transition hover:bg-primary/90"
            >
              Browse trips
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
