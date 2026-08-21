import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { MessageSquare, Loader2 } from 'lucide-react';
import BackButton from '../../components/BackButton';

export default function ChatList() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/chat/conversations');
        setConversations(res.data || []);
      } catch (err) {
        console.error(err);
        setConversations([]);
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

  return (
    <div className="animate-fade-in">
      <BackButton to="/dashboard" className="mb-4" />
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-6">Messages</h1>
      {conversations.length === 0 ? (
        <div className="text-center py-20 card-premium rounded-2xl">
          <MessageSquare className="mx-auto text-gray-300 mb-3" size={40} />
          <h3 className="font-display font-semibold text-ink-900">No conversations yet</h3>
          <p className="text-sm text-gray-400 mt-1">Start chatting with a professional after booking.</p>
        </div>
      ) : (
        <div className="card-premium rounded-2xl overflow-hidden divide-y divide-gray-50">
          {conversations.map((c) => {
            const partner = c.partner;
            const lastMsg = c.lastMessage;
            return (
              <Link
                key={partner?.id || c.partner_id}
                to={`/dashboard/chat/${partner?.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors"
              >
                {partner?.profilePhoto ? (
                  <img src={partner.profilePhoto} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 font-bold">
                    {(partner?.fullName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink-900 truncate">{partner?.fullName}</p>
                    {c.lastMessageAt && <span className="text-xs text-gray-400 shrink-0">{new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-sm text-gray-500 truncate">{lastMsg || 'No messages yet'}</p>
                    {c.unreadCount > 0 && (
                      <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-brand-600 text-white text-[11px] font-bold flex items-center justify-center">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
