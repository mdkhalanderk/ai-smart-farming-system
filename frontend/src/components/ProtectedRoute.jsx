import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, requireProfile = true }) => {
  const { user, profile, loading, profileLoading } = useAuth();
  const location = useLocation();

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <Loader2 className="w-8 h-8 text-[#1b432a] animate-spin" />
          <p className="text-[#2d3a2f] font-medium text-sm">Verifying farmer session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireProfile && !profile && location.pathname !== '/profile-setup') {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
};
