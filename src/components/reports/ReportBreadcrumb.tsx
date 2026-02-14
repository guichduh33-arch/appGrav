import { ChevronRight } from 'lucide-react';

export interface BreadcrumbLevel {
  label: string;
  onClick?: () => void;
}

interface ReportBreadcrumbProps {
  levels: BreadcrumbLevel[];
}

/**
 * Breadcrumb component for report drill-down navigation
 * Each level is clickable except the last (current) level
 */
export function ReportBreadcrumb({ levels }: ReportBreadcrumbProps) {
  if (levels.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-sm mb-4" aria-label="Breadcrumb">
      {levels.map((level, index) => {
        const isLast = index === levels.length - 1;
        const isClickable = !isLast && level.onClick;

        return (
          <div key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
            )}
            {isClickable ? (
              <button
                onClick={level.onClick}
                className="text-[var(--color-gold)] hover:text-[var(--color-gold)]/80 hover:underline transition-colors"
              >
                {level.label}
              </button>
            ) : (
              <span className={isLast ? 'text-white font-medium' : 'text-[var(--theme-text-muted)]'}>
                {level.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
