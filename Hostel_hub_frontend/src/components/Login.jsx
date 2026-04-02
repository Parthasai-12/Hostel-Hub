import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import './Login.css';

const Login = ({ onNavigate, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            let role = 'STUDENT';
            let name = '';
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                role = payload.role || (payload.authorities ? (Array.isArray(payload.authorities) ? payload.authorities[0] : payload.authorities) : 'STUDENT');
                name = payload.name || payload.sub || '';
            } catch (e) {
                console.error('Error decoding token:', e);
            }
            localStorage.setItem('role', role);
            if (name) localStorage.setItem('userName', name);
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Fetch user details to get accurate name
            import('../services/api').then(({ default: api }) => {
                api.get('/users/me').then(res => {
                    if (res.data?.name) localStorage.setItem('userName', res.data.name);
                    onLoginSuccess('landing');
                }).catch(() => {
                    onLoginSuccess('landing');
                });
            });
        }
    }, [onLoginSuccess]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, role: returnedRole } = response.data;
            localStorage.setItem('token', token);

            let role = returnedRole;
            if (!role) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    role = payload.role || (payload.authorities ? (Array.isArray(payload.authorities) ? payload.authorities[0] : payload.authorities) : null);
                } catch (e) {
                    console.error('Error decoding token:', e);
                }
            }
            if (!role) role = 'STUDENT';

            localStorage.setItem('role', role);

            // Fetch user details to store name
            try {
                const userRes = await api.get('/users/me');
                if (userRes.data?.name) localStorage.setItem('userName', userRes.data.name);
            } catch (e) {
                console.error('Error fetching user details:', e);
            }
            onLoginSuccess('landing');

        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <motion.button
                className="back-btn"
                onClick={() => onNavigate('landing')}
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
            >
                <ArrowLeft size={20} />
                <span>Back to Home</span>
            </motion.button>

            <div className="login-container">
                <motion.div
                    className="login-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="login-header">
                        <div className="login-logo">
                            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                                <rect width="32" height="32" rx="8" fill="url(#login-gradient)" />
                                <path d="M8 12h16M8 16h16M8 20h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="login-gradient" x1="0" y1="0" x2="32" y2="32">
                                        <stop offset="0%" style={{ stopColor: '#667eea' }} />
                                        <stop offset="100%" style={{ stopColor: '#764ba2' }} />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <h2>Welcome Back</h2>
                        <p>Sign in to manage your hostel experience</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <motion.div
                                className="error-message"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <div className="input-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={20} />
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={20} />
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-options">
                            <a href="#" className="forgot-link" onClick={(e) => { e.preventDefault(); onNavigate('forgot-password'); }}>Forgot Password?</a>
                        </div>

                        <motion.button
                            type="submit"
                            className="login-submit-btn"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isLoading ? (
                                <div className="loader"></div>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <LogIn size={20} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="google-auth-container" style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                        <a 
                            href="http://localhost:8080/oauth2/authorization/google" 
                            className="google-btn"
                            style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                width: '100%', padding: '0.75rem', borderRadius: '8px', 
                                border: '1px solid #e2e8f0', background: '#ffffff', color: '#1e293b', 
                                fontWeight: '600', textDecoration: 'none', transition: 'all 0.2s ease', 
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)', boxSizing: 'border-box'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Continue with Google
                        </a>
                    </div>

                    <div className="login-footer">
                        <p>Don’t have an account? <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('register'); }}>Create a new account</a></p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
