import { useRouteError, isRouteErrorResponse } from '@remix-run/react'
import { captureRemixErrorBoundaryError } from '@sentry/remix'

export function GeneralErrorBoundary({
	specialCases,
}: {
	specialCases?: { [key: number]: string }
}) {
	const error = useRouteError()
	console.error(error)
	captureRemixErrorBoundaryError(error)
	const isResponse = isRouteErrorResponse(error)
	let errorMessage = 'Something went wrong. Please, try again later.'
	const isClientError = isResponse && error.status >= 400 && error.status < 500
	if (isResponse && isClientError) {
		if (specialCases?.[error.status]) {
			errorMessage = specialCases[error.status]
		} else {
			errorMessage = error.statusText
		}
	}
	return (
		<div className="absolute bottom-0 left-0 right-0 top-0 m-auto flex h-full w-full items-center justify-center text-3xl font-semibold">
			{isClientError ? `${error.status} - ${errorMessage}` : errorMessage}
		</div>
	)
}
