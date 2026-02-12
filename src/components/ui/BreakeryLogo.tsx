import { cn } from '@/lib/utils';

interface BreakeryLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'gold';
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: { icon: 20, text: 'text-sm', gap: 'gap-1.5' },
  md: { icon: 28, text: 'text-base', gap: 'gap-2' },
  lg: { icon: 40, text: 'text-xl', gap: 'gap-2.5' },
  xl: { icon: 64, text: 'text-3xl', gap: 'gap-3' },
};

const variantColors = {
  light: { primary: '#F5F4F1', secondary: '#A8A29E' },
  dark: { primary: '#1C1917', secondary: '#57534E' },
  gold: { primary: '#C9A55C', secondary: '#9A7B3A' },
};

export function BreakeryLogo({
  size = 'md',
  variant = 'gold',
  className,
  showText = true,
}: BreakeryLogoProps) {
  const { icon, text, gap } = sizeMap[size];
  const colors = variantColors[variant];

  return (
    <div className={cn('inline-flex items-center', gap, className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Stylized wheat/bread mark for The Breakery */}
        <circle cx="32" cy="32" r="30" stroke={colors.primary} strokeWidth="2" fill="none" />
        {/* Simplified croissant shape */}
        <path
          d="M18 38c2-8 8-14 14-14s12 6 14 14"
          stroke={colors.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M22 36c1.5-5 5-9 10-9s8.5 4 10 9"
          stroke={colors.primary}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        {/* Wheat accent lines */}
        <path
          d="M26 20l6-4 6 4"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M28 17l4-3 4 3"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.5"
        />
        {/* Bottom text baseline */}
        <line
          x1="20"
          y1="46"
          x2="44"
          y2="46"
          stroke={colors.secondary}
          strokeWidth="1"
          opacity="0.3"
        />
      </svg>
      {showText && (
        <span
          className={cn('font-display font-semibold tracking-tight', text)}
          style={{ color: colors.primary }}
        >
          The Breakery
        </span>
      )}
    </div>
  );
}
