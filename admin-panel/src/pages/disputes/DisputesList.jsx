import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AlertTriangle, Scale, ChevronRight, Loader2, FileText } from 'lucide-react';
import { PageHeader, StatusBadge } from '../../components';

export default function DisputesList() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try { const res = await api.get('/disputes'); setDisputes(res.data.disputes || res.data); } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };

  const handleResolve = async (id, status) => {
    try { await api.put(`/disputes/${id}/resolve`, { status }); loadDisputes(); setSelected(null); toast.success('Dispute resolved'); } catch { toast.error('Failed'); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader2 size={32} className="text-brand-600 animate-spin mb-3" />
      <p className="text-sm text-gray-400">Loading disputes...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Disputes"
        subtitle={`${disputes.length} dispute${disputes.length !== 1 ? 's' : ''} reported`}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">All Disputes</h3>
            <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-medium">{disputes.filter(d => d.status === 'OPEN').length} open</span>
          </div>
          {disputes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Scale size={48} className="text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">No disputes reported</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {disputes.map(d => (
                <div
                  key={d.id}
                  onClick={() => setSelected(d)}
                  className={`p-4 cursor-pointer transition-all ${
                    selected?.id === d.id
                      ? 'bg-brand-50 border-l-4 border-l-brand-600'
                      : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        d.status === 'OPEN' ? 'bg-red-50' : 'bg-emerald-50'
                      }`}>
                        <AlertTriangle size={16} className={d.status === 'OPEN' ? 'text-red-500' : 'text-emerald-500'} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{d.raiser?.fullName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{d.reason?.replace(/_/g, ' ')}</p>
                        {d.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{d.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={d.status} />
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selected ? (
          <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit lg:sticky lg:top-24">
            <h3 className="font-bold text-gray-800 mb-1">Dispute Details</h3>
            <div className="flex items-center gap-2 mb-5">
              <StatusBadge status={selected.status} />
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Raised by</p>
                <p className="text-sm font-medium text-gray-700">{selected.raiser?.fullName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Reason</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2">{selected.reason?.replace(/_/g, ' ')}</p>
              </div>
              {selected.description && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2 whitespace-pre-wrap">{selected.description}</p>
                </div>
              )}
              {selected.evidence?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Evidence ({selected.evidence.length})</p>
                  <div className="flex gap-2 flex-wrap">
                    {selected.evidence.map(e => (
                      <img key={e.id} src={e.fileUrl} alt="Evidence" className="w-20 h-20 rounded-xl object-cover border border-gray-200 shadow-sm" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Resolution</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleResolve(selected.id, 'RESOLVED_CUSTOMER')}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-sm text-sm font-medium">
                Resolve in Favor of Customer
              </button>
              <button onClick={() => handleResolve(selected.id, 'RESOLVED_WORKER')}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm text-sm font-medium">
                Resolve in Favor of Worker
              </button>
              <button onClick={() => handleResolve(selected.id, 'DISMISSED')}
                className="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-sm text-sm font-medium">
                Dismiss Dispute
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center justify-center text-center h-fit">
            <FileText size={48} className="text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">Select a dispute to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
