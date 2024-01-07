/** @type {import('tailwindcss').Config} */
export default {
	content: ['./app/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {
			animation: {
				'fade-in-scale-up': 'fade-in-scale-up 0.5s ease-in-out',
				'slide-in-from-right': 'slide-in-from-right 0.25s ease-out',
				'fade-in': 'fade-in 0.5s ease-in-out',
			},
			keyframes: {
				'fade-in-scale-up': {
					from: {
						opacity: 0,
						transform: 'scale(0)',
					},
					to: {
						opacity: 1,
						transform: 'scale(1)',
					},
				},
				'slide-in-from-right': {
					from: {
						opacity: 0,
						transform: 'translateX(100%)',
					},
					to: {
						opacity: 1,
						transform: 'translateX(0)',
					},
				},
				'fade-in': {
					'0%': {
						opacity: '0',
					},
					'100%': {
						opacity: '1',
					},
				},
			},
			colors: {
				background: {
					DEFAULT: 'hsl(var(--background-light))',
					dark: 'hsl(var(--background-dark))',
				},
				foreground: {
					DEFAULT: 'hsl(var(--foreground-light))',
					dark: 'hsl(var(--foreground-dark))',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					muted: 'hsl(var(--primary-muted))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					muted: 'hsl(var(--secondary-muted))',
				},
				input: {
					required: 'hsl(var(--input-required))',
					invalid: 'hsl(var(--input-invalid))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},
		},
		screens: {
			'2xl': {
				max: '1600px',
			},
			// specific use case; for the navbar width
			'1.5xl': {
				max: '1320px',
			},
			xl: {
				max: '1280px',
			},
			lg: {
				max: '1100px',
			},
			md: {
				max: '992px',
			},
			sm: {
				max: '768px',
			},
			xs: {
				max: '576px',
			},
		},
		fontFamily: {
			oswald: ['Oswald', 'Oswald Fallback'],
		},
	},
	plugins: [],
	darkMode: 'class',
}
