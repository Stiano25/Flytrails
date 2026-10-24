import { useEffect, useState, useCallback, useMemo } from 'react';
import { adminApi } from '../../data/api.js';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import {
  Ticket,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  Eye,
  Printer,
  Download,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

function formatKES(val) {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

const statusBadge = {
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  failed: 'bg-rose-100 text-rose-800 border-rose-200',
  cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected booking for detailed modal
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Deletion state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Status updating state
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Status update
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const updated = await adminApi.updateBookingStatus(id, newStatus);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      if (selectedBooking?.id === id) {
        setSelectedBooking(updated);
      }
    } catch (err) {
      alert(err.message || 'Failed to update booking status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete booking
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteBooking(deleteId);
      setBookings((prev) => prev.filter((b) => b.id !== deleteId));
      if (selectedBooking?.id === deleteId) setSelectedBooking(null);
      setDeleteId(null);
    } catch (err) {
      alert(err.message || 'Failed to delete booking');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered & searched bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === 'all' || b.paymentStatus === statusFilter;
      if (!matchesStatus) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        b.ticketNumber?.toLowerCase().includes(q) ||
        b.customerName?.toLowerCase().includes(q) ||
        b.customerEmail?.toLowerCase().includes(q) ||
        b.customerPhone?.toLowerCase().includes(q) ||
        b.tripTitle?.toLowerCase().includes(q) ||
        b.mpesaReceipt?.toLowerCase().includes(q)
      );
    });
  }, [bookings, search, statusFilter]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter((b) => b.paymentStatus === 'completed');
    const revenue = completed.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const pending = bookings.filter((b) => b.paymentStatus === 'pending').length;

    return { total, completed: completed.length, revenue, pending };
  }, [bookings]);

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-orange-500" />
            Trip Bookings & M-Pesa Payments
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Real-time reservations, ticket verification, and STK Push payment logs.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Bookings</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Paid Bookings</div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">{stats.completed}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-orange-600">Total Collected</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{formatKES(stats.revenue)}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pending STK Push</div>
          <div className="mt-2 text-2xl font-bold text-amber-600">{stats.pending}</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search ticket #, customer, email, phone, trip, receipt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed (Paid)</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading && bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
            Loading bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Ticket className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            No bookings found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                <tr>
                  <th className="px-5 py-3.5">Ticket #</th>
                  <th className="px-5 py-3.5">Trip</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Slots & Total</th>
                  <th className="px-5 py-3.5">M-Pesa Receipt</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs">
                        {b.ticketNumber}
                      </span>
                    </td>

                    <td className="px-5 py-4 max-w-[200px]">
                      <div className="font-semibold text-slate-900 truncate" title={b.tripTitle}>
                        {b.tripTitle}
                      </div>
                      <div className="text-xs text-slate-400">{b.tripDeparture || 'Upcoming'}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{b.customerName}</div>
                      <div className="text-xs text-slate-500">{b.customerPhone}</div>
                      <div className="text-xs text-slate-400 truncate max-w-[160px]">{b.customerEmail}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{formatKES(b.amount)}</div>
                      <div className="text-xs text-slate-500">{b.slots} slot{b.slots === 1 ? '' : 's'}</div>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-slate-700">
                      {b.mpesaReceipt ? (
                        <span className="font-semibold text-emerald-700">{b.mpesaReceipt}</span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          statusBadge[b.paymentStatus] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {b.paymentStatus === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {b.paymentStatus === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                        {b.paymentStatus === 'failed' && <XCircle className="w-3 h-3 text-rose-600" />}
                        <span className="capitalize">{b.paymentStatus}</span>
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(b.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                          title="View Ticket / Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteId(b.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredBookings.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/70 px-5 py-3.5 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong className="text-slate-800">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                <strong className="text-slate-800">{Math.min(currentPage * pageSize, filteredBookings.length)}</strong> of{' '}
                <strong className="text-slate-800">{filteredBookings.length}</strong> bookings
              </span>
              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const hasGap = prev && p - prev > 1;
                    return (
                      <span key={p} className="flex items-center">
                        {hasGap && <span className="px-1 text-slate-400">...</span>}
                        <button
                          onClick={() => setCurrentPage(p)}
                          className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-semibold transition ${
                            currentPage === p
                              ? 'bg-slate-900 text-white'
                              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {p}
                        </button>
                      </span>
                    );
                  })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-slate-900 text-lg">Booking Ticket</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Ticket Box */}
            <div className="rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/30 p-5 space-y-4">
              <div className="flex justify-between items-start border-b border-orange-100 pb-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-orange-600">FLYTRAILS TICKET</div>
                  <div className="text-base font-bold text-slate-900">{selectedBooking.tripTitle}</div>
                  <div className="text-xs text-slate-500">Departure: {selectedBooking.tripDeparture || 'TBC'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Number</div>
                  <div className="font-mono text-sm font-bold text-slate-900">{selectedBooking.ticketNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Customer Name</span>
                  <span className="font-semibold text-slate-800">{selectedBooking.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone</span>
                  <span className="font-semibold text-slate-800">{selectedBooking.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Email</span>
                  <span className="font-semibold text-slate-800">{selectedBooking.customerEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Slots</span>
                  <span className="font-semibold text-slate-800">{selectedBooking.slots} traveler(s)</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Amount Paid</span>
                  <span className="font-bold text-emerald-700 text-sm">{formatKES(selectedBooking.amount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">M-Pesa Receipt</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedBooking.mpesaReceipt || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status</span>
                  <span className="capitalize font-semibold text-slate-800">{selectedBooking.paymentStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Paid At</span>
                  <span className="text-slate-800">{formatDate(selectedBooking.paidAt)}</span>
                </div>
              </div>
            </div>

            {/* Status change actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Change Status:</span>
                <select
                  value={selectedBooking.paymentStatus}
                  disabled={updatingId === selectedBooking.id}
                  onChange={(e) => handleStatusChange(selectedBooking.id, e.target.value)}
                  className="rounded-lg border border-slate-200 text-xs px-2.5 py-1.5 text-slate-700"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteId && (
        <ConfirmDialog
          title="Delete booking record"
          message="Are you sure you want to delete this booking? This will permanently remove the record from your database."
          confirmLabel="Delete booking"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
