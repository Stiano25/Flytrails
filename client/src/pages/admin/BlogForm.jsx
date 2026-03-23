import { useState, useRef } from 'react';
import { adminApi } from '../../data/api.js';
import { X, Plus, Trash2, Upload } from 'lucide-react';

const CATEGORIES = ['Safari', 'Hiking', 'Travel Tips', 'Community', 'Budget', 'International'];

const emptyPost = {
  slug: '', title: '', excerpt: '', category: 'Safari',
  readTime: '', date: new Date().toISOString().slice(0, 10),
  image: '', featured: false, isPublished: true,
  sections: [{ heading: '', body: [''] }], closing: '',
};

function inputClass(extra = '') {
  return `w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${extra}`;
}

export default function BlogForm({ post, onSave, onClose }) {
  const [form, setForm] = useState(() => post ? {
    ...post,
    sections: post.sections?.length ? post.sections : [{ heading: '', body: [''] }],
  } : { ...emptyPost });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  function set(key, value) { setForm((f) => ({ ...f, [key]: value })); }

  // Section helpers
  function updateSection(si, key, value) {
    setForm((f) => {
      const sections = [...f.sections];
      sections[si] = { ...sections[si], [key]: value };
      return { ...f, sections };
    });
  }
  function addSection() { setForm((f) => ({ ...f, sections: [...f.sections, { heading: '', body: [''] }] })); }
  function removeSection(si) {
    setForm((f) => {
      const sections = f.sections.filter((_, i) => i !== si);
      return { ...f, sections: sections.length ? sections : [{ heading: '', body: [''] }] };
    });
  }
  function addPara(si) {
    setForm((f) => {
      const sections = [...f.sections];
      sections[si] = { ...sections[si], body: [...sections[si].body, ''] };
      return { ...f, sections };
    });
  }
  function updatePara(si, pi, value) {
    setForm((f) => {
      const sections = [...f.sections];
      const body = [...sections[si].body];
      body[pi] = value;
      sections[si] = { ...sections[si], body };
      return { ...f, sections };
    });
  }
  function removePara(si, pi) {
    setForm((f) => {
      const sections = [...f.sections];
      const body = sections[si].body.filter((_, i) => i !== pi);
      sections[si] = { ...sections[si], body: body.length ? body : [''] };
      return { ...f, sections };
    });
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { set('image', await adminApi.uploadBlogImage(file)); }
    catch (err) { alert(err.message); }
    finally { setUploading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await adminApi.upsertBlogPost({
        ...form,
        sections: form.sections.filter((s) => s.heading || s.body.some(Boolean)),
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
            {post ? 'Edit post' : 'New post'}
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
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Title *</span>
                <input value={form.title} onChange={(e) => set('title', e.target.value)} required className={inputClass()} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Slug (URL) *</span>
                <input value={form.slug} onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} required placeholder="e.g. best-time-mt-kenya" className={inputClass()} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Category *</span>
                <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass()}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Date *</span>
                <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required className={inputClass()} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Read time</span>
                <input value={form.readTime} onChange={(e) => set('readTime', e.target.value)} placeholder="e.g. 5 min read" className={inputClass()} />
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Excerpt *</span>
                <textarea value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} required rows={2} className={inputClass('resize-none')} />
              </label>
            </div>
          </section>

          {/* Cover image */}
          <section>
            <h3 className="mb-4 font-semibold text-slate-700">Cover image</h3>
            <div className="flex gap-4 items-start">
              {form.image && <img src={form.image} alt="cover" className="h-24 w-36 rounded-xl object-cover border border-slate-200" />}
              <div className="flex-1">
                <input type="url" value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="Paste image URL, or upload" className={inputClass('mb-2')} />
                <button type="button" onClick={() => fileRef.current.click()} disabled={uploading}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading…' : 'Upload file'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
            </div>
          </section>

          {/* Content sections */}
          <section>
            <h3 className="mb-4 font-semibold text-slate-700">Article content</h3>
            {form.sections.map((section, si) => (
              <div key={si} className="mb-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Section {si + 1}</span>
                  <button type="button" onClick={() => removeSection(si)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <input
                  value={section.heading}
                  onChange={(e) => updateSection(si, 'heading', e.target.value)}
                  placeholder="Section heading"
                  className={inputClass('mb-3')}
                />
                {section.body.map((para, pi) => (
                  <div key={pi} className="mb-2 flex gap-2">
                    <textarea
                      value={para}
                      onChange={(e) => updatePara(si, pi, e.target.value)}
                      placeholder="Paragraph"
                      rows={2}
                      className={inputClass('resize-none flex-1')}
                    />
                    <button type="button" onClick={() => removePara(si, pi)} className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-white">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addPara(si)} className="mt-1 flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <Plus className="h-3.5 w-3.5" /> Add paragraph
                </button>
              </div>
            ))}
            <button type="button" onClick={addSection} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <Plus className="h-4 w-4" /> Add section
            </button>

            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Closing line (blockquote)</span>
              <input value={form.closing} onChange={(e) => set('closing', e.target.value)} placeholder="e.g. Questions? Ask us on WhatsApp." className={inputClass()} />
            </label>
          </section>

          {/* Toggles */}
          <section className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/40" />
              <span className="text-sm font-medium text-slate-700">Featured post (shown in sidebar and home)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => set('isPublished', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/40" />
              <span className="text-sm font-medium text-slate-700">Published (visible to public)</span>
            </label>
          </section>
        </form>

        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-accent hover:bg-primary/90 disabled:opacity-50">
            {saving ? 'Saving…' : post ? 'Update post' : 'Create post'}
          </button>
        </div>
      </div>
    </div>
  );
}
