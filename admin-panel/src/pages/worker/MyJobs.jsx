import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import { Briefcase, Loader2 } from 'lucide-react';

const filters = [
  { value: '', label: 'All' },
  { value: 'ACCEPTED', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = status ? { status } : {};
        const res = await api.get('/bookings/my-jobs', { params });
        setJobs(res.data || []);
      } catch (err) {
        console.error(err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [status]);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">{jobs.length} job{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                status === f.value ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-600" size={28} />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Briefcase className="mx-auto text-gray-300 mb-3" size={40} />
          <h3 className="font-semibold text-gray-700">No jobs found</h3>
          <p className="text-sm text-gray-400 mt-1">Accepted bookings will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((b) => (
            <Link
              key={b.id}
              to={`/worker/jobs/${b.id}`}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center">
                  {b.service?.iconUrl ? (
                    <img src={b.service.iconUrl} alt="" className="w-7 h-7 object-contain" />
                  ) : (
                    <Briefcase className="text-brand-600" size={18} />
                  )}
                </div>
                <StatusBadge status={b.status} />
              </div>
              <h3 className="font-semibold text-gray-900">{b.service?.nameEn}</h3>
              <div className="flex items-center gap-2 mt-2">
                {b.customer?.profilePhoto ? (
                  <img src={b.customer.profilePhoto} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    {(b.customer?.fullName || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-gray-600">{b.customer?.fullName}</span>
              </div>
              <p className="text-xs text-gray-400 mt-3 line-clamp-2">{b.description}</p>
              {b.priceEstimate != null && (
                <div className="mt-3 text-sm font-semibold text-brand-700">PKR {Number(b.priceEstimate).toLocaleString()}</div>
              )}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
                <span>{b.bookingType === 'SCHEDULED' && b.scheduledAt ? new Date(b.scheduledAt).toLocaleString() : 'ASAP'}</span>
                <span>{new Date(b.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
