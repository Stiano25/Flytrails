import { useState, useRef } from 'react';
import { adminApi } from '../../data/api.js';
import { X, Plus, Trash2, Upload } from 'lucide-react';

const CATEGORIES = ['Hiking', 'Beach', 'Safari', 'International', 'Halal', 'Women-Only'];
const DIFFICULTIES = ['Easy', 'Moderate', 'Hard'];

const emptyTrip = {
  slug: '', title: '', location: '', category: 'Hiking', duration: '',
  price: '', spotsTotal: 20, spotsLeft: 20, difficulty: 'Easy',
  nextDeparture: '', description: '', image: '',
  highlights: [''], itinerary: [{ day: 1, title: '', description: '' }],
  included: [''], notIncluded: [''], faqs: [{ question: '', answer: '' }],
  isActive: true, sortOrder: 0,
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

export default function TripForm({ trip, onSave, onClose }) {
  const [form, setForm] = useState(() => trip ? {
    ...trip,
    price: String(trip.price),
    spotsTotal: String(trip.spotsTotal),
    spotsLeft: String(trip.spotsLeft),
    sortOrder: String(trip.sortOrder || 0),
    highlights: trip.highlights?.length ? trip.highlights : [''],
    included: trip.included?.length ? trip.included : [''],
    notIncluded: trip.notIncluded?.length ? trip.notIncluded : [''],
    itinerary: trip.itinerary?.length ? trip.itinerary : [{ day: 1, title: '', description: '' }],
    faqs: trip.faqs?.length ? trip.faqs : [{ question: '', answer: '' }],
  } : { ...emptyTrip });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  function set(key, value) { setForm((f) => ({ ...f, [key]: value })); }
  function setArr(key, index, value) {
    setForm((f) => {
      const arr = [...f[key]];
      arr[index] = value;
      return { ...f, [key]: arr };
    });
  }
  function addArr(key, empty) { setForm((f) => ({ ...f, [key]: [...f[key], empty] })); }
  function removeArr(key, index) {
    setForm((f) => {
      const arr = f[key].filter((_, i) => i !== index);
      return { ...f, [key]: arr.length ? arr : [typeof f[key][0] === 'string' ? '' : {}] };
    });
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await adminApi.uploadTripImage(file);
      set('image', url);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await adminApi.upsertTrip({
        ...form,
        price: Number(form.price),
        spotsTotal: Number(form.spotsTotal),
        spotsLeft: Number(form.spotsLeft),
        sortOrder: Number(form.sortOrder),
        highlights: form.highlights.filter(Boolean),
        included: form.included.filter(Boolean),
        notIncluded: form.notIncluded.filter(Boolean),
        itinerary: form.itinerary.filter((d) => d.title),
        faqs: form.faqs.filter((f) => f.question),
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
          <h2 className="font-display text-xl font-bold text-slate-800">
            {trip ? 'Edit trip' : 'New trip'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 160px)' }}>
          {/* Basic info */}
          <section>
            <h3 className="mb-4 font-semibold text-slate-700">Basic info</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <FieldLabel required>Title</FieldLabel>
                <input value={form.title} onChange={(e) => set('title', e.target.value)} required className={inputClass()} />
              </label>
              <label className="flex flex-col gap-1.5">
                <FieldLabel required>Slug (URL)</FieldLabel>
                <input value={form.slug} onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} required className={inputClass()} placeholder="e.g. mt-kenya-trek" />
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <FieldLabel required>Location</FieldLabel>
                <input value={form.location} onChange={(e) => set('location', e.target.value)} required className={inputClass()} />
              </label>
              <label className="flex flex-col gap-1.5">
                <FieldLabel required>Category</FieldLabel>
                <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass()}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <FieldLabel required>Difficulty</FieldLabel>
                <select value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)} className={inputClass()}>
                  {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <FieldLabel required>Duration</FieldLabel>
                <input value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="e.g. 5 days" required className={inputClass()} />
              </label>
              <label className="flex flex-col gap-1.5">
                <FieldLabel required>Price (KES)</FieldLabel>
                <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} required min="0" className={inputClass()} />
              </label>
              <label className="flex flex-col gap-1.5">
                <FieldLabel>Spots total</FieldLabel>
                <input type="number" value={form.spotsTotal} onChange={(e) => set('spotsTotal', e.target.value)} min="1" className={inputClass()} />
              </label>
              <label className="flex flex-col gap-1.5">
                <FieldLabel>Spots left</FieldLabel>
                <input type="number" value={form.spotsLeft} onChange={(e) => set('spotsLeft', e.target.value)} min="0" className={inputClass()} />
              </label>
              <label className="flex flex-col gap-1.5">
                <FieldLabel>Next departure</FieldLabel>
                <input type="date" value={form.nextDeparture} onChange={(e) => set('nextDeparture', e.target.value)} className={inputClass()} />
              </label>
              <label className="flex flex-col gap-1.5">
                <FieldLabel>Sort order</FieldLabel>
                <input type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} min="0" className={inputClass()} />
              </label>
            </div>
            <label className="mt-4 flex flex-col gap-1.5">
              <FieldLabel required>Description</FieldLabel>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} required rows={3} className={inputClass('resize-none')} />
            </label>
          </section>

          {/* Cover image */}
          <section>
            <h3 className="mb-4 font-semibold text-slate-700">Cover image</h3>
            <div className="flex gap-4 items-start">
              {form.image && (
                <img src={form.image} alt="cover" className="h-24 w-36 rounded-xl object-cover border border-slate-200" />
              )}
              <div>
                <input type="url" value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="Paste image URL, or upload below" className={inputClass('mb-2')} />
                <button
                  type="button"
                  onClick={() => fileRef.current.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading…' : 'Upload file'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
            </div>
          </section>

          {/* Highlights */}
          <section>
            <h3 className="mb-4 font-semibold text-slate-700">Highlights</h3>
            {form.highlights.map((h, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input value={h} onChange={(e) => setArr('highlights', i, e.target.value)} placeholder="Highlight point" className={inputClass('flex-1')} />
                <button type="button" onClick={() => removeArr('highlights', i)} className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-slate-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addArr('highlights', '')} className="mt-1 flex items-center gap-1.5 text-sm text-primary hover:underline">
              <Plus className="h-4 w-4" /> Add highlight
            </button>
          </section>

          {/* Itinerary */}
          <section>
            <h3 className="mb-4 font-semibold text-slate-700">Itinerary</h3>
            {form.itinerary.map((d, i) => (
              <div key={i} className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Day {i + 1}</span>
                  <button type="button" onClick={() => removeArr('itinerary', i)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <input
                  value={d.title}
                  onChange={(e) => setArr('itinerary', i, { ...d, title: e.target.value, day: i + 1 })}
                  placeholder="Day title (e.g. Nairobi to Nanyuki)"
                  className={inputClass('mb-2')}
                />
                <textarea
                  value={d.description}
                  onChange={(e) => setArr('itinerary', i, { ...d, description: e.target.value, day: i + 1 })}
                  placeholder="Day description"
                  rows={2}
                  className={inputClass('resize-none')}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArr('itinerary', { day: form.itinerary.length + 1, title: '', description: '' })}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Plus className="h-4 w-4" /> Add day
            </button>
          </section>

          {/* Included / Not included */}
          <section className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-4 font-semibold text-slate-700">What's included</h3>
              {form.included.map((item, i) => (
                <div key={i} className="mb-2 flex gap-2">
                  <input value={item} onChange={(e) => setArr('included', i, e.target.value)} placeholder="Included item" className={inputClass('flex-1')} />
                  <button type="button" onClick={() => removeArr('included', i)} className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-slate-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addArr('included', '')} className="mt-1 flex items-center gap-1.5 text-sm text-primary hover:underline">
                <Plus className="h-4 w-4" /> Add item
              </button>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-slate-700">Not included</h3>
              {form.notIncluded.map((item, i) => (
                <div key={i} className="mb-2 flex gap-2">
                  <input value={item} onChange={(e) => setArr('notIncluded', i, e.target.value)} placeholder="Not included item" className={inputClass('flex-1')} />
                  <button type="button" onClick={() => removeArr('notIncluded', i)} className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-slate-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addArr('notIncluded', '')} className="mt-1 flex items-center gap-1.5 text-sm text-primary hover:underline">
                <Plus className="h-4 w-4" /> Add item
              </button>
            </div>
          </section>

          {/* FAQs */}
          <section>
            <h3 className="mb-4 font-semibold text-slate-700">FAQs</h3>
            {form.faqs.map((faq, i) => (
              <div key={i} className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">FAQ {i + 1}</span>
                  <button type="button" onClick={() => removeArr('faqs', i)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <input
                  value={faq.question}
                  onChange={(e) => setArr('faqs', i, { ...faq, question: e.target.value })}
                  placeholder="Question"
                  className={inputClass('mb-2')}
                />
                <textarea
                  value={faq.answer}
                  onChange={(e) => setArr('faqs', i, { ...faq, answer: e.target.value })}
                  placeholder="Answer"
                  rows={2}
                  className={inputClass('resize-none')}
                />
              </div>
            ))}
            <button type="button" onClick={() => addArr('faqs', { question: '', answer: '' })} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <Plus className="h-4 w-4" /> Add FAQ
            </button>
          </section>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
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
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-accent hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : trip ? 'Update trip' : 'Create trip'}
          </button>
        </div>
      </div>
    </div>
  );
}
