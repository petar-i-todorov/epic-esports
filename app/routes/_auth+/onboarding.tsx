import { DataFunctionArgs, json, redirect } from '@remix-run/node'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import bcrypt from 'bcryptjs'
import {
	Form,
	useActionData,
	useLoaderData,
	useNavigation,
} from '@remix-run/react'
import { conform, useForm } from '@conform-to/react'
import { SignupSchema } from '#app/routes/_auth+/signup'
import { AuthButton, AuthPage } from '#app/routes/_auth+/login'
import { prisma } from '#app/utils/prisma-client.server'
import { getProviderData } from '#app/utils/verify.server'
import Mandatory from '#app/components/ui/mandatory'
import Error from '#app/components/ui/error'
import Link from '#app/components/ui/custom-link'
import { invariantResponse } from '#app/utils/misc.server'
import { createCookie } from '#app/utils/session.server'
import { createConfettiCookie } from '#app/utils/confetti.server'
import Input from '#app/components/ui/input'

export async function loader({ request }: DataFunctionArgs) {
	const { email, fullName, username } = await getProviderData(request)

	return json({
		email: email ?? '',
		fullName: fullName ?? '',
		username: username ?? '',
	})
}

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()

	const {
		provider,
		id: providerId,
		email: profileEmail,
	} = await getProviderData(request)

	// cookie w/ the data has expired
	invariantResponse(
		provider && providerId,
		"30 minutes have passed since you've started the registration process. Please, try again.",
	)

	const submission = await parse(formData, {
		schema: SignupSchema.superRefine(async ({ username, email }, ctx) => {
			const differentEmail = profileEmail !== email

			if (differentEmail) {
				ctx.addIssue({
					code: 'custom',
					message:
						'Changing email during 3-rd party registration is not allowed',
					path: ['email'],
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

		const hashedPassword = await bcrypt.hash(password, 10)

		const { id } = await prisma.user.create({
			data: {
				email,
				username,
				name: fullName,
				passwordHash: {
					create: {
						hash: hashedPassword,
					},
				},
				connection: {
					create: {
						provider,
						providerId,
					},
				},
			},
			select: {
				id: true,
			},
		})

		const sessionCookie = await createCookie(id)
		const confettiCookie = createConfettiCookie()
		const headers = new Headers([
			['Set-Cookie', sessionCookie],
			['Set-Cookie', confettiCookie],
		])

		return redirect('/', {
			headers,
		})
	} else {
		return json({ submission }, { status: 400 })
	}
}

export default function SignupRoute() {
	const { email, fullName, username } = useLoaderData<typeof loader>()
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
		defaultValue: {
			email,
			fullName,
			username,
		},
	})

	return (
		<AuthPage>
			<Form className="flex flex-col gap-2" method="POST" {...form.props}>
				<Input
					type="email"
					placeholder="janedoh@email.com"
					readOnly={!!email}
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
					placeholder="janedoe123"
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
								? 'outline-red-500 outline-1 outline-dashed'
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
					disabled={
						// eslint-disable-next-line react/jsx-no-leaked-render
						navigation.formMethod === 'POST' &&
						navigation.formAction === '/onboarding'
					}
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
