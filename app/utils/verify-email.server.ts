import { createCookieSessionStorage } from '@remix-run/node'

export const verifyEmailSessionStorage = createCookieSessionStorage({
	cookie: {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		secrets: [process.env.SIGNUP_DATA_SECRET!],
		name: 'ee_verify-email',
		maxAge: 60 * 60 * 30, // 30 minutes
	},
})
