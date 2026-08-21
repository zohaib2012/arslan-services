import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import {
  Mail, Phone, Star, Wrench, MapPin, Clock, ChevronRight,
  Loader2, BadgeCheck, Wallet, Camera, FileText,
} from 'lucide-react';
import BackButton from '../../components/BackButton';

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
    <div className="max-w-2xl mx-auto animate-fade-in pb-10">
      <BackButton to="/worker/dashboard" className="mb-4" />
      {/* Profile header card */}
      <div className="card-premium overflow-hidden mb-6">
        <div className="h-32 md:h-40 relative">
          {profile.coverPhoto ? (
            <img src={profile.coverPhoto} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="h-full gradient-brand relative">
              <div className="absolute inset-0 bg-dots opacity-30" />
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_20%,white,transparent_50%)]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
        <div className="px-6 pb-6 -mt-14 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-xl shrink-0 ring-2 ring-brand-100">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="" className="w-full h-full rounded-[18px] object-cover" />
              ) : (
                <div className="w-full h-full rounded-[18px] gradient-brand-soft flex items-center justify-center text-brand-700 text-3xl font-extrabold">
                  {(user?.fullName || 'W').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 sm:pb-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl md:text-2xl font-extrabold text-ink-900">{user?.fullName}</h1>
                {profile.isOnline && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 rounded-full">
                    <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" /></span>
                    Online
                  </span>
                )}
                <StatusBadge status={profile.verificationStatus} />
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-500 flex-wrap">
                <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                  <Star size={14} className="fill-amber-400 text-amber-400" /> {Number(profile.avgRating || 0).toFixed(1)}
                </span>
                <span className="text-gray-400">({profile.totalReviews || 0})</span>
                <span className="text-gray-300">·</span>
                <span>{profile.completedJobs || 0} jobs</span>
                {profile.experienceYears > 0 && <><span className="text-gray-300">·</span><span>{profile.experienceYears} yrs exp</span></>}
              </div>
            </div>
            <Link
              to="/worker/profile/edit"
              className="sm:pb-1 shrink-0 btn-primary px-5 py-2.5 text-white text-sm font-bold rounded-xl"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 mb-6">
        {menu.map((m) => (
          <Link
            key={m.label}
            to={m.to}
            className="card-premium flex items-center gap-4 px-5 py-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
          >
            <div className="w-10 h-10 rounded-xl gradient-brand-soft flex items-center justify-center text-brand-600 shrink-0">
              {m.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink-900">{m.label}</p>
              <p className="text-xs text-gray-400">{m.desc}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </Link>
        ))}
      </div>

      <div className="card-premium p-6 mb-6">
        <h3 className="font-display font-bold text-lg text-ink-900 mb-3">About</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{profile.description || 'No description added yet.'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="card-premium p-5">
          <h3 className="font-display font-bold text-lg text-ink-900 mb-3">Contact</h3>
          <div className="space-y-2.5 text-sm">
            <p className="flex items-center gap-2 text-gray-600"><Mail size={15} className="text-brand-600 shrink-0" /> {user?.email || 'Not set'}</p>
            <p className="flex items-center gap-2 text-gray-600"><Phone size={15} className="text-brand-600 shrink-0" /> {user?.phone || 'Not set'}</p>
          </div>
        </div>
        <div className="card-premium p-5">
          <h3 className="font-display font-bold text-lg text-ink-900 mb-3">Service Areas</h3>
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
