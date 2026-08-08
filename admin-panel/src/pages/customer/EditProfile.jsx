import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, Loader2 } from 'lucide-react';

export default function EditProfile() {
  const { user, init } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      if (fullName !== user?.fullName) payload.fullName = fullName;
      if (email !== user?.email) payload.email = email;
      if (phone !== user?.phone) payload.phone = phone;
      await api.put('/users/me', payload);
      toast.success('Profile updated.');
      await init();
      navigate('/dashboard/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <Link to="/dashboard/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700 mb-5">
        <ChevronLeft size={15} /> Back to profile
      </Link>
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-2xl btn-primary font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : null}
          Save Changes
        </button>
      </form>
    </div>
  );
}
