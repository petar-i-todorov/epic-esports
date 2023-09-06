import { Link as RemixLink } from '@remix-run/react'
import { type ComponentProps } from 'react'

export default function Link({
	className,
	...props
}: ComponentProps<typeof RemixLink>) {
	return (
		<RemixLink
			{...props}
			className={`font-bold text-blue-900 hover:underline hover:brightness-150 transition-colors ${className}`}
		/>
	)
}
