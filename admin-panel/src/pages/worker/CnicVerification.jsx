import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import { ChevronLeft, Loader2, Upload, CreditCard, ShieldAlert, BadgeCheck } from 'lucide-react';

export default function CnicVerification() {
  const [profile, setProfile] = useState(null);
  const [cnicNumber, setCnicNumber] = useState('');
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [uploading, setUploading] = useState(false);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/workers/me');
        setProfile(res.data);
        setCnicNumber(res.data.cnicNumber || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUpload = async (e, side) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'cnic');
      const res = await api.post('/upload/single', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (side === 'front') setFront(res.data.url);
      else setBack(res.data.url);
      toast.success('Image uploaded.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const submitVerification = async () => {
    if (!front || !back) {
      toast.error('Please upload both CNIC front and back.');
      return;
    }
    if (cnicNumber.trim().length < 13) {
      toast.error('Please enter a valid CNIC number.');
      return;
    }
    setUploading(true);
    try {
      await api.put('/workers/me/verification', {
        cnicFront: front,
        cnicBack: back,
        cnicNumber: cnicNumber.trim(),
      });
      toast.success('CNIC submitted for verification.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand-600" size={28} />
      </div>
    );
  }

  const isVerified = profile?.verificationStatus === 'VERIFIED';

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <Link to="/worker/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700 mb-5">
        <ChevronLeft size={15} /> Back to profile
      </Link>
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-2 flex items-center gap-2">
        <BadgeCheck size={22} className="text-brand-600" /> CNIC Verification
      </h1>

      <div className="mb-6 p-4 rounded-2xl bg-gray-50 flex items-center justify-between">
        <span className="text-sm text-gray-600">Current status</span>
        <StatusBadge status={profile?.verificationStatus} />
      </div>

      {isVerified ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
            <BadgeCheck className="text-emerald-500" size={30} />
          </div>
          <h3 className="font-bold text-ink-900">You are verified!</h3>
          <p className="text-sm text-gray-500 mt-1">Your identity has been verified.</p>
        </div>
      ) : (
        <div className="card-premium p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">CNIC Number</label>
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-gray-400" />
              <input
                value={cnicNumber}
                onChange={(e) => setCnicNumber(e.target.value)}
                placeholder="XXXXX-XXXXXXX-X"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UploadBox label="Front of CNIC" image={front} uploading={uploading} onPick={() => frontRef.current?.click()} />
            <UploadBox label="Back of CNIC" image={back} uploading={uploading} onPick={() => backRef.current?.click()} />
          </div>
          <input ref={frontRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'front')} />
          <input ref={backRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'back')} />

          <div className="p-4 rounded-2xl bg-amber-50 flex items-start gap-3">
            <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-amber-800 leading-relaxed">
              Your CNIC is used only for identity verification. It is stored securely and never shown publicly.
            </p>
          </div>

          <button
            onClick={submitVerification}
            disabled={uploading}
            className="w-full py-4 rounded-2xl btn-primary font-bold disabled:opacity-50"
          >
            {uploading ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </div>
      )}
    </div>
  );
}

function UploadBox({ label, image, uploading, onPick }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-1.5">{label}</p>
      <button
        onClick={onPick}
        className={`w-full h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${
          image ? 'border-emerald-200 bg-emerald-50/40' : 'border-gray-200 hover:border-brand-300'
        }`}
      >
        {image ? (
          <img src={image} alt={label} className="w-full h-full object-cover" />
        ) : uploading ? (
          <Loader2 className="animate-spin text-brand-600 mb-2" size={22} />
        ) : (
          <>
            <Upload size={20} className="text-gray-400 mb-2" />
            <span className="text-xs text-gray-400">Click to upload</span>
          </>
        )}
      </button>
    </div>
  );
}
