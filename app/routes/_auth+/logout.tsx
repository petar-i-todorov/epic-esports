import { redirect } from '@remix-run/node'
import { sessionStorage } from '~/utils/session.server'

export async function action() {
	const session = await sessionStorage.getSession()
	const cookie = await sessionStorage.destroySession(session)

	console.log(cookie)

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return redirect(process.env.ORIGIN!, {
		headers: {
			'Set-Cookie': cookie,
		},
	})
}
