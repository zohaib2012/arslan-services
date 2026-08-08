import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, Filter, Search } from 'lucide-react';
import { PageHeader, StatusBadge } from '../../components';

const statusFilters = ['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'DISPUTED', 'REJECTED'];

export default function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  const abortRef = useRef(null);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    loadBookings(controller.signal);
    return () => controller.abort();
  }, [page, statusFilter, filterSearch]);

  const loadBookings = async (signal) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (filterSearch) params.search = filterSearch;
      const res = await api.get('/bookings', { params, signal });
      setBookings(res.data.bookings);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') toast.error('Failed to load bookings');
    }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Bookings"
        subtitle="Monitor and manage all service bookings"
      />

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 mb-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              placeholder="Search customer or worker..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (setFilterSearch(search), setPage(1))}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm transition-all"
            />
          </div>
          <button
            onClick={() => { setFilterSearch(search); setPage(1); }}
            className="w-full sm:w-auto px-5 py-2.5 gradient-brand text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-md shadow-brand-600/20"
          >
            Filter
          </button>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Filter size={15} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter by status</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all ${
                statusFilter === s
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-brand-600/30 border-t-brand-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-400 mt-4">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Calendar size={48} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-brand-50/70 border-b border-brand-100">
                  {['Customer', 'Worker', 'Service', 'Type', 'Status', 'Date', 'Amount'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-white text-xs font-bold">
                          {(b.customer?.fullName || '?').charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{b.customer?.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{b.worker?.user?.fullName}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{b.service?.nameEn}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                        {b.bookingType}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-700">{b.totalAmount ? `PKR ${b.totalAmount}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-brand-50/30">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                  p === page ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'border border-gray-200 hover:bg-white text-gray-600'
                }`}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
