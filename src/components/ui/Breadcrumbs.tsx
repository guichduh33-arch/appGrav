import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
    className?: string
}

/**
 * Reusable breadcrumb navigation component for deep pages.
 * Uses react-router-dom Link for client-side navigation.
 */
export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
    if (items.length <= 1) return null

    return (
        <nav
            className={`flex items-center gap-1.5 text-sm mb-4 flex-wrap ${className}`}
            aria-label="Breadcrumb"
        >
            {items.map((item, index) => {
                const isLast = index === items.length - 1

                return (
                    <div key={index} className="flex items-center gap-1.5">
                        {index > 0 && (
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                        )}
                        {!isLast && item.href ? (
                            <Link
                                to={item.href}
                                className="text-muted-foreground hover:text-primary hover:underline transition-colors min-h-[44px] flex items-center"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className={isLast ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                {item.label}
                            </span>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
