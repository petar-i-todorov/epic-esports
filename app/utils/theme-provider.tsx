import React from 'react'

export enum Theme {
	Light = 'light',
	Dark = 'dark',
}

const ThemeContext = React.createContext<
	[Theme, React.Dispatch<React.SetStateAction<Theme>>] | undefined
>(undefined)

export const useTheme = () => {
	const theme = React.useContext(ThemeContext)
	if (!theme) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return theme
}

export default function ThemeProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const [theme, setTheme] = React.useState<Theme>(Theme.Light)

	return (
		<ThemeContext.Provider value={[theme, setTheme]}>
			{children}
		</ThemeContext.Provider>
	)
}
