import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { BASE_URL } from '../services/api';
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
    const [modalOpen, setModalOpen] = useState(false);
    const [modalComplaint, setModalComplaint] = useState(null);
    const [modalStatus, setModalStatus] = useState('PENDING');
    const [modalEstimatedDays, setModalEstimatedDays] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalRemarks, setModalRemarks] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'WARDEN') {
// logger removed
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
// logger removed
            setError('Failed to load complaints. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusSelectChange = (complaint, newStatus) => {
        setModalComplaint(complaint);
        setModalStatus(newStatus);
        setModalEstimatedDays(complaint.estimatedResolutionDays || '');
        setModalMessage(complaint.progressMessage || '');
        setModalRemarks('');
        setModalOpen(true);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        if (!modalComplaint) return;

        try {
            setUpdatingId(modalComplaint.id);
            setModalOpen(false);
            
            const payload = {
                status: modalStatus,
                estimatedDays: modalEstimatedDays ? parseInt(modalEstimatedDays, 10) : null,
                message: modalMessage,
                remarks: modalStatus === 'RESOLVED' ? modalRemarks : ''
            };

            await api.put(`/complaints/${modalComplaint.id}/status`, payload);
            await fetchComplaints();
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setUpdatingId(null);
            setModalComplaint(null);
        }
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setModalComplaint(null);
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
                                        <th>Image</th>
                                        <th style={{ textAlign: 'center' }}>Affected</th>
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
                                            <td className="image-cell">
                                                {complaint.imageUrl ? (
                                                    <img 
                                                        src={`${BASE_URL}${complaint.imageUrl}`} 
                                                        alt="Complaint" 
                                                        className="complaint-image-preview"
                                                        style={{ 
                                                            width: '50px', 
                                                            height: '50px', 
                                                            objectFit: 'cover', 
                                                            borderRadius: '4px',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => window.open(`${BASE_URL}${complaint.imageUrl}`, '_blank')}
                                                    />
                                                ) : (
                                                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No image</span>
                                                )}
                                            </td>
                                            <td style={{ 
                                                textAlign: 'center', 
                                                fontWeight: '700', 
                                                color: (complaint.duplicateCount > 1) ? '#fb923c' : 'var(--text-secondary)' 
                                            }}>
                                                {complaint.duplicateCount || 1}
                                            </td>
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
                                                    onChange={(e) => handleStatusSelectChange(complaint, e.target.value)}
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

            {/* Modal Overlay Form */}
            <AnimatePresence>
                {modalOpen && (
                    <motion.div 
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="modal-content"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            <div className="modal-header">
                                <h3 className="modal-title">Update Complaint Status</h3>
                                <button className="modal-close" onClick={handleModalClose}>
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select 
                                        className="form-select"
                                        value={modalStatus}
                                        onChange={(e) => setModalStatus(e.target.value)}
                                        required
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="RESOLVED">Resolved</option>
                                    </select>
                                </div>

                                {modalStatus === 'IN_PROGRESS' && (
                                    <div className="form-group">
                                        <label className="form-label">Estimated Resolution Days</label>
                                        <input 
                                            type="number"
                                            className="form-input"
                                            value={modalEstimatedDays}
                                            onChange={(e) => setModalEstimatedDays(e.target.value)}
                                            min="1"
                                            placeholder="Enter number of days"
                                            required
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">Progress Message</label>
                                    <textarea 
                                        className="form-textarea"
                                        value={modalMessage}
                                        onChange={(e) => setModalMessage(e.target.value)}
                                        placeholder="Explain current progress or next steps..."
                                        required
                                    />
                                </div>

                                {modalStatus === 'RESOLVED' && (
                                    <div className="form-group">
                                        <label className="form-label">Resolution Remarks (optional)</label>
                                        <textarea 
                                            className="form-textarea"
                                            value={modalRemarks}
                                            onChange={(e) => setModalRemarks(e.target.value)}
                                            placeholder="Enter resolution remarks that will be sent via email..."
                                        />
                                    </div>
                                )}

                                <div className="modal-footer">
                                    <button type="button" className="btn-cancel" onClick={handleModalClose}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-submit">
                                        Submit Update
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WardenDashboard;
