import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { BASE_URL } from '../services/api';
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
    Trash2,
    Filter,
    FileText
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

    const [complaints, setComplaints] = useState([]);
    const [wardens, setWardens] = useState([]);
    const [failedEmails, setFailedEmails] = useState([]);
    const [loadingEmails, setLoadingEmails] = useState(false);
    const [resendingId, setResendingId] = useState(null);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'ADMIN') {
            onLogout();
        }
    }, []);

    useEffect(() => {
        if (activeMenu === 'all-complaints') fetchComplaints();
        if (activeMenu === 'manage-wardens') fetchWardens();
        if (activeMenu === 'failed-emails') fetchFailedEmails();
    }, [activeMenu, statusFilter, categoryFilter]);

    const fetchComplaints = async () => {
        setLoadingData(true);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (categoryFilter) params.category = categoryFilter;
            const res = await api.get('/complaints/admin/all', { params });
            setComplaints(res.data);
        } catch (err) {
            console.error('Failed to fetch complaints', err);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchWardens = async () => {
        setLoadingData(true);
        try {
            const res = await api.get('/api/admin/wardens');
            setWardens(res.data);
        } catch (err) {
            console.error('Failed to fetch wardens', err);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchFailedEmails = async () => {
        setLoadingEmails(true);
        try {
            const res = await api.get('/api/admin/email-monitoring/dlq-messages');
            setFailedEmails(res.data);
        } catch (err) {
            console.error('Failed to fetch failed emails', err);
        } finally {
            setLoadingEmails(false);
        }
    };

    const handleResendFailedEmail = async (messageId) => {
        setResendingId(messageId);
        try {
            await api.post(`/api/admin/email-monitoring/dlq-messages/${messageId}/resend`);
            alert('Email resend successfully initiated!');
            fetchFailedEmails();
        } catch (err) {
            console.error('Failed to resend email', err);
            const msg = err.response?.data?.message || 'Failed to resend email.';
            alert(msg);
        } finally {
            setResendingId(null);
        }
    };

    const getFormattedPayload = (payload) => {
        try {
            return JSON.stringify(JSON.parse(payload), null, 2);
        } catch (e) {
            return payload;
        }
    };

    const handleDeleteComplaint = async (id) => {
        if (!window.confirm('Are you sure you want to delete this complaint?')) return;
        try {
            await api.delete(`/complaints/admin/${id}`);
            fetchComplaints();
        } catch (err) {
            alert('Failed to delete complaint');
        }
    };

    const handleRemoveWarden = async (id) => {
        if (!window.confirm('Are you sure you want to remove this warden?')) return;
        try {
            await api.delete(`/api/admin/wardens/${id}`);
            fetchWardens();
        } catch (err) {
            alert('Failed to remove warden');
        }
    };

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
        { id: 'all-complaints', label: 'All Complaints', icon: <FileText size={20} /> },
        { id: 'manage-wardens', label: 'Manage Wardens', icon: <Users size={20} /> },
        { id: 'failed-emails', label: 'Failed Emails', icon: <Mail size={20} /> },
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

    const renderAllComplaints = () => (
        <motion.div
            className="content-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">System Complaints</h1>
                    <p className="dashboard-subtitle">Monitor all complaints and delete them if necessary</p>
                </div>
            </div>
            
            <div className="table-card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>Status Filter</label>
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>Category Filter</label>
                        <select 
                            value={categoryFilter} 
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        >
                            <option value="">All Categories</option>
                            <option value="FOOD">Food</option>
                            <option value="ELECTRICITY">Electricity</option>
                            <option value="CLEANLINESS">Cleanliness</option>
                            <option value="WATER">Water</option>
                            <option value="INTERNET">Internet</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                </div>

                <div className="table-wrapper">
                    {loadingData ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading complaints...</div>
                    ) : complaints.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No complaints found.</div>
                    ) : (
                        <table className="complaints-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>ID</th>
                                    <th>Student</th>
                                    <th>Category</th>
                                    <th>Title</th>
                                    <th>Image</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map((c, index) => (
                                    <tr key={c.id}>
                                        <td>{index + 1}</td>
                                        <td>#{c.id}</td>
                                        <td>{c.studentName} {c.roomNumber ? `(${c.roomNumber})` : ''}</td>
                                        <td>{c.category}</td>
                                        <td>{c.title}</td>
                                        <td className="image-cell">
                                            {c.imageUrl ? (
                                                <img 
                                                    src={`${BASE_URL}${c.imageUrl}`} 
                                                    alt="Complaint" 
                                                    className="complaint-image-preview"
                                                    style={{ 
                                                        width: '50px', 
                                                        height: '50px', 
                                                        objectFit: 'cover', 
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => window.open(`${BASE_URL}${c.imageUrl}`, '_blank')}
                                                />
                                            ) : (
                                                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No image</span>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                                                background: c.status === 'RESOLVED' ? 'rgba(16,185,129,0.15)' : c.status === 'IN_PROGRESS' ? 'rgba(234,179,8,0.15)' : 'rgba(100,116,139,0.15)',
                                                color: c.status === 'RESOLVED' ? '#10b981' : c.status === 'IN_PROGRESS' ? '#eab308' : '#cbd5e1'
                                            }}>{c.status}</span>
                                        </td>
                                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button onClick={() => handleDeleteComplaint(c.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }} title="Delete Complaint">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </motion.div>
    );

    const renderManageWardens = () => (
        <motion.div
            className="content-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Manage Wardens</h1>
                    <p className="dashboard-subtitle">View and remove hostel wardens</p>
                </div>
            </div>
            
            <div className="table-card">
                <div className="table-wrapper">
                    {loadingData ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading wardens...</div>
                    ) : wardens.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No wardens found.</div>
                    ) : (
                        <table className="complaints-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wardens.map((w, index) => (
                                    <tr key={w.id}>
                                        <td>{index + 1}</td>
                                        <td>#{w.id}</td>
                                        <td>{w.name}</td>
                                        <td>{w.email}</td>
                                        <td>
                                            <button onClick={() => handleRemoveWarden(w.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Trash2 size={16} /> Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </motion.div>
    );

    const renderFailedEmails = () => (
        <motion.div
            className="content-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Failed Email Notifications</h1>
                    <p className="dashboard-subtitle">Monitor and resend failed email notifications from the DLQ</p>
                </div>
            </div>

            <div className="table-card">
                <div className="table-wrapper">
                    {loadingEmails ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading failed emails...</div>
                    ) : failedEmails.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No failed email notifications found.</div>
                    ) : (
                        <table className="complaints-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Recipient</th>
                                    <th>Type</th>
                                    <th>Failure Reason</th>
                                    <th>Timestamp</th>
                                    <th>Retries</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {failedEmails.map((email, index) => (
                                    <tr key={email.messageId}>
                                        <td>{index + 1}</td>
                                        <td style={{ wordBreak: 'break-all' }}>{email.emailRecipient}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                                                background: email.emailType === 'OTP' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                color: email.emailType === 'OTP' ? '#3B82F6' : '#10b981'
                                            }}>{email.emailType}</span>
                                        </td>
                                        <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={email.failureReason}>
                                            {email.failureReason}
                                        </td>
                                        <td>{new Date(email.failedTimestamp).toLocaleString()}</td>
                                        <td>{email.retryCount}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => setSelectedEmail(email)}
                                                    style={{ background: 'rgba(102, 126, 234, 0.1)', color: '#667eea', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => handleResendFailedEmail(email.messageId)}
                                                    disabled={resendingId === email.messageId}
                                                    style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', opacity: resendingId === email.messageId ? 0.5 : 1 }}
                                                >
                                                    {resendingId === email.messageId ? 'Resending...' : 'Resend'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal for Details */}
            {selectedEmail && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="table-card" 
                        style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}
                    >
                        <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <h3 className="table-title">Failed Email Details</h3>
                            <button onClick={() => setSelectedEmail(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
                            <div>
                                <strong style={{ color: '#e2e8f0' }}>Message ID:</strong>
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.25rem', wordBreak: 'break-all' }}>{selectedEmail.messageId}</div>
                            </div>
                            <div>
                                <strong style={{ color: '#e2e8f0' }}>Recipient:</strong>
                                <div style={{ marginTop: '0.25rem', wordBreak: 'break-all' }}>{selectedEmail.emailRecipient}</div>
                            </div>
                            <div>
                                <strong style={{ color: '#e2e8f0' }}>Email Type:</strong>
                                <div style={{ marginTop: '0.25rem' }}>{selectedEmail.emailType}</div>
                            </div>
                            <div>
                                <strong style={{ color: '#e2e8f0' }}>Failure Reason:</strong>
                                <div style={{ background: 'rgba(239, 68, 68, 0.05)', borderLeft: '4px solid #ef4444', padding: '0.75rem', borderRadius: '4px', color: '#fca5a5', fontSize: '0.9rem', marginTop: '0.25rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{selectedEmail.failureReason}</div>
                            </div>
                            <div>
                                <strong style={{ color: '#e2e8f0' }}>Message Payload:</strong>
                                <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#a7f3d0', overflowX: 'auto', marginTop: '0.25rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                    {getFormattedPayload(selectedEmail.messagePayload)}
                                </pre>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
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
                {activeMenu === 'create-warden' ? renderCreateWarden() : 
                 activeMenu === 'all-complaints' ? renderAllComplaints() :
                 activeMenu === 'manage-wardens' ? renderManageWardens() : 
                 activeMenu === 'failed-emails' ? renderFailedEmails() :
                 renderDashboardHome()}
            </main>
        </div>
    );
};

export default AdminDashboard;
