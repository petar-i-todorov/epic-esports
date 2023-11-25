import { DataFunctionArgs, redirect } from '@remix-run/node'
import { authenticator } from '~/utils/auth-github.server'
import { createCookie } from '~/utils/verify.server'

export async function loader({ request }: DataFunctionArgs) {
	const profile = await authenticator.authenticate('github', request, {
		throwOnError: true,
	})

	const cookie = await createCookie({
		provider: 'github',
		providerId: profile.id,
		email: profile.email,
		fullName: profile.fullName,
		username: profile.username,
	})

	return redirect('/onboarding', {
		headers: {
			'Set-Cookie': cookie,
		},
	})
}
