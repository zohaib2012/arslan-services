import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { connectSocket, sendChatMessage, emitTyping, emitMessageRead, getCurrentUserId } from '../../lib/socket';
import { ChevronLeft, Send, Loader2, Paperclip } from 'lucide-react';

export default function WorkerChat() {
  const { partnerId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  const myId = user?.id || getCurrentUserId();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [partnerId]);

  useEffect(() => {
    setMessages([]);
    setLoading(true);
    setPartnerTyping(false);
    (async () => {
      try {
        const [msgRes, convRes] = await Promise.allSettled([
          api.get(`/chat/messages/${partnerId}`),
          api.get('/chat/conversations'),
        ]);
        if (msgRes.status === 'fulfilled') setMessages(msgRes.value.data?.messages || []);
        if (convRes.status === 'fulfilled') {
          const c = (convRes.value.data || []).find((x) => x.partner?.id === partnerId);
          if (c) setPartner(c.partner);
        }
        if (myId) emitMessageRead(partnerId);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId]);

  const onReceive = useCallback((msg) => {
    setMessages((prev) => {
      const exists = prev.some((m) => m.id === msg.id);
      if (exists) return prev;
      return [...prev, msg];
    });
    if (msg.senderId === partnerId) emitMessageRead(partnerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId]);

  const onTyping = useCallback((data) => {
    if (data.userId === partnerId) {
      setPartnerTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setPartnerTyping(false), 1500);
    }
  }, [partnerId]);

  useEffect(() => {
    const socket = connectSocket();
    socket.on('chat:receive', onReceive);
    socket.on('chat:typing', onTyping);
    socket.on('chat:message-read', () => {});
    return () => {
      socket.off('chat:receive', onReceive);
      socket.off('chat:typing', onTyping);
      clearTimeout(typingTimeout.current);
    };
  }, [onReceive, onTyping]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !partnerId) return;
    const socket = connectSocket();
    const payload = { receiverId: partnerId, bookingId: null, message: text, messageType: 'TEXT' };
    sendChatMessage(payload);
    const optimistic = {
      id: `temp-${Date.now()}`,
      senderId: myId,
      receiverId: partnerId,
      message: text,
      messageType: 'TEXT',
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    socket.emit('chat:typing', { receiverId: partnerId });
  };

  const handleTyping = () => {
    if (partnerId) emitTyping(partnerId);
  };

  const partnerName = partner?.fullName || 'Chat';

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link to="/worker/chat" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700 mb-4">
        <ChevronLeft size={15} /> All conversations
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: 420 }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          {partner?.profilePhoto ? (
            <img src={partner.profilePhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 font-bold">
              {(partnerName).charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{partnerName}</p>
            <p className="text-xs text-gray-400">{partnerTyping ? 'typing...' : 'Chat'}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50/50">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-brand-600" size={24} />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">Say hello to {partnerName}!</p>
          ) : (
            messages.map((m) => {
              const mine = m.senderId === myId;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      mine ? 'bg-brand-600 text-white rounded-br-md' : 'bg-white text-gray-700 border border-gray-100 rounded-bl-md'
                    }`}
                  >
                    <p>{m.message}</p>
                    <p className={`text-[10px] mt-1 ${mine ? 'text-emerald-100/70' : 'text-gray-400'}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {mine && (m.isRead ? ' · read' : '')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-gray-100 bg-white">
          <button type="button" className="p-2.5 text-gray-400 hover:text-brand-600 transition-colors">
            <Paperclip size={18} />
          </button>
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); handleTyping(); }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-40 transition-colors"
          >
            <Send size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}
