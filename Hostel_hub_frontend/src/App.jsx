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
  // Initialize view based on URL. If the user hits /login directly but is logged in, they'll just see Home anyway soon.
  const initialView = window.location.pathname === '/login' ? 'login' : 'landing';
  const [currentView, setCurrentView] = useState(initialView);
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');

  useEffect(() => {
    // Check URL for OAuth token first
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
      localStorage.setItem('token', urlToken);
      let parsedRole = 'STUDENT';
      let parsedName = '';
      try {
        const payload = JSON.parse(atob(urlToken.split('.')[1]));
        parsedRole = payload.role || (payload.authorities ? (Array.isArray(payload.authorities) ? payload.authorities[0] : payload.authorities) : 'STUDENT');
        parsedName = payload.name || payload.sub || '';
      } catch (e) {
        console.error("Error parsing JWT:", e);
      }
      localStorage.setItem('role', parsedRole);
      if (parsedName) localStorage.setItem('userName', parsedName);
      
      setUserRole(parsedRole);
      setUserName(parsedName);
      
      // Clean up URL to show proper frontend route (e.g. /home) without the token hash
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Fetch user details async to get up-to-date name
      import('./services/api').then(({ default: api }) => {
        api.get('/users/me').then(res => {
          if (res.data?.name) {
            localStorage.setItem('userName', res.data.name);
            setUserName(res.data.name);
          }
        }).catch(() => {});
      });
      return; // Skip the rest since we just authenticated perfectly
    }

    // Standard session check
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const storedName = localStorage.getItem('userName');
    
    // Also if the browser path is /login, we should not explicitly keep them on login if they are already logged in
    // But since currentView defaults to 'landing', they just stay on landing
    
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
