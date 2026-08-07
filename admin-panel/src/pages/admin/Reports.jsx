import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { FileText, Download, Users, TrendingUp, Loader2 } from 'lucide-react';
import { PageHeader, StatCard } from '../../components';
import toast from 'react-hot-toast';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [bookingChart, setBookingChart] = useState([]);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userRes, bookingRes] = await Promise.all([
        api.get('/reports/users'),
        api.get('/reports/bookings'),
      ]);
      setUserStats(userRes.data);
      setBookingChart(bookingRes.data?.bookingTrends || bookingRes.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleDownload = async () => {
    try {
      const csv = [
        ['Metric', 'Value'],
        ['Total Customers', userStats?.totalCustomers || 0],
        ['Total Workers', userStats?.totalWorkers || 0],
        ['New Customers Today', userStats?.customersToday || 0],
        ['New Workers Today', userStats?.workersToday || 0],
      ].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', 'report.csv');
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch { toast.error('Download failed'); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader2 size={32} className="text-brand-600 animate-spin mb-3" />
      <p className="text-sm text-gray-400">Loading reports...</p>
    </div>
  );

  const maxCount = bookingChart.length > 0 ? Math.max(...bookingChart.map(b => b.count || b.bookings || 0), 1) : 1;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reports"
        subtitle="Export and analyze platform data"
      >
        <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 text-sm font-medium">
          <Download size={18} /> Export CSV
        </button>
      </PageHeader>

      {userStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          <StatCard icon={Users} label="Total Customers" value={userStats.totalCustomers?.toLocaleString() || 0} color="blue" />
          <StatCard icon={Users} label="Total Workers" value={userStats.totalWorkers?.toLocaleString() || 0} color="purple" />
          <StatCard icon={TrendingUp} label="New Customers Today" value={userStats.customersToday || 0} color="emerald" />
          <StatCard icon={TrendingUp} label="New Workers Today" value={userStats.workersToday || 0} color="amber" />
        </div>
      )}

      {bookingChart.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-bold text-gray-800 mb-6">Booking Activity (Last {bookingChart.length} Days)</h3>
          <div className="flex items-end gap-2 h-48">
            {bookingChart.map((item) => {
              const count = item.count || item.bookings || 0;
              const height = (count / maxCount) * 100;
              return (
                <div key={item.date || item.period} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <span className="text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>
                  <div
                    className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-lg transition-all duration-300 group-hover:from-brand-500 group-hover:to-brand-300 cursor-pointer"
                    style={{ height: `${Math.max(height, count > 0 ? 4 : 0)}%`, minHeight: count > 0 ? '4px' : '0' }}
                  />
                  <span className="text-xs text-gray-400">{(item.date || item.period || '').slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center">
          <FileText size={48} className="text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">No report data available</p>
        </div>
      )}
    </div>
  );
}
