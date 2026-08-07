import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Activity, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '../../components';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const abortRef = useRef(null);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    loadLogs(controller.signal);
    return () => controller.abort();
  }, [page]);

  const loadLogs = async (signal) => {
    setLoading(true);
    try {
      const res = await api.get('/activity-logs', { params: { page, limit: 30 }, signal });
      setLogs(res.data.logs || res.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') setLogs([]);
    }
    finally { setLoading(false); }
  };

  const actionColors = {
    CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',
    DELETE: 'bg-red-50 text-red-700 border-red-200',
    LOGIN: 'bg-purple-50 text-purple-700 border-purple-200',
    VERIFY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    SUSPEND: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Activity Logs"
        subtitle="Track all administrative actions"
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={32} className="text-brand-600 animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading activity logs...</p>
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['User', 'Action', 'Entity', 'Details', 'Time'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map(l => (
                  <tr key={l.id} className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-400 flex items-center justify-center text-white text-xs font-bold">
                          {(l.admin?.fullName || 'S').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{l.admin?.fullName || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${actionColors[l.action] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {l.action}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{l.entity || '-'}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 max-w-xs truncate">{l.details || '-'}</td>
                    <td className="px-5 py-4 text-sm text-gray-400">{new Date(l.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <Activity size={48} className="text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">No activity logs recorded yet</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded-xl border border-gray-200 hover:bg-white disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                  p === page ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'border border-gray-200 hover:bg-white text-gray-600'
                }`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 rounded-xl border border-gray-200 hover:bg-white disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
