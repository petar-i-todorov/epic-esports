import { NavLink as RemixNavLink } from '@remix-run/react'

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
				isActive
					? ' text-yellow-400 hover:brightness-[90%]'
					: 'hover:brightness-[90%]'
			}
			to={option.slug}
			{...props}
		>
			{option.title.toUpperCase()}
		</RemixNavLink>
	)
}
