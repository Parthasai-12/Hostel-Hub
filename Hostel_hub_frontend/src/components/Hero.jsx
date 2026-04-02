import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { LogIn } from 'lucide-react';
import Button from './Button';
import './Hero.css';

const Hero = ({ onNavigate, isLoggedIn }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    const floatingCards = [
        { icon: '📝', text: 'New Complaint', delay: 0 },
        { icon: '✓', text: 'Resolved', delay: 0.2 },
        { icon: '⏱️', text: 'In Progress', delay: 0.4 },
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

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: 'easeOut',
            },
        },
    };

    const handleLogin = () => {
        onNavigate('login');
    };

    return (
        <section className="hero" id="home" ref={ref}>
            <div className="hero-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="container hero-container">
                <motion.div
                    className="hero-content"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                >
                    <motion.h1 className="hero-title" variants={itemVariants}>
                        Simple Hostel Complaint Management
                    </motion.h1>

                    <motion.p className="hero-description" variants={itemVariants}>
                        HostelHub is a complete complaint management platform designed to streamline communication between students, wardens, and administrators. It ensures that issues are reported, tracked, and resolved efficiently through a structured workflow.
                    </motion.p>

                    <motion.div className="hero-buttons" variants={itemVariants}>
                        {!isLoggedIn ? (
                            <Button
                                variant="primary"
                                icon={<LogIn size={20} />}
                                onClick={handleLogin}
                            >
                                Login
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={() => onNavigate('dashboard')}
                            >
                                Go to Dashboard
                            </Button>
                        )}
                    </motion.div>
                </motion.div>

                <div className="hero-illustration">
                    {floatingCards.map((card, index) => (
                        <motion.div
                            key={index}
                            className={`floating-card card-${index + 1}`}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{
                                opacity: isInView ? 1 : 0,
                                y: isInView ? 0 : 50,
                            }}
                            transition={{
                                delay: card.delay,
                                duration: 0.6,
                                ease: 'easeOut',
                            }}
                            whileHover={{
                                scale: 1.1,
                                rotate: 5,
                                transition: { duration: 0.3 },
                            }}
                        >
                            <div className="card-icon">{card.icon}</div>
                            <div className="card-text">{card.text}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Hero;
