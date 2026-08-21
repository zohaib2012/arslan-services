import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { MessageSquare, Loader2, ChevronRight, FileText } from 'lucide-react';
import { PageHeader, StatusBadge } from '../../components';

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try { const res = await api.get('/support-tickets'); setTickets(res.data.tickets || res.data); } catch { setTickets([]); } finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    try { await api.put(`/support-tickets/${id}`, { status }); loadTickets(); toast.success('Status updated'); } catch { toast.error('Failed'); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader2 size={32} className="text-brand-600 animate-spin mb-3" />
      <p className="text-sm text-gray-400">Loading support tickets...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Support Tickets"
        subtitle={`${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} from users`}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">All Tickets</h3>
            <div className="flex gap-2">
              <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium">{tickets.filter(t => t.status === 'OPEN').length} open</span>
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">{tickets.filter(t => t.status === 'IN_PROGRESS').length} in progress</span>
            </div>
          </div>
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <MessageSquare size={48} className="text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">No support tickets</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {tickets.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className={`p-4 cursor-pointer transition-all ${
                    selected?.id === t.id
                      ? 'bg-brand-50 border-l-4 border-l-brand-600'
                      : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-800 truncate">{t.subject}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{t.name || t.user?.fullName || 'User'}</span>
                        {t.phone && <><span>·</span><span>{t.phone}</span></>}
                        {t.createdAt && <><span>·</span><span>{new Date(t.createdAt).toLocaleDateString()}</span></>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <StatusBadge status={t.status} />
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">{selected.subject}</h3>
              <StatusBadge status={selected.status} />
            </div>
            <p className="text-xs text-gray-400 mb-5">
              By {selected.name || selected.user?.fullName || 'Unknown'}
              {selected.phone && <> · {selected.phone}</>}
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Description</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.description}</p>
            </div>

            {selected.messages?.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Messages ({selected.messages.length})</p>
                <div className="space-y-3">
                  {selected.messages.map(m => (
                    <div key={m.id} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">{m.sender?.fullName}</span>
                        <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700">{m.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusUpdate(selected.id, s)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                    selected.status === s
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center justify-center text-center h-fit">
            <FileText size={48} className="text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">Select a ticket to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
