import { DialogOverlay, DialogContent } from '@reach/dialog'
import { useRouteLoaderData } from '@remix-run/react'
import React from 'react'
import Icon from '#app/components/icon'
import NavLink from '#app/components/ui/nav-link'
import { options } from '#app/constants/navbar-options'
import { loader } from '#app/root'

export default function HamburgerMenu({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
	const rootData = useRouteLoaderData<typeof loader>('root')
	const categories = rootData?.categories ?? []
	const menuOptions = [...categories, ...options]

	return (
		<DialogOverlay
			className="h-[100dvh] fixed top-0 left-0 bottom-0 right-0 bg-black text-white text-2xl font-bold font-oswald"
			onDismiss={() => setIsOpen(false)}
			isOpen={isOpen}
		>
			<DialogContent className="flex flex-col justify-between h-[100dvh]">
				<div className="w-full h-[50px] px-[10px] flex justify-between items-center">
					<Icon name="epic-esports" fill="white" width="45" height="45" />
					<button
						onClick={() => setIsOpen(false)}
						className="w-[45px] h-[45px] flex items-center justify-center"
					>
						<Icon name="cross-1" width="20" height="20" fill="white" />
					</button>
				</div>
				<div className="flex flex-col gap-4 mx-[15px] overflow-y-auto text-lg">
					{menuOptions.slice(0, 6).map(option => (
						<NavLink
							key={option.name}
							option={option}
							onClick={() => setIsOpen(false)}
						/>
					))}
					<div className="flex items-center">
						<span>MORE</span>{' '}
						<Icon name="chevron-down" width="25" height="25" fill="white" />
					</div>
					<div className="flex flex-col gap-4 ml-4">
						{menuOptions.slice(6, menuOptions.length).map(option => (
							<NavLink
								key={option.name}
								option={option}
								onClick={() => setIsOpen(false)}
							/>
						))}
					</div>
				</div>
				<div className="w-full p-[15px] flex justify-between">
					<Icon name="facebook-logo" width="40" height="40" fill="white" />
					<Icon name="twitter-logo" width="40" height="40" fill="white" />
					<Icon name="instagram-logo" width="40" height="40" fill="white" />
					<Icon name="youtube-logo" width="40" height="40" fill="white" />
					<Icon name="twitch-logo" width="40" height="40" fill="white" />
				</div>
			</DialogContent>
		</DialogOverlay>
	)
}
