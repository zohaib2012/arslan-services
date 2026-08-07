import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wrench, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 0, transparent 40%), radial-gradient(circle at 80% 70%, white 0, transparent 35%)' }} />
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-16 text-white">
          <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center mb-8 shadow-2xl">
            <Wrench className="text-emerald-300" size={40} />
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

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center">
              <Wrench className="text-white" size={28} />
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

          <p className="text-center text-sm text-gray-500 mt-8">
            Don't have an account?{' '}
            <Link to="/auth/register" className="font-medium text-brand-600 hover:text-brand-700">
              Create one
            </Link>
          </p>
          <p className="text-center text-sm text-gray-400 mt-3">
            Are you an admin?{' '}
            <Link to="/auth/login" className="font-medium text-brand-600 hover:text-brand-700">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
