import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, User, Shield, ChevronRight, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/bookings/my-bookings');
        setStats({
          bookings: res.data?.length || 0,
          completed: res.data?.filter((b) => b.status === 'COMPLETED').length || 0,
        });
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex items-center gap-4">
        {user?.profilePhoto ? (
          <img src={user.profilePhoto} alt="" className="w-16 h-16 rounded-2xl object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-bold">
            {(user?.fullName || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <p className="text-lg font-bold text-gray-900">{user?.fullName}</p>
          <p className="text-sm text-gray-400">{user?.role}</p>
        </div>
        <Link to="/dashboard/profile/edit" className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors">
          Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats?.bookings || 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">Total Bookings</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats?.completed || 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">Completed</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
        <DetailRow icon={<User size={17} />} label="Full Name" value={user?.fullName} />
        <DetailRow icon={<Mail size={17} />} label="Email" value={user?.email || 'Not set'} />
        <DetailRow icon={<Phone size={17} />} label="Phone" value={user?.phone || 'Not set'} />
        <DetailRow icon={<Shield size={17} />} label="Account Type" value={user?.role} />
      </div>

      <Link
        to="/dashboard/password"
        className="mt-4 w-full flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-gray-100 hover:bg-gray-50/60 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-700">Change Password</span>
        <ChevronRight size={16} className="text-gray-400" />
      </Link>

      <button
        onClick={logout}
        className="mt-4 w-full flex items-center justify-center gap-2 px-5 py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-semibold transition-colors"
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}
