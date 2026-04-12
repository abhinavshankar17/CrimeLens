import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AnalyzePage from './pages/AnalyzePage';
import CrimeMapPage from './pages/CrimeMapPage';
import CasesPage from './pages/CasesPage';
import DashboardPage from './pages/DashboardPage';
// Placeholder for CaseDetail
const CaseDetailPage = () => <div className="grid-container"><h1 className="page-title">Case details</h1></div>;

import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{padding:"2rem"}}>Loading Secure Session...</div>;
  if (!user) {
    // For Hackathon demo, we will auto login as admin if no user instead of a full login page
    // This allows for a smoother demo flow without friction.
    return <Navigate to="/" />; 
  }
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/map" element={<CrimeMapPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/:id" element={<CaseDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
