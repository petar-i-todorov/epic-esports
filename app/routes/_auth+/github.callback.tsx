import { DataFunctionArgs, redirect } from '@remix-run/node'
import { authenticator } from '~/utils/auth-github.server'
import { prisma } from '~/utils/prisma-client.server'
import { createCookie } from '~/utils/verify.server'
import { createCookie as createSessionCookie } from '#app/utils/session.server'

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

	const connection = await prisma.connection.findUnique({
		select: {
			userId: true,
		},
		where: {
			providerId_provider: {
				provider: 'github',
				providerId: profile.id,
			},
		},
	})

	if (connection) {
		return redirect('/', {
			headers: {
				'Set-Cookie': await createSessionCookie(connection.userId),
			},
		})
	}

	const user = await prisma.user.findUnique({
		select: {
			id: true,
		},
		where: {
			email: profile.email,
		},
	})

	if (user) {
		await prisma.connection.create({
			data: {
				id: profile.id,
				provider: 'github',
				providerId: profile.id,
				userId: user.id,
			},
		})

		return redirect('/', {
			headers: {
				'Set-Cookie': await createSessionCookie(user.id),
			},
		})
	}

	return redirect('/onboarding', {
		headers: {
			'Set-Cookie': cookie,
		},
	})
}
