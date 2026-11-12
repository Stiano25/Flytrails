import { useEffect, useState } from 'react';
import { adminApi } from '../../data/api.js';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import { FAQ_GROUPS, fallbackAsAdminFaqs } from '../../data/faqs.js';

const groupLabel = (id) => FAQ_GROUPS.find((g) => g.id === id)?.label || 'Auto';

const emptyForm = {
  id: null,
  question: '',
  answer: '',
  category: '',
  linkLabel: '',
  linkUrl: '',
  isActive: true,
  sortOrder: 0,
};

export default function FaqsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [filter, setFilter] = useState('all');

  async function fetchItems() {
    setLoading(true);
    try {
      setItems(await adminApi.getAllFaqs());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function openNew() {
    setForm({ ...emptyForm, sortOrder: items.length });
    setShowForm(true);
  }

  function openEdit(item) {
    setForm({
      id: item.id,
      question: item.question,
      answer: item.answer,
      category: item.category || '',
      linkLabel: item.linkLabel || '',
      linkUrl: item.linkUrl || '',
      isActive: item.isActive,
      sortOrder: item.sortOrder ?? 0,
    });
    setShowForm(true);
  }

  function closeForm() {
    setForm(emptyForm);
    setShowForm(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await adminApi.upsertFaq(form);
      setItems((prev) => {
        const idx = prev.findIndex((x) => x.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [...prev, saved].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      });
      closeForm();
    } catch (err) {
      alert(err.message || 'Failed to save FAQ');
    } finally {
      setSaving(false);
    }
  }

  // Copy the FAQs the site shows by default into the table (skipping any question that's already there), so they can be edited.
  async function importBuiltIn() {
    const existing = new Set(items.map((x) => x.question.trim().toLowerCase()));
    const missing = fallbackAsAdminFaqs().filter((f) => !existing.has(f.question.trim().toLowerCase()));
    if (!missing.length) {
      alert('All built-in FAQs are already in the list.');
      return;
    }
    const offset = items.reduce((m, x) => Math.max(m, x.sortOrder ?? 0), -1) + 1;
    setImporting(true);
    try {
      const added = await adminApi.insertFaqs(missing.map((f, i) => ({ ...f, sortOrder: offset + i })));
      setItems((prev) => [...prev, ...added].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
    } catch (err) {
      alert('Failed to import: ' + err.message);
    } finally {
      setImporting(false);
    }
  }

  const shown = filter === 'all' ? items : items.filter((x) => (x.category || '') === filter);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await adminApi.deleteFaq(deleteId);
      setItems((prev) => prev.filter((x) => x.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">FAQs</h1>
          <p className="mt-1 text-slate-500">
            Questions shown on the home page (all topics) and the Membership page (Membership topic). While this list is empty the site shows its built-in FAQs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={importBuiltIn}
          disabled={importing || loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {importing ? 'Importing…' : 'Import built-in FAQs'}
        </button>
        <button
          type="button"
          onClick={openNew}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-accent hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add FAQ
        </button>
        </div>
      </div>

      {!loading && items.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {[{ id: 'all', label: 'All' }, ...FAQ_GROUPS, { id: '', label: 'Auto' }].map((g) => (
            <button
              key={g.id || 'auto'}
              type="button"
              onClick={() => setFilter(g.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${filter === g.id ? 'bg-primary text-accent' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-slate-400">Loading…</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-500">Question</th>
                <th className="hidden px-4 py-3 font-semibold text-slate-500 md:table-cell">Answer</th>
                <th className="hidden px-4 py-3 font-semibold text-slate-500 sm:table-cell">Topic</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Order</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shown.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="max-w-sm px-4 py-3">
                    <p className="line-clamp-2 font-medium text-slate-800">{item.question}</p>
                  </td>
                  <td className="hidden max-w-xl px-4 py-3 text-slate-600 md:table-cell">
                    <p className="line-clamp-2">{item.answer}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">{groupLabel(item.category)}</td>
                  <td className="px-4 py-3 text-slate-500">{item.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        aria-label="Edit FAQ"
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(item.id)}
                        aria-label="Delete FAQ"
                        className="rounded-lg border border-red-100 p-1.5 text-red-400 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {items.length === 0 && (
            <p className="py-12 text-center text-slate-400">
              No FAQs yet. Use “Import built-in FAQs” to edit the ones the site shows now, or add your own.
            </p>
          )}
          {items.length > 0 && shown.length === 0 && <p className="py-12 text-center text-slate-400">No FAQs in this topic.</p>}
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="presentation"
          onClick={closeForm}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-labelledby="faq-form-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="faq-form-title" className="font-display text-lg font-bold text-slate-800">
              {form.id ? 'Edit FAQ' : 'New FAQ'}
            </h2>
            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <label className="block text-sm">
                <span className="font-semibold text-slate-600">Question</span>
                <input
                  required
                  value={form.question}
                  onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-slate-600">Answer</span>
                <textarea
                  required
                  rows={4}
                  value={form.answer}
                  onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-slate-600">Topic</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800"
                >
                  <option value="">Auto (guess from the question)</option>
                  {FAQ_GROUPS.map((g) => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                  ))}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="font-semibold text-slate-600">Button text</span>
                  <input
                    value={form.linkLabel}
                    placeholder="Plan my trip"
                    onChange={(e) => setForm((f) => ({ ...f, linkLabel: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-semibold text-slate-600">Button link</span>
                  <input
                    value={form.linkUrl}
                    placeholder="/trips, https://… or whatsapp"
                    onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800"
                  />
                </label>
              </div>
              <p className="-mt-2 text-xs text-slate-400">Leave the link empty to point to the trip planner.</p>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  Visible on site
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="font-semibold text-slate-600">Sort</span>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1"
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-accent hover:bg-primary/90 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete FAQ?"
          message="This will permanently remove this FAQ."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
