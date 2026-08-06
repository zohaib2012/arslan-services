import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Ban, Briefcase, Star } from 'lucide-react';
import { PageHeader, StatusBadge } from '../../components';

export default function WorkersList() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const abortRef = useRef(null);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    loadWorkers(controller.signal);
    return () => controller.abort();
  }, [page]);

  const loadWorkers = async (signal) => {
    setLoading(true);
    try {
      const res = await api.get('/workers', { params: { page, limit: 20 }, signal });
      setWorkers(res.data.workers);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') toast.error('Failed to load');
    }
    finally { setLoading(false); }
  };

  const handleVerify = async (id, status) => {
    try { await api.put(`/workers/${id}/verify`, { verified: status === 'VERIFIED', notes: '' }); loadWorkers(); toast.success('Updated'); } catch { toast.error('Failed'); }
  };

  const handleSuspend = async (id) => {
    const worker = workers.find(w => w.id === id);
    const isSuspended = worker.verificationStatus === 'SUSPENDED';
    try { await api.put(`/workers/${id}/suspend`, { suspended: !isSuspended, reason: '' }); loadWorkers(); toast.success('Updated'); } catch { toast.error('Failed'); }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Workers"
        subtitle="Manage service providers on the platform"
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-brand-600/30 border-t-brand-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-400 mt-4">Loading workers...</p>
          </div>
        ) : workers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Briefcase size={48} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">No workers registered yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Worker', 'Email', 'Phone', 'Status', 'Rating', 'Jobs', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {workers.map(w => (
                  <tr key={w.id} className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          {(w.user?.fullName || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{w.user?.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{w.user?.email || '-'}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{w.user?.phone || '-'}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={w.verificationStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium text-gray-700">{Number(w.avgRating || w.averageRating || 0).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                        {w.completedJobs || w._count?.workerBookings || 0} jobs
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {w.verificationStatus === 'PENDING' && (
                          <>
                            <button onClick={() => handleVerify(w.id, 'VERIFIED')} className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Verify">
                              <CheckCircle size={15} />
                            </button>
                            <button onClick={() => handleVerify(w.id, 'REJECTED')} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Reject">
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                        <button onClick={() => handleSuspend(w.id)} className={`p-2 rounded-xl transition-colors ${
                          w.verificationStatus === 'SUSPENDED' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`} title={w.verificationStatus === 'SUSPENDED' ? 'Unsuspend' : 'Suspend'}>
                          <Ban size={15} />
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
