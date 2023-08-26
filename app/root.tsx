import React from 'react'
import { cssBundleHref } from '@remix-run/css-bundle'
import { type LinksFunction } from '@remix-run/node'
import {
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

export const links: LinksFunction = () => [
	...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
	{ rel: 'stylesheet', href: globalCss },
]

const navbarOptions = [
	'VALORANT',
	'MOBILE LEGENDS',
	'LEAGUE OF LEGENDS',
	'DOTA 2',
	'CALL OF DUTY',
	'ANIME',
	'COMMUNITY',
	'GAMING',
	'CULTURE',
	'COSPLAY',
	'GENSHIN IMPACT',
	'CS:GO',
	'PUBG',
	'TEKKEN',
	'STREET FIGHTER',
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
							<NavLink to={option.toLowerCase().replace(' ', '-')} key={option}>
								{option}
							</NavLink>
						))}
						<div className="hamburger-more flex items-center h-[100%] relative">
							MORE <Icon name="chevron-down" width="20" height="20" />
							<div className="navbar-options px-[30px] pb-[30px] absolute top-[100%] left-[-30px] bg-black text-white">
								{navbarOptions.slice(maxNavbarOptionsOnScreen).map(option => (
									<NavLink
										className="block whitespace-nowrap"
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
						<Icon name="hamburger-menu" width="25" height="25" />
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
