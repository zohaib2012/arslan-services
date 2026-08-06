import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import CustomersList from './pages/customers/CustomersList';
import WorkersList from './pages/workers/WorkersList';
import PendingVerification from './pages/workers/PendingVerification';
import BookingsList from './pages/bookings/BookingsList';
import CategoriesList from './pages/categories/CategoriesList';
import ServicesList from './pages/services/ServicesList';
import DisputesList from './pages/disputes/DisputesList';
import BannersList from './pages/banners/BannersList';
import SendNotification from './pages/notifications/SendNotification';
import Analytics from './pages/analytics/Analytics';
import Reports from './pages/reports/Reports';
import ActivityLogs from './pages/activityLogs/ActivityLogs';
import Roles from './pages/roles/Roles';
import Settings from './pages/settings/Settings';
import SupportTickets from './pages/supportTickets/SupportTickets';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
