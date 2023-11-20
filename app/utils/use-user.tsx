import { json } from '@remix-run/node'
import { useRouteLoaderData } from '@remix-run/react'
import { prisma } from './prisma-client.server'
import { sessionStorage } from './session.server'
import { loader } from '~/root'

export async function getUser(cookie: string) {
	const session = await sessionStorage.getSession(cookie)

	const userId = session.get('userId') as string | undefined

	if (userId) {
		const user = await prisma.user.findUnique({
			select: {
				id: true,
				email: true,
				username: true,
			},
			where: {
				id: userId,
			},
		})

		if (user) {
			return user
		}
		return null
	} else {
		return null
	}
}

export function useRequiredUser() {
	const loaderData = useRouteLoaderData<typeof loader>('root')

	if (loaderData?.user) {
		return { user: loaderData.user }
	}

	throw json({ message: 'Unauthorized' }, { status: 401 })
}

export function useOptionalUser() {
	const loaderData = useRouteLoaderData<typeof loader>('root')

	if (loaderData?.user) {
		return { user: loaderData.user }
	}
	return null
}