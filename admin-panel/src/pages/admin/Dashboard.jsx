import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Users, Briefcase, Calendar, AlertTriangle, DollarSign } from 'lucide-react';
import { StatCard, PageHeader } from '../../components';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    api.get('/dashboard/stats').then(res => setStats(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="w-12 h-12 border-4 border-brand-600/30 border-t-brand-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-400 mt-4">Loading dashboard...</p>
    </div>
  );

  if (!stats) return (
    <div className="flex flex-col items-center justify-center py-32">
      <AlertTriangle size={48} className="text-gray-300 mb-3" />
      <p className="text-gray-500 text-sm">Failed to load dashboard data</p>
    </div>
  );

  const { totalCustomers, totalWorkers, totalBookings, totalRevenue, pendingVerifications, openDisputes, recentBookings } = stats;
  const bookingStatusData = [
    { name: 'Completed', value: recentBookings?.filter(b => b.status === 'COMPLETED').length || 0, color: '#006837' },
    { name: 'Pending', value: recentBookings?.filter(b => b.status === 'PENDING').length || 0, color: '#F5A623' },
    { name: 'Accepted', value: recentBookings?.filter(b => b.status === 'ACCEPTED').length || 0, color: '#3B82F6' },
    { name: 'Cancelled', value: recentBookings?.filter(b => b.status === 'CANCELLED').length || 0, color: '#EF4444' },
  ];
  const totalForChart = bookingStatusData.reduce((s, d) => s + d.value, 0) || 1;

  const weeklyData = [
    { day: 'Mon', bookings: 4, revenue: 12000 },
    { day: 'Tue', bookings: 6, revenue: 18000 },
    { day: 'Wed', bookings: 8, revenue: 24000 },
    { day: 'Thu', bookings: 5, revenue: 15000 },
    { day: 'Fri', bookings: 9, revenue: 27000 },
    { day: 'Sat', bookings: 12, revenue: 36000 },
    { day: 'Sun', bookings: 7, revenue: 21000 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        label="Admin Panel"
        title="Dashboard"
        subtitle="Overview of your platform performance"
      />

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Users} label="Total Customers" value={totalCustomers?.toLocaleString() || 0} color="blue" trend={12} trendUp />
        <StatCard icon={Briefcase} label="Total Workers" value={totalWorkers?.toLocaleString() || 0} color="purple" trend={8} trendUp />
        <StatCard icon={Calendar} label="Total Bookings" value={totalBookings?.toLocaleString() || 0} color="emerald" trend={15} trendUp />
        <StatCard icon={DollarSign} label="Total Revenue" value={`PKR ${(totalRevenue || 0).toLocaleString()}`} color="amber" trend={10} trendUp />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 shadow-lg shadow-amber-500/20">
              <Briefcase className="text-white" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Verifications</p>
              <p className="font-display text-2xl font-bold text-ink-900">{pendingVerifications || 0}</p>
            </div>
          </div>
          <div className="relative pt-2">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.min((pendingVerifications || 0) / Math.max(totalWorkers || 1, 1) * 100, 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((pendingVerifications || 0) / Math.max(totalWorkers || 1, 1) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-400 shadow-lg shadow-red-500/20">
              <AlertTriangle className="text-white" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Open Disputes</p>
              <p className="font-display text-2xl font-bold text-ink-900">{openDisputes || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <div className="flex-1">
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((openDisputes || 0) / Math.max(totalBookings || 1, 1) * 100, 100)}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {((openDisputes || 0) / Math.max(totalBookings || 1, 1) * 100).toFixed(1)}% of bookings
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-card border border-gray-100">
          <h3 className="font-display font-bold text-ink-900 mb-6">Weekly Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006837" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#006837" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A623" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    padding: '8px 12px',
                  }}
                />
                <Area type="monotone" dataKey="bookings" stroke="#006837" fillOpacity={1} fill="url(#colorBookings)" strokeWidth={2} />
                <Area type="monotone" dataKey="revenue" stroke="#F5A623" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-brand-600" />
              <span className="text-xs text-gray-500">Bookings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gold-400" />
              <span className="text-xs text-gray-500">Revenue (PKR)</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
          <h3 className="font-display font-bold text-ink-900 mb-6">Booking Status</h3>
          <div className="space-y-4">
            {bookingStatusData.filter(d => d.value > 0).map((item) => (
              <div key={item.name}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-semibold text-gray-800">{item.value}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(item.value / totalForChart) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
            {bookingStatusData.every(d => d.value === 0) && (
              <p className="text-sm text-gray-400 text-center py-8">No booking data yet</p>
            )}
          </div>
        </div>
      </div>

      {recentBookings && recentBookings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h3 className="font-display font-bold text-ink-900">Recent Bookings</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">Last {recentBookings.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-brand-50/70 border-b border-brand-100">
                  {['Customer', 'Worker', 'Service', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentBookings.map(b => (
                  <tr key={b.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold">
                          {(b.customer?.fullName || '?').charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{b.customer?.fullName || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{b.worker?.fullName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{b.service?.nameEn || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        {PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
                         ACCEPTED: 'bg-blue-50 text-blue-700 border border-blue-200',
                         COMPLETED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                         CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
                         EXPIRED: 'bg-gray-100 text-gray-500 border border-gray-200',
                         DISPUTED: 'bg-orange-50 text-orange-700 border border-orange-200',
                        }[b.status] || 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
