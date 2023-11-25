/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createCookieSessionStorage } from '@remix-run/node'
import { Authenticator } from 'remix-auth'
import { GitHubStrategy } from 'remix-auth-github'

type ProviderData = {
	id: string
	username: string
	fullName: string
	email: string
}

const authenticatorCookieSessionStorage = createCookieSessionStorage({
	cookie: {
		name: 'ee__authenticator',
		secrets: [process.env.AUTHENTICATOR_SECRET!],
		sameSite: 'lax',
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
	},
})

const authenticator = new Authenticator<ProviderData>(
	authenticatorCookieSessionStorage,
)

authenticator.use(
	new GitHubStrategy(
		{
			clientID: process.env.GITHUB_STRATEGY_CLIENT_ID!,
			clientSecret: process.env.GITHUB_STRATEGY_CLIENT_SECRET!,
			callbackURL: `${process.env.ORIGIN}/github/callback`,
		},
		async ({ profile }) => {
			console.log(profile)
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

export { authenticator }
