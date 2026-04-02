import { useRef, useState } from 'react';
import { adminApi } from '../../data/api.js';
import { X, Plus, Trash2, Upload } from 'lucide-react';

const emptyAccommodation = {
  slug: '',
  title: '',
  location: '',
  shortDescription: '',
  description: '',
  image: '',
  priceFrom: '',
  amenities: [''],
  rating: '',
  gallery: [],
  bookingWhatsapp: '',
  bookingLink: '',
  isActive: true,
  sortOrder: 0,
};

function inputClass(extra = '') {
  return `w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${extra}`;
}

function FieldLabel({ children, required }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}{required && <span className="ml-1 text-red-400">*</span>}
    </span>
  );
}

function slugify(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function AccommodationForm({ accommodation, onSave, onClose }) {
  const [form, setForm] = useState(() => accommodation ? {
    ...accommodation,
    priceFrom: String(accommodation.priceFrom ?? ''),
    rating: accommodation.rating == null ? '' : String(accommodation.rating),
    sortOrder: String(accommodation.sortOrder ?? 0),
    amenities: accommodation.amenities?.length ? accommodation.amenities : [''],
    gallery: accommodation.gallery?.length ? accommodation.gallery : [],
  } : { ...emptyAccommodation });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const fileRef = useRef();
  const galleryFileRef = useRef();

  function set(key, value) { setForm((f) => ({ ...f, [key]: value })); }
  function setArr(key, index, value) {
    setForm((f) => {
      const arr = [...f[key]];
      arr[index] = value;
      return { ...f, [key]: arr };
    });
  }
  function addArr(key) { setForm((f) => ({ ...f, [key]: [...f[key], ''] })); }
  function removeArr(key, index) {
    setForm((f) => {
      const arr = f[key].filter((_, i) => i !== index);
      return { ...f, [key]: arr.length ? arr : [''] };
    });
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await adminApi.uploadAccommodationImage(file);
      set('image', url);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleGalleryUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setGalleryUploading(true);
    try {
      const uploadedUrls = await Promise.all(
        files.map((file) => adminApi.uploadAccommodationImage(file))
      );
      set('gallery', [...form.gallery, ...uploadedUrls]);
    } catch (err) {
      alert(err.message);
    } finally {
      setGalleryUploading(false);
      e.target.value = '';
    }
  }

  function removeGalleryImage(index) {
    set('gallery', form.gallery.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const autoSlug = slugify(form.slug || form.title);
      const saved = await adminApi.upsertAccommodation({
        ...form,
        slug: autoSlug,
        priceFrom: Number(form.priceFrom) || 0,
        rating: form.rating === '' ? null : Number(form.rating),
        amenities: form.amenities.filter(Boolean),
        gallery: form.gallery.filter(Boolean),
        sortOrder: Number(form.sortOrder) || 0,
      });
      onSave(saved);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex overflow-auto bg-black/50 p-4">
      <div className="m-auto w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-display text-xl font-bold text-slate-800">{accommodation ? 'Edit accommodation' : 'New accommodation'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 160px)' }}>
          <section>
            <h3 className="mb-4 font-semibold text-slate-700">Basic info</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <FieldLabel required>Title</FieldLabel>
                <input value={form.title} onChange={(e) => set('title', e.target.value)} required className={inputClass()} />
              </label>
              <label className="flex flex-col gap-1.5">
                <FieldLabel>Slug (optional)</FieldLabel>
                <input
                  value={form.slug}
                  onChange={(e) => set('slug', slugify(e.target.value))}
                  className={inputClass()}
                  placeholder="Auto-generated from title if left empty"
                />
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <FieldLabel required>Location</FieldLabel>
                <input value={form.location} onChange={(e) => set('location', e.target.value)} required className={inputClass()} />
              </label>
              <label className="flex flex-col gap-1.5">
                <FieldLabel>Price from (KES)</FieldLabel>
                <input type="number" min="0" value={form.priceFrom} onChange={(e) => set('priceFrom', e.target.value)} className={inputClass()} />
              </label>
              <label className="flex flex-col gap-1.5">
                <FieldLabel>Rating (0-5)</FieldLabel>
                <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => set('rating', e.target.value)} className={inputClass()} />
              </label>
              <label className="flex flex-col gap-1.5">
                <FieldLabel>Booking WhatsApp (digits only)</FieldLabel>
                <input
                  value={form.bookingWhatsapp || ''}
                  onChange={(e) => set('bookingWhatsapp', e.target.value.replace(/[^\d]/g, ''))}
                  className={inputClass()}
                  placeholder="e.g. 2547XXXXXXXX"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <FieldLabel>Booking link</FieldLabel>
                <input type="url" value={form.bookingLink} onChange={(e) => set('bookingLink', e.target.value)} className={inputClass()} />
              </label>
              <label className="flex flex-col gap-1.5">
                <FieldLabel>Sort order</FieldLabel>
                <input type="number" min="0" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} className={inputClass()} />
              </label>
            </div>
            <label className="mt-4 flex flex-col gap-1.5">
              <FieldLabel>Short description</FieldLabel>
              <textarea value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} rows={2} className={inputClass('resize-none')} />
            </label>
            <label className="mt-4 flex flex-col gap-1.5">
              <FieldLabel>Description</FieldLabel>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} className={inputClass('resize-none')} />
            </label>
          </section>

          <section>
            <h3 className="mb-4 font-semibold text-slate-700">Cover image</h3>
            <div className="flex items-start gap-4">
              {form.image && <img src={form.image} alt="cover" className="h-24 w-36 rounded-xl border border-slate-200 object-cover" />}
              <div>
                <input type="url" value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="Paste image URL, or upload below" className={inputClass('mb-2')} />
                <button
                  type="button"
                  onClick={() => fileRef.current.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload file'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-4 font-semibold text-slate-700">Amenities</h3>
            {form.amenities.map((amenity, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input value={amenity} onChange={(e) => setArr('amenities', i, e.target.value)} className={inputClass('flex-1')} />
                <button type="button" onClick={() => removeArr('amenities', i)} className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-slate-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addArr('amenities')} className="mt-1 flex items-center gap-1.5 text-sm text-primary hover:underline">
              <Plus className="h-4 w-4" /> Add amenity
            </button>
          </section>

          <section>
            <h3 className="mb-4 font-semibold text-slate-700">Gallery images</h3>
            <div className="mb-3">
              <button
                type="button"
                onClick={() => galleryFileRef.current.click()}
                disabled={galleryUploading}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {galleryUploading ? 'Uploading gallery images...' : 'Upload gallery images'}
              </button>
              <input
                ref={galleryFileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleGalleryUpload}
              />
            </div>

            {form.gallery.length === 0 ? (
              <p className="text-sm text-slate-500">No gallery images uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {form.gallery.map((url, i) => (
                  <div key={`${url}-${i}`} className="relative overflow-hidden rounded-xl border border-slate-200">
                    <img src={url} alt={`Gallery ${i + 1}`} className="h-24 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute right-1 top-1 rounded-md bg-black/60 p-1 text-white hover:bg-black/75"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/40"
            />
            <span className="text-sm font-medium text-slate-700">Active (visible to public)</span>
          </label>
        </form>

        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-accent hover:bg-primary/90 disabled:opacity-50">
            {saving ? 'Saving...' : accommodation ? 'Update accommodation' : 'Create accommodation'}
          </button>
        </div>
      </div>
    </div>
  );
}
