import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { Calendar, Star, Heart, MessageSquare, AlertTriangle, ArrowRight, Bell, Loader2 } from 'lucide-react';

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
    { label: 'Total Bookings', value: bookings.length, icon: <Calendar size={18} />, color: 'bg-brand-600', link: '/dashboard/bookings' },
    { label: 'Active Jobs', value: active, icon: <MessageSquare size={18} />, color: 'bg-blue-500', link: '/dashboard/bookings' },
    { label: 'Completed', value: completed, icon: <Star size={18} />, color: 'bg-emerald-500', link: '/dashboard/bookings' },
    { label: 'Favorites', value: '-', icon: <Heart size={18} />, color: 'bg-rose-500', link: '/dashboard/favorites' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Welcome back, {user?.fullName?.split(' ')[0] || 'there'}!</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your bookings, favorites and messages.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Link
            key={s.label}
            to={s.link}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl ${s.color} text-white flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-ink-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent bookings */}
        <div className="lg:col-span-2 card-premium rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-display font-bold text-ink-900">Recent Bookings</h2>
            <Link to="/dashboard/bookings" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
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
                <Link key={b.id} to={`/dashboard/bookings/${b.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    {b.service?.iconUrl ? (
                      <img src={b.service.iconUrl} alt="" className="w-6 h-6 object-contain" />
                    ) : (
                      <Star className="text-brand-600" size={17} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">{b.service?.nameEn}</p>
                    <p className="text-xs text-gray-400 truncate">
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
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-display font-bold text-ink-900 flex items-center gap-1.5">
              <Bell size={15} className="text-brand-600" /> Notifications
            </h2>
            <Link to="/dashboard/notifications" className="text-xs font-semibold text-brand-700 hover:underline">See all</Link>
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
                <div key={n.id} className="px-6 py-3.5">
                  <p className="text-sm font-medium text-ink-900">{n.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Disputes banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/dashboard/disputes" className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white flex items-center justify-between hover:opacity-95 transition-opacity">
          <div>
            <p className="font-display font-bold">Open a Dispute</p>
            <p className="text-sm text-white/80 mt-1">Something wrong with a booking?</p>
          </div>
          <AlertTriangle size={28} className="opacity-80" />
        </Link>
        <Link to="/workers/nearby" className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 text-white flex items-center justify-between hover:opacity-95 transition-opacity">
          <div>
            <p className="font-display font-bold">Find More Workers</p>
            <p className="text-sm text-white/80 mt-1">Browse verified professionals</p>
          </div>
          <ArrowRight size={28} className="opacity-80" />
        </Link>
      </div>
    </div>
  );
}
