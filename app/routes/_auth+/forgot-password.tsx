import { Form, Link, useActionData } from '@remix-run/react'
import { json, type DataFunctionArgs, redirect } from '@remix-run/node'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { generateTOTP, verifyTOTP } from '@epic-web/totp'
import z from 'zod'
import { useForm } from '@conform-to/react'
import { AuthButton, AuthPage } from '../../routes/_auth+/login.js'
import Icon from '../../components/icon.js'
import { getUser } from '../../utils/use-user.js'
import { prisma } from '../../utils/prisma-client.server.js'
import Error from '../../components/ui/error.js'
import { createCookie as createToastCookie } from '../../utils/toast.server.js'
import { invariantResponse } from '../../utils/misc.server.js'
import { createCookie } from '../../utils/verify.server.js'
import Input from '../../components/ui/input.js'

const EmailSchema = z
	.string({
		required_error: 'Email address is required',
	})
	.email({ message: 'Invalid email address' })

const ForgotPasswordSchema = z.union([
	z.object({
		email: EmailSchema,
		intent: z.literal('send'),
	}),
	z.object({
		email: EmailSchema,
		code: z.string({
			required_error: 'Verification code is required',
		}),
		intent: z.literal('verify'),
	}),
])

export async function action({ request }: DataFunctionArgs) {
	const cookieHeader = request.headers.get('Cookie')
	const formData = await request.formData()
	console.log(Object.fromEntries(formData))

	const submission = await parse(formData, {
		schema: ForgotPasswordSchema.superRefine(async (fields, ctx) => {
			const { email, intent } = fields

			const user = await prisma.user.findUnique({
				select: {
					id: true,
					email: true,
				},
				where: {
					email,
				},
			})

			if (!user) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'User with such email does not exist',
					path: ['email'],
				})
			}

			if (intent === 'verify') {
				const verification = await prisma.verification.findUnique({
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

				if (verification) {
					const isValid = verifyTOTP({
						...verification,
						otp: fields.code,
					})

					if (!isValid) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: 'Invalid verification code',
							path: ['code'],
						})
					}
				} else {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'No verification code found for this email',
						path: ['email'],
					})
				}
			}
		}),
		async: true,
	})

	if (submission.value) {
		if (submission.value.intent === 'send') {
			const loggedIn = await getUser(cookieHeader ?? '')
			invariantResponse(loggedIn, 'You are already logged in')

			const { otp, ...totpConfig } = generateTOTP({
				algorithm: 'sha256',
				period: 30,
			})

			const verificationData = {
				...totpConfig,
				type: 'email',
				target: submission.value.email,
			}

			await prisma.verification.upsert({
				create: verificationData,
				update: verificationData,
				where: {
					type_target: {
						type: 'email',
						target: submission.value.email,
					},
				},
			})

			const response = await fetch('https://api.resend.com/emails', {
				method: 'POST',
				body: JSON.stringify({
					to: submission.value.email,
					from: process.env.RESEND_API_EMAIL,
					subject: 'Reset your password',
					html: `
								<div>
									<h1>Reset your password</h1>
									<p>Enter the following code to reset your password:</p>
									<p>${otp}</p>
								</div>
							`,
				}),
				headers: {
					Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
					'Content-Type': 'application/json',
				},
			})

			invariantResponse(response.ok, 'Failed to send email')

			return json(
				{ submission },
				{
					headers: {
						'Set-Cookie': await createToastCookie({
							type: 'success',
							title: 'Email sent',
							description: 'Check your inbox for the verification code',
						}),
					},
				},
			)
		} else {
			return redirect('/reset-password', {
				headers: {
					'Set-Cookie': await createCookie({ email: submission.value.email }),
				},
			})
		}
	} else {
		return json({ submission }, { status: 400 })
	}
}

export default function ForgotPasswordRoute() {
	const actionData = useActionData<typeof action>()

	const isEmailSent = Boolean(actionData?.submission.value?.email)

	const [form, fields] = useForm({
		id: 'forgot-password-form',
		constraint: getFieldsetConstraint(ForgotPasswordSchema),
		lastSubmission: actionData?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: ForgotPasswordSchema })
		},
	})

	return (
		<AuthPage>
			<Link
				to="/login"
				className="absolute left-[30px] top-[25px] flex text-gray-300"
			>
				<Icon name="chevron-left" width="25" height="25" />
				<span className="hover:text-orange-300">Login</span>
			</Link>
			<Form
				action="/forgot-password"
				method="POST"
				className="relative flex flex-col items-center gap-2"
				{...form.props}
			>
				<Input
					fieldConfig={fields.email}
					label="Email"
					type="email"
					placeholder="janedoe@email.com"
				/>
				{isEmailSent ? (
					<Input
						fieldConfig={fields.code}
						label="Verification Code"
						type="text"
						placeholder="000000"
						headless
					/>
				) : null}
				{isEmailSent ? (
					<AuthButton name="intent" value="verify">
						Verify code
					</AuthButton>
				) : null}
				<AuthButton name="intent" value="send">
					{isEmailSent ? 'Send new code' : 'Send verification code'}
				</AuthButton>
				{form.error ? <Error id={form.errorId} error={form.error} /> : null}
			</Form>
		</AuthPage>
	)
}
