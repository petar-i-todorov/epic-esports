import { useRouteError, isRouteErrorResponse } from '@remix-run/react'
import { captureRemixErrorBoundaryError } from '@sentry/remix'

export function GeneralErrorBoundary({
	specialCases,
}: {
	specialCases?: { [key: number]: string | JSX.Element }
}) {
	const error = useRouteError()
	console.error(error)
	captureRemixErrorBoundaryError(error)
	const isResponse = isRouteErrorResponse(error)
	let errorMessage = 'Something went wrong. Please, try again later.'
	const isClientError = isResponse && error.status >= 400 && error.status < 500
	const specialCase = isClientError ? specialCases?.[error.status] : undefined
	if (isResponse && isClientError) {
		if (typeof specialCase === 'string') {
			errorMessage = specialCase
		} else {
			errorMessage = error.statusText
		}
	}
	let children: undefined | string | JSX.Element
	if (typeof specialCase !== 'undefined' && typeof specialCase !== 'string') {
		children = specialCase
	} else {
		children = isClientError
			? `${error.status} - ${errorMessage}`
			: errorMessage
	}
	return (
		<div className="absolute bottom-0 left-0 right-0 top-0 m-auto flex h-full w-full items-center justify-center text-3xl font-semibold">
			{children}
		</div>
	)
}
