import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

export interface InventoryItem {
    id: string;
    name: string;
    current_stock: number;
    min_stock_level: number;
    unit_name: string;
    severity: string;
    supplier_name?: string;
}

interface InventoryMonitorProps {
    items: InventoryItem[];
    isLoading: boolean;
}

function getStockPercent(current: number, min: number): number {
    // Treat 2× min_stock_level as "full" for display purposes
    const full = min * 2;
    if (full <= 0) return 100;
    return Math.min(Math.round((current / full) * 100), 100);
}

function getBarColor(severity: string): string {
    switch (severity) {
        case 'critical':
            return 'var(--color-danger-text)';
        case 'warning':
            return 'var(--color-warning-text)';
        default:
            return 'var(--color-gold)';
    }
}

function getBarBg(severity: string): string {
    switch (severity) {
        case 'critical':
            return 'var(--color-danger-bg)';
        case 'warning':
            return 'var(--color-warning-bg)';
        default:
            return 'rgba(202, 176, 109, 0.1)';
    }
}

/**
 * Stitch-style Inventory Monitor widget.
 * Shows ingredient/product stock levels with progress bars and supplier names.
 */
export function InventoryMonitor({ items, isLoading }: InventoryMonitorProps) {
    return (
        <div className="bg-[var(--theme-bg-secondary)] rounded-2xl p-6 border border-[var(--theme-border)] shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Package size={16} className="text-[var(--theme-text-secondary)]" />
                    <h3 className="text-sm font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">
                        Inventory Monitor
                    </h3>
                    {items.length > 0 && (
                        <span className="bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] text-xs font-medium px-2 py-0.5 rounded-full border border-[var(--theme-border)]">
                            {items.length}
                        </span>
                    )}
                </div>
                <Link
                    to="/inventory"
                    className="text-sm text-[var(--color-gold)] hover:text-[var(--color-gold-light)] flex items-center gap-1 transition-colors"
                >
                    View all <ArrowRight size={14} />
                </Link>
            </div>
            <p className="text-xs text-[var(--theme-text-muted)] mb-5">
                Real-time status of raw materials and ingredients
            </p>

            {/* Content */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}
                </div>
            ) : items.length === 0 ? (
                <p className="text-sm text-[var(--theme-text-muted)] text-center py-8">
                    All stock levels are healthy
                </p>
            ) : (
                <div className="space-y-4">
                    {items.map(item => {
                        const percent = getStockPercent(item.current_stock, item.min_stock_level);
                        const barColor = getBarColor(item.severity);
                        const barBg = getBarBg(item.severity);

                        return (
                            <div
                                key={item.id}
                                className="group p-4 rounded-xl bg-[var(--theme-bg-tertiary)]/40 border border-[var(--theme-border)]/50 hover:border-[var(--theme-border)] transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="min-w-0">
                                        <span className="text-sm font-medium text-[var(--theme-text-primary)] block truncate">
                                            {item.name}
                                        </span>
                                        {item.supplier_name && (
                                            <span className="text-[11px] text-[var(--theme-text-muted)]">
                                                Supplier: {item.supplier_name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-3">
                                        <span className="text-xs font-mono text-[var(--theme-text-secondary)]">
                                            {item.current_stock} {item.unit_name}
                                        </span>
                                        <span
                                            className={cn(
                                                'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                                                item.severity === 'critical'
                                                    ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]'
                                                    : item.severity === 'warning'
                                                        ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]'
                                                        : 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]'
                                            )}
                                        >
                                            {item.severity}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div
                                    className="h-2 rounded-full overflow-hidden"
                                    style={{ backgroundColor: barBg }}
                                >
                                    <div
                                        className="h-2 rounded-full transition-all duration-700 ease-out"
                                        style={{
                                            width: `${percent}%`,
                                            backgroundColor: barColor,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
