import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function WorkerDisputes() {
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Disputes</h1>

      {disputes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <AlertTriangle className="mx-auto text-gray-300 mb-3" size={40} />
          <h3 className="font-semibold text-gray-700">No disputes raised</h3>
          <p className="text-sm text-gray-400 mt-1">Disputes you raise on bookings will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <Link
              key={d.id}
              to={`/worker/disputes/${d.id}`}
              className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <AlertTriangle className="text-orange-500" size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{d.booking?.service?.nameEn}</p>
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
