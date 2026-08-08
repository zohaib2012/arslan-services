import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import { AlertTriangle, Plus, Loader2 } from 'lucide-react';

export default function MyDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/disputes/my');
        setDisputes(res.data || []);
      } catch (err) {
        console.error(err);
        setDisputes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand-600" size={28} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">My Disputes</h1>
          <p className="text-sm text-gray-500 mt-1">{disputes.length} dispute{disputes.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          to="/dashboard/disputes/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 btn-primary text-sm font-semibold rounded-xl"
        >
          <Plus size={16} /> New Dispute
        </Link>
      </div>

      {disputes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <AlertTriangle className="mx-auto text-gray-300 mb-3" size={40} />
          <h3 className="font-semibold text-ink-900">No disputes raised</h3>
          <p className="text-sm text-gray-400 mt-1">If something went wrong with a booking, you can raise a dispute.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <Link
              key={d.id}
              to={`/dashboard/disputes/${d.id}`}
              className="block card-premium p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <AlertTriangle className="text-orange-500" size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900">{d.booking?.service?.nameEn}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {d.reason?.replace(/_/g, ' ')} · {new Date(d.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{d.description}</p>
                  </div>
                </div>
                <StatusBadge status={d.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
