import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, CheckCircle, AlertCircle, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';
import api from '../services/api';
import './Login.css'; // Reusing Login styles for consistency

const STEPS = { EMAIL: 1, OTP: 2, PASSWORD: 3 };

const ForgotPassword = ({ onNavigate }) => {
    const [step, setStep] = useState(STEPS.EMAIL);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const clearMessages = () => { setError(''); setSuccess(''); };

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        clearMessages();
        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password/send-otp', { email });
            setSuccess('OTP sent to your email! Check your inbox.');
            setStep(STEPS.OTP);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'No account found with this email.');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        clearMessages();
        if (otp.length < 6) { setError('Please enter the full 6-digit OTP.'); return; }
        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password/verify-otp', { email, otp });
            setSuccess('OTP verified! Please set your new password.');
            setStep(STEPS.PASSWORD);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Invalid or expired OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        clearMessages();
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', { email, newPassword });
            setSuccess('Password updated successfully! Redirecting to login...');
            setTimeout(() => onNavigate('login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update password.');
        } finally {
            setIsLoading(false);
        }
    };

    const stepTitles = {
        [STEPS.EMAIL]: { title: 'Forgot Password', sub: 'Enter your registered email to receive an OTP' },
        [STEPS.OTP]:   { title: 'Verify OTP',      sub: `Enter the 6-digit code sent to ${email}` },
        [STEPS.PASSWORD]: { title: 'Set New Password', sub: 'Choose a strong new password' },
    };

    return (
        <div className="login-page">
            <motion.button
                className="back-btn"
                onClick={() => step === STEPS.EMAIL ? onNavigate('login') : setStep(s => s - 1)}
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
            >
                <ArrowLeft size={20} />
                <span>{step === STEPS.EMAIL ? 'Back to Login' : 'Back'}</span>
            </motion.button>

            <div className="login-container">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        className="login-card"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Step indicators */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            {[STEPS.EMAIL, STEPS.OTP, STEPS.PASSWORD].map(s => (
                                <div key={s} style={{
                                    width: s === step ? '2rem' : '0.5rem', height: '0.5rem',
                                    borderRadius: '9999px', transition: 'all 0.3s',
                                    background: s <= step ? '#667eea' : '#e2e8f0'
                                }} />
                            ))}
                        </div>

                        <div className="login-header">
                            <div className="login-logo">
                                <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                                    <rect width="32" height="32" rx="8" fill="url(#fp-gradient)" />
                                    <path d="M8 12h16M8 16h16M8 20h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                    <defs>
                                        <linearGradient id="fp-gradient" x1="0" y1="0" x2="32" y2="32">
                                            <stop offset="0%" style={{ stopColor: '#667eea' }} />
                                            <stop offset="100%" style={{ stopColor: '#764ba2' }} />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <h2>{stepTitles[step].title}</h2>
                            <p>{stepTitles[step].sub}</p>
                        </div>

                        {/* Alert messages */}
                        {error && (
                            <motion.div className="error-message" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </motion.div>
                        )}
                        {success && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                style={{ background: '#ecfdf5', border: '1px solid #d1fae5', padding: '0.75rem', borderRadius: '8px', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}
                            >
                                <CheckCircle size={18} />
                                <span>{success}</span>
                            </motion.div>
                        )}

                        {/* STEP 1: Email */}
                        {step === STEPS.EMAIL && (
                            <form onSubmit={handleSendOtp} className="login-form">
                                <div className="input-group">
                                    <label htmlFor="email">Email Address</label>
                                    <div className="input-wrapper">
                                        <Mail className="input-icon" size={20} />
                                        <input type="email" id="email" placeholder="your@email.com"
                                            value={email} onChange={e => setEmail(e.target.value)} required />
                                    </div>
                                </div>
                                <motion.button type="submit" className="login-submit-btn" disabled={isLoading}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ marginTop: '1rem' }}>
                                    {isLoading ? <div className="loader"></div> : <><span>Send OTP</span><ShieldCheck size={20} /></>}
                                </motion.button>
                            </form>
                        )}

                        {/* STEP 2: OTP */}
                        {step === STEPS.OTP && (
                            <form onSubmit={handleVerifyOtp} className="login-form">
                                <div className="input-group">
                                    <label htmlFor="otp">6-Digit OTP</label>
                                    <input type="text" id="otp" placeholder="Enter OTP" value={otp}
                                        onChange={e => setOtp(e.target.value)} maxLength={6}
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', fontSize: '1.5rem', letterSpacing: '6px', textAlign: 'center', boxSizing: 'border-box' }} />
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.25rem' }}>
                                    Didn't receive the OTP?{' '}
                                    <button type="button" onClick={handleSendOtp} style={{ background: 'none', border: 'none', color: '#667eea', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>
                                        Resend
                                    </button>
                                </p>
                                <motion.button type="submit" className="login-submit-btn" disabled={isLoading || otp.length < 6}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ marginTop: '1rem' }}>
                                    {isLoading ? <div className="loader"></div> : <><span>Verify OTP</span><CheckCircle size={20} /></>}
                                </motion.button>
                            </form>
                        )}

                        {/* STEP 3: New Password */}
                        {step === STEPS.PASSWORD && (
                            <form onSubmit={handleResetPassword} className="login-form">
                                <div className="input-group">
                                    <label htmlFor="newPassword">New Password</label>
                                    <div className="input-wrapper">
                                        <Lock className="input-icon" size={20} />
                                        <input type="password" id="newPassword" placeholder="Min. 6 characters"
                                            value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <div className="input-wrapper">
                                        <KeyRound className="input-icon" size={20} />
                                        <input type="password" id="confirmPassword" placeholder="Confirm new password"
                                            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                                    </div>
                                </div>
                                <motion.button type="submit" className="login-submit-btn" disabled={isLoading}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ marginTop: '1rem' }}>
                                    {isLoading ? <div className="loader"></div> : <><span>Update Password</span><CheckCircle size={20} /></>}
                                </motion.button>
                            </form>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ForgotPassword;
