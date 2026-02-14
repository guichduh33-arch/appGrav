import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardKpiCardProps {
    label: string;
    value: string;
    icon: ReactNode;
    iconColor?: string;
    className?: string;
}

/**
 * Stitch-style premium KPI card with large prominent value.
 * Used on the Dashboard "Executive Summary" row.
 */
export function DashboardKpiCard({
    label,
    value,
    icon,
    iconColor = 'var(--color-gold)',
    className,
}: DashboardKpiCardProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl p-6',
                'bg-[var(--onyx-surface)] border border-white/5',
                'hover:border-white/10 transition-all duration-300',
                'group',
                className
            )}
        >
            {/* Subtle gradient accent at top */}
            <div
                className="absolute top-0 left-0 right-0 h-[1px] opacity-40"
                style={{
                    background: `linear-gradient(90deg, transparent 0%, ${iconColor} 50%, transparent 100%)`,
                }}
            />

            {/* Icon */}
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `color-mix(in srgb, ${iconColor} 10%, transparent)` }}
            >
                {icon}
            </div>

            {/* Label */}
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-smoke)] mb-2">
                {label}
            </p>

            {/* Value */}
            <p className="text-3xl font-bold text-white tracking-tight">
                {value}
            </p>
        </div>
    );
}
