import React from 'react'

const clientThemeCode = `
;(() => {
  const theme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
  const documentElementClassList = document.documentElement.classList;
  const themeAlreadyApplied = documentElementClassList.contains('light') || documentElementClassList.contains('dark');
  if (themeAlreadyApplied) {
    console.warn(
      "Something seems to be wrong. But it's not your fault!",
    );
  } else {
    documentElementClassList.add(theme);
  }
})();
`

export function NonFlashOfWrongThemeEls() {
	return <script dangerouslySetInnerHTML={{ __html: clientThemeCode }} />
}

export enum Theme {
	Light = 'light',
	Dark = 'dark',
}

const ThemeContext = React.createContext<
	[Theme | null, React.Dispatch<React.SetStateAction<Theme | null>>] | undefined
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
	const [theme, setTheme] = React.useState<Theme | null>(() => {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition, no-constant-binary-expression
		if (typeof window !== 'undefined') {
			return matchMedia('(prefers-color-scheme: dark)').matches
				? Theme.Dark
				: Theme.Light
		}

		return null
	})

	return (
		<ThemeContext.Provider value={[theme, setTheme]}>
			{children}
		</ThemeContext.Provider>
	)
}
