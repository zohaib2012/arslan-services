import { useState } from 'react';
import { X, Send, Phone, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { WhatsAppIcon } from './BrandIcons';

const WHATSAPP_LINK = `https://wa.me/923001234567?text=${encodeURIComponent('Hi, I need help with Easyservice.')}`;

export default function SupportButton() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast.error('Please fill all fields.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/support-tickets', {
        subject: `Support request from ${form.name.trim()}`,
        description: form.message.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
      });
      toast.success('Message sent! Our support team will contact you shortly.');
      setForm({ name: '', phone: '', message: '' });
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-[0_8px_30px_rgba(37,211,102,0.4)] flex items-center justify-center hover:brightness-110 transition-all active:scale-90 animate-glow-pulse"
        aria-label="Contact support"
      >
        <WhatsAppIcon size={26} />
      </button>

      {/* Support modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white w-full sm:w-[420px] sm:rounded-3xl rounded-t-3xl shadow-2xl p-5 sm:p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-ink-900">Contact Support</h3>
                <p className="text-xs text-gray-500">Need help? We'll recommend the best worker for you.</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Ali Khan"
                  className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone / WhatsApp</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="03XX XXXXXXX"
                  className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">What service do you need?</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g. I need an AC technician in DHA Lahore"
                  className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl gradient-brand text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-3 text-sm text-gray-600">
              <a href="tel:+923001234567" className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline">
                <Phone size={14} className="text-brand-600" /> +92 300 1234567
              </a>
              <span className="text-gray-300">|</span>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-[#128C7E] hover:underline">
                <WhatsAppIcon size={14} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
