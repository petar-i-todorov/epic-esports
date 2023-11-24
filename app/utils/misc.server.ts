import { type ResponseInit, json } from '@remix-run/node'

export function invariantResponse(
	condition: unknown,
	message: string,
	responseInit?: ResponseInit,
): asserts condition {
	if (!condition) {
		throw json(message, {
			status: 400,
			...responseInit,
		})
	}
}
