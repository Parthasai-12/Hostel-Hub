import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Send, AlertCircle } from 'lucide-react';
import api from '../services/api';
import './ComplaintForm.css';

const ComplaintForm = ({ onNavigate, onAddComplaint }) => {
    const [formData, setFormData] = useState({
        category: '',
        description: '',
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = [
        'Electrical Issue',
        'Plumbing Issue',
        'Furniture Damage',
        'WiFi/Internet',
        'Cleanliness',
        'Security',
        'Other',
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.category);
            formDataToSend.append('description', formData.description);
            if (image) {
                formDataToSend.append('image', image);
            }

            const response = await api.post('/complaints', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (onAddComplaint) {
                onAddComplaint(response.data);
            }

            alert('Complaint submitted successfully!');

            // Reset form
            setFormData({
                category: '',
                description: '',
            });
            setImage(null);
            setImagePreview(null);

            // Navigate back to dashboard
            onNavigate('dashboard');
        } catch (err) {
// logger removed
            setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="complaint-form-container">
            <motion.div
                className="complaint-form-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="form-header">
                    <button
                        onClick={() => onNavigate('landing')}
                        className="back-btn"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#667eea',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '1rem',
                            padding: '0'
                        }}
                    >
                        ← Back to Home
                    </button>
                    <div className="form-icon">
                        <FileText size={32} />
                    </div>
                    <h2 className="form-title">Raise a Complaint</h2>
                    <p className="form-subtitle">Tell us about your issue and we'll get it resolved</p>
                </div>

                <form onSubmit={handleSubmit} className="complaint-form">
                    {error && (
                        <motion.div
                            className="error-message"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                background: '#fef2f2',
                                border: '1px solid #fee2e2',
                                padding: '1rem',
                                borderRadius: '8px',
                                color: '#dc2626',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '1.5rem',
                                fontSize: '0.875rem'
                            }}
                        >
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                    <div className="form-group">
                        <label htmlFor="category" className="form-label">
                            Complaint Category
                        </label>
                        <div className="select-wrapper">
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description" className="form-label">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="form-textarea"
                            placeholder="Describe your complaint in detail..."
                            rows="6"
                            required
                        />
                        <p className="form-hint">
                            Please provide as much detail as possible to help us resolve your issue quickly
                        </p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="image" className="form-label">
                            Attach Image (Optional)
                        </label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="form-input"
                            style={{
                                padding: '0.75rem',
                                border: '2px dashed #e2e8f0',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        />
                        {imagePreview && (
                            <div style={{ marginTop: '1rem' }}>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '200px',
                                        borderRadius: '8px',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <motion.button
                        type="submit"
                        className="submit-button"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!formData.category || !formData.description || isLoading}
                    >
                        {isLoading ? (
                            <div className="loader" style={{
                                width: '20px',
                                height: '20px',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '50%',
                                borderTopColor: 'white',
                                animation: 'spin 1s ease-in-out infinite'
                            }}></div>
                        ) : (
                            <>
                                <Send size={20} />
                                Submit Complaint
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default ComplaintForm;
