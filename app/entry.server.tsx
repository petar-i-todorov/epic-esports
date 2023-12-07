import { PassThrough } from 'stream'
import * as Sentry from '@sentry/remix'
/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { EntryContext, Response } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import isbot from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import { setupServer } from 'msw/node'
import { http, HttpResponse, passthrough } from 'msw'

export function handleError(error: unknown, { request }: { request: Request }) {
	// returns undefined making ESLint being fine with it
	// since we don't have missed promise awaiting
	// (sentry requires us just to fire this promise and forget about it)
	void Sentry.captureRemixServerException(error, 'remix.server', request)
}

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	tracesSampleRate: 1,
	beforeSend(event, hint) {
		if (
			hint.originalException instanceof Error &&
			hint.originalException.stack?.match(
				/chrome-extension:|moz-extension:|extensions|anonymous scripts/,
			)
		) {
			return null
		}
		return event
	},
})

// const server = setupServer(
// 	http.post(/sentry/, () => {
// 		return passthrough()
// 	}),
// 	http.get(/sanity/, () => {
// 		return passthrough()
// 	}),
// 	http.post('https://api.resend.com/emails', async ({ request }) => {
// 		const body = await request.json()
// 		const response = HttpResponse.json({ success: true })
// 		console.info(body)

// 		return response
// 	}),
// 	http.post(`${process.env.REMIX_DEV_HTTP_ORIGIN}ping`, () => {
// 		return passthrough()
// 	}),
// )

// server.listen({
// 	onUnhandledRequest: req => {
// 		console.warn(`Unhandled ${req.method} request to ${req.url}.`)
// 	},
// })

const ABORT_DELAY = 5_000

export default function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
) {
	return isbot(request.headers.get('user-agent'))
		? handleBotRequest(
				request,
				responseStatusCode,
				responseHeaders,
				remixContext,
		  )
		: handleBrowserRequest(
				request,
				responseStatusCode,
				responseHeaders,
				remixContext,
		  )
}

function handleBotRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
) {
	return new Promise((resolve, reject) => {
		let shellRendered = false
		const { pipe, abort } = renderToPipeableStream(
			<RemixServer
				context={remixContext}
				url={request.url}
				abortDelay={ABORT_DELAY}
			/>,
			{
				onAllReady() {
					shellRendered = true
					const body = new PassThrough()

					responseHeaders.set('Content-Type', 'text/html')

					resolve(
						new Response(body, {
							headers: responseHeaders,
							status: responseStatusCode,
						}),
					)

					pipe(body)
				},
				onShellError(error: unknown) {
					reject(error)
				},
				onError(error: unknown) {
					responseStatusCode = 500
					// Log streaming rendering errors from inside the shell.  Don't log
					// errors encountered during initial shell rendering since they'll
					// reject and get logged in handleDocumentRequest.
					if (shellRendered) {
						console.error(error)
					}
				},
			},
		)

		setTimeout(abort, ABORT_DELAY)
	})
}

function handleBrowserRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
) {
	return new Promise((resolve, reject) => {
		let shellRendered = false
		const { pipe, abort } = renderToPipeableStream(
			<RemixServer
				context={remixContext}
				url={request.url}
				abortDelay={ABORT_DELAY}
			/>,
			{
				onShellReady() {
					shellRendered = true
					const body = new PassThrough()

					responseHeaders.set('Content-Type', 'text/html')

					resolve(
						new Response(body, {
							headers: responseHeaders,
							status: responseStatusCode,
						}),
					)

					pipe(body)
				},
				onShellError(error: unknown) {
					reject(error)
				},
				onError(error: unknown) {
					responseStatusCode = 500
					// Log streaming rendering errors from inside the shell.  Don't log
					// errors encountered during initial shell rendering since they'll
					// reject and get logged in handleDocumentRequest.
					if (shellRendered) {
						console.error(error)
					}
				},
			},
		)

		setTimeout(abort, ABORT_DELAY)
	})
}
