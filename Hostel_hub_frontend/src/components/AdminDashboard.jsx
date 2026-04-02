import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import {
    LayoutDashboard,
    LogOut,
    Menu,
    X,
    UserPlus,
    Mail,
    Lock,
    User,
    CheckCircle,
    AlertCircle,
    Shield,
    Users,
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = ({ onNavigate, onLogout, userName }) => {
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Create Warden form state
    const [wardenName, setWardenName] = useState('');
    const [wardenEmail, setWardenEmail] = useState('');
    const [wardenPassword, setWardenPassword] = useState('');
    const [createWardenLoading, setCreateWardenLoading] = useState(false);
    const [createWardenSuccess, setCreateWardenSuccess] = useState('');
    const [createWardenError, setCreateWardenError] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'ADMIN') {
            console.warn('Unauthorized access to admin dashboard');
            onLogout();
        }
    }, []);

    const handleCreateWarden = async (e) => {
        e.preventDefault();
        setCreateWardenError('');
        setCreateWardenSuccess('');
        setCreateWardenLoading(true);
        try {
            await api.post('/api/admin/create-warden', {
                name: wardenName,
                email: wardenEmail,
                password: wardenPassword,
            });
            setCreateWardenSuccess(`Warden account created successfully for ${wardenEmail}!`);
            setWardenName('');
            setWardenEmail('');
            setWardenPassword('');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Failed to create warden. Please try again.';
            setCreateWardenError(typeof msg === 'string' ? msg : 'Failed to create warden. Please try again.');
        } finally {
            setCreateWardenLoading(false);
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'Admin Panel', icon: <LayoutDashboard size={20} /> },
        { id: 'create-warden', label: 'Create New Warden', icon: <UserPlus size={20} /> },
        { id: 'logout', label: 'Logout', icon: <LogOut size={20} /> },
    ];

    const handleMenuClick = (menuId) => {
        setActiveMenu(menuId);
        setSidebarOpen(false);
        if (menuId !== 'create-warden') {
            setCreateWardenSuccess('');
            setCreateWardenError('');
        }
        if (menuId === 'logout') onLogout();
    };

    const renderCreateWarden = () => (
        <motion.div
            className="content-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Create New Warden</h1>
                    <p className="dashboard-subtitle">Add a new warden who can manage student complaints</p>
                </div>
            </div>

            <div className="table-card" style={{ maxWidth: '480px' }}>
                <div className="table-header">
                    <h2 className="table-title">Warden Details</h2>
                </div>
                <form onSubmit={handleCreateWarden} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {createWardenSuccess && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                background: 'rgba(16,185,129,0.12)',
                                border: '1px solid rgba(16,185,129,0.3)',
                                borderRadius: '8px',
                                padding: '0.75rem 1rem',
                                color: '#10b981',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem'
                            }}
                        >
                            <CheckCircle size={18} />
                            <span>{createWardenSuccess}</span>
                        </motion.div>
                    )}

                    {createWardenError && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                background: 'rgba(239,68,68,0.12)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: '8px',
                                padding: '0.75rem 1rem',
                                color: '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem'
                            }}
                        >
                            <AlertCircle size={18} />
                            <span>{createWardenError}</span>
                        </motion.div>
                    )}

                    {/* Full Name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="text"
                                placeholder="Warden Full Name"
                                value={wardenName}
                                onChange={(e) => setWardenName(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.5rem', borderRadius: '8px', border: '1px solid rgba(100,116,139,0.3)', background: 'rgba(15,23,42,0.6)', color: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="email"
                                placeholder="warden@example.com"
                                value={wardenEmail}
                                onChange={(e) => setWardenEmail(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.5rem', borderRadius: '8px', border: '1px solid rgba(100,116,139,0.3)', background: 'rgba(15,23,42,0.6)', color: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="password"
                                placeholder="Min. 6 characters"
                                value={wardenPassword}
                                onChange={(e) => setWardenPassword(e.target.value)}
                                required
                                minLength={6}
                                style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.5rem', borderRadius: '8px', border: '1px solid rgba(100,116,139,0.3)', background: 'rgba(15,23,42,0.6)', color: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={createWardenLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff', fontWeight: 600, fontSize: '0.95rem',
                            cursor: createWardenLoading ? 'not-allowed' : 'pointer',
                            opacity: createWardenLoading ? 0.7 : 1, marginTop: '0.5rem'
                        }}
                    >
                        {createWardenLoading ? <span>Creating...</span> : <><UserPlus size={18} /><span>Create Warden</span></>}
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );

    const renderDashboardHome = () => (
        <motion.div
            className="content-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Welcome back, {userName || 'Admin'}!</h1>
                    <p className="dashboard-subtitle">System management and warden administration</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => handleMenuClick('create-warden')}>
                    <div className="stat-icon" style={{ background: 'rgba(102,126,234,0.15)', color: '#667eea', padding: '0.75rem', borderRadius: '10px' }}>
                        <UserPlus size={24} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Wardens</p>
                        <p className="stat-value" style={{ fontSize: '1rem', color: '#667eea' }}>Create →</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.75rem', borderRadius: '10px' }}>
                        <Shield size={24} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Your Role</p>
                        <p className="stat-value" style={{ fontSize: '1rem' }}>ADMIN</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(234,179,8,0.15)', color: '#eab308', padding: '0.75rem', borderRadius: '10px' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Complaint Management</p>
                        <p className="stat-value" style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Handled by Wardens</p>
                    </div>
                </div>
            </div>

            <div className="table-card" style={{ padding: '1.5rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, lineHeight: 1.7 }}>
                    <strong style={{ color: '#e2e8f0' }}>Admin responsibilities:</strong><br />
                    • Create and manage warden accounts via <em>Create New Warden</em>.<br />
                    • Complaint review and resolution is handled by assigned wardens.<br />
                    • Students self-register and raise complaints directly.
                </p>
            </div>
        </motion.div>
    );

    return (
        <div className="admin-dashboard">
            {/* Mobile Menu Button */}
            <motion.button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                whileTap={{ scale: 0.9 }}
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>

            {/* Sidebar */}
            <AnimatePresence>
                {(sidebarOpen || window.innerWidth > 768) && (
                    <motion.aside
                        className="sidebar"
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="sidebar-header" onClick={() => onNavigate('landing')} style={{ cursor: 'pointer' }}>
                            <div className="logo">
                                <span className="logo-text">HostelHub Admin</span>
                            </div>
                        </div>

                        <nav className="sidebar-nav">
                            {menuItems.map((item, index) => (
                                <motion.button
                                    key={item.id}
                                    className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                                    onClick={() => handleMenuClick(item.id)}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ x: 5 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </motion.button>
                            ))}
                        </nav>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="main-content">
                {activeMenu === 'create-warden' ? renderCreateWarden() : renderDashboardHome()}
            </main>
        </div>
    );
};

export default AdminDashboard;
