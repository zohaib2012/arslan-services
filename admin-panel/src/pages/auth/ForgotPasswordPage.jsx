import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Please enter your email or phone');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('https://easyservice.tech/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      setSent(true);
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-emerald-600" size={32} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Check Your Inbox</h1>
            <p className="text-sm text-gray-500 mt-2">
              We've sent a password reset link to your email. Please follow the instructions in the email.
            </p>
            <Link to="/auth/login" className="inline-block mt-6 px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Forgot Password</h1>
            <p className="text-sm text-gray-500 mb-6">
              Enter your email or phone number and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email or Phone</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@example.com or +923001234567"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold shadow-lg shadow-brand-600/25 hover:from-brand-700 hover:to-brand-800 transition-all disabled:opacity-60"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Send Reset Link'}
              </button>
            </form>
            <Link to="/auth/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mt-6">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
