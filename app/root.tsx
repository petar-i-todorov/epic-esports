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
// @ts-expect-error - module problem, to fix before deploying
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import Confetti from 'confetti-react'
import { getUser, useOptionalUser } from './utils/use-user'
import { honeypot } from '#app/utils/honeypot.server'
import { createConfettiCookie, getConfetti } from '#app/utils/confetti.server'
import { ToastSchema, createCookie, getToast } from '#app/utils/toast.server'
import globalCss from '#app/styles/global.css'
import Icon from '#app/components/icon'
import { categories } from '#app/constants/post-categories'
import Toaster from '#app/components/toast'

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
	const confetti = getConfetti(request)
	const confettiCookie = createConfettiCookie(null)
	const cookieHeader = request.headers.get('Cookie') ?? ''
	const theme = cookie.parse(cookieHeader).ee_theme
	const user = await getUser(cookieHeader)
	const honeypotInputProps = honeypot.getInputProps()
	const ENV = {
		SENTRY_DSN: process.env.SENTRY_DSN,
	}
	const toast = await getToast(request)
	const toastResult = ToastSchema.safeParse(toast)
	const headers = toastResult.success
		? new Headers([
				['Set-Cookie', confettiCookie],
				['Set-Cookie', await createCookie(null)],
		  ])
		: new Headers([['Set-Cookie', confettiCookie]])

	return json(
		{
			theme,
			user,
			honeypotInputProps,
			confetti,
			ENV,
			toast: toastResult.success ? toastResult.data : null,
		},
		{
			headers,
		},
	)
}

export const action = async ({ request }: ActionArgs) => {
	const currentTheme = cookie.parse(
		request.headers.get('Cookie') ?? '',
	).ee_theme

	const setCookie = cookie.serialize(
		'ee_theme',
		currentTheme === 'dark' ? 'light' : 'dark',
		{
			maxAge: 60 * 60 * 24 * 30,
		},
	)

	return json(
		{},
		{
			headers: {
				'set-cookie': setCookie,
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
	...categories.map(category => category.toUpperCase()),
	'EVENTS',
	'ABOUT US',
	'JOBS',
	'PARTNER WITH US',
	'PRESS',
	'PRIVACY',
	'CONTACT US',
]

function App() {
	const navbarOptionsCountOnScreen = 7

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

	const fetcher = useFetcher()

	const userData = useOptionalUser()

	const [width, setWidth] = React.useState(0)
	const [height, setHeight] = React.useState(0)

	React.useEffect(() => {
		setWidth(document.documentElement.clientWidth)
		setHeight(window.innerHeight)

		const onResize = () => {
			setWidth(document.documentElement.clientWidth)
			setHeight(window.innerHeight)
		}

		window.addEventListener('resize', onResize)

		return () => window.removeEventListener('resize', onResize)
	}, [])

	const { confetti, ENV, theme } = useLoaderData<typeof loader>()

	return (
		<html lang="en" className={`${theme} w-full`}>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `
					const cookie = document.cookie
					const keys = cookie.split("; ").map(c => c.split("=")[0].trim())
					if(!keys.includes("ee_theme")) {
						const preferredTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
						document.cookie = document.cookie ? document.cookie + "," : "" + "ee_theme=" + preferredTheme + ";max-age=60 * 60 * 24 * 30"
						location.reload()
					}
				`,
					}}
				/>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Meta />
				<Links />
				<script
					dangerouslySetInnerHTML={{
						__html: `const ENV = ${JSON.stringify(ENV)}`,
					}}
				/>
			</head>
			<body className="min-h-[100dvh] w-full">
				<header className="bg-black w-full">
					<nav className="flex justify-between items-center w-[1300px] 1.5xl:w-full h-[50px] mx-auto text-white font-semibold text-sm relative">
						<div className="flex justify-between items-center gap-[25px]">
							<NavLink to=".">
								<Icon name="epic-esports" width="45" height="45" fill="white" />
							</NavLink>
							{navbarOptions
								.slice(0, navbarOptionsCountOnScreen)
								.map(option => (
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
							<div className="hamburger-more flex items-center h-full relative">
								MORE <Icon name="chevron-down" width="20" height="20" />
								<div className="navbar-options px-[30px] pb-[30px] absolute top-full left-[-30px] z-10 bg-black text-white">
									{navbarOptions
										.slice(navbarOptionsCountOnScreen)
										.map(option => (
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
						</div>
						<div className="flex items-center gap-[15px]">
							{userData?.user ? (
								<Form method="post" action="/logout">
									<button>Logout</button>
								</Form>
							) : (
								<NavLink className={navBarButtonsClassNames} to="/login">
									<button>Login</button>
								</NavLink>
							)}
							<span>|</span>
							<fetcher.Form method="post">
								<input type="hidden" name="intent" value="theme" />
								<button className="w-[60px] h-[30px] p-1 border-white border-2 rounded-2xl">
									<div className="w-[30%] h-full transition-transform rounded-full bg-white dark:translate-x-[33px]" />
								</button>
							</fetcher.Form>
							<div className="flex justify-center items-center h-full">
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
									className={`p-[15px] flex gap-[15px] absolute top-full right-0 ${
										isSearchBarOpen ? 'visible' : 'invisible'
									} transition-opacity bg-black z-10`}
								>
									<Form
										action="/"
										className="w-[300px] h-full p-1.5 flex gap-2"
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
							<div className="flex justify-center items-center h-full relative">
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
									className={`flex flex-col items-center absolute top-full right-0 ${
										isHamburgerOpen ? 'visible' : 'invisible'
									} transition-opacity pb-[30px] px-[30px] z-10`}
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
						</div>
					</nav>
				</header>
				<main className="min-h-[calc(100dvh-250px)] my- py-[30px] flex flex-col relative dark:bg-black text-black dark:text-white transition-colors">
					<Toaster />
					<Confetti
						key={confetti}
						run={Boolean(confetti)}
						recycle={false}
						width={width}
						height={height}
						numberOfPieces={500}
					/>
					<Outlet />
				</main>
				<footer className="h-[200px] bg-black text-white">
					<div className="w-4/6 h-full mx-auto flex flex-col justify-evenly">
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
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}

export default function AppWithProviders() {
	const { honeypotInputProps } = useLoaderData<typeof loader>()

	return (
		<HoneypotProvider {...honeypotInputProps}>
			<App />
		</HoneypotProvider>
	)
}
