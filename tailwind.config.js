/** @type {import('tailwindcss').Config} */
export default {
	content: ['./app/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {},
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
			oswald: ['Oswald', 'sans-serif'],
		},
	},
	plugins: [],
	darkMode: 'class',
}
