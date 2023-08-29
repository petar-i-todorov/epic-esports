import React from 'react'
import { cssBundleHref } from '@remix-run/css-bundle'
import { type LinksFunction } from '@remix-run/node'
import {
	Link,
	Links,
	LiveReload,
	Meta,
	NavLink,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react'
import globalCss from './styles/global.css'
import Icon from './components/Icon'
import useHydrated from './utils/use-hydrated'
import { categories } from './constants/post-categories'

export const links: LinksFunction = () => [
	...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
	{ rel: 'stylesheet', href: globalCss },
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

export default function App() {
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

	const dropdownOptionsClassNames = 'block whitespace-nowrap'

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<header className="bg-black">
					<nav className="flex justify-between items-center w-4/6 h-[50px] mx-auto text-white">
						<NavLink to=".">
							<Icon name="frame" width="25" height="25" />
						</NavLink>
						{navbarOptions.slice(0, maxNavbarOptionsOnScreen).map(option => (
							<NavLink
								className={({ isActive }) =>
									isActive ? 'text-yellow-400' : ''
								}
								to={option.toLowerCase().replaceAll(/[: ]/g, '-')}
								key={option}
							>
								{option}
							</NavLink>
						))}
						<div className="hamburger-more flex items-center h-[100%] relative">
							MORE <Icon name="chevron-down" width="20" height="20" />
							<div className="navbar-options px-[30px] pb-[30px] absolute top-[100%] left-[-30px] bg-black text-white">
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
						<NavLink className="p-[6px] bg-yellow-400 text-black" to="login">
							<button>Login</button>
						</NavLink>
						<Icon name="magnifying-glass" width="25" height="25" />
						<div className="flex justify-center items-center h-[100%] relative">
							<Icon
								name="hamburger-menu"
								width="25"
								height="25"
								onClick={() => {
									setIsHamburgerOpen(prevState => !prevState)
								}}
							/>
							<div
								className={`flex flex-col items-center absolute top-[100%] ${
									isHamburgerOpen ? 'opacity-1' : 'opacity-0'
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
									<Link to="about-us">ABOUT</Link>
									{' | '}
									<Link to="about-us">PRESS</Link>
									{' | '}
									<Link to="about-us">T&C</Link>
									{' | '}
									<Link to="about-us">CONTACT US</Link>
								</div>
							</div>
						</div>
					</nav>
				</header>
				<Outlet />
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}
