import { json } from '@remix-run/node'
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
		<div className="w-full h-full absolute top-0 left-0 right-0 bottom-0 m-auto flex justify-center items-center text-3xl font-semibold">
			{isClientError ? `${error.status} - ${errorMessage}` : errorMessage}
		</div>
	)
}
