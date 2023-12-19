import { Form, Link, useActionData, useNavigation } from '@remix-run/react'
import { json, type DataFunctionArgs, redirect } from '@remix-run/node'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { generateTOTP, verifyTOTP } from '@epic-web/totp'
import z from 'zod'
import { useForm } from '@conform-to/react'
import { AuthButton, AuthPage } from '#app/routes/_auth+/login.tsx'
import Icon from '#app/components/icon.tsx'
import { getUser } from '#app/utils/use-user.tsx'
import { prisma } from '#app/utils/prisma-client.server.ts'
import Error from '#app/components/ui/error.tsx'
import { createCookie as createToastCookie } from '#app/utils/toast.server.ts'
import { invariantResponse } from '#app/utils/misc.server.ts'
import { createCookie } from '#app/utils/verify.server.ts'
import Input from '#app/components/ui/input.tsx'
import { sendEmail } from '#app/utils/send-email.server.ts'

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
	console.log('here')
	const cookieHeader = request.headers.get('Cookie')
	const formData = await request.formData()

	console.log('formdara')

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
	console.log(submission)

	if (submission.value) {
		if (submission.value.intent === 'send') {
			console.log('send')
			const loggedIn = await getUser(cookieHeader ?? '')
			console.log(loggedIn)
			invariantResponse(!loggedIn, 'You are already logged in')
			console.log('logged in')

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

			console.log('there')
			await sendEmail({
				to: submission.value.email,
				subject: 'Reset your password',
				html: `
				<!DOCTYPE html>
				<html>
				<head>
					<style>
						.container {
							font-family: Arial, sans-serif;
							background-color: #f4f4f4;
							padding: 20px;
							max-width: 600px;
							margin: auto;
						}
						.header {
							background-color: #222;
							color: #fff;
							padding: 10px;
							text-align: center;
						}
						.content {
							background-color: white;
							padding: 20px;
							text-align: center;
						}
						.button {
							display: inline-block;
							margin-top: 20px;
							padding: 10px 20px;
							background-color: #0066cc;
							color: white;
							text-decoration: none;
							border-radius: 5px;
						}
						.footer {
							text-align: center;
							padding: 10px;
							font-size: 0.8em;
							color: #777;
						}
					</style>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1>Epic Esports</h1>
						</div>
						<div class="content">
							<h2>Reset your password</h2>
							<p>Enter the following code to reset your password:</p>
							<p>${otp}</p>
						</div>
						<div class="footer">
							Epic Esports, Inc. <br>
							123 Esports Lane, Gaming City, GX 12345 <br>
						</div>
					</div>
				</body>
				</html>				
				`,
			}).catch(() => {
				throw json({
					message: 'Failed to send email',
					status: 500,
				})
			})
			console.log('and there')

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
		console.log('return')
		return json({ submission }, { status: 400 })
	}
}

export default function ForgotPasswordRoute() {
	const navigation = useNavigation()
	const isLoadingVerify = navigation.formData?.get('intent') === 'verify'
	const isLoadingSend = navigation.formData?.get('intent') === 'send'
	const isLoading = isLoadingVerify || isLoadingSend

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
					/>
				) : null}
				{isEmailSent ? (
					<AuthButton name="intent" value="verify" disabled={isLoading}>
						<span className="relative">
							Verify code
							{isLoadingVerify ? (
								<Icon
									name="loader-2"
									className="absolute left-[110%] top-[calc(50%-12.5px)] h-[25px] w-[25px] animate-spin"
								/>
							) : null}
						</span>
					</AuthButton>
				) : null}
				<AuthButton name="intent" value="send" disabled={isLoading}>
					<span className="relative">
						{isEmailSent ? 'Send new code' : 'Send verification code'}
						{isLoadingSend ? (
							<Icon
								name="loader-2"
								className="absolute left-[110%] top-[calc(50%-12.5px)] h-[25px] w-[25px] animate-spin"
							/>
						) : null}
					</span>
				</AuthButton>
				{form.error ? <Error id={form.errorId} error={form.error} /> : null}
			</Form>
		</AuthPage>
	)
}
