import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search, Menu, X, User, LogOut, Bell, Home, MessageCircle,
  Calendar, Sparkles,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import InstallPrompt from '../components/InstallPrompt';
import SupportButton from '../components/SupportButton';

const navItems = [
  { path: '/', label: 'Home', exact: true },
  { path: '/workers/nearby', label: 'Nearby Workers' },
  { path: '/ai-search', label: 'AI Assistant' },
];

const bottomTabs = [
  { path: '/', label: 'Home', icon: Home, exact: true },
  { path: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
  { path: '/ai-search', label: '', icon: Sparkles, center: true },
  { path: '/dashboard/chat-list', label: 'Chat', icon: MessageCircle },
  { path: '/dashboard', label: 'Profile', icon: User, exact: true },
];

export default function CustomerLayout({ isDashboard = false }) {
  const { user, isAuthenticated, isWorker, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const goToRoleHome = () => {
    if (isWorker) navigate('/worker/dashboard');
    else if (isAdmin) navigate('/admin/dashboard');
    else navigate('/dashboard');
  };

  const isBottomActive = (tab) => {
    if (tab.exact) return location.pathname === tab.path;
    return location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
  };

  const Logo = ({ dark = false }) => (
    <Link to="/" className="flex items-center">
      <img
        src="/icons/logo.png"
        alt="Easy service"
        className={`h-9 w-auto object-contain ${dark ? 'bg-white/90' : ''} rounded-lg p-0.5`}
      />
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#F6F9F7] flex flex-col md:bg-gray-50">
      <InstallPrompt />

      {/* Mobile app header */}
      <header className={`md:hidden sticky top-0 z-50 transition-all duration-200 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm' : 'bg-[#F6F9F7]'}`}>
        <div className="flex items-center justify-between h-16 px-4">
          <button className="p-2 -ml-2 text-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Logo />
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard/notifications' : '/auth/login')}
            className="relative p-2 -mr-2 text-gray-700"
          >
            <Bell size={22} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
        </div>

        {menuOpen && (
          <div className="absolute inset-x-0 top-16 bg-white border-b border-gray-100 shadow-lg px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-sm font-semibold ${
                    isActive ? 'text-brand-700 bg-brand-50' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <button onClick={() => { setMenuOpen(false); goToRoleHome(); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  My Dashboard
                </button>
                <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/auth/login" onClick={() => setMenuOpen(false)} className="flex-1 px-4 py-2.5 text-center text-sm font-semibold text-brand-700 border border-brand-200 rounded-xl">Login</Link>
                <Link to="/auth/register" onClick={() => setMenuOpen(false)} className="flex-1 px-4 py-2.5 text-center text-sm font-semibold text-white bg-brand-600 rounded-xl">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Desktop header */}
      <header className="hidden md:block sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Logo />

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'text-brand-700 bg-brand-50' : 'text-gray-600 hover:text-brand-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {isAuthenticated && (
                <button
                  onClick={goToRoleHome}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-brand-700 hover:bg-gray-50 transition-colors"
                >
                  {isWorker ? 'My Dashboard' : isAdmin ? 'Admin Panel' : 'My Account'}
                </button>
              )}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <form onSubmit={handleSearch} className="relative">
                <input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search workers..."
                  className="w-56 pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <Search className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
              </form>

              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {(user?.fullName || 'U').charAt(0).toUpperCase()}
                    </div>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 truncate">{user?.fullName}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email || user?.phone}</p>
                      </div>
                      <button
                        onClick={() => { setUserMenuOpen(false); navigate(isWorker ? '/worker/dashboard' : '/dashboard'); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Home size={15} /> Dashboard
                      </button>
                      <button
                        onClick={() => { setUserMenuOpen(false); navigate('/dashboard/notifications'); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Bell size={15} /> Notifications
                      </button>
                      <button
                        onClick={() => { setUserMenuOpen(false); navigate('/dashboard/profile'); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User size={15} /> Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1"
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/auth/login" className="px-4 py-2 text-sm font-medium text-brand-700 hover:text-brand-800">
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={`flex-1 ${isDashboard ? 'bg-gray-50' : ''}`}>
        <div className="max-w-7xl mx-auto w-full px-0 md:px-4 lg:px-6 pb-28 md:pb-0">
          <Outlet />
        </div>
      </main>

      {/* Desktop footer */}
      <footer className="hidden md:block bg-gradient-to-br from-brand-800 via-brand-900 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <img src="/icons/logo.png" alt="Easy service" className="h-9 w-auto object-contain" />
              </div>
              <p className="text-sm text-emerald-100/60 leading-relaxed">
                Pakistan's trusted home services marketplace. Verified professionals at your doorstep.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-300/80 uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm text-emerald-100/60">
                <li><Link to="/workers/nearby" className="hover:text-white transition-colors">Find Workers</Link></li>
                <li><Link to="/search" className="hover:text-white transition-colors">Search Services</Link></li>
                <li><Link to="/ai-search" className="hover:text-white transition-colors">AI Assistant</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-300/80 uppercase tracking-wider mb-4">For Workers</h4>
              <ul className="space-y-2.5 text-sm text-emerald-100/60">
                <li><Link to="/auth/register" className="hover:text-white transition-colors">Register as Worker</Link></li>
                <li><Link to="/worker/dashboard" className="hover:text-white transition-colors">Worker Dashboard</Link></li>
                <li><Link to="/auth/login" className="hover:text-white transition-colors">Worker Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-300/80 uppercase tracking-wider mb-4">Contact</h4>
              <ul className="space-y-2.5 text-sm text-emerald-100/60">
                <li>+92 300 1234567</li>
                <li>support@arslan.com</li>
                <li>Lahore, Pakistan</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-emerald-100/40">© {new Date().getFullYear()} Easy service. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-emerald-100/40">
              <Link to="/privacy" className="hover:text-emerald-300/60 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-emerald-300/60 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {location.pathname === '/' && <SupportButton />}

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-2">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isBottomActive(tab);
            if (tab.center) {
              return (
                <button
                  key={tab.path}
                  type="button"
                  onClick={() => navigate(tab.path)}
                  className="relative -top-5 flex flex-col items-center justify-center active:scale-95"
                >
                  <span className="w-14 h-14 rounded-full gradient-brand shadow-glow flex items-center justify-center text-white">
                    <Sparkles size={24} />
                  </span>
                </button>
              );
            }
            return (
              <button
                key={tab.path}
                type="button"
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center gap-1 min-w-[3.5rem] h-full py-1 rounded-xl transition-colors active:scale-95 ${
                  active ? 'text-brand-700' : 'text-gray-400'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
