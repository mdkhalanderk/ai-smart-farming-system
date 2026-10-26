import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ProfileSetup } from './pages/ProfileSetup';
import { Dashboard } from './pages/Dashboard';
import { DiseaseDetection } from './pages/DiseaseDetection';
import { CommunityPage } from './pages/CommunityPage';
import { ProfilePage } from './pages/ProfilePage';
import { PricePrediction } from './pages/PricePrediction';
import { YieldPrediction } from './pages/YieldPrediction';
import { ReportsPage } from './pages/ReportsPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#faf8f5] font-sans text-[#1a2e1d] flex flex-col selection:bg-[#cbe2ce] selection:text-[#143823]">
          <Navbar />
          <main className="flex-1">
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
                path="/reports"
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
          </main>
          
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

