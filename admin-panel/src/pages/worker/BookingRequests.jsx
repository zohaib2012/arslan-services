import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import { Clock, Briefcase, Loader2, MapPin } from 'lucide-react';
import BackButton from '../../components/BackButton';

export default function BookingRequests() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/bookings/my-jobs', { params: { status: 'PENDING' } });
        setBookings(res.data || []);
      } catch (err) {
        console.error(err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="animate-fade-in">
      <BackButton to="/worker/dashboard" className="mb-4" />
      <h1 className="font-display text-2xl font-extrabold text-ink-900 mb-6">Booking Requests</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-600" size={28} />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 card-premium">
          <Clock className="mx-auto text-gray-200 mb-3" size={40} />
          <h3 className="font-display font-semibold text-ink-700">No pending requests</h3>
          <p className="text-sm text-ink-600 mt-1">New booking requests will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookings.map((b) => (
            <Link
              key={b.id}
              to={`/worker/requests/${b.id}`}
              className="card-premium p-5 group"
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
              <h3 className="font-display font-semibold text-ink-900">{b.service?.nameEn}</h3>
              <div className="flex items-center gap-2 mt-2">
                {b.customer?.profilePhoto ? (
                  <img src={b.customer.profilePhoto} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-ink-600">
                    {(b.customer?.fullName || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-ink-600">{b.customer?.fullName}</span>
              </div>
              <p className="text-xs text-ink-600 mt-3 line-clamp-2">{b.description}</p>
              <div className="flex items-center gap-1.5 mt-3 text-xs text-ink-600">
                <MapPin size={12} /> {b.address}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-4 pt-3 border-t border-gray-50 text-xs text-ink-600">
                <span className="truncate">{b.bookingType === 'SCHEDULED' && b.scheduledAt ? new Date(b.scheduledAt).toLocaleString() : 'ASAP'}</span>
                <span>{new Date(b.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
