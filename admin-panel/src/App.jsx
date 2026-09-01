import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getBrowserLocation, setStoredLocation } from './lib/location';
import { Toaster } from 'react-hot-toast';

import CustomerLayout from './layouts/CustomerLayout';
import CustomerDashboardLayout from './layouts/CustomerDashboardLayout';
import WorkerLayout from './layouts/WorkerLayout';
import AdminLayout from './layouts/AdminLayout';

// Public / website pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const OtpPage = lazy(() => import('./pages/auth/OtpPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const RoleSelectionPage = lazy(() => import('./pages/auth/RoleSelectionPage'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));

const LandingPage = lazy(() => import('./pages/website/LandingPage'));
const SearchPage = lazy(() => import('./pages/website/SearchPage'));
const AiSearchPage = lazy(() => import('./pages/website/AiSearchPage'));
const NearbyWorkersPage = lazy(() => import('./pages/website/NearbyWorkersPage'));
const WorkerDetailPage = lazy(() => import('./pages/website/WorkerDetailPage'));
const CreateBookingPage = lazy(() => import('./pages/website/CreateBookingPage'));
const AboutUs = lazy(() => import('./pages/website/AboutUs'));
const ContactUs = lazy(() => import('./pages/website/ContactUs'));
const TermsAndConditions = lazy(() => import('./pages/website/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('./pages/website/PrivacyPolicy'));

// Customer pages
const CustomerDashboardHome = lazy(() => import('./pages/customer/DashboardHome'));
const MyBookings = lazy(() => import('./pages/customer/MyBookings'));
const BookingDetail = lazy(() => import('./pages/customer/BookingDetail'));
const CustomerChatList = lazy(() => import('./pages/customer/ChatList'));
const CustomerChat = lazy(() => import('./pages/customer/Chat'));
const MyDisputes = lazy(() => import('./pages/customer/MyDisputes'));
const DisputeDetail = lazy(() => import('./pages/customer/DisputeDetail'));
const CreateDispute = lazy(() => import('./pages/customer/CreateDispute'));
const Favorites = lazy(() => import('./pages/customer/Favorites'));
const Notifications = lazy(() => import('./pages/customer/Notifications'));
const Profile = lazy(() => import('./pages/customer/Profile'));
const EditProfile = lazy(() => import('./pages/customer/EditProfile'));
const ChangePassword = lazy(() => import('./pages/customer/ChangePassword'));
const WriteReview = lazy(() => import('./pages/customer/WriteReview'));
const BlockedWorkers = lazy(() => import('./pages/customer/BlockedWorkers'));

// Worker pages
const WorkerDashboardHome = lazy(() => import('./pages/worker/DashboardHome'));
const BookingRequests = lazy(() => import('./pages/worker/BookingRequests'));
const RequestDetail = lazy(() => import('./pages/worker/RequestDetail'));
const MyJobs = lazy(() => import('./pages/worker/MyJobs'));
const JobDetail = lazy(() => import('./pages/worker/JobDetail'));
const WorkerChatList = lazy(() => import('./pages/worker/ChatList'));
const WorkerChat = lazy(() => import('./pages/worker/Chat'));
const WorkerProfile = lazy(() => import('./pages/worker/WorkerProfile'));
const WorkerEditProfile = lazy(() => import('./pages/worker/WorkerEditProfile'));
const CnicVerification = lazy(() => import('./pages/worker/CnicVerification'));
const Portfolio = lazy(() => import('./pages/worker/Portfolio'));
const ServicesSelection = lazy(() => import('./pages/worker/ServicesSelection'));
const ServiceAreas = lazy(() => import('./pages/worker/ServiceAreas'));
const WorkingHours = lazy(() => import('./pages/worker/WorkingHours'));
const PaymentMethods = lazy(() => import('./pages/worker/PaymentMethods'));
const WorkerDisputes = lazy(() => import('./pages/worker/WorkerDisputes'));
const WorkerDisputeDetail = lazy(() => import('./pages/worker/WorkerDisputeDetail'));
const WorkerNotifications = lazy(() => import('./pages/worker/Notifications'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const CustomersList = lazy(() => import('./pages/admin/CustomersList'));
const WorkersList = lazy(() => import('./pages/admin/WorkersList'));
const PendingVerification = lazy(() => import('./pages/admin/PendingVerification'));
const BookingsList = lazy(() => import('./pages/admin/BookingsList'));
const CategoriesList = lazy(() => import('./pages/admin/CategoriesList'));
const ServicesList = lazy(() => import('./pages/admin/ServicesList'));
const DisputesList = lazy(() => import('./pages/admin/DisputesList'));
const BannersList = lazy(() => import('./pages/admin/BannersList'));
const SendNotification = lazy(() => import('./pages/admin/SendNotification'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const ActivityLogs = lazy(() => import('./pages/admin/ActivityLogs'));
const Roles = lazy(() => import('./pages/admin/Roles'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const SupportTickets = lazy(() => import('./pages/admin/SupportTickets'));

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow animate-pulse">
          <img src="/icons/logo.png" alt="Easy service" className="w-8 h-8 object-contain" />
        </div>
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-600/30 border-t-brand-600"></div>
      </div>
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
  useEffect(() => {
    getBrowserLocation().then((loc) => {
      if (loc) setStoredLocation(loc);
    });
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/auth/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
            <Route path="/auth/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
            <Route path="/auth/otp" element={<PublicOnly><OtpPage /></PublicOnly>} />
            <Route path="/auth/forgot-password" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />
            <Route path="/auth/role" element={<PublicOnly><RoleSelectionPage /></PublicOnly>} />
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="/" element={<CustomerLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="ai-search" element={<AiSearchPage />} />
              <Route path="workers/nearby" element={<NearbyWorkersPage />} />
              <Route path="workers/:id" element={<WorkerDetailPage />} />
              <Route path="book" element={<CreateBookingPage />} />
              <Route path="about" element={<AboutUs />} />
              <Route path="contact" element={<ContactUs />} />
              <Route path="terms" element={<TermsAndConditions />} />
              <Route path="privacy" element={<PrivacyPolicy />} />
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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
