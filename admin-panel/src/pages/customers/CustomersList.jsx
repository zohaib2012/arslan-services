import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Users, Ban, Trash2, Search, ShieldAlert } from 'lucide-react';
import { PageHeader, StatusBadge } from '../../components';

export default function CustomersList() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const abortRef = useRef(null);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    loadCustomers(controller.signal);
    return () => controller.abort();
  }, [page]);

  const loadCustomers = async (signal) => {
    setLoading(true);
    try {
      const res = await api.get('/customers', { params: { page, limit: 20, search }, signal });
      setCustomers(res.data.customers);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') toast.error('Failed to load customers');
    }
    finally { setLoading(false); }
  };

  const handleBlock = async (id) => {
    const customer = customers.find(c => c.id === id);
    try { await api.put(`/customers/${id}/block`, { isBlocked: !customer.isBlocked, blockReason: '' }); loadCustomers(); toast.success('Updated'); } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;
    try { await api.delete(`/customers/${id}`); loadCustomers(); toast.success('Customer deleted'); } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Customers"
        subtitle={`${totalPages > 0 ? `${customers.length} registered users` : 'Manage platform customers'}`}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                onKeyDown={e => e.key === 'Enter' && loadCustomers()}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm transition-all"
              />
            </div>
            <button onClick={loadCustomers} className="px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-medium shadow-sm">
              Search
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-brand-600/30 border-t-brand-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-400 mt-4">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Users size={48} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Customer', 'Email', 'Phone', 'Status', 'Bookings', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          {(c.fullName || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{c.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{c.email || '-'}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{c.phone || '-'}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={c.isBlocked ? 'BLOCKED' : 'ACTIVE'} />
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                        {c._count?.customerBookings || 0} bookings
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleBlock(c.id)} className={`p-2 rounded-xl transition-colors ${
                          c.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                        }`} title={c.isBlocked ? 'Unblock' : 'Block'}>
                          <Ban size={15} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
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
