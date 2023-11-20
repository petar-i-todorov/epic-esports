import React from 'react'
import { cssBundleHref } from '@remix-run/css-bundle'
import {
	type LinksFunction,
	type ActionArgs,
	type LoaderArgs,
	json,
	V2_MetaFunction,
} from '@remix-run/node'
import {
	Form,
	Link,
	Links,
	LiveReload,
	Meta,
	NavLink,
	Outlet,
	Scripts,
	ScrollRestoration,
	useFetcher,
	useLoaderData,
} from '@remix-run/react'
import cookie from 'cookie'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import { getUser, useOptionalUser } from './utils/use-user'
import { honeypot } from './utils/honeypot.server'
import globalCss from '#app/styles/global.css'
import Icon from '#app/components/icon'
import useHydrated from '#app/utils/use-hydrated'
import { categories } from '#app/constants/post-categories'
import ThemeProvider, {
	useTheme,
	Theme,
	NonFlashOfWrongThemeEls,
} from '#app/utils/theme-provider'

export const meta: V2_MetaFunction = () => {
	const title = 'Epic Esports - Home of Esports Heroes'
	const description =
		"Dive into the thrilling world of Epic Esports, the ultimate destination for all things esports. Experience live tournaments, expert analysis, and connect with a global community of enthusiasts. Whether you're a seasoned pro or a budding gamer, Epic Esports is your gateway to the latest in competitive gaming, strategies, and esports news. Join us and become part of the esports revolution!"
	return [
		{ title },
		{
			name: 'description',
			content: description,
		},
		{
			name: 'og:title',
			content: title,
		},
		{
			name: 'og:description',
			content: description,
		},
		// TODO: add image
		{
			name: 'og:image',
			content: '',
		},
		{
			name: 'og:image:alt',
			content: 'Epic Esports Logo',
		},
		{
			name: 'twitter:title',
			content: title,
		},
		{
			name: 'twitter:description',
			content: description,
		},
		{
			name: 'twitter:image',
			content: '',
		},
		{
			name: 'twitter:image:alt',
			content: 'Epic Esports Logo',
		},
	]
}

export const loader = async ({ request }: LoaderArgs) => {
	const cookieHeader = request.headers.get('Cookie') ?? ''
	const parsedCookie = cookie.parse(cookieHeader)
	const { theme: cookieTheme } = parsedCookie
	const user = await getUser(cookieHeader)
	const honeypotInputProps = honeypot.getInputProps()
	return json({ cookieTheme, user, honeypotInputProps })
}

export const action = async ({ request }: ActionArgs) => {
	const formData = await request.formData()
	const newTheme = formData.get('theme')

	const serializedCookie = cookie.serialize('theme', String(newTheme), {
		maxAge: 60 * 60 * 24 * 30,
	})

	return json(
		{},
		{
			headers: {
				'set-cookie': serializedCookie,
			},
		},
	)
}

export const links: LinksFunction = () => [
	...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
	{ rel: 'stylesheet', href: globalCss },
	{ rel: 'robots', href: '/robots.txt' },
]

const navbarOptions = [
	...categories,
	'EVENTS',
	'ABOUT US',
	'JOBS',
	'PARTNER WITH US',
	'PRESS',
	'PRIVACY',
	'CONTACT US',
]

