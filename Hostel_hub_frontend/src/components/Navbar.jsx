import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ scrolled, onNavigate, isLoggedIn, onLogout }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);

    const navItems = [
        { id: 'home', label: 'Home' },
        { id: 'features', label: 'Features' },
        { id: 'complaints', label: 'Complaints' },
    ];

    // Only add Profile to nav items if logged in (or maybe not? The requirements said "View Profile" in dropdown)
    // The previous code had 'Profile' in navItems. 
    // Requirement says: "When logged in... Remove ALL login buttons... Show a circular profile avatar button... Dropdown actions: View Profile"
    // So 'Profile' should NOT be a regular nav item anymore if it's in the dropdown. 
    // However, I should probably keep 'Complaints' visible if it's a public section? 
    // Actually, complaints seem to be dashboard feature.
    // The previous navItems list was: Home, Features, Complaints, Profile.
    // I will stick to Home and Features for public. 
    // If logged in, maybe show Dashboard link? 
    // Let's stick to the requirements: "WHEN USER IS LOGGED IN: Remove ALL login buttons... Show ... profile avatar".
    // I will remove 'Profile' from the main list as it's now in the dropdown.

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['home', 'features']; // Reduced list for landing page scrolling
            const scrollPosition = window.scrollY + 100;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Also fetch user details if logged in
        if (isLoggedIn) {
            // We can't really async fetch easily in this effect if we want to avoid multiple calls or race conditions
            // but for a simple avatar initial, we might need name.
            // Or we can just use a generic icon until the dropdown is opened?
            // Requirement: "Avatar should show: First letter of user's name OR Generic user icon"
            // Fetching on mount if loggedIn seems appropriate.
            import('../services/api').then(({ default: api }) => {
                api.get('/users/me').then(res => {
                    setUser(res.data);
                }).catch(err => console.log('Failed to fetch user generic info', err));
            });
        }
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoggedIn]);

    const scrollToSection = (sectionId) => {
        if (sectionId === 'home' || sectionId === 'features') {
            const element = document.getElementById(sectionId);
            if (element) {
                const offsetTop = element.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth',
                });
            }
        } else if (sectionId === 'complaints') {
            // Assuming this navigates to something else or just scrolls if on page
            // Leaving as is for now if it exists on landing
        }

        setMobileMenuOpen(false);
    };

    return (
        <motion.nav
            className={`navbar ${scrolled ? 'scrolled' : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container nav-container">
                <motion.div
                    className="logo"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate('landing')}
                    style={{ cursor: 'pointer' }}
                >
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="32" rx="8" fill="url(#gradient)" />
                        <path d="M8 12h16M8 16h16M8 20h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        <defs>
                            <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                                <stop offset="0%" style={{ stopColor: '#667eea' }} />
                                <stop offset="100%" style={{ stopColor: '#764ba2' }} />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="logo-text">HostelHub</span>
                </motion.div>

                {/* Desktop Menu */}
                <ul className="nav-menu desktop-menu">
                    {navItems.filter(item => item.id !== 'profile' && (isLoggedIn || item.id !== 'complaints')).map((item, index) => (
                        <motion.li
                            key={item.id}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <a
                                href={`#${item.id}`}
                                className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (item.id === 'complaints' && isLoggedIn) {
                                        onNavigate('complaints');
                                    } else {
                                        scrollToSection(item.id);
                                    }
                                }}
                            >
                                {item.label}
                            </a>
                        </motion.li>
                    ))}

                    {!isLoggedIn ? (
                        <motion.li
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <motion.a
                                href="#login"
                                className="nav-link login-btn"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onNavigate('login');
                                }}
                            >
                                Login
                            </motion.a>
                        </motion.li>
                    ) : (
                        <motion.li
                            className="profile-menu-container"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <motion.button
                                className="profile-avatar-btn"
                                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
                            </motion.button>

                            <AnimatePresence>
                                {profileMenuOpen && (
                                    <motion.div
                                        className="profile-dropdown"
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    >
                                        <div className="profile-header">
                                            <p className="profile-name">{user?.name || 'User'}</p>
                                            <p className="profile-email">{user?.email || 'Loading...'}</p>
                                            <span className="profile-role">{user?.role || 'STUDENT'}</span>
                                        </div>
                                        <div className="profile-actions">
                                            <button onClick={() => { setProfileMenuOpen(false); onNavigate('profile'); }}>View Profile</button>
                                            <button onClick={() => { setProfileMenuOpen(false); onNavigate('dashboard'); }}>Dashboard</button>
                                            <button onClick={() => { setProfileMenuOpen(false); onLogout(); }} className="logout-btn">Logout</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.li>
                    )}
                </ul>

                {/* Mobile Menu Button - simplified for now, keeping core logic */}
                <motion.button
                    className="hamburger"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    whileTap={{ scale: 0.9 }}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className="mobile-menu"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ul className="mobile-nav-list">
                            {navItems.filter(item => item.id !== 'profile' && (isLoggedIn || item.id !== 'complaints')).map((item, index) => (
                                <motion.li
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <a
                                        href={`#${item.id}`}
                                        className={`mobile-nav-link ${activeSection === item.id ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            scrollToSection(item.id);
                                        }}
                                    >
                                        {item.label}
                                    </a>
                                </motion.li>
                            ))}
                            {!isLoggedIn ? (
                                <motion.li>
                                    <a href="#login" className="mobile-nav-link" onClick={(e) => { e.preventDefault(); onNavigate('login'); setMobileMenuOpen(false); }}>Login</a>
                                </motion.li>
                            ) : (
                                <>
                                    <motion.li>
                                        <a href="#" className="mobile-nav-link" onClick={() => { onNavigate('profile'); setMobileMenuOpen(false); }}>My Profile</a>
                                    </motion.li>
                                    <motion.li>
                                        <a href="#" className="mobile-nav-link" onClick={() => { onLogout(); setMobileMenuOpen(false); }}>Logout</a>
                                    </motion.li>
                                </>
                            )}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
