import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    icon,
    onClick,
    className = '',
    ...props
}) => {
    const [ripples, setRipples] = useState([]);

    const handleClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newRipple = {
            x,
            y,
            id: Date.now(),
        };

        setRipples([...ripples, newRipple]);

        setTimeout(() => {
            setRipples((prevRipples) => prevRipples.filter((r) => r.id !== newRipple.id));
        }, 600);

        if (onClick) {
            onClick(e);
        }
    };

    return (
        <motion.button
            className={`btn btn-${variant} ${className}`}
            onClick={handleClick}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            {...props}
        >
            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    className="ripple"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                    }}
                />
            ))}
            {icon && <span className="btn-icon">{icon}</span>}
            <span className="btn-text">{children}</span>
        </motion.button>
    );
};

export default Button;
