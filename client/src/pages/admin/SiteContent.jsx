import { useEffect, useState, useRef } from 'react';
import { adminApi } from '../../data/api.js';
import { Check, X, Pencil } from 'lucide-react';

function ContentRow({ row, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(row.value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef();
  const isLong = row.value.length > 80;

  function startEdit() {
    setValue(row.value);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(row.key, value);
      setEditing(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setValue(row.value);
    setEditing(false);
  }

  return (
    <div className="flex items-start gap-4 border-b border-slate-100 px-4 py-4 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{row.label}</p>
        {editing ? (
          <div className="mt-2">
            {isLong ? (
              <textarea
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            ) : (
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            )}
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-accent disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={handleCancel} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{row.value}</p>
        )}
      </div>
      {!editing && (
        <button onClick={startEdit} className="mt-1 shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <Pencil className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default function SiteContent() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAllSiteContent()
      .then(setRows)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(key, value) {
    await adminApi.updateSiteContent(key, value);
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, value } : r)));
  }

  // Group by section
  const sections = rows.reduce((acc, row) => {
    if (!acc[row.section]) acc[row.section] = [];
    acc[row.section].push(row);
    return acc;
  }, {});

  const sectionOrder = ['home', 'about', 'contact', 'global'];
  const orderedSections = [
    ...sectionOrder.filter((s) => sections[s]),
    ...Object.keys(sections).filter((s) => !sectionOrder.includes(s)),
  ];

  const sectionLabels = { home: 'Home Page', about: 'About Page', contact: 'Contact Info', global: 'Global / Footer' };

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800">Site Content</h1>
        <p className="mt-1 text-slate-500">Edit the text that appears across your site. Click the pencil icon to edit any field.</p>
      </div>

      {loading ? (
        <p className="mt-8 text-slate-400">Loading…</p>
      ) : (
        <div className="mt-6 space-y-6">
          {orderedSections.map((section) => (
            <div key={section} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <h2 className="font-semibold text-slate-700 capitalize">
                  {sectionLabels[section] || section}
                </h2>
              </div>
              {sections[section].map((row) => (
                <ContentRow key={row.key} row={row} onSave={handleSave} />
              ))}
            </div>
          ))}

          {orderedSections.length === 0 && (
            <p className="text-slate-400">No content entries found. Make sure you ran the SQL schema.</p>
          )}
        </div>
      )}
    </div>
  );
}
