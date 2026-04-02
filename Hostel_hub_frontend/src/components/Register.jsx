import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../services/api';
import './Login.css'; // Reusing Login styles for consistency

const Register = ({ onNavigate }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [otp, setOtp] = useState('');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [otpMessage, setOtpMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await api.post('/auth/send-otp', { email });
            setShowOtpModal(true);
            setOtpMessage({ type: 'success', text: 'OTP sent to your email.' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAndRegister = async () => {
        if (!otp || otp.length < 6) {
            setOtpMessage({ type: 'error', text: 'Please enter a valid 6-digit OTP.' });
            return;
        }
        setOtpMessage({ type: '', text: '' });
        setIsVerifyingOtp(true);

        try {
            await api.post('/auth/verify-otp-and-register', {
                name,
                email,
                password,
                roomNumber,
                otp
            });

            setOtpMessage({ type: 'success', text: 'Registration successful! Redirecting to login...' });
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                setShowOtpModal(false);
                onNavigate('login');
            }, 2000);

        } catch (err) {
            setOtpMessage({ type: 'error', text: err.response?.data?.message || 'Invalid or expired OTP.' });
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleResendOtp = async () => {
        setOtpMessage({ type: '', text: '' });
        setIsSendingOtp(true);
        try {
            await api.post('/auth/send-otp', { email });
            setOtpMessage({ type: 'success', text: 'OTP resent to your email.' });
        } catch (err) {
            setOtpMessage({ type: 'error', text: err.response?.data?.message || 'Failed to resend OTP.' });
        } finally {
            setIsSendingOtp(false);
        }
    };

    return (
        <>
        <div className="login-page">
            <motion.button
                className="back-btn"
                onClick={() => onNavigate('login')}
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
            >
                <ArrowLeft size={20} />
                <span>Back to Login</span>
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
                        <h2>Create Account</h2>
                        <p>Join our hostel community today</p>
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

                        {success && (
                            <motion.div
                                className="success-message"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    background: '#ecfdf5',
                                    border: '1px solid #d1fae5',
                                    padding: 'var(--spacing-sm)',
                                    borderRadius: 'var(--radius-md)',
                                    color: '#059669',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-sm)',
                                    fontSize: '0.875rem',
                                    marginBottom: 'var(--spacing-md)'
                                }}
                            >
                                <CheckCircle size={18} />
                                <span>{success}</span>
                            </motion.div>
                        )}

                        <div className="input-group">
                            <label htmlFor="name">Full Name</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={20} />
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

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

                        <div className="input-group">
                            <label htmlFor="roomNumber">Room Number</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={20} />
                                <input
                                    type="text"
                                    id="roomNumber"
                                    placeholder="e.g., A-101"
                                    value={roomNumber}
                                    onChange={(e) => setRoomNumber(e.target.value)}
                                />
                            </div>
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
                                    <span>Create Account</span>
                                    <UserPlus size={20} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="login-footer">
                        <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }}>Sign In</a></p>
                    </div>
                </motion.div>
            </div>
        </div>
            
            {showOtpModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', 
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <motion.div 
                        className="modal-content"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            background: '#1e293b', padding: '2rem', borderRadius: '12px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                            width: '100%', maxWidth: '400px', border: '1px solid #334155'
                        }}
                    >
                        <h3 style={{ marginTop: 0, color: '#f8fafc', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Verify Your Email</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            We've sent a 6-digit verification code to <strong>{email}</strong>. Please enter it below.
                        </p>
                        
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                style={{
                                    width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                                    background: '#0f172a', border: '1px solid #334155', color: '#f8fafc',
                                    fontSize: '1.25rem', letterSpacing: '4px', textAlign: 'center',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        
                        {otpMessage.text && (
                            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: otpMessage.type === 'error' ? '#ef4444' : '#10b981', textAlign: 'center' }}>
                                {otpMessage.text}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button 
                                onClick={handleVerifyAndRegister}
                                disabled={isVerifyingOtp || !otp || otp.length < 6}
                                style={{
                                    padding: '0.75rem', borderRadius: '8px', background: '#ec4899', 
                                    color: '#fff', border: 'none', fontWeight: '600', 
                                    cursor: (isVerifyingOtp || !otp || otp.length < 6) ? 'not-allowed' : 'pointer',
                                    opacity: (isVerifyingOtp || !otp || otp.length < 6) ? 0.7 : 1, width: '100%'
                                }}
                            >
                                {isVerifyingOtp ? 'Verifying...' : 'Verify & Create Account'}
                            </button>
                            
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button 
                                    onClick={handleResendOtp}
                                    disabled={isSendingOtp}
                                    style={{
                                        padding: '0.75rem', borderRadius: '8px', background: '#334155', 
                                        color: '#f8fafc', border: 'none', fontWeight: '600', 
                                        cursor: isSendingOtp ? 'not-allowed' : 'pointer', flex: 1
                                    }}
                                >
                                    {isSendingOtp ? 'Sending...' : 'Resend OTP'}
                                </button>
                                <button 
                                    onClick={() => setShowOtpModal(false)}
                                    style={{
                                        padding: '0.75rem', borderRadius: '8px', background: 'transparent', 
                                        color: '#94a3b8', border: '1px solid #334155', fontWeight: '600', 
                                        cursor: 'pointer', flex: 1
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default Register;
