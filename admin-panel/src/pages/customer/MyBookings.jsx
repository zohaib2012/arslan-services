import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import { Calendar, Star, Loader2 } from 'lucide-react';

const filters = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'EXPIRED', label: 'Expired' },
];

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = status ? { status } : {};
        const res = await api.get('/bookings/my-bookings', { params });
        setBookings(res.data || []);
      } catch (err) {
        console.error(err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [status]);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">My Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
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
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 card-premium rounded-2xl">
          <Calendar className="mx-auto text-gray-300 mb-3" size={40} />
          <h3 className="font-display font-semibold text-ink-900">No bookings found</h3>
          <p className="text-sm text-gray-400 mt-1">Book a service to get started.</p>
          <Link to="/workers/nearby" className="inline-block mt-4 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors">
            Find a Worker
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookings.map((b) => (
            <Link
              key={b.id}
              to={`/dashboard/bookings/${b.id}`}
              className="card-premium rounded-2xl p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center">
                  {b.service?.iconUrl ? (
                    <img src={b.service.iconUrl} alt="" className="w-7 h-7 object-contain" />
                  ) : (
                    <Star className="text-brand-600" size={18} />
                  )}
                </div>
                <StatusBadge status={b.status} />
              </div>
              <h3 className="font-display font-semibold text-ink-900">{b.service?.nameEn}</h3>
              <div className="flex items-center gap-2 mt-2">
                {b.worker?.user?.profilePhoto ? (
                  <img src={b.worker.user.profilePhoto} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    {(b.worker?.user?.fullName || 'W').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-gray-600">{b.worker?.user?.fullName}</span>
              </div>
              <p className="text-xs text-gray-400 mt-3 line-clamp-2">{b.description}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
                <span>{b.bookingType === 'SCHEDULED' && b.scheduledAt ? `Scheduled: ${new Date(b.scheduledAt).toLocaleString()}` : 'As soon as possible'}</span>
                <span>{new Date(b.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
