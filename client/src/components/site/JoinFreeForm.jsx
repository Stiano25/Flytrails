import { useState } from 'react';
import { CircleCheck } from 'lucide-react';
import { useSubmit } from '../../hooks/useApi.js';
import { api } from '../../data/api.js';

const ring = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/** "Join free" as an Explorer: an email field on the existing newsletter sign-up, with inline confirmation. */
export default function JoinFreeForm({ className = '', stacked = false }) {
  const { submit, loading } = useSubmit();
  const [state, setState] = useState({ status: 'idle', message: '' });

  async function join(e) {
    e.preventDefault();
    const email = String(new FormData(e.target).get('email') || '').trim();
    const result = await submit(() => api.subscribeNewsletter(email));
    if (result.success) {
      e.target.reset();
      setState({ status: 'done', message: '' });
    } else {
      setState({ status: 'error', message: result.error || 'We couldn’t add you just now. Please try again.' });
    }
  }

  if (state.status === 'done') {
    return (
      <p className={`inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-3 text-[15px] font-medium text-primary ${className}`} role="status">
        <CircleCheck className="h-5 w-5" aria-hidden />
        You’re in. Watch your inbox for the next trip drop.
      </p>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={join} className={`flex max-w-md flex-col gap-3 ${stacked ? '' : 'sm:flex-row'}`} aria-label="Join the Flytrails community for free">
        <label className="flex-1">
          <span className="sr-only">Email address</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-full border border-brand-dark/15 bg-white px-5 py-3 text-[15px] text-brand-dark placeholder:text-brand-dark/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand-orange px-6 text-[15px] font-semibold text-brand-dark transition-colors hover:bg-[#f4a53f] disabled:opacity-60 ${ring}`}
        >
          {loading ? 'Joining…' : 'Join free'}
        </button>
      </form>
      {state.status === 'error' && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {state.message}
        </p>
      )}
    </div>
  );
}
