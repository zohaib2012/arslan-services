import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import CustomerLayout from './layouts/CustomerLayout';
import CustomerDashboardLayout from './layouts/CustomerDashboardLayout';
import WorkerLayout from './layouts/WorkerLayout';
import AdminLayout from './layouts/AdminLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OtpPage from './pages/auth/OtpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import RoleSelectionPage from './pages/auth/RoleSelectionPage';
import AdminLogin from './pages/admin/Login';

import LandingPage from './pages/website/LandingPage';
import SearchPage from './pages/website/SearchPage';
import AiSearchPage from './pages/website/AiSearchPage';
import NearbyWorkersPage from './pages/website/NearbyWorkersPage';
import WorkerDetailPage from './pages/website/WorkerDetailPage';
import CreateBookingPage from './pages/website/CreateBookingPage';

import CustomerDashboardHome from './pages/customer/DashboardHome';
import MyBookings from './pages/customer/MyBookings';
import BookingDetail from './pages/customer/BookingDetail';
import CustomerChatList from './pages/customer/ChatList';
import CustomerChat from './pages/customer/Chat';
import MyDisputes from './pages/customer/MyDisputes';
import DisputeDetail from './pages/customer/DisputeDetail';
import CreateDispute from './pages/customer/CreateDispute';
import Favorites from './pages/customer/Favorites';
import Notifications from './pages/customer/Notifications';
import Profile from './pages/customer/Profile';
import EditProfile from './pages/customer/EditProfile';
import ChangePassword from './pages/customer/ChangePassword';
import WriteReview from './pages/customer/WriteReview';
import BlockedWorkers from './pages/customer/BlockedWorkers';

import WorkerDashboardHome from './pages/worker/DashboardHome';
import BookingRequests from './pages/worker/BookingRequests';
import RequestDetail from './pages/worker/RequestDetail';
import MyJobs from './pages/worker/MyJobs';
import JobDetail from './pages/worker/JobDetail';
import WorkerChatList from './pages/worker/ChatList';
import WorkerChat from './pages/worker/Chat';
import WorkerProfile from './pages/worker/WorkerProfile';
import WorkerEditProfile from './pages/worker/WorkerEditProfile';
import CnicVerification from './pages/worker/CnicVerification';
import Portfolio from './pages/worker/Portfolio';
import ServicesSelection from './pages/worker/ServicesSelection';
import ServiceAreas from './pages/worker/ServiceAreas';
import WorkingHours from './pages/worker/WorkingHours';
import PaymentMethods from './pages/worker/PaymentMethods';
import WorkerDisputes from './pages/worker/WorkerDisputes';
import WorkerDisputeDetail from './pages/worker/WorkerDisputeDetail';
import WorkerNotifications from './pages/worker/Notifications';

import AdminDashboard from './pages/admin/Dashboard';
import CustomersList from './pages/admin/CustomersList';
import WorkersList from './pages/admin/WorkersList';
import PendingVerification from './pages/admin/PendingVerification';
import BookingsList from './pages/admin/BookingsList';
import CategoriesList from './pages/admin/CategoriesList';
import ServicesList from './pages/admin/ServicesList';
import DisputesList from './pages/admin/DisputesList';
import BannersList from './pages/admin/BannersList';
import SendNotification from './pages/admin/SendNotification';
import Analytics from './pages/admin/Analytics';
import Reports from './pages/admin/Reports';
import ActivityLogs from './pages/admin/ActivityLogs';
import Roles from './pages/admin/Roles';
import Settings from './pages/admin/Settings';
import SupportTickets from './pages/admin/SupportTickets';

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-700"></div>
    </div>
  );
}

function roleHome(user) {
  if (!user) return '/';
  const role = user.role;
  if (role === 'WORKER') return '/worker/dashboard';
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') return '/admin/dashboard';
  return '/';
}

function RequireRole({ role, children }) {
  const { isAuthenticated, loading, isCustomer, isWorker, isAdmin } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  let ok = false;
  if (role === 'admin') ok = isAdmin;
  else if (role === 'worker') ok = isWorker;
  else if (role === 'customer') ok = isCustomer;
  if (!ok) return <Navigate to="/" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to={roleHome(user)} replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/auth/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
          <Route path="/auth/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
          <Route path="/auth/otp" element={<PublicOnly><OtpPage /></PublicOnly>} />
          <Route path="/auth/forgot-password" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />
          <Route path="/auth/role" element={<PublicOnly><RoleSelectionPage /></PublicOnly>} />
          <Route path="/admin/login" element={<PublicOnly><AdminLogin /></PublicOnly>} />

          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="ai-search" element={<AiSearchPage />} />
            <Route path="workers/nearby" element={<NearbyWorkersPage />} />
            <Route path="workers/:id" element={<WorkerDetailPage />} />
            <Route path="book" element={<CreateBookingPage />} />
          </Route>

          <Route path="/admin" element={<RequireRole role="admin"><AdminLayout /></RequireRole>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="customers" element={<CustomersList />} />
            <Route path="workers" element={<WorkersList />} />
            <Route path="workers/pending" element={<PendingVerification />} />
            <Route path="bookings" element={<BookingsList />} />
            <Route path="categories" element={<CategoriesList />} />
            <Route path="services" element={<ServicesList />} />
            <Route path="disputes" element={<DisputesList />} />
            <Route path="banners" element={<BannersList />} />
            <Route path="notifications" element={<SendNotification />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
            <Route path="roles" element={<Roles />} />
            <Route path="settings" element={<Settings />} />
            <Route path="support-tickets" element={<SupportTickets />} />
          </Route>

          <Route path="/dashboard" element={<RequireRole role="customer"><CustomerDashboardLayout /></RequireRole>}>
            <Route index element={<CustomerDashboardHome />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="chat-list" element={<CustomerChatList />} />
            <Route path="chat/:partnerId" element={<CustomerChat />} />
            <Route path="disputes" element={<MyDisputes />} />
            <Route path="disputes/new" element={<CreateDispute />} />
            <Route path="disputes/:id" element={<DisputeDetail />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/edit" element={<EditProfile />} />
            <Route path="password" element={<ChangePassword />} />
            <Route path="review/:bookingId" element={<WriteReview />} />
            <Route path="blocked-workers" element={<BlockedWorkers />} />
          </Route>

          <Route path="/worker" element={<RequireRole role="worker"><WorkerLayout /></RequireRole>}>
            <Route index element={<Navigate to="/worker/dashboard" replace />} />
            <Route path="dashboard" element={<WorkerDashboardHome />} />
            <Route path="requests" element={<BookingRequests />} />
            <Route path="requests/:id" element={<RequestDetail />} />
            <Route path="jobs" element={<MyJobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="chat" element={<WorkerChatList />} />
            <Route path="chat/:partnerId" element={<WorkerChat />} />
            <Route path="profile" element={<WorkerProfile />} />
            <Route path="profile/edit" element={<WorkerEditProfile />} />
            <Route path="verification" element={<CnicVerification />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="services" element={<ServicesSelection />} />
            <Route path="areas" element={<ServiceAreas />} />
            <Route path="hours" element={<WorkingHours />} />
            <Route path="payments" element={<PaymentMethods />} />
            <Route path="disputes" element={<WorkerDisputes />} />
            <Route path="disputes/:id" element={<WorkerDisputeDetail />} />
            <Route path="notifications" element={<WorkerNotifications />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
