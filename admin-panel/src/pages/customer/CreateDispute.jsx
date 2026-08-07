import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { ChevronLeft, AlertTriangle, Loader2, Plus, X } from 'lucide-react';

const reasons = ['WORKER_DID_NOT_ARRIVE', 'CUSTOMER_DID_NOT_PAY', 'WRONG_SERVICE_PROVIDED', 'FRAUD', 'PROPERTY_DAMAGE', 'MISCONDUCT'];

export default function CreateDispute() {
  const [searchParams] = useSearchParams();
  const preselectedBooking = searchParams.get('booking') || '';
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [bookingId, setBookingId] = useState(preselectedBooking);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState([]);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceType, setEvidenceType] = useState('IMAGE');
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/bookings/my-bookings');
        setBookings((res.data || []).filter((b) => b.status !== 'PENDING'));
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const addEvidence = () => {
    if (!evidenceUrl.trim()) {
      toast.error('Enter a file URL.');
      return;
    }
    setEvidence((prev) => [...prev, { fileUrl: evidenceUrl.trim(), fileType: evidenceType, caption: caption.trim() || undefined }]);
    setEvidenceUrl('');
    setCaption('');
  };

  const handleSubmit = async () => {
    if (!bookingId) return toast.error('Please select a booking.');
    if (!reason) return toast.error('Please select a reason.');
    if (!description.trim()) return toast.error('Please describe the issue.');
    setSubmitting(true);
    try {
      await api.post('/disputes', { bookingId, reason, description });
      const created = await api.get('/disputes/my');
      const dispute = created.data?.[0];
      if (dispute) {
        for (const e of evidence) {
          await api.post(`/disputes/${dispute.id}/evidence`, e);
        }
      }
      toast.success('Dispute raised successfully.');
      navigate('/dashboard/disputes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to raise dispute.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Link to="/dashboard/disputes" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700 mb-5">
        <ChevronLeft size={15} /> My Disputes
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <AlertTriangle className="text-orange-500" size={22} /> Raise a Dispute
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Booking *</label>
          <select
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          >
            <option value="">Select a booking</option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>{b.service?.nameEn} · {b.worker?.user?.fullName} ({b.status})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Reason *</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          >
            <option value="">Select a reason</option>
            {reasons.map((r) => (
              <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe what went wrong..."
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2">Evidence (optional)</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {evidence.map((e, i) => (
              <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-600">
                {e.fileType === 'IMAGE' ? <img src={e.fileUrl} alt="" className="w-6 h-6 rounded object-cover" /> : <span>📄</span>}
                <span className="max-w-[160px] truncate">{e.caption || e.fileUrl}</span>
                <button onClick={() => setEvidence(evidence.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <input
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="Image/document URL"
              className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="IMAGE">Image</option>
              <option value="DOCUMENT">Document</option>
            </select>
          </div>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
            className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 mb-2"
          />
          <button onClick={addEvidence} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
            <Plus size={15} /> Add evidence
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="animate-spin" size={18} /> : <AlertTriangle size={18} />}
          Submit Dispute
        </button>
      </div>
    </div>
  );
}
