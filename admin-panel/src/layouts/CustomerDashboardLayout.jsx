import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Calendar, MessageSquare, Heart, AlertTriangle,
  Bell, User, Ban, LogOut, Menu, X, ChevronDown, Home, Wrench,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const menuGroups = [
  {
    label: 'Main',
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    ],
  },
  {
    label: 'Bookings',
    items: [
      { path: '/dashboard/bookings', icon: Calendar, label: 'My Bookings' },
      { path: '/dashboard/chat-list', icon: MessageSquare, label: 'Messages' },
    ],
  },
  {
    label: 'Account',
    items: [
      { path: '/dashboard/favorites', icon: Heart, label: 'Favorites' },
      { path: '/dashboard/disputes', icon: AlertTriangle, label: 'Disputes' },
      { path: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
      { path: '/dashboard/blocked-workers', icon: Ban, label: 'Blocked Workers' },
      { path: '/dashboard/profile', icon: User, label: 'Profile' },
    ],
  },
];

const mobileTabs = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
  { path: '/dashboard/chat-list', label: 'Chat', icon: MessageSquare },
  { path: '/dashboard', label: 'Profile', icon: User, exact: true },
];

export default function CustomerDashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isMobileTabActive = (tab) => {
    if (tab.exact) return location.pathname === tab.path;
    return location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
  };

  return (
    <div className="flex h-screen bg-[#F6F9F7]">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-brand-800 via-brand-700 to-brand-900 shadow-2xl transform transition-all duration-300 lg:translate-x-0 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Wrench className="text-emerald-300" size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Easy service</h1>
              <p className="text-[10px] text-emerald-300/80 font-medium uppercase tracking-widest">Customer Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-6 overflow-y-auto flex-1 min-h-0">
          {menuGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300/50 mb-2 px-3">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ path, icon: Icon, label, exact }) => (
                  <NavLink
                    key={path}
                    to={path}
                    end={exact}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(path, exact)
                        ? 'bg-white/15 text-white shadow-lg shadow-black/10'
                        : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} className={`shrink-0 ${isActive(path, exact) ? 'text-emerald-300' : ''}`} />
                    <span>{label}</span>
                    {isActive(path, exact) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 p-4 border-t border-white/10 bg-brand-800/50 backdrop-blur-sm">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-emerald-100/70 hover:text-white hover:bg-white/5 transition-all mb-1"
          >
            <Home size={18} /> View Website
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-red-300/70 hover:text-red-300 hover:bg-white/5 transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className={`sticky top-0 z-10 h-16 flex items-center justify-between px-4 lg:px-6 transition-colors ${
          scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-sm' : 'bg-transparent lg:bg-white/80'
        }`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700 p-1">
              <Menu size={22} />
            </button>
            <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400">
              <span className="text-gray-600 font-medium capitalize">
                {location.pathname.split('/').filter(Boolean).join(' / ') || 'Dashboard'}
              </span>
            </div>
            <h1 className="lg:hidden font-display font-bold text-ink-900">Customer Panel</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/notifications')}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-brand-600/20">
                  {(user?.fullName || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-700 leading-tight">{user?.fullName || 'Customer'}</p>
                  <p className="text-xs text-gray-400">{user?.email || user?.phone || 'Customer'}</p>
                </div>
                <ChevronDown size={14} className={`hidden sm:block text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
                    <p className="text-xs text-gray-400">{user?.email || user?.phone}</p>
                  </div>
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate('/dashboard/profile'); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User size={16} /> My Profile
                  </button>
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate('/'); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Home size={16} /> View Website
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8 pb-32 lg:pb-8">
          <div className="animate-fade-in max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile bottom tabs */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isMobileTabActive(tab);
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
