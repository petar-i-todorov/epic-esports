import { useRouteError, isRouteErrorResponse } from '@remix-run/react'

export function GeneralErrorBoundary({
	specialCases,
}: {
	specialCases?: { [key: number]: string }
}) {
	const error = useRouteError()
	const isResponse = isRouteErrorResponse(error)
	let errorMessage = 'Something went wrong. Please, try again later.'
	if (isResponse && error.status >= 400 && error.status < 500) {
		if (specialCases?.[error.status]) {
			errorMessage = specialCases[error.status]
		} else {
			errorMessage = error.statusText
		}
	}
	return (
		<div className="w-full h-full flex justify-center items-center">
			<div className="w-full h-full flex flex-col justify-center items-center">
				<h1 className="text-6xl text-red-500">Error</h1>
				<h2 className="text-3xl text-red-500">{errorMessage}</h2>
			</div>
		</div>
	)
}
