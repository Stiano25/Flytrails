import { useEffect, useState } from 'react';
import { adminApi } from '../../data/api.js';
import AccommodationForm from './AccommodationForm.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';

function formatKes(n) {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n || 0);
}

export default function AccommodationsAdmin() {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formAccommodation, setFormAccommodation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchAccommodations() {
    setLoading(true);
    try { setAccommodations(await adminApi.getAllAccommodations()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchAccommodations(); }, []);

  function openNew() { setFormAccommodation(undefined); setShowForm(true); }
  function openEdit(accommodation) { setFormAccommodation(accommodation); setShowForm(true); }
  function closeForm() { setShowForm(false); setFormAccommodation(null); }

  function handleSave(saved) {
    setAccommodations((prev) => {
      const idx = prev.findIndex((a) => a.id === saved.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [...prev, saved];
    });
    closeForm();
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await adminApi.deleteAccommodation(deleteId);
      setAccommodations((prev) => prev.filter((a) => a.id !== deleteId));
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
          <h1 className="font-display text-2xl font-bold text-slate-800">Accommodations</h1>
          <p className="mt-1 text-slate-500">{accommodations.length} accommodations total</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-accent hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New accommodation
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-slate-400">Loading...</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-500">Accommodation</th>
                <th className="hidden px-4 py-3 font-semibold text-slate-500 md:table-cell">Location</th>
                <th className="hidden px-4 py-3 font-semibold text-slate-500 lg:table-cell">Price from</th>
                <th className="hidden px-4 py-3 font-semibold text-slate-500 lg:table-cell">Rating</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accommodations.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt={item.title} className="h-10 w-14 rounded-lg object-cover" />}
                      <div>
                        <p className="font-semibold text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-400">{item.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{item.location}</td>
                  <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">{formatKes(item.priceFrom)}</td>
                  <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">{item.rating ?? '-'}</td>
                  <td className="px-4 py-3">
                    {item.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <Eye className="h-3 w-3" /> Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                        <EyeOff className="h-3 w-3" /> Hidden
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(item.id)} className="rounded-lg border border-red-100 p-1.5 text-red-400 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {accommodations.length === 0 && (
            <p className="py-12 text-center text-slate-400">No accommodations yet - create your first one.</p>
          )}
        </div>
      )}

      {showForm && (
        <AccommodationForm
          accommodation={formAccommodation}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete accommodation?"
          message="This will permanently remove the accommodation and all its data. This cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
