import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Seo from '../components/Seo';
import {
  LayoutDashboard, Users, Briefcase, Calendar, FolderTree,
  AlertTriangle, Image, Bell, LogOut, Menu, X, TrendingUp, FileText,
  Activity, Shield, Settings, MessageSquare, ChevronDown,
  UserCircle, Wrench
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const menuGroups = [
  {
    label: 'Main',
    items: [
      { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Management',
    items: [
      { path: '/admin/customers', icon: Users, label: 'Customers' },
      { path: '/admin/workers', icon: Briefcase, label: 'Workers' },
      { path: '/admin/workers/pending', icon: UserCircle, label: 'Verification' },
      { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    ],
  },
  {
    label: 'Content',
    items: [
      { path: '/admin/categories', icon: FolderTree, label: 'Categories' },
      { path: '/admin/services', icon: Wrench, label: 'Services' },
      { path: '/admin/banners', icon: Image, label: 'Banners' },
      { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { path: '/admin/analytics', icon: TrendingUp, label: 'Analytics' },
      { path: '/admin/reports', icon: FileText, label: 'Reports' },
      { path: '/admin/activity-logs', icon: Activity, label: 'Activity Logs' },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/admin/disputes', icon: AlertTriangle, label: 'Disputes' },
      { path: '/admin/roles', icon: Shield, label: 'Roles' },
      { path: '/admin/support-tickets', icon: MessageSquare, label: 'Support' },
      { path: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path) => {
    if (location.pathname === '/admin/workers/pending') return path === '/admin/workers/pending';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="flex h-screen bg-[#F6F9F7]">
      <Seo noindex />
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-brand-800 via-brand-700 to-brand-900 shadow-2xl transform transition-all duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/icons/logo.png" alt="Easyservice" className="h-9 w-auto object-contain" />
            <div>
              <p className="text-[10px] text-emerald-300/80 font-medium uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-6 overflow-y-auto pb-24" style={{ height: 'calc(100% - 4rem)' }}>
          {menuGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300/50 mb-2 px-3">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ path, icon: Icon, label }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive(path)
                        ? 'bg-white/15 text-white shadow-lg shadow-black/10'
                        : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} className={`shrink-0 ${isActive(path) ? 'text-emerald-300' : ''}`} />
                    <span>{label}</span>
                    {isActive(path) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-brand-800/50 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-red-300/70 hover:text-red-300 hover:bg-white/5 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
              <Menu size={22} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
              <span className="text-gray-600 font-medium capitalize">
                {location.pathname.split('/').filter(Boolean).join(' / ') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={18} />
            </button>
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-brand-600/20">
                  {(user?.fullName || user?.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-700 leading-tight">{user?.fullName || user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-400">{user?.email || user?.role || 'Administrator'}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-scale-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700">{user?.fullName || user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-400">{user?.email || 'admin@arslan.com'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
