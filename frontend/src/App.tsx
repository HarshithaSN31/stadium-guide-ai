import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import { Sparkles } from 'lucide-react';

// Lazy loading pages for optimized performance (code splitting)
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const SmartMap = React.lazy(() => import('./pages/SmartMap'));
const MyTicket = React.lazy(() => import('./pages/MyTicket'));
const AIAssistant = React.lazy(() => import('./pages/AIAssistant'));
const Facilities = React.lazy(() => import('./pages/Facilities'));
const Accessibility = React.lazy(() => import('./pages/Accessibility'));
const Emergency = React.lazy(() => import('./pages/Emergency'));
const Transport = React.lazy(() => import('./pages/Transport'));
const Profile = React.lazy(() => import('./pages/Profile'));

// Premium Sports Tech Loading Skeleton
const PageLoader = () => (
  <div className="min-h-[500px] w-full flex flex-col items-center justify-center gap-4 bg-[#030712]">
    <div className="relative flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-fifa-blue-light/10 border-t-fifa-neon animate-spin"></div>
      <Sparkles size={16} className="absolute text-fifa-neon animate-pulse" />
    </div>
    <div className="text-center space-y-1">
      <p className="text-[10px] text-fifa-neon font-black tracking-widest uppercase animate-pulse">Syncing Stadium Grid</p>
      <p className="text-[9px] text-slate-500">Loading live operational channels...</p>
    </div>
  </div>
);

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={
          <div className="min-h-screen bg-[#030712] flex items-center justify-center">
            <PageLoader />
          </div>
        }>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes wrapped in Suspense for chunk loading */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/map" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SmartMap />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ticket" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MyTicket />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AIAssistant />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/facilities" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Facilities />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/accessibility" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Accessibility />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/emergency" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Emergency />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transport" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Transport />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default App;
