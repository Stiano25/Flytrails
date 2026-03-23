import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useBlogPosts } from '../hooks/useApi.js';

const categories = ['Safari', 'Hiking', 'Travel Tips', 'Community', 'Budget', 'International'];

export default function Blog() {
  const { data: postsData } = useBlogPosts();
  const blogPosts = postsData || [];
  const popular = blogPosts.filter((p) => p.featured).slice(0, 3);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_40%_0%,rgba(212,169,106,0.07),transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary/90">
              <BookOpen className="h-4 w-4" aria-hidden />
              Journal
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold text-brand-dark md:text-5xl">Travel guides &amp; tips</h1>
            <p className="mt-3 max-w-xl font-light text-brand-dark/75">Practical advice from our team and community.</p>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-8 sm:grid-cols-2">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="flex flex-col overflow-hidden rounded-3xl border border-white/35 bg-white/25 shadow-lg backdrop-blur-xl transition hover:border-accent/30"
              >
                <Link to={`/blog/${post.slug}`} className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full border border-white/30 bg-primary/90 px-2.5 py-0.5 text-xs font-bold text-brand-light backdrop-blur-sm">
                    {post.category}
                  </span>
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display text-lg font-bold leading-snug text-brand-dark">
                    <Link to={`/blog/${post.slug}`} className="transition hover:text-primary">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 flex-1 text-sm font-light text-brand-dark/75">{post.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs font-extralight text-brand-dark/50">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" aria-hidden />
                      {post.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {post.readTime}
                    </span>
                  </div>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="mt-4 inline-flex w-fit items-center gap-1 rounded-full border border-primary/35 bg-white/40 px-4 py-2 text-sm font-semibold text-primary backdrop-blur-sm transition hover:bg-white/60"
                  >
                    Read more
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-8 lg:sticky lg:top-28">
            <div className="glass-surface-strong rounded-3xl p-6">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-brand-dark">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                Popular posts
              </h3>
              <ul className="mt-4 space-y-3 text-sm font-light">
                {popular.map((p) => (
                  <li key={p.slug}>
                    <Link to={`/blog/${p.slug}`} className="text-primary transition hover:underline">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-surface rounded-3xl p-6">
              <h3 className="font-display text-lg font-bold text-brand-dark">Categories</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <li key={c}>
                    <span className="rounded-full border border-white/40 bg-white/35 px-3 py-1 text-xs font-medium text-brand-dark/85 backdrop-blur-sm">
                      {c}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-surface rounded-3xl p-6">
              <h3 className="font-display text-lg font-bold text-brand-dark">Newsletter</h3>
              <p className="mt-2 text-sm font-extralight text-brand-dark/70">New guides in your inbox.</p>
              <form
                className="mt-4 flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  e.target.reset();
                }}
              >
                <label htmlFor="blog-side-news" className="sr-only">
                  Email
                </label>
                <input
                  id="blog-side-news"
                  type="email"
                  required
                  placeholder="Email"
                  className="glass-input text-sm"
                />
                <button type="submit" className="rounded-xl bg-primary py-2.5 text-sm font-bold text-accent shadow-sm hover:bg-primary/90">
                  Subscribe
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
