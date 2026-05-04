import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../data/api.js';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import { Trash2 } from 'lucide-react';

const statusBadge = {
  pending: 'bg-amber-100 text-amber-900',
  approved: 'bg-emerald-100 text-emerald-900',
  hidden: 'bg-slate-200 text-slate-800',
};

export default function ReviewsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const list = await adminApi.getAllCustomerReviews();
      setItems(list);
      const next = {};
      list.forEach((r) => {
        next[r.id] = r.adminReply || '';
      });
      setDrafts(next);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function setDraft(id, text) {
    setDrafts((d) => ({ ...d, [id]: text }));
  }

  async function save(id, status, includeReply) {
    setSavingId(id);
    try {
      const updated = await adminApi.updateCustomerReview({
        id,
        status,
        adminReply: includeReply ? drafts[id] : undefined,
      });
      setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
    } catch (err) {
      alert(err.message || 'Failed to save');
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteCustomerReview(deleteId);
      setItems((prev) => prev.filter((x) => x.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Customer reviews</h1>
        <p className="mt-1 text-sm text-slate-600">Approve, reply, or hide submissions from the public reviews page.</p>
      </div>

      {loading ? (
        <p className="text-slate-600">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-600">No reviews yet.</p>
      ) : (
        <div className="space-y-6">
          {items.map((r) => (
            <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{r.authorName}</p>
                  {r.authorEmail ? (
                    <a href={`mailto:${r.authorEmail}`} className="text-sm text-primary hover:underline">
                      {r.authorEmail}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400">No email</span>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                    {r.rating ? ` · ${r.rating}/5` : ''}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[r.status] || 'bg-slate-100'}`}>
                  {r.status}
                </span>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{r.body}</p>

              <label className="mt-4 block text-sm">
                <span className="font-medium text-slate-700">Public reply (optional)</span>
                <textarea
                  value={drafts[r.id] ?? ''}
                  onChange={(e) => setDraft(r.id, e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Thank them or add context — shows under their review when published."
                />
              </label>

              <div className="mt-4 flex flex-wrap gap-2">
                {r.status !== 'approved' && (
                  <button
                    type="button"
                    disabled={!!savingId}
                    onClick={() => save(r.id, 'approved', false)}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {savingId === r.id ? 'Saving…' : 'Approve (no reply)'}
                  </button>
                )}
                <button
                  type="button"
                  disabled={!!savingId}
                  onClick={() => save(r.id, 'approved', true)}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {savingId === r.id ? 'Saving…' : 'Publish with reply'}
                </button>
                {r.status !== 'hidden' && (
                  <button
                    type="button"
                    disabled={!!savingId}
                    onClick={() => save(r.id, 'hidden', false)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Hide
                  </button>
                )}
                <button
                  type="button"
                  disabled={!!savingId}
                  onClick={() => setDeleteId(r.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete this review?"
          message="This cannot be undone."
          confirmLabel="Delete"
          loading={deleting}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
