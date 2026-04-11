import { useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../lib/AuthContext.jsx';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

export default function Account() {
  const { user, staff } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const email = user?.email ?? staff?.email ?? '';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (!email) {
      setError('No email on session.');
      return;
    }

    setLoading(true);
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (reauthError) {
      setError('Current password is incorrect.');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setError(updateError.message || 'Could not update password.');
      setLoading(false);
      return;
    }

    setSuccess('Password updated.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl font-bold text-slate-800 md:text-3xl">Account</h1>
      <p className="mt-1 text-sm text-slate-600">Change your sign-in password.</p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <KeyRound className="h-5 w-5 text-accent" />
          Change password
        </h2>
        <p className="mt-1 text-sm text-slate-500">Enter your current password, then choose a new one.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {success}
          </div>
        )}

        <label className="mt-6 block">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current password</span>
          <div className="relative mt-1">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-12 text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
            >
              {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </label>
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">New password</span>
          <div className="relative mt-1">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-12 text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showNew ? 'Hide new password' : 'Show new password'}
            >
              {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </label>
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Confirm new password</span>
          <div className="relative mt-1">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-12 text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-brand-dark transition hover:bg-accent/90 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
