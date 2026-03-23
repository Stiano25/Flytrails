import { useEffect, useState } from 'react';
import { adminApi } from '../../data/api.js';
import TripForm from './TripForm.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';

function formatKes(n) {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n);
}

export default function TripsAdmin() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formTrip, setFormTrip] = useState(null); // null = closed, undefined = new, obj = edit
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchTrips() {
    setLoading(true);
    try { setTrips(await adminApi.getAllTrips()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchTrips(); }, []);

  function openNew() { setFormTrip(undefined); setShowForm(true); }
  function openEdit(trip) { setFormTrip(trip); setShowForm(true); }
  function closeForm() { setShowForm(false); setFormTrip(null); }

  function handleSave(saved) {
    setTrips((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [...prev, saved];
    });
    closeForm();
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await adminApi.deleteTrip(deleteId);
      setTrips((prev) => prev.filter((t) => t.id !== deleteId));
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
          <h1 className="font-display text-2xl font-bold text-slate-800">Trips</h1>
          <p className="mt-1 text-slate-500">{trips.length} trips total</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-accent hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New trip
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-slate-400">Loading…</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-500">Trip</th>
                <th className="hidden px-4 py-3 font-semibold text-slate-500 md:table-cell">Category</th>
                <th className="hidden px-4 py-3 font-semibold text-slate-500 lg:table-cell">Price</th>
                <th className="hidden px-4 py-3 font-semibold text-slate-500 lg:table-cell">Spots left</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {trip.image && (
                        <img src={trip.image} alt={trip.title} className="h-10 w-14 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="font-semibold text-slate-800">{trip.title}</p>
                        <p className="text-xs text-slate-400">{trip.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{trip.category}</td>
                  <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">{formatKes(trip.price)}</td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className={`text-sm ${trip.spotsLeft <= 3 ? 'font-bold text-amber-500' : 'text-slate-600'}`}>
                      {trip.spotsLeft} / {trip.spotsTotal}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {trip.isActive ? (
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
                      <button
                        onClick={() => openEdit(trip)}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(trip.id)}
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

          {trips.length === 0 && (
            <p className="py-12 text-center text-slate-400">No trips yet — create your first one.</p>
          )}
        </div>
      )}

      {showForm && (
        <TripForm
          trip={formTrip}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete trip?"
          message="This will permanently remove the trip and all its data. This cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
