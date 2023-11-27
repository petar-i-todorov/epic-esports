import { DataFunctionArgs, redirect } from '@remix-run/node'
import { authenticator } from '~/utils/authenticator.server'
import { prisma } from '~/utils/prisma-client.server'
import { createCookie } from '~/utils/verify.server'
import { createCookie as createSessionCookie } from '#app/utils/session.server'
import { invariantResponse } from '~/utils/misc.server'

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