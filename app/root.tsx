import clsx from 'clsx'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import React from 'react'
import {
	type LinksFunction,
	type DataFunctionArgs,
	type MetaFunction,
	json,
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
// import { Index as Confetti } from 'confetti-react'
// import { useWindowSize } from '@uidotdev/usehooks'
import { getUser } from '#app/utils/use-user.server'
import HamburgerMenu from '#app/components/hamburger-menu-lg.tsx'
import { honeypot } from '#app/utils/honeypot.server.ts'
import {
	createConfettiCookie,
	getConfetti,
} from '#app/utils/confetti.server.ts'
import { ToastSchema, createCookie, getToast } from '#app/utils/toast.server.ts'
import '#app/styles/global.css'
import Icon from '#app/components/Icon.tsx'
import Toaster from '#app/components/toast.tsx'
import { staticPageOptions } from '#app/constants/static-page-options.ts'
import favicon from '#app/assets/favicon.svg'
import { loadQuery } from '#app/sanity/loader.server.ts'
import { CATEGORIES_QUERY } from '#app/sanity/queries.ts'
import { type Category } from '#app/components/posts-block.tsx'

const VisualEditing = React.lazy(
	() => import('#app/components/visual-editing.tsx'),
)

export const meta: MetaFunction = () => {
	const title = 'Epic Esports | Home of Esports Heroes'
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
		{
			name: 'robots',
			content: 'noindex, nofollow',
		},
	]
}

export const loader = async ({ request }: DataFunctionArgs) => {
	const confetti = getConfetti(request)
	const confettiCookie = createConfettiCookie(null)
	const cookieHeader = request.headers.get('Cookie') ?? ''
	const theme = cookie.parse(cookieHeader).ee_theme
	const pastLgHint = cookie.parse(cookieHeader)['ee_past-lg'] === 'true'
	const user = await getUser(cookieHeader)
	const honeypotInputProps = honeypot.getInputProps()
	const ENV = {
		SENTRY_DSN: process.env.SENTRY_DSN,
		SANITY_STUDIO_PROJECT_ID: process.env.SANITY_STUDIO_PROJECT_ID,
		SANITY_STUDIO_DATASET: process.env.SANITY_STUDIO_DATASET,
		SANITY_STUDIO_URL: process.env.SANITY_STUDIO_URL,
		SANITY_STUDIO_USE_STEGA: process.env.SANITY_STUDIO_USE_STEGA,
	}
	const toast = await getToast(request)
	const toastResult = ToastSchema.safeParse(toast)
	const headers = toastResult.success
		? new Headers([
				['Set-Cookie', confettiCookie],
				['Set-Cookie', await createCookie(null)],
			])
		: new Headers([['Set-Cookie', confettiCookie]])

	const { data: categories } = await loadQuery<Category[]>(CATEGORIES_QUERY)

	return json(
		{
			theme,
			user,
			honeypotInputProps,
			confetti,
			ENV,
			toast: toastResult.success ? toastResult.data : null,
			categories,
			pastLgHint,
		},
		{
			headers,
		},
	)
}

