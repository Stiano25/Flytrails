import { useEffect, useRef, useState } from 'react';
import { adminApi } from '../../data/api.js';
import { Upload, Pencil, Trash2, X, Check, Plus } from 'lucide-react';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';

const ALL_TAGS = ['Kenya', 'East Africa', 'International', 'Safari', 'Hiking', 'Beach'];

function EditModal({ image, onSave, onClose }) {
  const [location, setLocation] = useState(image.location);
  const [tags, setTags] = useState(image.tags || []);
  const [saving, setSaving] = useState(false);

  function toggleTag(tag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(image.id, { location, tags });
      onClose();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-slate-800">Edit image</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <img src={image.url} alt={image.location} className="mb-4 h-40 w-full rounded-xl object-cover" />

        <label className="block mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Location label</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>

        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tags</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  tags.includes(tag)
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-accent hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ onUpload, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  function handleFile(f) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function toggleTag(tag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleUpload() {
    if (!file || !location.trim()) return alert('Please add a file and location label.');
    setUploading(true);
    try {
      await onUpload(file, location, tags);
      onClose();
    } catch (e) {
      alert(e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-slate-800">Upload image</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          onClick={() => fileRef.current.click()}
          className="mb-4 flex h-36 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-primary/50 hover:bg-slate-100"
        >
          {preview ? (
            <img src={preview} alt="preview" className="h-full w-full rounded-xl object-cover" />
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-400">Click to select image</p>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <label className="block mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Location label</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Maasai Mara, Kenya"
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>

        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tags</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  tags.includes(tag)
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-accent hover:bg-primary/90 disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GalleryAdmin() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editImage, setEditImage] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchImages() {
    setLoading(true);
    try {
      setImages(await adminApi.getAllGalleryImages());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchImages(); }, []);

  async function handleUpload(file, location, tags) {
    await adminApi.uploadGalleryImage(file, location, tags);
    fetchImages();
  }

  async function handleSaveEdit(id, updates) {
    await adminApi.updateGalleryImage(id, updates);
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
    );
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await adminApi.deleteGalleryImage(deleteId);
      setImages((prev) => prev.filter((img) => img.id !== deleteId));
      setDeleteId(null);
    } catch (e) {
      alert('Failed to delete: ' + e.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">Gallery</h1>
          <p className="mt-1 text-slate-500">{images.length} images</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-accent hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Upload image
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-slate-400">Loading…</p>
      ) : images.length === 0 ? (
        <div className="mt-12 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Upload className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-slate-400">No images yet — upload your first one.</p>
          <button
            onClick={() => setShowUpload(true)}
            className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-accent hover:bg-primary/90"
          >
            Upload image
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {images.map((img) => (
            <div key={img.id} className="group relative overflow-hidden rounded-2xl bg-slate-100">
              <div className="aspect-[4/3]">
                <img src={img.url} alt={img.location} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                <p className="truncate text-xs font-semibold text-white">{img.location}</p>
                <div className="mt-2 flex gap-1.5">
                  <button
                    onClick={() => setEditImage(img)}
                    className="flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/30"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(img.id)}
                    className="flex items-center gap-1 rounded-lg bg-red-500/80 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm hover:bg-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="truncate text-xs text-slate-500">{img.location}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {img.tags.slice(0, 2).map((t) => (
                    <span key={t} className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600">{t}</span>
                  ))}
                  {img.tags.length > 2 && (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600">+{img.tags.length - 2}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editImage && (
        <EditModal
          image={editImage}
          onSave={handleSaveEdit}
          onClose={() => setEditImage(null)}
        />
      )}

      {showUpload && (
        <UploadModal
          onUpload={handleUpload}
          onClose={() => setShowUpload(false)}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete image?"
          message="This will permanently remove the image. This cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
