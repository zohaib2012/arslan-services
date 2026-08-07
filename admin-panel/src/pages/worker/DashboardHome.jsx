import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { Calendar, Briefcase, Clock, DollarSign, Star, ArrowRight, Loader2, Bell } from 'lucide-react';

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
    { label: 'Today', value: stats?.todayBookings ?? '-', icon: <Calendar size={18} />, color: 'bg-brand-600', link: '/worker/jobs' },
    { label: 'Pending Requests', value: stats?.pendingBookings ?? '-', icon: <Clock size={18} />, color: 'bg-amber-500', link: '/worker/requests' },
    { label: 'Completed Jobs', value: stats?.totalCompleted ?? '-', icon: <Briefcase size={18} />, color: 'bg-emerald-500', link: '/worker/jobs' },
    { label: 'Earnings', value: stats?.totalEarnings ? `PKR ${Number(stats.totalEarnings).toLocaleString()}` : 'PKR 0', icon: <DollarSign size={18} />, color: 'bg-blue-500', link: '/worker/jobs' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.fullName?.split(' ')[0] || 'there'}!</h1>
        <p className="text-sm text-gray-500 mt-1">Here's your work summary.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Link key={s.label} to={s.link} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${s.color} text-white flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900 truncate">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Jobs</h2>
            <Link to="/worker/jobs" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-brand-600" size={24} />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="mx-auto text-gray-300 mb-3" size={36} />
              <p className="text-gray-500 text-sm">No bookings yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {jobs.slice(0, 5).map((b) => (
                <Link key={b.id} to={`/worker/jobs/${b.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    {b.service?.iconUrl ? (
                      <img src={b.service.iconUrl} alt="" className="w-6 h-6 object-contain" />
                    ) : (
                      <Briefcase className="text-brand-600" size={17} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{b.service?.nameEn}</p>
                    <p className="text-xs text-gray-400 truncate">{b.customer?.fullName} · {new Date(b.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-1.5">
              <Bell size={15} className="text-brand-600" /> Notifications
            </h2>
            <Link to="/worker/notifications" className="text-xs font-semibold text-brand-700 hover:underline">See all</Link>
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
                  <p className="text-sm font-medium text-gray-800">{n.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/worker/requests" className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white flex items-center justify-between hover:opacity-95 transition-opacity">
          <div>
            <p className="font-bold">Booking Requests</p>
            <p className="text-sm text-white/80 mt-1">Accept or reject new bookings</p>
          </div>
          <Clock size={28} className="opacity-80" />
        </Link>
        <Link to="/worker/profile" className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 text-white flex items-center justify-between hover:opacity-95 transition-opacity">
          <div>
            <p className="font-bold">Complete Your Profile</p>
            <p className="text-sm text-white/80 mt-1">Add services, areas and more</p>
          </div>
          <Star size={28} className="opacity-80" />
        </Link>
      </div>
    </div>
  );
}
