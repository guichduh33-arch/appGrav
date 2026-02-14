/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          light: 'var(--color-gold-light)',
          dark: 'var(--color-gold-dark)',
          deep: 'var(--color-gold-deep)'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        success: {
          DEFAULT: 'var(--color-success)',
          bg: 'var(--color-success-bg)',
          text: 'var(--color-success-text)',
          border: 'var(--color-success-border)'
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          bg: 'var(--color-warning-bg)',
          text: 'var(--color-warning-text)',
          border: 'var(--color-warning-border)'
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          bg: 'var(--color-danger-bg)',
          text: 'var(--color-danger-text)',
          border: 'var(--color-danger-border)'
        },
        info: {
          DEFAULT: 'var(--color-info)',
          bg: 'var(--color-info-bg)',
          text: 'var(--color-info-text)',
          border: 'var(--color-info-border)'
        },
        flour: 'var(--color-flour)',
        cream: 'var(--color-cream)',
        kraft: 'var(--color-kraft)',
        parchment: 'var(--color-parchment)',
        wheat: 'var(--color-wheat)',
        charcoal: 'var(--color-charcoal)',
        espresso: 'var(--color-espresso)',
        smoke: 'var(--color-smoke)',
        stone: 'var(--color-stone)',
        sand: 'var(--color-sand)',
        gold: {
          light: 'var(--color-gold-light)',
          DEFAULT: 'var(--color-gold)',
          dark: 'var(--color-gold-dark)',
          deep: 'var(--color-gold-deep)'
        },
        kds: {
          accent: '#ec5b13',
          bg: 'var(--kds-bg)',
          surface: 'var(--kds-surface)',
          'surface-elevated': 'var(--kds-surface-elevated)',
          'surface-hover': 'var(--kds-surface-hover)',
          border: 'var(--kds-border)',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      fontFamily: {
        display: [
          'var(--font-display)'
        ],
        body: [
          'var(--font-body)'
        ],
        sans: [
          'var(--font-body)'
        ],
        mono: [
          'JetBrains Mono',
          'var(--font-mono)'
        ],
        fraunces: [
          'Fraunces', 'serif'
        ]
      },
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)'
      },
      spacing: {
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
        '3xl': 'var(--space-3xl)'
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 4px)',
        DEFAULT: 'var(--radius-md)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)'
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        glow: 'var(--shadow-glow)'
      },
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        'modal-backdrop': 'var(--z-modal-backdrop)',
        modal: 'var(--z-modal)',
        toast: 'var(--z-toast)',
        tooltip: '600'
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)'
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
        bounce: 'var(--ease-bounce)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'pulse-preparing': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' }
        },
        'pulse-ready': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' }
        },
        'countdown-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.1)' }
        },
        'pin-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' }
        },
        'slideInFromLeft': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' }
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' }
        },
        'pulse-alert': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        },
        'pulse-urgent': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' }
        },
        'pulse-new': {
          '0%, 100%': { boxShadow: '0 0 6px rgba(236, 91, 19, 0.2)' },
          '50%': { boxShadow: '0 0 10px rgba(236, 91, 19, 0.35)' }
        },
        'pulse-critical': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(239, 68, 68, 0.3)' },
          '50%': { boxShadow: '0 0 14px rgba(239, 68, 68, 0.5)' }
        },
        'pulse-mobile': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 15px rgba(139, 92, 246, 0.6)' }
        },
        'blink-hold': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        },
        'card-exit': {
          from: { opacity: '1', transform: 'translateY(0) scale(1)' },
          to: { opacity: '0', transform: 'translateY(-20px) scale(0.95)' }
        },
        'sh-fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'sh-slide-up': {
          from: { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        'sh-spin': {
          to: { transform: 'rotate(360deg)' }
        },
        'sh-card-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'sh-expand-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'slide-down': {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(0)' }
        },
        'grow-up': {
          from: { transform: 'scaleY(0)' },
          to: { transform: 'scaleY(1)' }
        },
        'grow-width': {
          from: { width: '0' },
          to: { width: 'var(--target-width, 100%)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-preparing': 'pulse-preparing 1.5s ease-in-out infinite',
        'pulse-ready': 'pulse-ready 0.5s ease-in-out',
        'countdown-pulse': 'countdown-pulse 1s infinite',
        'pin-shake': 'pin-shake 0.5s ease-in-out',
        'slideInFromLeft': 'slideInFromLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slide-up 0.3s ease',
        'pulse-alert': 'pulse-alert 1s ease-in-out infinite',
        'pulse-urgent': 'pulse-urgent 1s infinite',
        'pulse-new': 'pulse-new 3s infinite',
        'pulse-critical': 'pulse-critical 2s infinite',
        'pulse-mobile': 'pulse-mobile 2s infinite',
        'blink-hold': 'blink-hold 1s infinite',
        'card-exit': 'card-exit 300ms ease-out forwards',
        'sh-fade-in': 'sh-fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'sh-slide-up': 'sh-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'sh-spin': 'sh-spin 0.8s linear infinite',
        'sh-card-in': 'sh-card-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'sh-expand-in': 'sh-expand-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slide-down 0.3s ease-out',
        'grow-up': 'grow-up 0.8s ease-out backwards',
        'grow-width': 'grow-width 0.8s ease-out backwards'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
