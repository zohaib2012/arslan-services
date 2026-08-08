import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import { ChevronLeft, AlertTriangle, Loader2, FileText } from 'lucide-react';

export default function DisputeDetail() {
  const { id } = useParams();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/disputes/${id}`);
        setDispute(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Dispute not found');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand-600" size={28} />
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-600 font-medium">{error || 'Dispute not found'}</p>
        <Link to="/dashboard/disputes" className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-brand-700 hover:underline">
          <ChevronLeft size={15} /> Back to disputes
        </Link>
      </div>
    );
  }

  const booking = dispute.booking;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link to="/dashboard/disputes" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700 mb-5">
        <ChevronLeft size={15} /> My Disputes
      </Link>

      <div className="card-premium overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="text-orange-500" size={19} />
            </div>
            <div>
              <p className="font-bold text-ink-900">Dispute on {booking?.service?.nameEn}</p>
              <p className="text-xs text-gray-500">{booking?.worker?.user?.fullName}</p>
            </div>
          </div>
          <StatusBadge status={dispute.status} />
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Reason</p>
            <p className="text-sm font-medium text-ink-800">{dispute.reason?.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</p>
            <p className="text-sm text-gray-600 leading-relaxed">{dispute.description}</p>
          </div>

          {dispute.evidence?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Evidence</p>
              <div className="space-y-2">
                {dispute.evidence.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    {e.fileType === 'IMAGE' || e.fileUrl?.includes('res.cloudinary.com') ? (
                      <img src={e.fileUrl} alt={e.caption || 'evidence'} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center">
                        <FileText className="text-brand-600" size={20} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{e.caption || 'Evidence file'}</p>
                      <p className="text-xs text-gray-400">Uploaded by {e.uploader?.fullName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dispute.resolutionNotes && (
            <div className="p-4 rounded-xl bg-emerald-50">
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">Resolution</p>
              <p className="text-sm text-emerald-900">{dispute.resolutionNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
