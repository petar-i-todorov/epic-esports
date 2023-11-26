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
import { SignupSchema } from './signup'
import { AuthButton, AuthPage, authInputsClassNames } from './login'
import { prisma } from '~/utils/prisma-client.server'
import { getProviderData } from '~/utils/verify.server'
import JustifyBetween from '~/components/ui/justify-between'
import Mandatory from '~/components/ui/mandatory'
import Error from '~/components/ui/error'
import Link from '~/components/ui/custom-link'
import { invariantResponse } from '~/utils/misc.server'
import { createCookie } from '~/utils/session.server'
import { createConfettiCookie } from '~/utils/confetti.server'

export async function loader({ request }: DataFunctionArgs) {
	const { email, fullName, username } = await getProviderData(request)

	return json({
		email: typeof email === 'string' ? email : '',
		fullName: typeof fullName === 'string' ? fullName : '',
		username: typeof username === 'string' ? username : '',
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
		typeof provider === 'string' && typeof providerId === 'string',
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
				<JustifyBetween>
					<label htmlFor={fields.email.id}>
						Email
						<Mandatory />
					</label>
					{fields.email.error ? (
						<Error id={fields.email.errorId} error={fields.email.error} />
					) : null}
				</JustifyBetween>
				<input
					className={`${authInputsClassNames} ${
						fields.email.error ? 'border-red-500' : ''
					}`}
					type="email"
					placeholder="janedoh@email.com"
					autoFocus
					readOnly={!!email}
					{...conform.input(fields.email)}
				/>
				<JustifyBetween>
					<label htmlFor={fields.password.id}>
						Password
						<Mandatory />
					</label>
					{fields.password.error ? (
						<Error id={fields.password.errorId} error={fields.password.error} />
					) : null}
				</JustifyBetween>
				<input
					className={`${authInputsClassNames} ${
						fields.password.error ? 'border-red-500' : ''
					}`}
					type="password"
					autoComplete="new-password"
					placeholder="Jane123456"
					{...conform.input(fields.password)}
				/>
				<JustifyBetween>
					<label htmlFor={fields.confirmPassword.id}>
						Confirm password
						<Mandatory />
					</label>
					{fields.confirmPassword.error ? (
						<Error
							id={fields.confirmPassword.errorId}
							error={fields.confirmPassword.error}
						/>
					) : null}
				</JustifyBetween>
				<input
					className={`${authInputsClassNames} ${
						fields.confirmPassword.error ? 'border-red-500' : ''
					}`}
					type="password"
					autoComplete="new-password"
					placeholder="Jane123456"
					{...conform.input(fields.confirmPassword)}
				/>
				<JustifyBetween>
					<label htmlFor={fields.username.id}>
						Username
						<Mandatory />
					</label>
					{fields.username.error ? (
						<Error id={fields.username.errorId} error={fields.username.error} />
					) : null}
				</JustifyBetween>
				<input
					className={`${authInputsClassNames} ${
						fields.username.error ? 'border-red-500' : ''
					}`}
					type="text"
					placeholder="janedoe123"
					{...conform.input(fields.username)}
				/>
				<JustifyBetween>
					<label htmlFor={fields.fullName.id}>
						Full name
						<Mandatory />
					</label>
					{fields.fullName.error ? (
						<Error id={fields.fullName.errorId} error={fields.fullName.error} />
					) : null}
				</JustifyBetween>
				<input
					className={`${authInputsClassNames} ${
						fields.fullName.error ? 'border-red-500' : ''
					}`}
					type="text"
					placeholder="Jane Doe"
					{...conform.input(fields.fullName)}
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
