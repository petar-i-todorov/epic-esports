import { redirect } from '@remix-run/node'
import { sessionStorage } from '#app/utils/session.server'
import { invariantResponse } from '#app/utils/misc.server'

export async function action() {
	const session = await sessionStorage.getSession()
	const cookie = await sessionStorage.destroySession(session)

	invariantResponse(process.env.ORIGIN, 'Missing ORIGIN env variable', {
		status: 500,
	})

	return redirect(process.env.ORIGIN, {
		headers: {
			'Set-Cookie': cookie,
		},
	})
}
