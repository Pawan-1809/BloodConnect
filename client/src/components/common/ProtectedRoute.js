import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, token } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  if (!token || !user) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user's role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    const dashboardPaths = {
      donor: '/donor/dashboard',
      receiver: '/receiver/dashboard',
      hospital: '/hospital/dashboard',
      admin: '/admin/dashboard'
    };
    
    return <Navigate to={dashboardPaths[user.role] || '/'} replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;
