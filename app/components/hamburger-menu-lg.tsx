import { DialogOverlay, DialogContent } from '@reach/dialog'
import { useRouteLoaderData } from '@remix-run/react'
import React from 'react'
import Icon from './icon'
import NavLink from './ui/nav-link'
import { options } from '~/constants/navbar-options'
import { loader } from '~/root'

export default function HamburgerMenu({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
	const rootData = useRouteLoaderData<typeof loader>('root')
	const menuOptions = [...(rootData?.categories ?? []), ...options]

	return (
		<DialogOverlay
			className="h-[100dvh] fixed top-0 left-0 bottom-0 right-0 bg-black text-white text-2xl font-bold"
			onDismiss={() => setIsOpen(false)}
			isOpen={isOpen}
		>
			<DialogContent>
				<div className="w-full h-[50px] flex justify-between items-center">
					<Icon name="epic-esports" fill="white" width="45" height="45" />
					<Icon
						name="cross-1"
						width="45"
						height="45"
						onClick={() => setIsOpen(false)}
					/>
				</div>
				<div className="flex flex-col gap-1 pl-[15px]">
					{menuOptions.slice(0, 6).map(option => (
						<NavLink
							option={option}
							key={option.name}
							onClick={() => setIsOpen(false)}
						/>
					))}
					<div className="flex items-center">
						<span>MORE</span>{' '}
						<Icon name="chevron-down" width="25" height="25" />
					</div>
					<div className="flex flex-col gap-1 ml-2">
						{menuOptions.slice(6, menuOptions.length).map(option => (
							<NavLink
								option={option}
								key={option.name}
								onClick={() => setIsOpen(false)}
							/>
						))}
					</div>
				</div>
				<div className="w-full p-[15px] absolute bottom-0 flex justify-between">
					<Icon name="facebook-logo" width="40" height="40" />
					<Icon name="twitter-logo" width="40" height="40" />
					<Icon name="instagram-logo" width="40" height="40" />
					<Icon name="youtube-logo" width="40" height="40" />
					<Icon name="twitch-logo" width="40" height="40" />
				</div>
			</DialogContent>
		</DialogOverlay>
	)
}
