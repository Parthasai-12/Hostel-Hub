import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import {
    LayoutDashboard,
    List,
    LogOut,
    Menu,
    X,
    Clock,
    CheckCircle,
    AlertCircle,
    ShieldCheck,
    ArrowLeft
} from 'lucide-react';
import './WardenDashboard.css';

const WardenDashboard = ({ onNavigate, onLogout, userName }) => {
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'WARDEN') {
            console.warn('Unauthorized access to warden dashboard');
            onLogout();
            return;
        }
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await api.get('/complaints/all');
            setComplaints(response.data);
        } catch (err) {
            console.error('Error fetching complaints:', err);
            setError('Failed to load complaints. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            setUpdatingId(id);
            await api.put(`/complaints/${id}/status`, { status: newStatus });
            await fetchComplaints();
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'Warden Panel', icon: <LayoutDashboard size={20} /> },
        { id: 'complaints', label: 'All Complaints', icon: <List size={20} /> },
        { id: 'logout', label: 'Logout', icon: <LogOut size={20} /> },
    ];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return <Clock size={16} className="status-icon" />;
            case 'IN_PROGRESS': return <AlertCircle size={16} className="status-icon" />;
            case 'RESOLVED': return <CheckCircle size={16} className="status-icon" />;
            default: return null;
        }
    };

    const getStatusClass = (status) => status.toLowerCase().replace('_', '-');

    const handleMenuClick = (menuId) => {
        setActiveMenu(menuId);
        setSidebarOpen(false);
        if (menuId === 'logout') onLogout();
    };

    const pending = complaints.filter(c => c.status === 'PENDING').length;
    const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
    const resolved = complaints.filter(c => c.status === 'RESOLVED').length;

    // Grouping removed in favor of filtering

    const renderComplaintsTable = () => {
        if (isLoading) {
            return (
                <div className="table-card" style={{ marginTop: '2rem' }}>
                    <div className="table-wrapper">
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading complaints...</div>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="table-card" style={{ marginTop: '2rem' }}>
                    <div className="table-wrapper">
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>{error}</div>
                    </div>
                </div>
            );
        }

        if (complaints.length === 0) {
            return (
                <div className="table-card" style={{ marginTop: '2rem' }}>
                    <div className="table-wrapper">
                        <div style={{ textAlign: 'center', padding: '2rem' }}>No complaints found.</div>
                    </div>
                </div>
            );
        }

        const filterCategories = ['ALL', 'FOOD', 'ELECTRICITY', 'CLEANLINESS', 'WATER', 'INTERNET', 'MAINTENANCE', 'OTHER'];

        const filtered = selectedCategory === "ALL"
            ? complaints
            : complaints.filter(c => (c.category || 'OTHER') === selectedCategory);

        return (
            <div className="complaints-container" style={{ marginTop: '2rem' }}>

                <div className="category-filters">
                    {filterCategories.map(cat => (
                        <button
                            key={cat}
                            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="table-card" style={{ marginBottom: '2rem' }}>
                    <div className="table-header">
                        <h2 className="table-title">{selectedCategory === 'ALL' ? 'All' : selectedCategory} Complaints</h2>
                    </div>
                    {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            No complaints found for this category.
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="complaints-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Student</th>
                                        <th style={{ whiteSpace: 'nowrap' }}>Room No</th>
                                        <th>Issue</th>
                                        <th>Description</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((complaint) => (
                                        <tr key={complaint.id}>
                                            <td>#{complaint.id}</td>
                                            <td>{complaint.studentName}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>{complaint.roomNumber || 'N/A'}</td>
                                            <td>{complaint.title}</td>
                                            <td className="description-cell" title={complaint.description}>{complaint.description}</td>
                                            <td>
                                                {complaint.createdAt
                                                    ? new Date(complaint.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                    : 'N/A'}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                                                    {getStatusIcon(complaint.status)}
                                                    {complaint.status}
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    className="status-select"
                                                    value={complaint.status}
                                                    onChange={(e) => handleStatusUpdate(complaint.id, e.target.value)}
                                                    disabled={updatingId === complaint.id}
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="RESOLVED">Resolved</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="warden-dashboard">
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
                            <span className="logo-text">HostelHub Warden</span>
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
                                <h1 className="dashboard-title">
                                    {activeMenu === 'complaints' ? 'All Complaints' : `Welcome back, ${userName || 'Warden'}!`}
                                </h1>
                                <p className="dashboard-subtitle">
                                    {activeMenu === 'complaints'
                                        ? 'Review and update the status of all student complaints'
                                        : 'Overview of hostel complaint activity'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats cards always visible */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon pending-bg"><Clock size={24} /></div>
                            <div>
                                <p className="stat-label">Pending</p>
                                <p className="stat-value">{pending}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon in-progress-bg"><AlertCircle size={24} /></div>
                            <div>
                                <p className="stat-label">In Progress</p>
                                <p className="stat-value">{inProgress}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon resolved-bg"><CheckCircle size={24} /></div>
                            <div>
                                <p className="stat-label">Resolved</p>
                                <p className="stat-value">{resolved}</p>
                            </div>
                        </div>
                    </div>

                    {/* Complaints table */}
                    {renderComplaintsTable()}
                </motion.div>
            </main>
        </div>
    );
};

export default WardenDashboard;
