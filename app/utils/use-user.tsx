import { useRouteLoaderData } from '@remix-run/react'
import { prisma } from '#app/utils/prisma-client.server.ts'
import { sessionStorage } from '#app/utils/session.server.ts'
import { invariantResponse } from '#app/utils/misc.server.ts'
import { type loader } from '#app/root.tsx'

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

	invariantResponse(loaderData?.user, 'Unauthorized', {
		status: 401,
	})

	return { user: loaderData.user }
}

export function useOptionalUser() {
	const loaderData = useRouteLoaderData<typeof loader>('root')

	if (loaderData?.user) {
		return { user: loaderData.user }
	}
	return null
}
