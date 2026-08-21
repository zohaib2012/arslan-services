import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { Calendar, Briefcase, Clock, DollarSign, Star, ArrowRight, Loader2, Bell, Wrench } from 'lucide-react';

export default function WorkerDashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, jobsRes, notifRes] = await Promise.allSettled([
          api.get('/workers/me/stats'),
          api.get('/bookings/my-jobs'),
          api.get('/notifications', { params: { limit: 5 } }),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data || []);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data?.notifications || notifRes.value.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statCards = [
    { label: 'Today', value: stats?.todayBookings ?? '-', icon: Calendar, color: 'from-brand-600 to-brand-700', link: '/worker/jobs' },
    { label: 'Pending Requests', value: stats?.pendingBookings ?? '-', icon: Clock, color: 'from-amber-500 to-orange-500', link: '/worker/requests' },
    { label: 'Completed Jobs', value: stats?.totalCompleted ?? '-', icon: Briefcase, color: 'from-emerald-500 to-emerald-600', link: '/worker/jobs' },
    { label: 'Earnings', value: stats?.totalEarnings ? `PKR ${Number(stats.totalEarnings).toLocaleString()}` : 'PKR 0', icon: DollarSign, color: 'from-blue-500 to-blue-600', link: '/worker/jobs' },
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
              Here's your work summary and recent activity.
            </p>
          </div>
          <div className="hidden md:block w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
            <Wrench size={28} className="text-gold-400" />
          </div>
        </div>
        <div className="relative mt-5 flex flex-wrap gap-2">
          <Link to="/worker/requests" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-brand-700 text-xs md:text-sm font-bold hover:bg-emerald-50 transition-colors">
            View Requests <ArrowRight size={14} />
          </Link>
          <Link to="/worker/profile" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass text-white text-xs md:text-sm font-semibold hover:bg-white/15 transition-colors">
            Complete Profile <Star size={14} className="text-gold-400" />
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
              <p className="text-lg md:text-2xl font-bold text-ink-900 truncate">{s.value}</p>
              <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">{s.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        <div className="lg:col-span-2 card-premium overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100">
            <h2 className="font-display font-bold text-base md:text-lg text-ink-900">Recent Jobs</h2>
            <Link to="/worker/jobs" className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-brand-700 hover:text-brand-800">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-brand-600" size={24} />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="mx-auto text-gray-200 mb-3" size={36} />
              <p className="text-ink-600 text-sm">No bookings yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {jobs.slice(0, 5).map((b) => (
                <Link key={b.id} to={`/worker/jobs/${b.id}`} className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3.5 md:py-4 hover:bg-gray-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    {b.service?.iconUrl ? (
                      <img src={b.service.iconUrl} alt="" className="w-6 h-6 object-contain" />
                    ) : (
                      <Briefcase className="text-brand-600" size={17} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-800 truncate">{b.service?.nameEn}</p>
                    <p className="text-[11px] md:text-xs text-ink-600 truncate">{b.customer?.fullName} · {new Date(b.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card-premium overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100">
            <h2 className="font-display font-bold text-base md:text-lg text-ink-900 flex items-center gap-1.5">
              <Bell size={15} className="text-brand-600" /> Notifications
            </h2>
            <Link to="/worker/notifications" className="text-xs md:text-sm font-semibold text-brand-700 hover:underline">See all</Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-brand-600" size={20} />
            </div>
          ) : notifications.length === 0 ? (
              <p className="text-sm text-ink-600 text-center py-10">No notifications yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="px-4 md:px-6 py-3.5">
                  <p className="text-sm font-medium text-ink-800">{n.title}</p>
                  <p className="text-[11px] md:text-xs text-ink-600 mt-0.5 line-clamp-2">{n.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <Link to="/worker/requests" className="rounded-2xl p-5 md:p-6 text-white flex items-center justify-between hover:brightness-105 hover:shadow-glow transition-all group bg-gradient-to-br from-amber-500 to-orange-500">
          <div>
            <p className="font-display font-bold text-base md:text-lg">Booking Requests</p>
            <p className="text-xs md:text-sm text-white/80 mt-1">Accept or reject new bookings</p>
          </div>
          <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock size={22} />
          </div>
        </Link>
        <Link to="/worker/profile" className="rounded-2xl p-5 md:p-6 text-white flex items-center justify-between hover:brightness-105 hover:shadow-glow transition-all group gradient-brand">
          <div>
            <p className="font-display font-bold text-base md:text-lg">Complete Your Profile</p>
            <p className="text-xs md:text-sm text-white/80 mt-1">Add services, areas and more</p>
          </div>
          <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Star size={22} />
          </div>
        </Link>
      </div>
    </div>
  );
}
