import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { ChevronLeft, Star, Loader2 } from 'lucide-react';

export default function WriteReview() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data);
      } catch {
        toast.error('Booking not found.');
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/reviews', { bookingId, rating, comment: comment.trim() || undefined });
      toast.success('Review submitted. Thank you!');
      navigate('/dashboard/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand-600" size={28} />
      </div>
    );
  }

  const workerName = booking?.worker?.user?.fullName || 'the worker';

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <Link to="/dashboard/bookings" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700 mb-5">
        <ChevronLeft size={15} /> My Bookings
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Rate {workerName}</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(i)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={36}
                className={`${(hover || rating) >= i ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} transition-colors`}
              />
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500">
          {rating === 0 ? 'Tap a star to rate' : `You rated ${rating} out of 5`}
        </p>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Your Review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder={`Share your experience with ${workerName}...`}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="animate-spin" size={18} /> : <Star size={18} />}
          Submit Review
        </button>
      </div>
    </div>
  );
}
