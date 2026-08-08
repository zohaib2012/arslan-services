import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import { ChevronLeft, MapPin, Calendar, CheckCircle2, XCircle, Loader2, Phone, MessageCircle, Clock, Star } from 'lucide-react';

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);

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

  const accept = async () => {
    setBusy(true);
    try {
      await api.put(`/bookings/${id}/accept`);
      toast.success('Booking accepted!');
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept booking.');
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    setBusy(true);
    try {
      await api.put(`/bookings/${id}/reject`, { reason: rejectReason.trim() || undefined });
      toast.success('Booking rejected.');
      navigate('/worker/requests');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject booking.');
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
        <Link to="/worker/requests" className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-brand-700 hover:underline">
          <ChevronLeft size={15} /> Back to requests
        </Link>
      </div>
    );
  }

  const customer = booking.customer;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link to="/worker/requests" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700 mb-5">
        <ChevronLeft size={15} /> Booking Requests
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
          <InfoRow icon={<Calendar size={15} />} label="Requested" value={new Date(booking.createdAt).toLocaleString()} />
          <InfoRow icon={<Clock size={15} />} label="When" value={booking.bookingType === 'SCHEDULED' && booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleString() : 'As soon as possible'} />
          <InfoRow icon={<MapPin size={15} />} label="Address" value={booking.address} />
          <InfoRow icon={<Star size={15} />} label="Expires" value={booking.expiryAt ? new Date(booking.expiryAt).toLocaleString() : '-'} />
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

      <div className="card-premium p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        {customer?.profilePhoto ? (
          <img src={customer.profilePhoto} alt="" className="w-14 h-14 rounded-2xl object-cover shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-700 font-bold text-xl shrink-0">
            {(customer?.fullName || 'C').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink-900 truncate">{customer?.fullName}</p>
          <p className="text-xs text-gray-400">Customer</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <a href={`tel:${customer?.phone || ''}`} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors" title="Call">
            <Phone size={16} />
          </a>
          <button
            onClick={() => navigate(`/worker/chat/${customer?.id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl btn-primary text-sm font-semibold"
          >
            <MessageCircle size={15} /> Message
          </button>
        </div>
      </div>

      {booking.status === 'PENDING' && (
        <div className="card-premium p-5 space-y-4">
          <p className="text-sm text-gray-600">Accept this booking to get started. If you don't respond, it will expire automatically.</p>
          {!showReject ? (
            <div className="flex gap-3">
              <button
                onClick={accept}
                disabled={busy}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50 transition-colors"
              >
                <CheckCircle2 size={17} /> {busy ? 'Processing...' : 'Accept Booking'}
              </button>
              <button
                onClick={() => setShowReject(true)}
                className="px-5 py-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition-colors"
              >
                <XCircle size={17} />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={2}
                placeholder="Reason for rejecting (optional)"
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={reject}
                  disabled={busy}
                  className="flex-1 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50 transition-colors"
                >
                  {busy ? 'Rejecting...' : 'Confirm Reject'}
                </button>
                <button
                  onClick={() => setShowReject(false)}
                  className="px-5 py-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
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
