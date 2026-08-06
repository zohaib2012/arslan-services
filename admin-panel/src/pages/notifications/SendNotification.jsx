import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Send, Bell, MessageSquare, Users2 } from 'lucide-react';
import { PageHeader } from '../../components';

export default function SendNotification() {
  const [form, setForm] = useState({ title: '', body: '', audience: 'CUSTOMER' });
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!form.title || !form.body) return toast.error('Title and body are required');
    setSending(true);
    try {
      await api.post('/notifications/send', { title: form.title, body: form.body, sendToAll: true, audience: form.audience });
      toast.success('Notification sent successfully!');
      setForm({ title: '', body: '', audience: 'CUSTOMER' });
    } catch { toast.error('Failed to send notification'); }
    finally { setSending(false); }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Send Notification"
        subtitle="Send push notifications to platform users"
      />

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 shadow-lg shadow-brand-600/20">
              <Bell className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">New Push Notification</h3>
              <p className="text-xs text-gray-400">This will be sent to all selected users</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notification Title</label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  placeholder="e.g. Special Offer Available!"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notification Body</label>
              <textarea
                placeholder="Write your notification message..."
                value={form.body}
                onChange={e => setForm({...form, body: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm resize-none transition-all"
                rows={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Audience</label>
              <div className="relative">
                <Users2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={form.audience}
                  onChange={e => setForm({...form, audience: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm bg-white appearance-none transition-all"
                >
                  <option value="CUSTOMER">All Customers</option>
                  <option value="WORKER">All Workers</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all disabled:opacity-60 shadow-lg shadow-brand-600/20 text-sm font-medium"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {sending ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
