import { createCookieSessionStorage } from '@remix-run/node'

const resetPasswordSessionCookieStorage = createCookieSessionStorage({
	cookie: {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		secrets: [process.env.RESET_PASSWORD_SECRET!],
		name: 'ee_reset-password',
		maxAge: 60 * 60 * 30, // 30 minutes
	},
})

export const getEmail = async (request: Request) => {
	const cookie = request.headers.get('Cookie')
	const session = await resetPasswordSessionCookieStorage.getSession(cookie)
	return session.get('email') as unknown
}

export const createCookie = async (email: string) => {
	const session = await resetPasswordSessionCookieStorage.getSession()
	session.set('email', email)
	const cookie = await resetPasswordSessionCookieStorage.commitSession(session)
	return cookie
}
