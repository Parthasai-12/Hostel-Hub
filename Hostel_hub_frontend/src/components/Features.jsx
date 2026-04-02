import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2, Clock, LayoutDashboard } from 'lucide-react';
import './Features.css';

const Features = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const features = [
        {
            icon: <CheckCircle2 size={48} />,
            iconBg: '#EEF2FF',
            iconColor: '#667eea',
            title: 'Student Complaint Portal',
            description: 'Students can easily raise complaints related to hostel facilities such as food, maintenance, and cleanliness. Each complaint can be tracked in real-time, ensuring transparency and accountability throughout the resolution process.',
            items: ['Raise complaints with detailed descriptions', 'Upload images for better clarity', 'Track status: Pending → In Progress → Resolved', 'View complete complaint history'],
        },
        {
            icon: <Clock size={48} />,
            iconBg: '#FEF3C7',
            iconColor: '#F59E0B',
            title: 'Warden Resolution Panel',
            description: 'Wardens and authorities are responsible for handling assigned complaints. They can update the status, add resolution notes, and ensure that issues are addressed promptly and effectively.',
            items: ['View assigned complaints', 'Update complaint status', 'Add resolution comments', 'Manage multiple issues efficiently'],
        },
        {
            icon: <LayoutDashboard size={48} />,
            iconBg: '#DBEAFE',
            iconColor: '#3B82F6',
            title: 'Admin Management System',
            description: 'Admins oversee the entire system by managing users, assigning complaints to wardens, and monitoring overall hostel operations. This ensures smooth coordination and faster issue resolution.',
            items: ['Create and manage wardens', 'Monitor all complaints', 'View system-wide analytics'],
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: 'easeOut',
            },
        },
    };

    return (
        <section className="features" id="features" ref={ref}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="section-title">System Overview</h2>
                </motion.div>

                <motion.div
                    className="features-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="feature-card"
                            variants={cardVariants}
                            whileHover={{
                                y: -10,
                                transition: { duration: 0.3 },
                            }}
                        >
                            <motion.div
                                className="feature-icon"
                                style={{ backgroundColor: feature.iconBg }}
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div style={{ color: feature.iconColor }}>
                                    {feature.icon}
                                </div>
                            </motion.div>

                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>

                            <ul className="feature-list">
                                {feature.items.map((item, itemIndex) => (
                                    <motion.li
                                        key={itemIndex}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                        transition={{ delay: index * 0.2 + itemIndex * 0.1 + 0.3 }}
                                    >
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Features;
