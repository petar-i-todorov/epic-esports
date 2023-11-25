import { createCookieSessionStorage } from '@remix-run/node'

type ResetPasswordSession = {
	email: string
}

type SignupSession = {
	email: string
	username: string
	fullName: string
	password: string
}

type ProviderSession = {
	provider: 'github'
	providerId: string
	username: string
	fullName: string
	email: string
}

type VerifySession = ResetPasswordSession | SignupSession | ProviderSession

const verifySessionStorage = createCookieSessionStorage({
	cookie: {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		secrets: [process.env.VERIFY_SECRET!],
		name: 'ee_verify',
		maxAge: 60 * 60 * 30, // 30 minutes
	},
})

export async function getEmail(request: Request) {
	const cookie = request.headers.get('cookie')
	const session = await verifySessionStorage.getSession(cookie)
	const email = session.get('email') as unknown
	return email
}

export async function getSignupData(request: Request) {
	const cookie = request.headers.get('cookie')
	const session = await verifySessionStorage.getSession(cookie)
	const email = session.get('email') as unknown
	const username = session.get('username') as unknown
	const fullName = session.get('fullName') as unknown
	const password = session.get('password') as unknown
	return {
		email,
		username,
		fullName,
		password,
	}
}

export async function getProviderData(request: Request) {
	const cookie = request.headers.get('cookie')
	const session = await verifySessionStorage.getSession(cookie)
	const provider = session.get('provider') as unknown
	const providerId = session.get('providerId') as unknown
	const username = session.get('username') as unknown
	const fullName = session.get('fullName') as unknown
	const email = session.get('email') as unknown
	return {
		provider,
		providerId,
		username,
		fullName,
		email,
	}
}

export async function createCookie(config: VerifySession) {
	const session = await verifySessionStorage.getSession()
	Object.keys(config).forEach(key => {
		session.set(key, config[key as keyof VerifySession])
	})
	const cookie = await verifySessionStorage.commitSession(session)
	return cookie
}