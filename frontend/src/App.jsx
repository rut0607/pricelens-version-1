import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ScenarioProvider } from './contexts/ScenarioContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage'; // ADD THIS IMPORT
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AnalysisCreate from './pages/AnalysisCreate';
import AnalysisView from './pages/AnalysisView';
import Scenarios from './pages/Scenarios';
import Compare from './pages/Compare';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScenarioProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'font-sans',
              duration: 4000,
            }}
          />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} /> {/* CHANGE THIS */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/analysis/new" element={
              <ProtectedRoute>
                <AnalysisCreate />
              </ProtectedRoute>
            } />
            
            <Route path="/analysis/:id" element={
              <ProtectedRoute>
                <AnalysisView />
              </ProtectedRoute>
            } />
            
            <Route path="/scenarios" element={
              <ProtectedRoute>
                <Scenarios />
              </ProtectedRoute>
            } />
            
            <Route path="/compare" element={
              <ProtectedRoute>
                <Compare />
              </ProtectedRoute>
            } />
            
            {/* Remove or update this redirect since we now have a landing page */}
            {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
            
            {/* 404 route - redirect to landing page instead of dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ScenarioProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;