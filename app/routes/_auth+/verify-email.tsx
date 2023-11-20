import { verifyTOTP } from '@epic-web/totp'
import { DataFunctionArgs, json, redirect } from '@remix-run/node'
import { prisma } from '~/utils/prisma-client.server'
import { sessionStorage } from '~/utils/session.server'
import { verifyEmailSessionStorage } from '~/utils/verify-email.server'

export async function loader({ request }: DataFunctionArgs) {
	const otp = new URL(request.url).searchParams.get('otp')

	if (otp) {
		const emailSession = await verifyEmailSessionStorage.getSession(
			request.headers.get('cookie'),
		)
		const email = emailSession.get('email') as string | undefined
		const fullName = emailSession.get('fullName') as string | undefined
		const username = emailSession.get('username') as string | undefined
		const password = emailSession.get('password') as string | undefined

		if (email && fullName && username && password) {
			const verificationData = await prisma.verification.findUnique({
				select: {
					secret: true,
					algorithm: true,
					digits: true,
					charSet: true,
					period: true,
				},
				where: {
					type_target: {
						type: 'email',
						target: email,
					},
				},
			})

			if (verificationData) {
				const isValid = verifyTOTP({
					...verificationData,
					otp,
				})

				if (isValid) {
					const { id } = await prisma.user.create({
						data: {
							email,
							name: fullName,
							username,
							passwordHash: {
								create: {
									hash: password,
								},
							},
						},
						select: { id: true },
					})

					const sessionId = await sessionStorage.getSession()
					sessionId.set('userId', id)

					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					return redirect(`${process.env.ORIGIN}/?confetti=true`, {
						headers: {
							'Set-Cookie': await sessionStorage.commitSession(sessionId),
						},
					})
				}
			}
		}
	}

	return json({})
}
