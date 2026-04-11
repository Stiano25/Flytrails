import { useEffect, useState } from 'react';
import { adminApi } from '../../data/api.js';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import { Plus, Pencil, Trash2, ImagePlus } from 'lucide-react';

const emptyForm = {
  id: null,
  quote: '',
  authorName: '',
  authorDetail: '',
  authorImageUrl: '',
  isActive: true,
  sortOrder: 0,
};

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export default function TestimonialsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [blobPreview, setBlobPreview] = useState(null);

  function clearPhotoPick() {
    if (blobPreview) URL.revokeObjectURL(blobPreview);
    setBlobPreview(null);
    setPhotoFile(null);
  }

  async function fetchItems() {
    setLoading(true);
    try {
      setItems(await adminApi.getAllTestimonials());
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
    clearPhotoPick();
    setForm({ ...emptyForm, sortOrder: items.length });
    setShowForm(true);
  }

  function openEdit(t) {
    clearPhotoPick();
    setForm({
      id: t.id,
      quote: t.quote,
      authorName: t.authorName,
      authorDetail: t.authorDetail || '',
      authorImageUrl: t.authorImageUrl || '',
      isActive: t.isActive,
      sortOrder: t.sortOrder ?? 0,
    });
    setShowForm(true);
  }

  function closeForm() {
    clearPhotoPick();
    setForm(emptyForm);
    setShowForm(false);
  }

  function handlePhotoChange(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      alert('Please choose an image file (JPEG, PNG, WebP, GIF, or AVIF).');
      return;
    }
    if (f.size > MAX_PHOTO_BYTES) {
      alert('Image must be 10 MB or smaller.');
      return;
    }
    if (blobPreview) URL.revokeObjectURL(blobPreview);
    setBlobPreview(URL.createObjectURL(f));
    setPhotoFile(f);
  }

  function removePhoto() {
    clearPhotoPick();
    setForm((f) => ({ ...f, authorImageUrl: '' }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      let authorImageUrl = form.authorImageUrl;
      if (photoFile) {
        authorImageUrl = await adminApi.uploadTestimonialPhoto(photoFile);
      }
      const saved = await adminApi.upsertTestimonial({ ...form, authorImageUrl });
      setItems((prev) => {
        const idx = prev.findIndex((x) => x.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      });
      closeForm();
    } catch (err) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await adminApi.deleteTestimonial(deleteId);
      setItems((prev) => prev.filter((x) => x.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeleting(false);
    }
  }

  const previewSrc = blobPreview || form.authorImageUrl || null;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">Testimonials</h1>
          <p className="mt-1 text-slate-500">
            Shown on the home page — author photo: upload an image under 10 MB (no link required).
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-accent hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add testimonial
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-slate-400">Loading…</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-500">Photo</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Quote</th>
                <th className="hidden px-4 py-3 font-semibold text-slate-500 md:table-cell">Author</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Order</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {t.authorImageUrl ? (
                      <img
                        src={t.authorImageUrl}
                        alt=""
                        className="h-11 w-11 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-400">
                        —
                      </div>
                    )}
                  </td>
                  <td className="max-w-md px-4 py-3">
                    <p className="line-clamp-2 font-medium text-slate-800">&ldquo;{t.quote}&rdquo;</p>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                    <p className="font-medium">{t.authorName}</p>
                    {t.authorDetail && <p className="text-xs text-slate-400">{t.authorDetail}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{t.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        t.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {t.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(t)}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(t.id)}
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
            <p className="py-12 text-center text-slate-400">No testimonials yet — add your first one.</p>
          )}
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
            aria-labelledby="testimonial-form-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="testimonial-form-title" className="font-display text-lg font-bold text-slate-800">
              {form.id ? 'Edit testimonial' : 'New testimonial'}
            </h2>
            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <label className="block text-sm">
                <span className="font-semibold text-slate-600">Quote</span>
                <textarea
                  required
                  rows={4}
                  value={form.quote}
                  onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-slate-600">Author name</span>
                <input
                  required
                  value={form.authorName}
                  onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-slate-600">Subtitle (optional)</span>
                <input
                  placeholder="e.g. Maasai Mara safari, March 2025"
                  value={form.authorDetail}
                  onChange={(e) => setForm((f) => ({ ...f, authorDetail: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800"
                />
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <span className="text-sm font-semibold text-slate-600">Author photo (optional)</span>
                <p className="mt-0.5 text-xs text-slate-500">
                  JPEG, PNG, WebP, GIF, or AVIF · max 10 MB
                </p>
                {previewSrc && (
                  <div className="relative mt-3 inline-block">
                    <img
                      src={previewSrc}
                      alt="Preview"
                      className="h-24 w-24 rounded-2xl object-cover ring-2 ring-white shadow-md"
                    />
                  </div>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                    <ImagePlus className="h-4 w-4" />
                    {previewSrc ? 'Replace image' : 'Upload image'}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="sr-only" onChange={handlePhotoChange} />
                  </label>
                  {(previewSrc || form.authorImageUrl) && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="rounded-xl border border-red-100 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>

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
          title="Delete testimonial?"
          message="This will permanently remove this testimonial."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
