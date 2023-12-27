/** @type {import('tailwindcss').Config} */
export default {
	content: ['./app/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {
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
