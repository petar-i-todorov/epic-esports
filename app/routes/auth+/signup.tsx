import z from 'zod'
import { DataFunctionArgs, json, redirect } from '@remix-run/node'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { conform, useForm } from '@conform-to/react'
import { Form, useActionData } from '@remix-run/react'
import {
	authInputsClassNames,
	AuthButton,
	AuthPage,
} from '#app/routes/auth+/login'
import Link from '#app/components/ui/custom-link'
import Mandatory from '#app/components/ui/mandatory'
import Error from '#app/components/ui/error'
import { prisma } from '~/utils/prisma-client.server'

const PasswordSchema = z
	.string()
	.min(8, 'Password must contain at least 8 characters')
	.max(50, "Password can't contain more than 50 characters")

const SignupSchema = z
	.object({
		email: z.string().email('Invalid email address'),
		password: PasswordSchema,
		confirmPassword: PasswordSchema,
		username: z
			.string()
			.min(4, 'Username must contain at least 4 characters')
			.max(15, "Username can't contain more than 15 characters"),
		fullName: z
			.string()
			.min(5, 'Full name must contain at least 5 characters')
			.max(100, "Full name can't contain more than 100 characters"),
		agree: z.literal('on'),
	})
	.superRefine(({ confirmPassword, password }, ctx) => {
		if (confirmPassword !== password) {
			ctx.addIssue({
				path: ['confirmPassword'],
				code: 'custom',
				message: 'The passwords must match',
			})
		}
	})

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()
	const submission = await parse(formData, {
		schema: SignupSchema.superRefine(async ({ username, email }, ctx) => {
			const emailTaken = await prisma.user.findUnique({
				where: {
					email,
				},
			})
			if(emailTaken){
				ctx.addIssue({
					path: ['email'],
					code: 'custom',
					message: 'User with this email already exists',
				})
			}

			const usernameTaken = await prisma.user.findUnique({
				where: {
					username,
				},
			})
			if(usernameTaken){
				ctx.addIssue({
					path: ['username'],
					code: 'custom',
					message: 'User with this username already exists',
				})
			}
		}, ), async: true
	,
	})

	if (submission.value) {
		return redirect('/auth/login')
	} else {
		return json({ submission }, { status: 400 })
	}
}

export default function SignupRoute() {
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
				<label htmlFor={fields.email.id}>
					Email
					<Mandatory />
				</label>
				<input
					className={`${authInputsClassNames} ${
						fields.email.error ? 'border-red-500' : ''
					}`}
					type="email"
					placeholder="janedoh@email.com"
					autoFocus
					{...conform.input(fields.email)}
				/>
				{fields.email.error ? (
					<Error id={fields.email.errorId} error={fields.email.error} />
				) : null}
				<label htmlFor={fields.password.id}>
					Password
					<Mandatory />
				</label>
				<input
					className={`${authInputsClassNames} ${
						fields.password.error ? 'border-red-500' : ''
					}`}
					type="password"
					autoComplete="new-password"
					placeholder="Jane123456"
					{...conform.input(fields.password)}
				/>
				{fields.password.error ? (
					<Error id={fields.password.errorId} error={fields.password.error} />
				) : null}
				<label htmlFor={fields.confirmPassword.id}>
					Confirm password
					<Mandatory />
				</label>
				<input
					className={`${authInputsClassNames} ${
						fields.confirmPassword.error ? 'border-red-500' : ''
					}`}
					type="password"
					autoComplete="new-password"
					placeholder="Jane123456"
					{...conform.input(fields.confirmPassword)}
				/>
				{fields.confirmPassword.error ? (
					<Error
						id={fields.confirmPassword.errorId}
						error={fields.confirmPassword.error}
					/>
				) : null}
				<label htmlFor={fields.username.id}>
					Username
					<Mandatory />
				</label>
				<input
					className={`${authInputsClassNames} ${
						fields.username.error ? 'border-red-500' : ''
					}`}
					type="text"
					placeholder="janedoe123"
					{...conform.input(fields.username)}
				/>
				{fields.username.error ? (
					<Error id={fields.username.errorId} error={fields.username.error} />
				) : null}
				<label htmlFor={fields.fullName.id}>
					Full name
					<Mandatory />
				</label>
				<input
					className={`${authInputsClassNames} ${
						fields.fullName.error ? 'border-red-500' : ''
					}`}
					type="text"
					placeholder="Jane Doe"
					{...conform.input(fields.fullName)}
				/>
				{fields.fullName.error ? (
					<Error id={fields.fullName.errorId} error={fields.fullName.error} />
				) : null}
				<label>
					<input
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
					<Error id={fields.agree.errorId} error={fields.agree.error} />
				) : null}
				<label>
					<input type="checkbox" name="promotions" /> I would like to receive
					updates and promotions from EPIC Esports.
				</label>
				<AuthButton>Accept & Create Account</AuthButton>
				<div className="flex justify-center">
					{form.error ? <Error id={form.errorId} error={form.error} /> : null}
				</div>
			</Form>
		</AuthPage>
	)
}
