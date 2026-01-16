import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    className = '',
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    children,
    ...props
}) => {
    return (
        <button
            className={`btn btn-${variant} ${className}`}
            {...props}
        >
            {leftIcon && <span className="flex items-center">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex items-center">{rightIcon}</span>}
        </button>
    );
};
