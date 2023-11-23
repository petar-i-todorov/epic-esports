import { verifyTOTP } from '@epic-web/totp'
import { DataFunctionArgs, json, redirect } from '@remix-run/node'
import { createConfettiCookie } from '#app/utils/confetti.server'
import { prisma } from '#app/utils/prisma-client.server'
import { sessionStorage } from '#app/utils/session.server'
import { verifyEmailSessionStorage } from '#app/utils/verify-email.server'

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

					const headers = new Headers([
						['Set-Cookie', await sessionStorage.commitSession(sessionId)],
						['Set-Cookie', createConfettiCookie()],
					])

					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					return redirect(process.env.ORIGIN!, {
						headers,
					})
				}
			}
		}
	}

	return json({})
}
