import { createCookieSessionStorage } from '@remix-run/node'
import z from 'zod'

export type Toast = {
	type: 'success' | 'error' | 'info'
	title: string
	description?: string
}

const toastCookieSessionStorage = createCookieSessionStorage({
	cookie: {
		name: 'ee_toast',
	},
})

export async function createCookie(toastConfig: Toast | null) {
	const session = await toastCookieSessionStorage.getSession()
	if (toastConfig) {
		session.set('toast', toastConfig)
		const cookie = await toastCookieSessionStorage.commitSession(session)
		return cookie
	}
	return toastCookieSessionStorage.destroySession(session)
}

export async function getToast(request: Request) {
	const cookie = request.headers.get('cookie')
	const session = await toastCookieSessionStorage.getSession(cookie)
	return session.get('toast')
}

export const ToastSchema = z
	.object({
		type: z.enum(['success', 'error', 'info']),
		title: z.string(),
		description: z.string().optional(),
	})
	.nullable()
