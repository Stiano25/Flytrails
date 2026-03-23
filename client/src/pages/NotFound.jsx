import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(27,67,50,0.08),transparent_50%)]" />
      <div className="glass-surface-strong relative max-w-md rounded-3xl px-10 py-12">
        <p className="flex justify-center text-primary">
          <Compass className="h-10 w-10" strokeWidth={1.25} aria-hidden />
        </p>
        <h1 className="mt-4 font-display text-6xl font-bold text-primary">404</h1>
        <p className="mt-4 font-light text-brand-dark/80">This page doesn&apos;t exist or has moved.</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-bold text-accent shadow-md transition hover:bg-primary/90"
        >
          <Home className="h-4 w-4" aria-hidden />
          Back to home
        </Link>
      </div>
    </div>
  );
}
