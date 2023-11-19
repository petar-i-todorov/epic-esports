import { createCookieSessionStorage } from '@remix-run/node'

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		secrets: [process.env.SESSION_SECRET!],
		name: 'session',
		maxAge: 60 * 60 * 60 * 24 * 30, // 30 days
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
	},
})

export async function createSessionCookie(userId: string) {
	const session = await sessionStorage.getSession()
	session.set('userId', userId)
	const cookie = await sessionStorage.commitSession(session)
	return cookie
}