export const action = async ({ request }: DataFunctionArgs) => {
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
	{ rel: 'robots', href: '/robots.txt' },
	{ rel: 'icon', href: favicon, type: 'image/svg+xml' },
	{ rel: 'apple-touch-icon', href: favicon, type: 'image/svg+xml' },
	{ rel: 'mask-icon', href: favicon, color: '#000000' },
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
			slug: '/about-us',
		},
		{
			name: 'PRIVACY',
			slug: '/privacy',
		},
		{
			name: 'T&C',
			slug: '/terms-of-use',
		},
		{
			name: 'CONTACT US',
			slug: '/contact-us',
		},
	]

	const themeFetcher = useFetcher()

	// const { width, height } = useWindowSize()

	const { ENV, theme, categories, pastLgHint, user } =
		useLoaderData<typeof loader>()
	const navbarOptions = [
		...categories.map(category => ({
			...category,
			slug: `/articles/${category.slug}`,
		})),
		...staticPageOptions,
	]

	const [pastLgBreakpoint, setPastLgBreakpoint] = React.useState(pastLgHint)

	React.useEffect(() => {
		const listener = () => {
			if (window.innerWidth <= 1100 && !pastLgBreakpoint) {
				setPastLgBreakpoint(true)
			} else if (window.innerWidth > 1100 && pastLgBreakpoint) {
				setPastLgBreakpoint(false)
			}
		}

		window.addEventListener('resize', listener)

		return () => window.removeEventListener('resize', listener)
	}, [pastLgBreakpoint])

	return (
		<html lang="en" className={`${theme} w-full`}>
			<head>
				<meta charSet="utf-8" />
				<script
					dangerouslySetInnerHTML={{
						__html: `
						const cookie = document.cookie;
						const keys = Object.fromEntries(cookie.split("; ").map(c => [c.split("=")[0], c.split("=")[1]]));
						
						if (!("ee_theme" in keys) || !("ee_past-lg" in keys)) {
						    if (!("ee_theme" in keys)) {
						        const preferredTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";path="/";
						        document.cookie = "ee_theme=" + preferredTheme + ";max-age=60 * 60 * 24 * 30";
						    }
						
						    if (!("ee_past-lg" in keys)) {
						        const pastLgBreakpoint = window.matchMedia("(max-width: 1100px)").matches;
						        document.cookie = "ee_past-lg=" + pastLgBreakpoint + ";max-age=60 * 60 * 24 * 30";path="/";
						    }
						
						    location.reload();
						}
						if(keys["ee_past-lg"] !== String(window.matchMedia("(max-width: 1100px)").matches)) {
							document.cookie = "ee_past-lg=" + window.matchMedia("(max-width: 1100px)").matches + ";max-age=60 * 60 * 24 * 30";path="/";
							location.reload();
						}
				`,
					}}
				/>
				<style
					dangerouslySetInnerHTML={{
						__html: `
						  @font-face {
							font-family: 'Oswald';
							font-style: normal;
							font-weight: 300;
							font-display: swap;
							src: url('/fonts/Oswald-Thin.woff2') format('woff2');
						  }

						  @font-face {
							font-family: 'Oswald Fallback';
							font-style: normal;
							font-weight: 300;
							src: local(Arial);
							size-adjust: 70%;
							ascent-override: 138%;
							descent-override: 70%;
							line-gap-override: normal;
						  }

						  @font-face {
							font-family: 'Oswald';
							font-style: normal;
							font-weight: 400;
							font-display: swap;
							src: url('/fonts/Oswald-Regular.woff2') format('woff2');
						  }

						  @font-face {
							font-family: 'Oswald';
							font-style: normal;
							font-weight: 700;
							font-display: swap;
							src: url('/fonts/Oswald-Bold.woff2') format('woff2');
						  }
						  
						  @font-face {
							font-family: 'Oswald Fallback';
							font-style: normal;
							font-weight: 700;
							src: local(Arial);
							size-adjust: 80%;
							ascent-override: 125%;
							descent-override: 53%;
							line-gap-override: normal;
						}
				`,
					}}
				/>
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Meta />
				<Links />
				<script
					dangerouslySetInnerHTML={{
						__html: `ENV = ${JSON.stringify(ENV)}`,
					}}
				/>
			</head>
			<body className="min-h-[100dvh] w-full">
				{/* <Confetti
					key={confetti}
					run={Boolean(confetti)}
					recycle={false}
					width={width ?? 0}
					height={height ?? 0}
					numberOfPieces={500}
				/> */}
				<header className="w-full bg-background-dark px-[10px] text-foreground-dark">
					<nav className="relative mx-auto flex h-[50px] w-[1290px] items-center justify-between text-sm font-semibold 1.5xl:w-full">
						<div className="flex items-center justify-between gap-[25px]">
							<NavLink to="." aria-label="Epic Esports Logo">
								<Icon
									name="epic-esports"
									width="45"
									height="45"
									className="fill-current"
								/>
							</NavLink>
							{pastLgBreakpoint ? null : (
								<>
									{navbarOptions
										.slice(0, navbarOptionsCountOnScreen)
										.map(option => {
											return (
												<NavLink
													className={({ isActive }) =>
														clsx(
															'header-link relative z-[3] font-oswald hover:brightness-[90%]',
															isActive && 'text-yellow-400',
														)
													}
													to={option.slug}
													key={option.title}
												>
													{option.title.toUpperCase()}
													<hr className="under-line absolute top-full block h-1 w-full rounded-full border-none bg-current" />
												</NavLink>
											)
										})}
									<button
										className="group relative isolate z-[2] flex h-full items-center text-left font-oswald"
										aria-label="Show more options"
									>
										<span className="relative isolate z-[1]">
											<div className="absolute inset-0 z-0 scale-x-[237%] scale-y-[248%] bg-black"></div>
											<span className="relative z-[2] flex items-center justify-between gap-[10px]">
												MORE{' '}
												<Icon
													name="chevron-down"
													width="20"
													height="20"
													className="fill-current"
												/>
											</span>
										</span>
										<div className="absolute left-[-30px] top-full z-0 flex -translate-y-full flex-col gap-4 bg-background-dark px-[30px] pb-[30px] pt-4 transition-transform delay-[1] group-hover:translate-y-0 group-focus-visible:translate-y-0 [&:has(:focus-visible)]:translate-y-0">
											{navbarOptions
												.slice(navbarOptionsCountOnScreen)
												.map(option => (
													<NavLink
														className={({ isActive }) =>
															clsx(
																dropdownOptionsClassNames,
																isActive && 'text-yellow-400',
															)
														}
														to={option.slug}
														key={option.title}
													>
														<span className="header-link relative">
															{option.title}
															<hr className="under-line absolute top-full block h-1 w-full rounded-full border-none bg-current" />
														</span>
													</NavLink>
												))}
										</div>
									</button>
								</>
							)}
						</div>
						<div className="flex items-center gap-[15px]">
							{user ? (
								<Form method="post" action="/logout">
									<button>Logout</button>
								</Form>
							) : (
								<Link className={navBarButtonsClassNames} to="/login">
									Login
								</Link>
							)}
							<span>|</span>
							<themeFetcher.Form method="post">
								<input type="hidden" name="intent" value="theme" />
								<button
									className="h-[30px] w-[60px] rounded-2xl border-2 border-current p-1"
									aria-label="Change theme"
								>
									<div className="h-full w-[30%] rounded-full bg-current transition-transform dark:translate-x-[33px]" />
								</button>
							</themeFetcher.Form>
							<div className="flex h-full items-center justify-center">
								<button
									onClick={() => {
										setIsSearchBarOpen(prevState => {
											if (!prevState) {
												searchInputRef.current?.focus()
											}
											return !prevState
										})
										setIsHamburgerOpen(false)
									}}
									aria-label="Search"
								>
									<Icon
										name="magnifying-glass"
										className="fill-current"
										width="25"
										height="25"
									/>
								</button>
								<div
									className={clsx(
										'absolute right-0 top-full z-10 flex gap-[15px] bg-black p-[15px] transition-opacity',
										isSearchBarOpen ? 'visible' : 'invisible',
									)}
								>
									<Form
										action="/"
										className="flex h-full w-[300px] gap-2 p-1.5"
									>
										<input
											className="flex-grow border-b bg-transparent focus:outline-none"
											type="text"
											placeholder="Search"
											name="s"
											ref={searchInputRef}
										/>
										<button className={navBarButtonsClassNames}>GO</button>
									</Form>
								</div>
							</div>
							<div className="relative flex h-full items-center justify-center">
								<button
									onClick={() => {
										setIsHamburgerOpen(prevState => !prevState)
										setIsSearchBarOpen(false)
									}}
									aria-label="Show more options"
								>
									<Icon
										name="hamburger-menu"
										width="25"
										height="25"
										className="fill-foreground-dark"
									/>
								</button>
								{pastLgBreakpoint ? (
									<HamburgerMenu
										isOpen={isHamburgerOpen}
										setIsOpen={setIsHamburgerOpen}
									/>
								) : (
									<div
										className={clsx(
											'absolute right-0 top-[calc(100%+10px)] z-10 flex flex-col items-center bg-black px-[30px] pb-[30px] transition-opacity',
											isHamburgerOpen ? 'visible' : 'invisible',
										)}
									>
										<div className="flex gap-2 p-10">
											<Link
												to="https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley"
												target="_blank"
												rel="noopener noreferrer"
											>
												<Icon
													name="facebook-logo"
													width="25"
													height="25"
													className="fill-current"
												/>
											</Link>
											<Link
												to="https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley"
												target="_blank"
												rel="noopener noreferrer"
											>
												<Icon
													name="x-logo"
													width="25"
													height="25"
													className="fill-current"
												/>
											</Link>
											<Link
												to="https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley"
												target="_blank"
												rel="noopener noreferrer"
											>
												<Icon
													name="instagram-logo"
													width="25"
													height="25"
													className="fill-current"
												/>
											</Link>
											<Link
												to="https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley"
												target="_blank"
												rel="noopener noreferrer"
											>
												<Icon
													name="youtube-logo"
													width="25"
													height="25"
													className="fill-current"
												/>
											</Link>
											<Link
												to="https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley"
												target="_blank"
												rel="noopener noreferrer"
											>
												<Icon
													name="twitch-logo"
													width="25"
													height="25"
													className="fill-current"
												/>
											</Link>
										</div>
										<div className="text-xs">
											<Link to="/about-us">ABOUT</Link>
											{' | '}
											<Link to="/privacy">PRIVACY</Link>
											{' | '}
											<Link to="/terms-of-use">T&C</Link>
											{' | '}
											<Link to="/contact-us">CONTACT US</Link>
										</div>
									</div>
								)}
							</div>
						</div>
					</nav>
				</header>
				<main className="relative flex min-h-[calc(100dvh-250px)]  w-full flex-col justify-center bg-background pb-[30px] text-black transition-colors dark:bg-black dark:text-foreground-dark xs:py-0">
					<Toaster />
					<Outlet />
				</main>
				<footer className="h-[200px] bg-background-dark text-foreground-dark">
					<div className="mx-auto flex h-full w-[1290px] flex-col justify-evenly 2xl:w-[1120px] xl:w-[960px] md:w-full">
						<div className="mx-auto flex h-full w-full flex-col justify-evenly md:w-[720px] md:px-[10px] sm:w-[540px] xs:w-full">
							<div>
								<span className="inline-block font-semibold xs:text-center xs:text-sm">
									EPIC ESPORTS - HOME OF ESPORTS HEROES
								</span>
								<hr className="mt-2 xs:mt-1" />
							</div>
							<div className="flex gap-10 md:justify-between md:gap-0 xs:text-xs">
								{footerOptions.map(option => (
									<Link
										className="hover:brightness-90"
										to={option.slug}
										key={option.name}
									>
										{option.name}
									</Link>
								))}
							</div>
							<span className="xs:text-sm">© EPIC ESPORTS</span>
						</div>
					</div>
				</footer>
				<ScrollRestoration />
				{ENV.SANITY_STUDIO_USE_STEGA ? (
					<React.Suspense>
						<VisualEditing />
					</React.Suspense>
				) : null}
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