function App() {
	const isHydrated = useHydrated()
	const [viewPortWidth, setViewPortWidth] = React.useState(0)
	const maxNavbarOptionsOnScreen = Math.min(7, viewPortWidth / 250)

	React.useEffect(() => {
		if (isHydrated) {
			setViewPortWidth(window.innerWidth)
		} else {
			setViewPortWidth(0)
		}
	}, [isHydrated])

	React.useEffect(() => {
		window.addEventListener('resize', () => {
			setViewPortWidth(window.innerWidth)
		})
	}, [])

	const [isHamburgerOpen, setIsHamburgerOpen] = React.useState(false)
	const [isSearchBarOpen, setIsSearchBarOpen] = React.useState(false)

	const dropdownOptionsClassNames =
		'block whitespace-nowrap hover:brightness-[90%]'
	const navBarButtonsClassNames = 'p-1.5 bg-yellow-400 text-black font-bold'

	const searchInputRef = React.useRef<HTMLInputElement>(null)

	const footerOptions = [
		{
			name: 'ABOUT',
			url: 'about',
		},
		{
			name: 'PRESS',
			url: 'press',
		},
		{
			name: 'T&C',
			url: 'terms-and-conditions',
		},
		{
			name: 'CONTACT US',
			url: 'contact-us',
		},
	]

	const [theme, setTheme] = useTheme()

	const fetcher = useFetcher()

	const userData = useOptionalUser()

	return (
		// on the server-side this resolves to "" because the initial value is being set
		// based on window.matchMedia("(prefers-color-scheme: dark)")
		// but since we add an inline script that sets the className to the right scheme
		// right before the hydration, we're fine
		// we don't have mismatch from before/after hydration
		// and also after the hydration the client's state will take care of the theme,
		// not the className we set right before the hydration
		<html lang="en" className={theme ?? ''}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="min-h-[100dvh]">
				<header className="bg-black">
					<nav className="flex justify-between items-center w-4/6 h-[50px] mx-auto text-white font-semibold">
						<NavLink to=".">
							<Icon name="epic-esports" width="45" height="45" fill="white" />
						</NavLink>
						{navbarOptions.slice(0, maxNavbarOptionsOnScreen).map(option => (
							<NavLink
								className={({ isActive }) =>
									isActive
										? ' text-yellow-400 hover:brightness-[90%]'
										: 'hover:brightness-[90%]'
								}
								to={option.toLowerCase().replaceAll(/[: ]/g, '-')}
								key={option}
							>
								{option}
							</NavLink>
						))}
						<div className="hamburger-more flex items-center h-[100%] relative">
							MORE <Icon name="chevron-down" width="20" height="20" />
							<div className="navbar-options px-[30px] pb-[30px] absolute top-[100%] left-[-30px] z-10 bg-black text-white">
								{navbarOptions.slice(maxNavbarOptionsOnScreen).map(option => (
									<NavLink
										className={({ isActive }) =>
											isActive
												? `text-yellow-400 ${dropdownOptionsClassNames}`
												: dropdownOptionsClassNames
										}
										to={option.toLowerCase().replace(' ', '-')}
										key={option}
									>
										{option}
									</NavLink>
								))}
							</div>
						</div>
						<span>|</span>
						{userData?.user ? (
							<Form method="post" action="/logout">
								<button>Logout</button>
							</Form>
						) : (
							<NavLink className={navBarButtonsClassNames} to="/login">
								<button>Login</button>
							</NavLink>
						)}
						<fetcher.Form method="post">
							<input type="hidden" name="intent" value="toggle-theme" />
							<input type="hidden" name="theme" value={theme ?? ''} />
							<button
								className="w-[60px] h-[30px] p-1 border-white border-2 rounded-2xl"
								onClick={() => {
									setTheme(prev => {
										const newTheme =
											prev === Theme.Dark ? Theme.Light : Theme.Dark
										return newTheme
									})
								}}
							>
								<div className="w-[30%] h-[100%] transition-transform rounded-full bg-white dark:translate-x-[33px]" />
							</button>
						</fetcher.Form>
						<div className="flex justify-center items-center h-[100%] relative">
							<Icon
								name="magnifying-glass"
								width="25"
								height="25"
								onClick={() => {
									setIsSearchBarOpen(prevState => {
										if (!prevState) {
											searchInputRef.current?.focus()
										}
										return !prevState
									})
									setIsHamburgerOpen(false)
								}}
							/>
							<div
								className={`p-[15px] flex gap-[15px] absolute top-[100%] ${
									isSearchBarOpen ? 'opacity-1' : 'opacity-0'
								} transition-opacity bg-black`}
							>
								<Form
									action="/"
									className="w-[300px] h-[100%] p-1.5 flex gap-2"
								>
									<input
										className="flex-grow bg-transparent border-b border-white text-white focus:outline-none"
										type="text"
										placeholder="Search"
										name="s"
										ref={searchInputRef}
									/>
									<button className={navBarButtonsClassNames}>GO</button>
								</Form>
							</div>
						</div>
						<div className="flex justify-center items-center h-[100%] relative">
							<Icon
								name="hamburger-menu"
								width="25"
								height="25"
								onClick={() => {
									setIsHamburgerOpen(prevState => !prevState)
									setIsSearchBarOpen(false)
								}}
							/>
							<div
								className={`flex flex-col items-center absolute top-[100%] ${
									isHamburgerOpen
										? 'opacity-1'
										: 'opacity-0 pointer-events-none'
								} transition-opacity bg-black pb-[30px] px-[30px]`}
							>
								<div className="flex gap-2 p-10">
									<Icon name="facebook-logo" width="25" height="25" />
									<Icon name="twitter-logo" width="25" height="25" />
									<Icon name="instagram-logo" width="25" height="25" />
									<Icon name="youtube-logo" width="25" height="25" />
									<Icon name="twitch-logo" width="25" height="25" />
								</div>
								<div className="text-xs">
									<Link to="about">ABOUT</Link>
									{' | '}
									<Link to="press">PRESS</Link>
									{' | '}
									<Link to="terms-and-conditions">T&C</Link>
									{' | '}
									<Link to="contact-us">CONTACT US</Link>
								</div>
							</div>
						</div>
					</nav>
				</header>
				<main className="min-h-[calc(100dvh-250px)] my- py-[30px] flex flex-col dark:bg-black transition-colors">
					<Outlet />
				</main>
				<footer className="h-[200px] bg-black text-white">
					<div className="w-4/6 h-[100%] mx-auto flex flex-col justify-evenly">
						<div>
							<span className="font-semibold">
								EPIC ESPORTS - HOME OF ESPORTS HEROES
							</span>
							<hr />
						</div>
						<div className="flex gap-10">
							{footerOptions.map(option => (
								<Link
									className="hover:brightness-90"
									to={option.url}
									key={option.name}
								>
									{option.name}
								</Link>
							))}
						</div>
						<span>© EPIC ESPORTS</span>
					</div>
				</footer>
				<ScrollRestoration />
				<NonFlashOfWrongThemeEls />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}

export default function AppWithProviders() {
	const { cookieTheme, honeypotInputProps } = useLoaderData<typeof loader>()

	return (
		<HoneypotProvider {...honeypotInputProps}>
			<ThemeProvider cookieTheme={cookieTheme}>
				<App />
			</ThemeProvider>
		</HoneypotProvider>
	)
}
