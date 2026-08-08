import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { TrendingUp, Users, Calendar, Loader2 } from 'lucide-react';
import { PageHeader, StatCard } from '../../components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Analytics() {
  const [userStats, setUserStats] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userRes, bookingRes] = await Promise.all([
        api.get('/reports/users'),
        api.get('/reports/bookings'),
      ]);
      setUserStats(userRes.data);
      setBookingStats(bookingRes.data);
    } catch { /* use defaults */ }
    finally { setLoading(false); }
  };

  const bookingData = Array.isArray(bookingStats) ? bookingStats : (bookingStats?.bookingTrends || []);
  const chartData = bookingData.map(item => ({
    period: item.date || item.period || item.day || '-',
    bookings: item.count || item.bookings || 0,
    revenue: item.revenue || 0,
  }));

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader2 size={32} className="text-brand-600 animate-spin mb-3" />
      <p className="text-sm text-ink-600">Loading analytics...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Analytics"
        subtitle="Data-driven insights about your platform"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={Users} label="Total Customers" value={userStats?.totalCustomers?.toLocaleString() || 0} color="blue" />
        <StatCard icon={Users} label="Total Workers" value={userStats?.totalWorkers?.toLocaleString() || 0} color="purple" />
        <StatCard icon={Calendar} label="Total Bookings" value={bookingStats?.totalBookings?.toLocaleString() || 0} color="emerald" />
        <StatCard icon={TrendingUp} label="Completed" value={bookingStats?.completedBookings?.toLocaleString() || 0} color="teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card-premium p-6">
          <h3 className="font-display font-bold text-ink-900 mb-6">Booking Trends</h3>
          {chartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 15, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '8px 12px' }}
                  />
                  <Bar dataKey="bookings" fill="#006837" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-72 text-ink-600 text-sm">No trend data available</div>
          )}
        </div>

        <div className="card-premium p-6">
          <h3 className="font-display font-bold text-ink-900 mb-6">Revenue Trends</h3>
          {chartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 15, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '8px 12px' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#F5A623" strokeWidth={2} dot={{ fill: '#F5A623', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-72 text-ink-600 text-sm">No revenue data available</div>
          )}
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card-premium overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="font-display font-bold text-ink-900">Detailed Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="gradient-brand">
                  {['Period', 'Bookings', 'Revenue'].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-display font-semibold text-white/90 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {chartData.map((item, i) => (
                  <tr key={i} className="hover:bg-brand-50/30 transition-colors">
                     <td className="px-6 py-4 text-sm font-display font-semibold text-ink-900">{item.period}</td>
                    <td className="px-6 py-4 text-sm text-ink-600">{item.bookings}</td>
                    <td className="px-6 py-4 text-sm text-ink-600">PKR {item.revenue?.toLocaleString() || 0}</td>
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
