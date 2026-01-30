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
  				'var(--font-mono)'
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
  			toast: 'var(--z-toast)'
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
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
