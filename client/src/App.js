import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Layout from './components/layout/Layout';
import LoadingScreen from './components/common/LoadingScreen';
import ProtectedRoute from './components/common/ProtectedRoute';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/Landing'));
const LoginPage = lazy(() => import('./pages/auth/Login'));
const RegisterPage = lazy(() => import('./pages/auth/Register'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));

// Dashboards
const DonorDashboard = lazy(() => import('./pages/donor/DonorDashboard'));
const ReceiverDashboard = lazy(() => import('./pages/receiver/ReceiverDashboard'));
const HospitalDashboard = lazy(() => import('./pages/hospital/HospitalDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// Donor Pages
const DonorProfile = lazy(() => import('./pages/donor/DonorProfile'));
const DonationHistory = lazy(() => import('./pages/donor/DonorHistory'));
const FindRequests = lazy(() => import('./pages/donor/FindRequests'));

// Receiver Pages
const CreateRequest = lazy(() => import('./pages/receiver/CreateRequest'));
const MyRequests = lazy(() => import('./pages/receiver/MyRequests'));
const FindDonors = lazy(() => import('./pages/receiver/FindDonors'));

// Hospital Pages
const HospitalProfile = lazy(() => import('./pages/hospital/HospitalProfile'));
const ManageStock = lazy(() => import('./pages/hospital/ManageStock'));
const ManageRequests = lazy(() => import('./pages/hospital/ManageRequests'));
const ManageDonations = lazy(() => import('./pages/hospital/ManageDonations'));

// Admin Pages
const UserManagement = lazy(() => import('./pages/admin/UsersManagement'));
const HospitalManagement = lazy(() => import('./pages/admin/HospitalsManagement'));
const RequestManagement = lazy(() => import('./pages/admin/RequestsManagement'));
const Analytics = lazy(() => import('./pages/admin/AnalyticsPage'));

// Shared Pages
const Schedules = lazy(() => import('./pages/shared/Schedules'));
const ScheduleDetail = lazy(() => import('./pages/shared/ScheduleDetail'));
const RequestDetail = lazy(() => import('./pages/shared/RequestDetail'));
const HospitalList = lazy(() => import('./pages/shared/HospitalList'));
const HospitalDetail = lazy(() => import('./pages/shared/HospitalDetail'));
const Notifications = lazy(() => import('./pages/shared/Notifications'));
const Settings = lazy(() => import('./pages/shared/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Get default dashboard based on user role
  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'donor':
        return '/donor/dashboard';
      case 'receiver':
        return '/receiver/dashboard';
      case 'hospital':
        return '/hospital/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to={getDashboardPath()} /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to={getDashboardPath()} /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to={getDashboardPath()} /> : <RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Public pages that work with or without auth */}
        <Route path="/hospitals" element={<Layout><HospitalList /></Layout>} />
        <Route path="/hospitals/:id" element={<Layout><HospitalDetail /></Layout>} />
        <Route path="/schedules" element={<Layout><Schedules /></Layout>} />
        <Route path="/schedules/:id" element={<Layout><ScheduleDetail /></Layout>} />

        {/* Protected - Donor Routes */}
        <Route element={<ProtectedRoute allowedRoles={['donor']} />}>
          <Route path="/donor/dashboard" element={<Layout><DonorDashboard /></Layout>} />
          <Route path="/donor/profile" element={<Layout><DonorProfile /></Layout>} />
          <Route path="/donor/history" element={<Layout><DonationHistory /></Layout>} />
          <Route path="/donor/find-requests" element={<Layout><FindRequests /></Layout>} />
        </Route>

        {/* Protected - Receiver Routes */}
        <Route element={<ProtectedRoute allowedRoles={['receiver']} />}>
          <Route path="/receiver/dashboard" element={<Layout><ReceiverDashboard /></Layout>} />
          <Route path="/receiver/create-request" element={<Layout><CreateRequest /></Layout>} />
          <Route path="/receiver/my-requests" element={<Layout><MyRequests /></Layout>} />
          <Route path="/receiver/find-donors" element={<Layout><FindDonors /></Layout>} />
        </Route>

        {/* Protected - Hospital Routes */}
        <Route element={<ProtectedRoute allowedRoles={['hospital']} />}>
          <Route path="/hospital/dashboard" element={<Layout><HospitalDashboard /></Layout>} />
          <Route path="/hospital/profile" element={<Layout><HospitalProfile /></Layout>} />
          <Route path="/hospital/stock" element={<Layout><ManageStock /></Layout>} />
          <Route path="/hospital/requests" element={<Layout><ManageRequests /></Layout>} />
          <Route path="/hospital/donations" element={<Layout><ManageDonations /></Layout>} />
        </Route>

        {/* Protected - Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<Layout><AdminDashboard /></Layout>} />
          <Route path="/admin/users" element={<Layout><UserManagement /></Layout>} />
          <Route path="/admin/hospitals" element={<Layout><HospitalManagement /></Layout>} />
          <Route path="/admin/requests" element={<Layout><RequestManagement /></Layout>} />
          <Route path="/admin/analytics" element={<Layout><Analytics /></Layout>} />
        </Route>

        {/* Protected - Shared Routes (require any authenticated user) */}
        <Route element={<ProtectedRoute allowedRoles={['donor', 'receiver', 'hospital', 'admin']} />}>
          <Route path="/requests/:id" element={<Layout><RequestDetail /></Layout>} />
          <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
