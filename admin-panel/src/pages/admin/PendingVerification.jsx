import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, UserCheck, Loader2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader, StatusBadge } from '../../components';

export default function PendingVerification() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [notes, setNotes] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const abortRef = useRef(null);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    loadPending(controller.signal);
    return () => controller.abort();
  }, [page]);

  const loadPending = async (signal) => {
    setLoading(true);
    try {
      const res = await api.get('/workers/pending', { params: { page, limit: 20 }, signal });
      setWorkers(res.data.workers);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') console.error(err);
    }
    finally { setLoading(false); }
  };

  const handleVerify = async (status) => {
    if (!selectedWorker) return;
    try {
      await api.put(`/workers/${selectedWorker.id}/verify`, { verified: status === 'VERIFIED', notes });
      setWorkers(prev => prev.filter(w => w.id !== selectedWorker.id));
      setSelectedWorker(null);
      setNotes('');
      toast.success(status === 'VERIFIED' ? 'Worker verified successfully' : 'Worker rejected');
    } catch { toast.error('Failed to update'); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader2 size={32} className="text-brand-600 animate-spin mb-3" />
      <p className="text-sm text-ink-600">Loading verification requests...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Verification Requests"
        subtitle={`${workers.length} worker${workers.length !== 1 ? 's' : ''} pending verification`}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 card-premium overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-display font-bold text-ink-900">Pending Workers</h3>
            <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium">{workers.length} pending</span>
          </div>
          {workers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <UserCheck size={48} className="text-gray-300 mb-3" />
              <p className="text-sm text-ink-600">All workers have been verified</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {workers.map(w => (
                <div
                  key={w.id}
                  onClick={() => setSelectedWorker(w)}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedWorker?.id === w.id
                      ? 'bg-brand-50 border-l-4 border-l-brand-600'
                      : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {(w.user?.fullName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display font-semibold text-ink-900 truncate">{w.user?.fullName}</p>
                      <p className="text-xs text-ink-600 truncate">{w.user?.email} {w.user?.phone ? `| ${w.user.phone}` : ''}</p>
                    </div>
                    <StatusBadge status="PENDING" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 px-5 py-4 border-t border-gray-50 bg-gray-50/30">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded-xl border border-gray-200 hover:bg-white disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                  p === page ? 'gradient-brand text-white shadow-md shadow-brand-600/20' : 'border border-gray-200 hover:bg-white text-ink-600'
                }`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 rounded-xl border border-gray-200 hover:bg-white disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {selectedWorker ? (
          <div className="w-full lg:w-96 card-premium p-6 h-fit lg:sticky lg:top-24">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-white text-lg font-bold shadow-md">
                {(selectedWorker.user?.fullName || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-display font-bold text-ink-900">{selectedWorker.user?.fullName}</h3>
                <p className="text-xs text-ink-600">{selectedWorker.user?.email}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {selectedWorker.cnicNumber && (
                <div>
                  <p className="text-xs font-medium text-ink-600 uppercase tracking-wider mb-1">CNIC Number</p>
                  <p className="text-sm text-ink-900 bg-gray-50 rounded-xl px-3 py-2">{selectedWorker.cnicNumber}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {selectedWorker.cnicFront && (
                  <div>
                    <p className="text-xs font-medium text-ink-600 uppercase tracking-wider mb-1">CNIC Front</p>
                    <img src={selectedWorker.cnicFront} alt="CNIC Front" className="w-full rounded-xl border border-gray-200 shadow-sm" />
                  </div>
                )}
                {selectedWorker.cnicBack && (
                  <div>
                    <p className="text-xs font-medium text-ink-600 uppercase tracking-wider mb-1">CNIC Back</p>
                    <img src={selectedWorker.cnicBack} alt="CNIC Back" className="w-full rounded-xl border border-gray-200 shadow-sm" />
                  </div>
                )}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-medium text-ink-600 uppercase tracking-wider mb-1.5">Verification Notes</label>
              <textarea
                placeholder="Add notes about this verification..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl ring-focus outline-none text-sm resize-none transition-all"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleVerify('VERIFIED')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-600/20 text-sm font-medium"
              >
                <CheckCircle size={16} /> Verify
              </button>
              <button
                onClick={() => handleVerify('REJECTED')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-lg shadow-red-600/20 text-sm font-medium"
              >
                <XCircle size={16} /> Reject
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full lg:w-96 card-premium p-10 flex flex-col items-center justify-center text-center h-fit">
            <FileText size={48} className="text-gray-200 mb-3" />
            <p className="text-sm text-ink-600">Select a worker to review their details</p>
          </div>
        )}
      </div>
    </div>
  );
}
