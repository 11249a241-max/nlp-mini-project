import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AcademicAssistant from './pages/AcademicAssistant';
import ProjectSimilarity from './pages/ProjectSimilarity';
import ComplaintAnalyzer from './pages/ComplaintAnalyzer';
import NoticeIntelligence from './pages/NoticeIntelligence';
import KnowledgeSharing from './pages/KnowledgeSharing';
import ResearchDiscovery from './pages/ResearchDiscovery';
import Profile from './pages/Profile';
import SettingsPage from './pages/SettingsPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold text-sm">
        Authenticating CampusMind AI Session...
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // If student tries to access faculty, redirect to student dashboard, and vice-versa
    return <Navigate to={user.role === 'FACULTY' ? '/faculty/dashboard' : '/student/dashboard'} replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes under DashboardLayout */}
          <Route element={<DashboardLayout />}>
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRole="STUDENT">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/dashboard"
              element={
                <ProtectedRoute allowedRole="FACULTY">
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assistant"
              element={
                <ProtectedRoute>
                  <AcademicAssistant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <ProjectSimilarity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints"
              element={
                <ProtectedRoute>
                  <ComplaintAnalyzer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notices"
              element={
                <ProtectedRoute>
                  <NoticeIntelligence />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discussions"
              element={
                <ProtectedRoute>
                  <KnowledgeSharing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/research"
              element={
                <ProtectedRoute>
                  <ResearchDiscovery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
