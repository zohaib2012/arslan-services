import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const phone = location.state?.phone || '';
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleChange = (i, val) => {
    const v = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) inputsRef.current[i + 1]?.focus();
    if (next.every((d) => d)) verify(next.join(''));
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };

  const verify = async (otp) => {
    if (!phone) {
      toast.error('Phone number missing. Please go back.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://187.127.218.111/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid OTP');
      localStorage.setItem('authToken', data.accessToken);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      const role = data.user?.role;
      if (role === 'WORKER') navigate('/worker/dashboard');
      else if (role === 'ADMIN' || role === 'SUPER_ADMIN') navigate('/admin/dashboard');
      else navigate('/');
      toast.success('Phone verified!');
    } catch (err) {
      toast.error(err.message || 'Verification failed');
      setDigits(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (countdown > 0) return;
    setCountdown(30);
    try {
      await fetch('http://187.127.218.111/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      toast.success('OTP resent!');
    } catch {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
            <ShieldCheck className="text-brand-600" size={32} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Verify Your Phone</h1>
          <p className="text-sm text-gray-500 mt-2 text-center">
            We sent a 6-digit code to <span className="font-medium text-gray-700">{phone || 'your phone'}</span>
          </p>
        </div>

        <div className="flex justify-center gap-2.5 mb-6">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          ))}
        </div>

        {loading && (
          <div className="flex justify-center mb-4">
            <Loader2 className="animate-spin text-brand-600" size={24} />
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          {countdown > 0 ? (
            <span>Resend in 0:{String(countdown).padStart(2, '0')}</span>
          ) : (
            <button onClick={resend} className="flex items-center gap-1.5 font-medium text-brand-600 hover:text-brand-700">
              <RefreshCw size={14} /> Resend Code
            </button>
          )}
        </div>

        <Link to="/auth/login" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-6">
          ← Back to login
        </Link>
      </div>
    </div>
  );
}
