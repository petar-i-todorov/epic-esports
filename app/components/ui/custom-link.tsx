import { Link as RemixLink } from '@remix-run/react'
import { type ComponentProps } from 'react'

export default function Link({
	className,
	...props
}: ComponentProps<typeof RemixLink>) {
	return (
		<RemixLink
			{...props}
			className={`font-oswald font-bold text-blue-900 hover:underline hover:brightness-150 dark:text-yellow-300 hover:dark:brightness-75 ${className}`}
		/>
	)
}
