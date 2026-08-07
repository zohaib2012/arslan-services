import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Home, Wrench, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const chooseRole = async (role) => {
    setLoading(true);
    try {
      await api.put('/users/role', { role });
      if (role === 'WORKER') navigate('/worker/dashboard');
      else navigate('/');
      toast.success('Role updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Choose Your Role</h1>
          <p className="text-emerald-100/70 mt-2">How would you like to use Arslan Services?</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <button
            onClick={() => chooseRole('CUSTOMER')}
            disabled={loading}
            className="group bg-white rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-100 transition-colors">
              <Home className="text-brand-600" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">I need a service</h3>
            <p className="text-sm text-gray-500">Book plumbers, electricians, cleaners and more</p>
          </button>
          <button
            onClick={() => chooseRole('WORKER')}
            disabled={loading}
            className="group bg-white rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-100 transition-colors">
              <Wrench className="text-brand-600" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">I provide services</h3>
            <p className="text-sm text-gray-500">Get jobs, manage bookings and grow your business</p>
          </button>
        </div>
        {loading && (
          <div className="flex justify-center mt-6">
            <Loader2 className="animate-spin text-white" size={24} />
          </div>
        )}
      </div>
    </div>
  );
}
