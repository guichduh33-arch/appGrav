import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    title?: string;
    action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
    className = '',
    title,
    action,
    children,
    ...props
}) => {
    return (
        <div className={`card ${className}`} {...props}>
            {(title || action) && (
                <div className="card-header">
                    {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="card-body">
                {children}
            </div>
        </div>
    );
};
