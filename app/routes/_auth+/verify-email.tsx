import { verifyTOTP } from '@epic-web/totp'
import { DataFunctionArgs, json, redirect } from '@remix-run/node'
import z from 'zod'
import { createConfettiCookie } from '../../utils/confetti.server.js'
import { prisma } from '../../utils/prisma-client.server.js'
import { sessionStorage } from '../../utils/session.server.js'
import { getSignupData } from '../../utils/verify.server.js'
import { invariantResponse } from '../../utils/misc.server.js'

const SignupDataSchema = z.object({
	// they're already validated when creating the cookie
	// just have to check if they're present or not
	email: z.string(),
	fullName: z.string(),
	username: z.string(),
	password: z.string(),
})

export async function loader({ request }: DataFunctionArgs) {
	const otp = new URL(request.url).searchParams.get('otp')

	if (otp) {
		const { email, fullName, username, password } = await getSignupData(request)
		const result = SignupDataSchema.safeParse({
			email,
			fullName,
			username,
			password,
		})

		if (result.success) {
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
						target: result.data.email,
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
							email: result.data.email,
							name: result.data.fullName,
							username: result.data.username,
							passwordHash: {
								create: {
									hash: result.data.password,
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

					invariantResponse(process.env.ORIGIN, 'Missing ORIGIN env variable', {
						status: 500,
					})
					return redirect(process.env.ORIGIN, {
						headers,
					})
				}
			}
		}
	}

	return json({})
}
