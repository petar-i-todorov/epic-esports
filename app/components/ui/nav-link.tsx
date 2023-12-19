import { NavLink as RemixNavLink } from '@remix-run/react'
import clsx from 'clsx'

type NavLinkOption = {
	title: string
	slug: string
}

export default function NavLink({
	option,
	...props
}: {
	option: NavLinkOption
} & Omit<React.ComponentProps<typeof RemixNavLink>, 'to'>) {
	return (
		<RemixNavLink
			className={({ isActive }) =>
				clsx('hover:brightness-[90%]', isActive && 'text-yellow-400')
			}
			to={option.slug}
			{...props}
		>
			{option.title.toUpperCase()}
		</RemixNavLink>
	)
}
