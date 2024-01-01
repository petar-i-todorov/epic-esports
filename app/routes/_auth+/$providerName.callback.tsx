import { type DataFunctionArgs, redirect } from '@remix-run/node'
import { authenticator } from '#app/utils/authenticator.server.ts'
import { prisma } from '#app/utils/prisma-client.server.ts'
import { createCookie } from '#app/utils/verify.server.ts'
import { createCookie as createSessionCookie } from '#app/utils/session.server.ts'
import { invariantResponse } from '#app/utils/misc.server.ts'

export async function loader({ request, params }: DataFunctionArgs) {
	const { providerName } = params

	invariantResponse(
		providerName,
		"There's a problem with the url. Missing provider name.",
		{
			status: 500,
		},
	)

	const profile = await authenticator.authenticate(providerName, request, {
		throwOnError: true,
	})

	const cookie = await createCookie({
		id: profile.id,
		provider: profile.provider,
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
				provider: profile.provider,
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
				provider: profile.provider,
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
