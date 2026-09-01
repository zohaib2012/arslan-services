import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, UserPlus, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, guestLogin } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);

  const handleGuest = async (e) => {
    e.preventDefault();
    setGuestLoading(true);
    try {
      await guestLogin(guestName.trim() || 'Guest');
      toast.success(`Welcome, ${guestName.trim() || 'Guest'}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not continue as guest');
    } finally {
      setGuestLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const data = await login(identifier.trim(), password);
      const role = data.user?.role;
      if (role === 'WORKER') navigate('/worker/dashboard');
      else if (role === 'ADMIN' || role === 'SUPER_ADMIN') navigate('/admin/dashboard');
      else navigate('/');
      toast.success('Welcome back!');
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('email OTP') || msg.includes('Admins must verify')) {
        navigate(`/admin/login?email=${encodeURIComponent(identifier.trim())}`);
        toast('Admin login needs OTP verification — redirected', { icon: '🔐' });
        return;
      }
      toast.error(msg || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 0, transparent 40%), radial-gradient(circle at 80% 70%, white 0, transparent 35%)' }} />
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-16 text-white">
          <div className="w-48 rounded-2xl bg-white shadow-2xl p-3 mb-8">
            <img src="/icons/logo.png" alt="Easy service" className="w-full h-auto" />
          </div>
          <h2 className="text-3xl font-bold text-center leading-tight">
            Find Trusted Home Service Professionals
          </h2>
          <p className="text-emerald-100/70 text-center mt-4 max-w-md">
            From plumbing to cleaning — verified workers at your doorstep. Manage bookings, chat in realtime, and more.
          </p>
          <div className="grid grid-cols-3 gap-6 mt-12 text-center">
            {[
              { num: '500+', label: 'Workers' },
              { num: '10K+', label: 'Bookings' },
              { num: '4.8', label: 'Avg Rating' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-emerald-300">{s.num}</p>
                <p className="text-xs text-emerald-100/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-5 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-brand-700 transition-colors"
        >
          <ChevronLeft size={20} /> Back
        </button>
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-44 rounded-xl bg-white shadow p-2.5">
              <img src="/icons/logo.png" alt="Easy service" className="w-full h-auto" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1 mb-8">Sign in to continue to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                <label htmlFor="remember" className="text-sm text-gray-600">Remember me</label>
              </div>
              <Link to="/auth/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold shadow-lg shadow-brand-600/25 hover:from-brand-700 hover:to-brand-800 transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {showGuestForm ? (
            <form onSubmit={handleGuest} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your name (Guest)</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Ali"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">You can browse and book services without an account.</p>
              </div>
              <button
                type="submit"
                disabled={guestLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all disabled:opacity-60"
              >
                {guestLoading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                {guestLoading ? 'Setting up...' : 'Continue as Guest'}
              </button>
              <button
                type="button"
                onClick={() => setShowGuestForm(false)}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                Back to sign in
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowGuestForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 font-semibold hover:border-brand-400 hover:text-brand-700 transition-all"
            >
              <UserPlus size={18} />
              Continue as Guest
            </button>
          )}

          <p className="text-center text-sm text-gray-500 mt-8">
            Don't have an account?{' '}
            <Link to="/auth/register" className="font-medium text-brand-600 hover:text-brand-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
