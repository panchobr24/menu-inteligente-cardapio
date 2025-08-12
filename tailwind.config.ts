
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
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
				// Custom food theme colors
				appetite: {
					50: 'hsl(15, 100%, 97%)',
					100: 'hsl(15, 100%, 94%)',
					200: 'hsl(15, 100%, 87%)',
					300: 'hsl(15, 100%, 78%)',
					400: 'hsl(15, 97%, 67%)',
					500: 'hsl(15, 95%, 58%)',
					600: 'hsl(15, 85%, 50%)',
					700: 'hsl(15, 85%, 42%)',
					800: 'hsl(15, 82%, 35%)',
					900: 'hsl(15, 80%, 30%)',
					950: 'hsl(15, 85%, 16%)'
				},
				nutrition: {
					50: 'hsl(142, 76%, 96%)',
					100: 'hsl(142, 72%, 91%)',
					200: 'hsl(142, 77%, 80%)',
					300: 'hsl(142, 76%, 65%)',
					400: 'hsl(142, 69%, 48%)',
					500: 'hsl(142, 71%, 39%)',
					600: 'hsl(142, 76%, 31%)',
					700: 'hsl(142, 75%, 25%)',
					800: 'hsl(142, 70%, 21%)',
					900: 'hsl(142, 65%, 17%)',
					950: 'hsl(142, 80%, 9%)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundImage: {
				'food-gradient': 'linear-gradient(135deg, hsl(15, 95%, 58%) 0%, hsl(15, 85%, 50%) 100%)',
				'nutrition-gradient': 'linear-gradient(135deg, hsl(142, 71%, 39%) 0%, hsl(142, 76%, 31%) 100%)',
				'hero-gradient': 'linear-gradient(135deg, hsl(15, 95%, 58%) 0%, hsl(142, 71%, 39%) 100%)'
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
				},
				'slide-up': {
					from: {
						transform: 'translateY(20px)',
						opacity: '0'
					},
					to: {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'fade-in': {
					from: {
						opacity: '0'
					},
					to: {
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'fade-in': 'fade-in 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
