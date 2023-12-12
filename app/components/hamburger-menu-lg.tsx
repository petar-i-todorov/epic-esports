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
	const categories = rootData?.categoriesInitial.data.map(category => {
		return {
			...category,
			slug: `/articles/${category.slug}`,
		}
	})
	const menuOptions = [...(categories ?? []), ...options]

	return (
		<DialogOverlay
			className="fixed bottom-0 left-0 right-0 top-0 h-[100dvh] bg-black font-oswald text-2xl font-bold text-white"
			onDismiss={() => setIsOpen(false)}
			isOpen={isOpen}
		>
			<DialogContent className="flex h-[100dvh] flex-col">
				<div className="flex h-[50px] w-full items-center justify-between px-[10px]">
					<Icon name="epic-esports" fill="white" width="45" height="45" />
					<button
						onClick={() => setIsOpen(false)}
						className="flex h-[45px] w-[45px] items-center justify-center"
					>
						<Icon name="cross-1" width="20" height="20" fill="white" />
					</button>
				</div>
				<div className="mx-[15px] mt-4 flex flex-grow flex-col gap-4 overflow-y-auto text-lg">
					{menuOptions.slice(0, 6).map(option => (
						<NavLink
							key={option.title}
							option={option}
							onClick={() => setIsOpen(false)}
						/>
					))}
					<div className="flex items-center">
						<span>MORE</span>{' '}
						<Icon name="chevron-down" width="25" height="25" fill="white" />
					</div>
					<div className="ml-4 flex flex-col gap-4">
						{menuOptions.slice(6, menuOptions.length).map(option => (
							<NavLink
								key={option.title}
								option={option}
								onClick={() => setIsOpen(false)}
							/>
						))}
					</div>
				</div>
				<div className="flex w-full justify-between p-[15px]">
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
