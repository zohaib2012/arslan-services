import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import {
  ChevronLeft, MapPin, Calendar, MessageCircle, Star, AlertTriangle,
  Loader2, Clock, CheckCircle2, XCircle, Phone,
} from 'lucide-react';

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleAt, setRescheduleAt] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/bookings/${id}`);
        setBooking(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Booking not found');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const cancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation.');
      return;
    }
    setBusy(true);
    try {
      await api.put(`/bookings/${id}/cancel`, { reason: cancelReason });
      toast.success('Booking cancelled.');
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data);
      setShowCancel(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setBusy(false);
    }
  };

  const reschedule = async () => {
    if (!rescheduleAt) {
      toast.error('Please pick a new date & time.');
      return;
    }
    setBusy(true);
    try {
      await api.put(`/bookings/${id}/reschedule`, { scheduledAt: rescheduleAt });
      toast.success('Booking rescheduled.');
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data);
      setShowReschedule(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reschedule.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand-600" size={28} />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-600 font-medium">{error || 'Booking not found'}</p>
        <Link to="/dashboard/bookings" className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-brand-700 hover:underline">
          <ChevronLeft size={15} /> Back to bookings
        </Link>
      </div>
    );
  }

  const worker = booking.worker?.user;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link to="/dashboard/bookings" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700 mb-5">
        <ChevronLeft size={15} /> My Bookings
      </Link>

      <div className="card-premium overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-brand-50 to-emerald-50 border-b border-brand-100">
          <div>
            <p className="text-sm text-gray-500">Booking</p>
            <p className="font-bold text-ink-900">{booking.service?.nameEn}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow icon={<Calendar size={15} />} label="Created" value={new Date(booking.createdAt).toLocaleString()} />
          <InfoRow
            icon={<Clock size={15} />}
            label="When"
            value={booking.bookingType === 'SCHEDULED' && booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleString() : 'As soon as possible'}
          />
          <InfoRow icon={<MapPin size={15} />} label="Address" value={booking.address} />
          <InfoRow icon={<Star size={15} />} label="Service" value={`${booking.service?.nameEn} · ${booking.bookingType}`} />
        </div>
        <div className="px-6 pb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</p>
          <p className="text-sm text-gray-600 leading-relaxed">{booking.description}</p>
          {booking.customerNotes && (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-1.5">Customer Notes</p>
              <p className="text-sm text-gray-600">{booking.customerNotes}</p>
            </>
          )}
        </div>
      </div>

      {/* Worker card */}
      <div className="card-premium p-5 mb-6 flex items-center gap-4">
        {worker?.profilePhoto ? (
          <img src={worker.profilePhoto} alt="" className="w-14 h-14 rounded-2xl object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-700 font-bold text-xl">
            {(worker?.fullName || 'W').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <p className="font-semibold text-ink-900">{worker?.fullName}</p>
          <p className="text-xs text-gray-400">Professional for this booking</p>
        </div>
        <div className="flex gap-2">
          <a href={`tel:${worker?.phone || ''}`} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors" title="Call">
            <Phone size={16} />
          </a>
          <button
            onClick={() => navigate(`/dashboard/chat/${worker?.id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl btn-primary text-sm font-semibold"
          >
            <MessageCircle size={15} /> Chat
          </button>
        </div>
      </div>

      {/* Actions */}
      {booking.status === 'PENDING' && (
        <div className="card-premium p-5 mb-6 space-y-4">
          <p className="text-sm text-gray-600">Waiting for {worker?.fullName} to accept your booking. Booking expires if not accepted in time.</p>
          <div className="flex flex-wrap gap-3">
            {booking.bookingType === 'SCHEDULED' && (
              <button
                onClick={() => { setShowReschedule(!showReschedule); setShowCancel(false); }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Calendar size={15} /> Reschedule
              </button>
            )}
            <button
              onClick={() => { setShowCancel(!showCancel); setShowReschedule(false); }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              <XCircle size={15} /> Cancel Booking
            </button>
          </div>
          {showReschedule && (
            <div className="p-4 rounded-xl bg-gray-50 space-y-3">
              <input
                type="datetime-local"
                value={rescheduleAt}
                onChange={(e) => setRescheduleAt(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button onClick={reschedule} disabled={busy} className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50">
                {busy ? 'Saving...' : 'Reschedule'}
              </button>
            </div>
          )}
          {showCancel && (
            <div className="p-4 rounded-xl bg-red-50 space-y-3">
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
                placeholder="Reason for cancellation..."
                className="w-full px-3 py-2.5 text-sm bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <button onClick={cancel} disabled={busy} className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50">
                {busy ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          )}
        </div>
      )}

      {booking.status === 'COMPLETED' && (
        <div className="card-premium p-5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-500" size={22} />
            <div>
              <p className="font-semibold text-ink-900">Job completed</p>
              <p className="text-xs text-gray-400">
                {booking.review ? `You rated ${booking.review.rating}★` : 'Rate your experience below'}
              </p>
            </div>
          </div>
          {!booking.review ? (
            <Link
              to={`/dashboard/review/${booking.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 btn-primary text-sm font-semibold rounded-xl"
            >
              <Star size={15} /> Write Review
            </Link>
          ) : (
            <Link to="/dashboard/bookings" className="text-sm font-semibold text-brand-700 hover:underline">Back</Link>
          )}
        </div>
      )}

      {booking.status !== 'PENDING' && booking.status !== 'COMPLETED' && !booking.isDisputed && (
        <div className="card-premium p-5 mb-6">
          <button
            onClick={() => navigate(`/dashboard/disputes/new?booking=${booking.id}`)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            <AlertTriangle size={15} /> Open a dispute for this booking
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}
