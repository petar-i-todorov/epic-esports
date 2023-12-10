// @ts-expect-error - module problem, to fix later before deploying
import { generateTOTP } from '@epic-web/totp'
// @ts-expect-error - module problem, to fix later before deploying
import { SpamError } from 'remix-utils/honeypot/server'
// @ts-expect-error - module problem, to fix later before deploying
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import z from 'zod'
import {
	DataFunctionArgs,
	V2_MetaFunction,
	json,
	redirect,
} from '@remix-run/node'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { conform, useForm } from '@conform-to/react'
import { Form, useActionData, useNavigation } from '@remix-run/react'
import bcrypt from 'bcryptjs'
import { AuthButton, AuthPage } from '#app/routes/_auth+/login'
import Link from '#app/components/ui/custom-link'
import Mandatory from '#app/components/ui/mandatory'
import Error from '#app/components/ui/error'
import { prisma } from '#app/utils/prisma-client.server'
import { honeypot } from '#app/utils/honeypot.server'
import { ConfirmPasswordSchema, PasswordSchema } from '#app/utils/auth'
import { invariantResponse } from '#app/utils/misc.server'
import { createCookie } from '#app/utils/verify.server'
import Input from '#app/components/ui/input'

export const meta: V2_MetaFunction = () => {
	return [
		{
			title: 'Signup - Epic Esports',
		},
	]
}

export const SignupSchema = z
	.object({
		email: z
			.string({
				required_error: 'Email is required',
			})
			.email({ message: 'Invalid email address' }),
		password: PasswordSchema,
		confirmPassword: ConfirmPasswordSchema,
		username: z
			.string({
				required_error: 'Username is required',
			})
			.min(4, { message: 'Username must contain at least 4 characters' })
			.max(15, { message: "Username can't contain more than 15 characters" }),
		fullName: z
			.string({
				required_error: 'Full name is required',
			})
			.min(5, { message: 'Full name must contain at least 5 characters' })
			.max(100, {
				message: "Full name can't contain more than 100 characters",
			}),
		agree: z.literal('on', {
			// current zod version has a bug where there's no invalid_literal option available for custom messages
			// therefore, the only way to show such is by iterating through the issues array of z.literal
			errorMap: () => {
				return {
					message: 'You must agree to our Privacy Policy and Terms of Use',
				}
			},
		}),
	})
	.superRefine(({ confirmPassword, password }, ctx) => {
		if (confirmPassword !== password) {
			ctx.addIssue({
				path: ['confirmPassword'],
				code: z.ZodIssueCode.custom,
				message: 'The passwords must match',
			})
		}
	})

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()

	try {
		honeypot.check(formData)
	} catch (err: unknown) {
		invariantResponse(err instanceof SpamError, "You're a spam bot")
		throw err
	}

	const submission = await parse(formData, {
		schema: SignupSchema.superRefine(async ({ username, email }, ctx) => {
			const emailTaken = await prisma.user.findUnique({
				select: {
					id: true,
				},
				where: {
					email,
				},
			})
			if (emailTaken) {
				ctx.addIssue({
					path: ['email'],
					code: 'custom',
					message: 'User with this email already exists',
				})
			}

			const usernameTaken = await prisma.user.findUnique({
				select: {
					id: true,
				},
				where: {
					username,
				},
			})
			if (usernameTaken) {
				ctx.addIssue({
					path: ['username'],
					code: 'custom',
					message: 'User with this username already exists',
				})
			}
		}),
		async: true,
	})

	if (submission.value) {
		const { email, password, username, fullName } = submission.value

		const { otp, ...verificationData } = generateTOTP({
			algorithm: 'SHA256',
			period: 30,
		})

		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			body: JSON.stringify({
				to: email,
				from: process.env.RESEND_API_EMAIL,
				subject: 'Welcome to EPIC Esports',
				html: `<!DOCTYPE html>
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
								<h2>Welcome to Epic Esports!</h2>
								<p>Thank you for signing up. Please confirm your email address to complete your registration.</p>
								<a href="${process.env.ORIGIN}/verify-email?otp=${otp}" class="button">Confirm Email</a>
								<p>If you did not sign up for an Epic Esports account, please ignore this email.</p>
							</div>
							<div class="footer">
								Epic Esports, Inc. <br>
								123 Esports Lane, Gaming City, GX 12345 <br>
							</div>
						</div>
					</body>
					</html>
					`,
			}),
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
			},
		})

		invariantResponse(response.ok, 'Failed to send verification email', {
			status: 500,
		})
		await prisma.verification.upsert({
			create: {
				type: 'email',
				target: email,
				...verificationData,
			},
			update: {
				type: 'email',
				target: email,
				...verificationData,
			},
			where: {
				type_target: {
					type: 'email',
					target: email,
				},
			},
		})

		const hashedPassword = await bcrypt.hash(password, 10)

		const cookie = await createCookie({
			email,
			password: hashedPassword,
			username,
			fullName,
		})

		return redirect(`/verify-email?otp=${otp}`, {
			headers: {
				'Set-Cookie': cookie,
			},
		})
	} else {
		return json({ submission }, { status: 400 })
	}
}

export default function SignupRoute() {
	const navigation = useNavigation()

	const actionData = useActionData<typeof action>()

	const [form, fields] = useForm({
		id: 'signup-form',
		constraint: getFieldsetConstraint(SignupSchema),
		lastSubmission: actionData?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: SignupSchema })
		},
		shouldValidate: 'onBlur',
	})

	return (
		<AuthPage>
			<Form className="flex flex-col gap-2" method="POST" {...form.props}>
				<HoneypotInputs />
				<Input
					type="email"
					placeholder="janedoh@email.com"
					fieldConfig={fields.email}
					label="Email"
				/>
				<Input
					type="password"
					autoComplete="new-password"
					placeholder="Jane123456"
					fieldConfig={fields.password}
					label="Password"
				/>
				<Input
					type="password"
					autoComplete="new-password"
					placeholder="Jane123456"
					fieldConfig={fields.confirmPassword}
					label="Confirm Password"
				/>
				<Input
					type="text"
					placeholder="janedoe"
					fieldConfig={fields.username}
					label="Username"
				/>
				<Input
					type="text"
					placeholder="Jane Doe"
					fieldConfig={fields.fullName}
					label="Full Name"
				/>
				<label>
					<input
						className={
							fields.agree.error
								? 'outline-dashed outline-1 outline-red-500'
								: ''
						}
						{...conform.input(fields.agree, {
							type: 'checkbox',
						})}
					/>{' '}
					By creating an account, I agree with EPIC Esports{' '}
					<Link to="/privacy">Privacy Policy</Link> and{' '}
					<Link to="/terms-and-conditions">Terms of Use</Link>
					<Mandatory />.
				</label>
				{fields.agree.error ? (
					<Error
						id={fields.agree.errorId}
						error={fields.agree.error}
						className="sr-only"
					/>
				) : null}
				<label>
					<input type="checkbox" name="promotions" /> I would like to receive
					updates and promotions from EPIC Esports.
				</label>
				<AuthButton
					disabled={Boolean(
						navigation.formMethod === 'POST' &&
							navigation.formAction === '/signup',
					)}
				>
					Accept & Create Account
				</AuthButton>
				<div className="flex justify-center">
					{form.error ? <Error id={form.errorId} error={form.error} /> : null}
				</div>
			</Form>
		</AuthPage>
	)
}
