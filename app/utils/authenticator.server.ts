import { createCookieSessionStorage } from '@remix-run/node'
import { Authenticator } from 'remix-auth'
import { GitHubStrategy } from 'remix-auth-github'
import { GoogleStrategy } from 'remix-auth-google'
import { FacebookStrategy } from 'remix-auth-socials'

export type ProviderData = {
	id: string
	username: string
	fullName: string
	email: string
	provider: string
}

if (!process.env.AUTHENTICATOR_SECRET) {
	throw new Error('AUTHENTICATOR_SECRET is not set')
}

if (!process.env.GITHUB_STRATEGY_CLIENT_ID) {
	throw new Error('GITHUB_STRATEGY_CLIENT_ID is not set')
}

if (!process.env.GITHUB_STRATEGY_CLIENT_SECRET) {
	throw new Error('GITHUB_STRATEGY_CLIENT_SECRET is not set')
}

if (!process.env.GOOGLE_STRATEGY_CLIENT_ID) {
	throw new Error('GOOGLE_STRATEGY_CLIENT_ID is not set')
}

if (!process.env.GOOGLE_STRATEGY_CLIENT_SECRET) {
	throw new Error('GOOGLE_STRATEGY_CLIENT_SECRET is not set')
}

if (!process.env.FACEBOOK_STRATEGY_CLIENT_ID) {
	throw new Error('FACEBOOK_STRATEGY_CLIENT_ID is not set')
}

if (!process.env.FACEBOOK_STRATEGY_CLIENT_SECRET) {
	throw new Error('FACEBOOK_STRATEGY_CLIENT_SECRET is not set')
}

const authenticatorCookieSessionStorage = createCookieSessionStorage({
	cookie: {
		name: 'ee__authenticator',
		secrets: [process.env.AUTHENTICATOR_SECRET],
		sameSite: 'lax',
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
	},
})

const authenticator = new Authenticator<ProviderData>(
	authenticatorCookieSessionStorage,
)

console.log('process.env.ORIGIN', process.env.ORIGIN)

authenticator.use(
	new GitHubStrategy(
		{
			clientID: process.env.GITHUB_STRATEGY_CLIENT_ID,
			clientSecret: process.env.GITHUB_STRATEGY_CLIENT_SECRET,
			callbackURL: `${process.env.ORIGIN}github/callback`,
		},
		async ({ profile }) => {
			return {
				username: profile.displayName,
				fullName: profile.name.givenName,
				email: profile.emails[0].value,
				id: profile.id,
				provider: profile.provider,
			}
		},
	),
	'github',
)

authenticator.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_STRATEGY_CLIENT_ID,
			clientSecret: process.env.GOOGLE_STRATEGY_CLIENT_SECRET,
			callbackURL: `${process.env.ORIGIN}google/callback`,
		},
		async ({ profile }) => {
			return {
				username: profile.displayName,
				fullName: profile.name.givenName,
				email: profile.emails[0].value,
				id: profile.id,
				provider: profile.provider,
			}
		},
	),
	'google',
)

authenticator.use(
	new FacebookStrategy(
		{
			clientID: process.env.FACEBOOK_STRATEGY_CLIENT_ID,
			clientSecret: process.env.FACEBOOK_STRATEGY_CLIENT_SECRET,
			callbackURL: `${process.env.ORIGIN}facebook/callback`,
		},
		async ({ profile }) => {
			return {
				username: profile.displayName,
				fullName: profile.name.givenName,
				email: profile.emails[0].value,
				id: profile.id,
				provider: profile.provider,
			}
		},
	),
	'facebook',
)

export { authenticator }
