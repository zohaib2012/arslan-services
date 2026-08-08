import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import {
  Mail, Phone, Star, Wrench, MapPin, Clock, ChevronRight,
  Loader2, BadgeCheck, Wallet, Camera, FileText,
} from 'lucide-react';

export default function WorkerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/workers/me');
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand-600" size={28} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Worker profile not found.</p>
      </div>
    );
  }

  const user = profile.user;
  const services = profile.workerServices || [];
  const areas = profile.serviceAreas || [];
  const methods = profile.paymentMethods || [];

  const menu = [
    { label: 'Edit Profile', desc: 'Update experience, description & languages', to: '/worker/profile/edit', icon: <FileText size={17} /> },
    { label: 'CNIC Verification', desc: 'Upload your CNIC documents', to: '/worker/verification', icon: <BadgeCheck size={17} /> },
    { label: 'Portfolio', desc: `${profile.portfolio?.length || 0} items`, to: '/worker/portfolio', icon: <Camera size={17} /> },
    { label: 'Services', desc: `${services.length} selected`, to: '/worker/services', icon: <Wrench size={17} /> },
    { label: 'Service Areas', desc: `${areas.length} areas`, to: '/worker/areas', icon: <MapPin size={17} /> },
    { label: 'Working Hours', desc: 'Set your availability', to: '/worker/hours', icon: <Clock size={17} /> },
    { label: 'Payment Methods', desc: `${methods.length} saved`, to: '/worker/payments', icon: <Wallet size={17} /> },
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Worker Profile</h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <div className="h-24 relative">
          {profile.coverPhoto ? (
            <img src={profile.coverPhoto} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="h-full bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-600 relative">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_20%,white,transparent_50%)]" />
            </div>
          )}
        </div>
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg shrink-0">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="" className="w-full h-full rounded-xl object-cover" />
              ) : (
                <div className="w-full h-full rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 text-2xl font-bold">
                  {(user?.fullName || 'W').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 pb-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">{user?.fullName}</h2>
                <StatusBadge status={profile.verificationStatus} />
                {profile.isOnline && <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Online</span>}
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 flex-wrap">
                <span className="flex items-center gap-1 text-amber-600 font-semibold"><Star size={13} className="fill-amber-400 text-amber-400" /> {Number(profile.avgRating).toFixed(1)}</span>
                <span>({profile.totalReviews || 0} reviews)</span>
                <span>· {profile.completedJobs || 0} jobs</span>
                {profile.experienceYears > 0 && <span>· {profile.experienceYears} yrs exp</span>}
              </div>
            </div>
            <Link to="/worker/profile/edit" className="pb-1 shrink-0 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors">
              Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 mb-6">
        {menu.map((m) => (
          <Link
            key={m.label}
            to={m.to}
            className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-gray-100 hover:bg-gray-50/60 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
              {m.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{m.label}</p>
              <p className="text-xs text-gray-400">{m.desc}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-3">About</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{profile.description || 'No description added yet.'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-3">Contact</h3>
          <div className="space-y-2.5 text-sm">
            <p className="flex items-center gap-2 text-gray-600"><Mail size={15} className="text-brand-600" /> {user?.email || 'Not set'}</p>
            <p className="flex items-center gap-2 text-gray-600"><Phone size={15} className="text-brand-600" /> {user?.phone || 'Not set'}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-3">Service Areas</h3>
          {areas.length === 0 ? (
            <p className="text-sm text-gray-400">No areas added.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {areas.map((a) => (
                <span key={a.id} className="px-2.5 py-1 text-xs font-medium text-brand-700 bg-brand-50 rounded-full">
                  {a.city}{a.area ? ` · ${a.area}` : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
