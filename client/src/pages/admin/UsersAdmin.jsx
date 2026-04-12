import { useCallback, useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminApi.js';
import { useAuth } from '../../lib/AuthContext.jsx';
import { UserPlus, Shield, ShieldCheck, Trash2, KeyRound, Eye, EyeOff } from 'lucide-react';

export default function UsersAdmin() {
  const { staff } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [pwdUserId, setPwdUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const data = await adminFetch('/users');
      setUsers(data.users || []);
    } catch (e) {
      setError(e.message || 'Failed to load staff.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await adminFetch('/users', {
        method: 'POST',
        body: { email: createEmail.trim(), password: createPassword, role: 'co_admin' },
      });
      setCreateEmail('');
      setCreatePassword('');
      await load();
    } catch (e) {
      setError(e.message || 'Could not create user.');
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleActive(u) {
    if (u.role === 'superadmin') return;
    setError('');
    try {
      await adminFetch(`/users/${u.id}`, {
        method: 'PATCH',
        body: { is_active: !u.isActive },
      });
      await load();
    } catch (e) {
      setError(e.message || 'Could not update status.');
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (!pwdUserId || !newPassword) return;
    setError('');
    try {
      await adminFetch(`/users/${pwdUserId}/password`, {
        method: 'PATCH',
        body: { password: newPassword },
      });
      setPwdUserId(null);
      setNewPassword('');
    } catch (e) {
      setError(e.message || 'Could not update password.');
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setError('');
    try {
      await adminFetch(`/users/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      await load();
    } catch (e) {
      setError(e.message || 'Could not delete user.');
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-bold text-slate-800 md:text-3xl">Staff accounts</h1>
      <p className="mt-1 text-sm text-slate-600">
        Add co-admins and manage access. Only the superadmin can use this page.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <UserPlus className="h-5 w-5 text-accent" />
          Add co-admin
        </h2>
        <p className="mt-1 text-sm text-slate-500">Creates a new login with the same permissions as other co-admins.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</span>
            <input
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="partner@example.com"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Initial password</span>
            <div className="relative mt-1">
              <input
                type={showCreatePassword ? 'text' : 'password'}
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-12 text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowCreatePassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showCreatePassword ? 'Hide password' : 'Show password'}
              >
                {showCreatePassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </label>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-4 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-brand-dark transition hover:bg-accent/90 disabled:opacity-50"
        >
          {creating ? 'Creating…' : 'Create co-admin'}
        </button>
      </form>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">All staff</h2>
        </div>
        {loading ? (
          <p className="p-6 text-slate-500">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Active</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isSelf = u.id === staff?.userId;
                  const isSuper = u.role === 'superadmin';
                  return (
                    <tr key={u.id} className="text-slate-700">
                      <td className="px-6 py-3 font-medium">{u.email || '—'}</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {isSuper ? (
                            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                          ) : (
                            <Shield className="h-3.5 w-3.5 text-slate-500" />
                          )}
                          {isSuper ? 'Superadmin' : 'Co-admin'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {isSuper ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <label className="inline-flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={u.isActive}
                              disabled={isSelf}
                              onChange={() => handleToggleActive(u)}
                              className="rounded border-slate-300 text-accent focus:ring-accent"
                            />
                            <span className="text-slate-600">{u.isActive ? 'Yes' : 'No'}</span>
                          </label>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {!isSuper && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setPwdUserId(u.id);
                                  setNewPassword('');
                                }}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                              >
                                <KeyRound className="h-3.5 w-3.5" />
                                Reset password
                              </button>
                              {!isSelf && (
                                <button
                                  type="button"
                                  onClick={() => setDeleteId(u.id)}
                                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pwdUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800">Set new password</h3>
            <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">New password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPwdUserId(null);
                    setNewPassword('');
                  }}
                  className="rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-brand-dark"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800">Delete account?</h3>
            <p className="mt-2 text-sm text-slate-600">
              This removes the user from Auth and staff. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
