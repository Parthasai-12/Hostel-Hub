import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import StudentDashboard from './components/StudentDashboard';
import ComplaintForm from './components/ComplaintForm';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import WardenDashboard from './components/WardenDashboard';
import ForgotPassword from './components/ForgotPassword';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const storedName = localStorage.getItem('userName');
    if (token && role) {
      setUserRole(role);
      if (storedName) setUserName(storedName);
    } else {
      // No valid session — clean up any stale data
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userName');
      setUserRole(null);
      setUserName('');
    }
  }, []);

  const handleLoginSuccess = (view) => {
    setUserRole(localStorage.getItem('role'));
    setUserName(localStorage.getItem('userName') || '');
    setCurrentView(view);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    setUserRole(null);
    setUserName('');
    setCurrentView('landing');
  };

  // Protected route guard: redirect to landing if not logged in
  const isLoggedIn = !!userRole;

  if (currentView === 'login') {
    return <Login onNavigate={setCurrentView} onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentView === 'register') {
    return <Register onNavigate={setCurrentView} />;
  }

  if (currentView === 'forgot-password') {
    return <ForgotPassword onNavigate={setCurrentView} />;
  }

  if (currentView === 'dashboard' || currentView === 'complaints') {
    if (!isLoggedIn) {
      // Not logged in — redirect to landing
      setCurrentView('landing');
      return null;
    }
    if (userRole === 'ADMIN') {
      return <AdminDashboard onNavigate={setCurrentView} onLogout={handleLogout} userName={userName} />;
    }
    if (userRole === 'WARDEN') {
      return <WardenDashboard onNavigate={setCurrentView} onLogout={handleLogout} userName={userName} />;
    }
    return <StudentDashboard onNavigate={setCurrentView} onLogout={handleLogout} initialView={currentView === 'complaints' ? 'complaints' : 'dashboard'} userName={userName} />;
  }

  if (currentView === 'form') {
    if (!isLoggedIn) { setCurrentView('landing'); return null; }
    return <ComplaintForm onNavigate={setCurrentView} />;
  }

  if (currentView === 'profile') {
    if (!isLoggedIn) { setCurrentView('landing'); return null; }
    return <Profile onNavigate={setCurrentView} />;
  }

  return (
    <div className="app">
      <Navbar onNavigate={setCurrentView} onLogout={handleLogout} isLoggedIn={!!userRole} />
      <Hero onNavigate={setCurrentView} isLoggedIn={!!userRole} />
      <Features />
      <Footer />
    </div>
  );
}

export default App;
