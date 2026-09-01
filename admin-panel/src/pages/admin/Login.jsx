import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, Mail, Lock, Eye, EyeOff, ShieldCheck, KeyRound, ArrowRight, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

export default function Login() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(searchParams.get('otpSent') === '1' ? 'otp' : 'email'); // email | otp
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { adminOtpLogin, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const startCooldown = () => {
    setCooldown(30);
    const t = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (searchParams.get('otpSent') === '1') startCooldown();
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/admin/request-otp', { email, password });
      toast.success(res.data?.message || 'OTP sent to your email');
      setStep('otp');
      startCooldown();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 4) {
      toast.error('Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      const data = await adminOtpLogin(email, otp.trim());
      toast.success('Verified! Welcome to the admin panel');
      const role = data.user?.role;
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') navigate('/admin/dashboard');
      else if (role === 'WORKER') navigate('/worker/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative flex flex-col justify-center px-16">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-8 backdrop-blur-sm">
            <Building2 className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Easyservice
          </h1>
          <p className="text-emerald-200/80 text-lg leading-relaxed max-w-md">
            Complete home services marketplace platform. Manage customers, workers, bookings, and more from one dashboard.
          </p>
          <div className="mt-12 space-y-4">
            {[
              { label: 'Customer Management', desc: 'Manage all platform users' },
              { label: 'Worker Verification', desc: 'Verify and oversee workers' },
              { label: 'Booking Oversight', desc: 'Track all service bookings' },
              { label: 'Analytics & Reports', desc: 'Data-driven insights' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <div>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-emerald-300/60 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="lg:hidden w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-600/20">
              <Building2 className="text-white" size={28} />
            </div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <ShieldCheck size={14} /> Secured with Email OTP
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {step === 'email' ? 'Admin Sign In' : 'Verify OTP'}
            </h2>
            <p className="text-gray-400 mt-1 text-sm">
              {step === 'email'
                ? 'Enter your admin email to receive a one-time code'
                : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    placeholder="admin@easyservice.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm transition-all bg-gray-50/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm transition-all bg-gray-50/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-semibold hover:from-brand-700 hover:to-brand-800 transition-all disabled:opacity-60 shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>Send OTP <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">One-Time Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit code"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 outline-none text-sm tracking-[0.35em] transition-all bg-gray-50/50 text-center font-bold text-lg"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-semibold hover:from-brand-700 hover:to-brand-800 transition-all disabled:opacity-60 shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>Verify & Access <ArrowRight size={18} /></>
                )}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(''); }}
                  className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 font-medium"
                >
                  <ArrowLeft size={14} /> Change email
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={cooldown > 0 || loading}
                  className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={14} className={cooldown > 0 ? '' : ''} />
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {isAuthenticated && isAdmin && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="text-sm text-brand-700 hover:text-brand-800 font-semibold inline-flex items-center gap-1"
              >
                Already signed in? Go to Dashboard <ArrowRight size={14} />
              </button>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-8">
            &copy; 2026 Easyservice. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
