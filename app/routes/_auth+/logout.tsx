import { redirect } from '@remix-run/node'
import { sessionStorage } from '#app/utils/session.server.ts'

export async function action() {
	const session = await sessionStorage.getSession()
	const cookie = await sessionStorage.destroySession(session)

	return redirect('/', {
		headers: {
			'Set-Cookie': cookie,
		},
	})
}
