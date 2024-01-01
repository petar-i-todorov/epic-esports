import { PassThrough, Readable } from 'node:stream'
import * as Sentry from '@sentry/remix'
/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { type EntryContext } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import isbot from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
// import { server } from './mocks/node.ts'
import { postReactionTypes } from './constants/post-reactions.ts'
import { prisma } from './utils/prisma-client.server.ts'

if (process.env.NODE_ENV === 'development') {
	// server.listen({
	// 	onUnhandledRequest(request) {
	// 		console.error(
	// 			`A request was made to ${request.url} but no handler was defined`,
	// 		)
	// 	},
	// })
}

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

for (const name of postReactionTypes) {
	await prisma.postReactionType.upsert({
		create: {
			name,
		},
		update: {},
		where: {
			name,
		},
	})
}

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
					const webBody = Readable.toWeb(body) as ReadableStream

					responseHeaders.set('Content-Type', 'text/html')

					resolve(
						new Response(webBody, {
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
					const webBody = Readable.toWeb(body) as ReadableStream

					responseHeaders.set('Content-Type', 'text/html')

					resolve(
						new Response(webBody, {
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
