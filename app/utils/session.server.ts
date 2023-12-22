import {
	CookieSerializeOptions,
	createCookieSessionStorage,
} from '@remix-run/node'
import { invariantResponse } from '#app/utils/misc.server.ts'

invariantResponse(
	process.env.SESSION_SECRET,
	'Missing SESSION_SECRET env variable',
	{
		status: 500,
	},
)

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		secrets: [process.env.SESSION_SECRET],
		name: 'ee_session',
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
	},
})

export async function createCookie(
	userId: string,
	options?: CookieSerializeOptions,
) {
	const session = await sessionStorage.getSession()
	session.set('userId', userId)
	const cookie = await sessionStorage.commitSession(session, options)
	return cookie
}
