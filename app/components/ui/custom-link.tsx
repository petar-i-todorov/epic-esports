import { Link as RemixLink } from '@remix-run/react'
import { type ComponentProps } from 'react'

export default function Link({
	className,
	...props
}: ComponentProps<typeof RemixLink>) {
	return (
		<RemixLink
			{...props}
			className={`font-bold text-blue-900 dark:text-yellow-300 hover:underline hover:brightness-150 hover:dark:brightness-75 font-oswald ${className}`}
		/>
	)
}
