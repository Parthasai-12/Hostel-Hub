import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import {
    LayoutDashboard,
    FileText,
    List,
    User,
    LogOut,
    Menu,
    X,
    Plus,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import './StudentDashboard.css';

const StudentDashboard = ({ onNavigate, complaints, onLogout, initialView = 'dashboard', userName }) => {
    const [activeMenu, setActiveMenu] = useState(initialView);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [realComplaints, setRealComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/complaints/my');
            setRealComplaints(response.data);
        } catch (err) {
            console.error('Error fetching complaints:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'raise', label: 'Raise Complaint', icon: <FileText size={20} /> },
        { id: 'complaints', label: 'My Complaints', icon: <List size={20} /> },
        { id: 'profile', label: 'Profile', icon: <User size={20} /> },
        { id: 'logout', label: 'Logout', icon: <LogOut size={20} /> },
    ];

    const getStatusIcon = (status) => {
        const s = status?.toUpperCase();
        switch (s) {
            case 'PENDING':
                return <Clock size={16} className="status-icon pending" />;
            case 'IN_PROGRESS':
                return <AlertCircle size={16} className="status-icon in-progress" />;
            case 'RESOLVED':
                return <CheckCircle size={16} className="status-icon resolved" />;
            default:
                return null;
        }
    };

    const getStatusClass = (status) => {
        return status?.toLowerCase().replace('_', '-');
    };

    const handleMenuClick = (menuId) => {
        setActiveMenu(menuId);
        setSidebarOpen(false);

        if (menuId === 'logout') {
            onLogout();
        } else if (menuId === 'raise') {
            onNavigate('form');
        } else if (menuId === 'profile') {
            onNavigate('profile');
        }
    };

    const handleRaiseComplaint = () => {
        onNavigate('form');
    };

    return (
        <div className="student-dashboard">
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
                                <div className="logo-icon">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                        <rect width="32" height="32" rx="8" fill="url(#gradient)" />
                                        <path d="M8 12h16M8 16h16M8 20h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                        <defs>
                                            <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                                                <stop offset="0%" style={{ stopColor: '#667eea' }} />
                                                <stop offset="100%" style={{ stopColor: '#764ba2' }} />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <span className="logo-text">HostelHub</span>
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
                <motion.div
                    className="content-wrapper"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {activeMenu === 'dashboard' ? (
                        <>
                            {/* Header */}
                            <div className="dashboard-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <button 
                                        onClick={() => onNavigate('landing')}
                                        style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#64748b' }}
                                        title="Back to Home"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div>
                                        <h1 className="dashboard-title">Welcome back, {userName || 'Student'}!</h1>
                                        <p className="dashboard-subtitle">Here's what's happening with your complaints</p>
                                    </div>
                                </div>
                                <motion.button
                                    className="btn-primary"
                                    onClick={handleRaiseComplaint}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Plus size={20} />
                                    Raise Complaint
                                </motion.button>
                            </div>

                            {/* Stats Cards */}
                            <div className="stats-grid">
                                <motion.div
                                    className="stat-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="stat-icon pending-bg">
                                        <Clock size={24} />
                                    </div>
                                    <div className="stat-info">
                                        <p className="stat-label">Pending</p>
                                        <p className="stat-value">{realComplaints.filter(c => c.status === 'PENDING').length}</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="stat-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="stat-icon in-progress-bg">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div className="stat-info">
                                        <p className="stat-label">In Progress</p>
                                        <p className="stat-value">{realComplaints.filter(c => c.status === 'IN_PROGRESS').length}</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="stat-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="stat-icon resolved-bg">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div className="stat-info">
                                        <p className="stat-label">Resolved</p>
                                        <p className="stat-value">{realComplaints.filter(c => c.status === 'RESOLVED').length}</p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Complaints Table */}
                            <motion.div
                                className="table-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="table-header">
                                    <h2 className="table-title">Recent Complaints</h2>
                                    <button className="btn-secondary" onClick={() => setActiveMenu('complaints')}>
                                        View All
                                    </button>
                                </div>

                                <div className="table-wrapper">
                                    <table className="complaints-table">
                                        <thead>
                                            <tr>
                                                <th>Issue</th>
                                                <th style={{ whiteSpace: 'nowrap' }}>Room No</th>
                                                <th>Description</th>
                                                <th>Image</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoading ? (
                                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Loading complaints...</td></tr>
                                            ) : realComplaints.length === 0 ? (
                                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No complaints found.</td></tr>
                                            ) : (
                                                realComplaints.slice(0, 5).map((complaint, index) => (
                                                    <motion.tr
                                                        key={complaint.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.1 + index * 0.05 }}
                                                        whileHover={{ backgroundColor: '#f9fafb' }}
                                                    >
                                                        <td className="issue-cell">{complaint.title}</td>
                                                        <td className="room-cell" style={{ whiteSpace: 'nowrap' }}>{complaint.roomNumber || 'N/A'}</td>
                                                        <td className="description-cell">{complaint.description}</td>
                                                        <td className="image-cell">
                                                            {complaint.imageUrl ? (
                                                                <img
                                                                    src={`http://localhost:8080${complaint.imageUrl}`}
                                                                    alt="Complaint"
                                                                    style={{
                                                                        width: '60px',
                                                                        height: '60px',
                                                                        objectFit: 'cover',
                                                                        borderRadius: '8px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    onClick={() => window.open(`http://localhost:8080${complaint.imageUrl}`, '_blank')}
                                                                />
                                                            ) : (
                                                                <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No image</span>
                                                            )}
                                                        </td>
                                                        <td className="date-cell">
                                                            {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('en-GB', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            }) : 'N/A'}
                                                        </td>
                                                        <td className="status-cell">
                                                            <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                                                                {getStatusIcon(complaint.status)}
                                                                {complaint.status}
                                                            </span>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </>
                    ) : activeMenu === 'complaints' ? (
                        <>
                            <div className="dashboard-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <button 
                                        onClick={() => onNavigate('landing')}
                                        style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#64748b' }}
                                        title="Back to Home"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div>
                                        <h1 className="dashboard-title">My Complaints</h1>
                                        <p className="dashboard-subtitle">A full history of your raised concerns</p>
                                    </div>
                                </div>
                                <motion.button
                                    className="btn-primary"
                                    onClick={() => setActiveMenu('dashboard')}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Back to Dashboard
                                </motion.button>
                            </div>

                            <motion.div
                                className="table-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="table-wrapper">
                                    <table className="complaints-table">
                                        <thead>
                                            <tr>
                                                <th>Issue</th>
                                                <th style={{ whiteSpace: 'nowrap' }}>Room No</th>
                                                <th>Description</th>
                                                <th>Image</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoading ? (
                                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Loading complaints...</td></tr>
                                            ) : realComplaints.length === 0 ? (
                                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No complaints found.</td></tr>
                                            ) : (
                                                realComplaints.map((complaint, index) => (
                                                    <motion.tr
                                                        key={complaint.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        whileHover={{ backgroundColor: '#f9fafb' }}
                                                    >
                                                        <td className="issue-cell">{complaint.title}</td>
                                                        <td className="room-cell" style={{ whiteSpace: 'nowrap' }}>{complaint.roomNumber || 'N/A'}</td>
                                                        <td className="description-cell">{complaint.description}</td>
                                                        <td className="image-cell">
                                                            {complaint.imageUrl ? (
                                                                <img
                                                                    src={`http://localhost:8080${complaint.imageUrl}`}
                                                                    alt="Complaint"
                                                                    style={{
                                                                        width: '60px',
                                                                        height: '60px',
                                                                        objectFit: 'cover',
                                                                        borderRadius: '8px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    onClick={() => window.open(`http://localhost:8080${complaint.imageUrl}`, '_blank')}
                                                                />
                                                            ) : (
                                                                <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No image</span>
                                                            )}
                                                        </td>
                                                        <td className="date-cell">
                                                            {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('en-GB', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            }) : 'N/A'}
                                                        </td>
                                                        <td className="status-cell">
                                                            <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                                                                {getStatusIcon(complaint.status)}
                                                                {complaint.status}
                                                            </span>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <h2 className="dashboard-title">Coming Soon</h2>
                            <p className="dashboard-subtitle">This section is under development.</p>
                            <button className="btn-primary" onClick={() => setActiveMenu('dashboard')} style={{ marginTop: '1rem' }}>
                                Back to Dashboard
                            </button>
                        </div>
                    )}
                </motion.div>

            </main>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <motion.div
                    className="overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default StudentDashboard;
