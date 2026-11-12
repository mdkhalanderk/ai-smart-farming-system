import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageLoader, GlobalNetworkLoader } from './components/PageLoader';

// Lazy-loaded routes for production performance and code splitting
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignUpPage = lazy(() => import('./pages/SignUpPage').then(m => ({ default: m.SignUpPage })));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup').then(m => ({ default: m.ProfileSetup })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const DiseaseDetection = lazy(() => import('./pages/DiseaseDetection').then(m => ({ default: m.DiseaseDetection })));
const CommunityPage = lazy(() => import('./pages/CommunityPage').then(m => ({ default: m.CommunityPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const PricePrediction = lazy(() => import('./pages/PricePrediction').then(m => ({ default: m.PricePrediction })));
const YieldPrediction = lazy(() => import('./pages/YieldPrediction').then(m => ({ default: m.YieldPrediction })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));

export default function App() {
  // Silently preload heavy route bundles after initial paint so mobile navigation is instant
  useEffect(() => {
    const timer = setTimeout(() => {
      import('./pages/Dashboard');
      import('./pages/DiseaseDetection');
      import('./pages/PricePrediction');
      import('./pages/YieldPrediction');
      import('./pages/CommunityPage');
      import('./pages/ReportsPage');
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <GlobalNetworkLoader />
          <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#faf8f5] font-sans text-[#1a2e1d] flex flex-col selection:bg-[#cbe2ce] selection:text-[#143823]">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignUpPage />} />

                  {/* Protected Routes */}
                  <Route
                    path="/profile-setup"
                    element={
                      <ProtectedRoute requireProfile={false}>
                        <ProfileSetup />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute requireProfile={true}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/detect"
                    element={
                      <ProtectedRoute requireProfile={true}>
                        <DiseaseDetection />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/price-prediction"
                    element={
                      <ProtectedRoute requireProfile={true}>
                        <PricePrediction />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/yield-prediction"
                    element={
                      <ProtectedRoute requireProfile={true}>
                        <YieldPrediction />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/yield"
                    element={
                      <ProtectedRoute requireProfile={true}>
                        <YieldPrediction />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/community"
                    element={
                      <ProtectedRoute requireProfile={true}>
                        <CommunityPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/messages"
                    element={
                      <ProtectedRoute requireProfile={true}>
                        <CommunityPage initialTab="messages" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute requireProfile={true}>
                        <ReportsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/evaluation"
                    element={
                      <ProtectedRoute requireProfile={true}>
                        <ReportsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute requireProfile={true}>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<LandingPage />} />
                </Routes>
              </Suspense>
            </main>
            
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
