import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Bell, BellOff, Loader2 } from 'lucide-react';

const typeStyles = {
  BOOKING_UPDATE: 'bg-brand-50 text-brand-700',
  CHAT_MESSAGE: 'bg-blue-50 text-blue-700',
  PROMOTION: 'bg-amber-50 text-amber-700',
  DISPUTE_UPDATE: 'bg-orange-50 text-orange-700',
  VERIFICATION_UPDATE: 'bg-emerald-50 text-emerald-700',
};

export default function WorkerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/notifications', { params: { page: 1, limit: 50 } });
      setNotifications(res.data?.notifications || res.data || []);
    } catch (err) {
      console.error(err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-sm font-semibold text-brand-700 hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-600" size={28} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <BellOff className="mx-auto text-gray-300 mb-3" size={40} />
          <h3 className="font-semibold text-ink-900">No notifications</h3>
          <p className="text-sm text-gray-400 mt-1">You're all caught up.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.isRead && markRead(n.id)}
              className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl border transition-colors ${
                n.isRead ? 'bg-white border-gray-100' : 'bg-brand-50/60 border-brand-100'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeStyles[n.type] || 'bg-gray-100 text-gray-500'}`}>
                <Bell size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                <p className="text-[11px] text-gray-400 mt-1.5">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0 mt-1.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
