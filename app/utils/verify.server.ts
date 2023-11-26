import { createCookieSessionStorage } from '@remix-run/node'
import { ProviderData } from './authenticator.server'
import { invariantResponse } from './misc.server'

type ResetPasswordSession = {
	email: string
}

type SignupSession = {
	email: string
	username: string
	fullName: string
	password: string
}

type VerifySession = ResetPasswordSession | SignupSession | ProviderData

invariantResponse(
	process.env.VERIFY_SECRET,
	'Missing VERIFY_SECRET env variable',
	{
		status: 500,
	},
)

const verifySessionStorage = createCookieSessionStorage({
	cookie: {
		secrets: [process.env.VERIFY_SECRET],
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
	const id = session.get('id') as unknown
	const provider = session.get('provider') as unknown
	const username = session.get('username') as unknown
	const fullName = session.get('fullName') as unknown
	const email = session.get('email') as unknown
	return {
		id,
		provider,
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
