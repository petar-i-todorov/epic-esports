import { createCookieSessionStorage } from '@remix-run/node'

const verifyEmailSessionStorage = createCookieSessionStorage({
	cookie: {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		secrets: [process.env.VERIFICATION_COOKIE_SECRET!],
		name: 'verify-email',
		maxAge: 60 * 60 * 30, // 30 minutes
	},
})

export async function createVerifyEmailCookie() {
	const session = await verifyEmailSessionStorage.getSession()
	return verifyEmailSessionStorage.commitSession(session)
}
