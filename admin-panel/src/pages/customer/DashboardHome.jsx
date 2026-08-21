import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { Calendar, Star, Heart, MessageSquare, AlertTriangle, ArrowRight, Bell, Loader2, MapPin, Sparkles } from 'lucide-react';

export default function CustomerDashboardHome() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [bookRes, notifRes] = await Promise.allSettled([
          api.get('/bookings/my-bookings'),
          api.get('/notifications', { params: { limit: 5 } }),
        ]);
        if (bookRes.status === 'fulfilled') setBookings(bookRes.value.data || []);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data?.notifications || notifRes.value.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const active = bookings.filter((b) => ['PENDING', 'ACCEPTED'].includes(b.status)).length;
  const completed = bookings.filter((b) => b.status === 'COMPLETED').length;

  const statCards = [
    { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'from-brand-600 to-brand-700', link: '/dashboard/bookings' },
    { label: 'Active Jobs', value: active, icon: MessageSquare, color: 'from-blue-500 to-blue-600', link: '/dashboard/bookings' },
    { label: 'Completed', value: completed, icon: Star, color: 'from-emerald-500 to-emerald-600', link: '/dashboard/bookings' },
    { label: 'Favorites', value: '-', icon: Heart, color: 'from-rose-500 to-rose-600', link: '/dashboard/favorites' },
  ];

  return (
    <div className="space-y-5 md:space-y-6 animate-fade-in pb-4">
      {/* Welcome card */}
      <div className="rounded-3xl gradient-brand p-5 md:p-8 text-white relative overflow-hidden shadow-glow">
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-xs md:text-sm text-emerald-100/80 mb-1">Welcome back,</p>
            <h1 className="font-display text-xl md:text-3xl font-extrabold">{user?.fullName?.split(' ')[0] || 'there'}!</h1>
            <p className="mt-2 text-xs md:text-sm text-emerald-50/80 max-w-md">
              Manage your bookings, favorites and messages from one place.
            </p>
          </div>
          <div className="hidden md:block w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
            <Sparkles size={28} className="text-gold-400" />
          </div>
        </div>
        <div className="relative mt-5 flex flex-wrap gap-2">
          <Link to="/workers/nearby" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-brand-700 text-xs md:text-sm font-bold hover:bg-emerald-50 transition-colors">
            Find a Worker <ArrowRight size={14} />
          </Link>
          <Link to="/ai-search" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass text-white text-xs md:text-sm font-semibold hover:bg-white/15 transition-colors">
            Ask AI Assistant <Sparkles size={14} className="text-gold-400" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              to={s.link}
              className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all"
            >
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center mb-3`}>
                <Icon size={18} />
              </div>
              <p className="text-xl md:text-2xl font-bold text-ink-900">{s.value}</p>
              <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 font-medium">{s.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        {/* Recent bookings */}
        <div className="lg:col-span-2 card-premium rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100">
            <h2 className="font-display font-bold text-base md:text-lg text-ink-900">Recent Bookings</h2>
            <Link to="/dashboard/bookings" className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-brand-700 hover:text-brand-800">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-brand-600" size={24} />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-300 mb-3" size={36} />
              <p className="text-gray-500 text-sm">No bookings yet.</p>
              <Link to="/" className="inline-block mt-3 text-sm font-semibold text-brand-700 hover:underline">Find a worker</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {bookings.slice(0, 5).map((b) => (
                <Link key={b.id} to={`/dashboard/bookings/${b.id}`} className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3.5 md:py-4 hover:bg-gray-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    {b.service?.iconUrl ? (
                      <img src={b.service.iconUrl} alt="" className="w-6 h-6 object-contain" />
                    ) : (
                      <Star className="text-brand-600" size={17} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">{b.service?.nameEn}</p>
                    <p className="text-[11px] md:text-xs text-gray-400 truncate">
                      {b.worker?.user?.fullName} · {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="card-premium rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100">
            <h2 className="font-display font-bold text-base md:text-lg text-ink-900 flex items-center gap-1.5">
              <Bell size={15} className="text-brand-600" /> Notifications
            </h2>
            <Link to="/dashboard/notifications" className="text-xs md:text-sm font-semibold text-brand-700 hover:underline">See all</Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-brand-600" size={20} />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No notifications yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="px-4 md:px-6 py-3.5">
                  <p className="text-sm font-medium text-ink-900">{n.title}</p>
                  <p className="text-[11px] md:text-xs text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Disputes + Find workers banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <Link to="/dashboard/disputes" className="rounded-2xl p-5 md:p-6 text-white flex items-center justify-between hover:opacity-95 transition-opacity bg-gradient-to-br from-orange-500 to-amber-500">
          <div>
            <p className="font-display font-bold text-base md:text-lg">Open a Dispute</p>
            <p className="text-xs md:text-sm text-white/80 mt-1">Something wrong with a booking?</p>
          </div>
          <AlertTriangle size={28} className="opacity-80" />
        </Link>
        <Link to="/workers/nearby" className="rounded-2xl p-5 md:p-6 text-white flex items-center justify-between hover:opacity-95 transition-opacity gradient-brand">
          <div>
            <p className="font-display font-bold text-base md:text-lg">Find More Workers</p>
            <p className="text-xs md:text-sm text-white/80 mt-1">Browse verified professionals</p>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={24} />
            <ArrowRight size={20} />
          </div>
        </Link>
      </div>
    </div>
  );
}
