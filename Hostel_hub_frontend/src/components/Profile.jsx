import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const Profile = ({ onNavigate }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/users/me');
                setUser(response.data);
            } catch (err) {
// logger removed
                setError('Could not load profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: 'var(--spacing-lg)' }}>
            <motion.button
                className="back-btn"
                onClick={() => onNavigate('landing')}
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
                style={{ marginBottom: 'var(--spacing-lg)' }}
            >
                <ArrowLeft size={20} />
                <span>Back to Home</span>
            </motion.button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--spacing-xl)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--border-color)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        margin: '0 auto var(--spacing-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '2.5rem',
                        fontWeight: 'bold'
                    }}>
                        {user?.name ? user.name.charAt(0).toUpperCase() : <User size={48} />}
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-heading)' }}>{user?.name || 'User Profile'}</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your account details</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ background: 'rgba(102, 126, 234, 0.2)', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--primary-light)' }}>
                            <User size={24} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Full Name</p>
                            <p style={{ fontWeight: '600', color: 'var(--text-heading)' }}>{user?.name || 'N/A'}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ background: 'rgba(102, 126, 234, 0.2)', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--primary-light)' }}>
                            <Mail size={24} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email Address</p>
                            <p style={{ fontWeight: '600', color: 'var(--text-heading)' }}>{user?.email || 'N/A'}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ background: 'rgba(102, 126, 234, 0.2)', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--primary-light)' }}>
                            <Shield size={24} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Role</p>
                            <span style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.75rem',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#10B981',
                                borderRadius: '9999px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                marginTop: '0.25rem'
                            }}>
                                {user?.role || 'STUDENT'}
                            </span>
                        </div>
                    </div>

                    {user?.roomNumber && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ background: 'rgba(102, 126, 234, 0.2)', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--primary-light)' }}>
                                <User size={24} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Room Number</p>
                                <p style={{ fontWeight: '600', color: 'var(--text-heading)' }}>{user.roomNumber}</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;
