import React, { HTMLAttributes } from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({
    className = '',
    variant = 'neutral',
    children,
    ...props
}) => {
    return (
        <span className={`badge badge-${variant} ${className}`} {...props}>
            {children}
        </span>
    );
};
