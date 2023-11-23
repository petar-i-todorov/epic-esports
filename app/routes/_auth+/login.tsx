import {
	DataFunctionArgs,
	V2_MetaFunction,
	json,
	redirect,
} from '@remix-run/node'
import { Form, Link, useActionData, useNavigation } from '@remix-run/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import z from 'zod'
import bcrypt from 'bcryptjs'
import { conform, useForm } from '@conform-to/react'
import facebookLogoSrc from '#app/assets/auth-logos/facebook-logo.jpg'
import appleLogoSrc from '#app/assets/auth-logos/apple-logo.jpg'
import googleLogoSrc from '#app/assets/auth-logos/google-logo.jpg'
import Icon from '#app/components/icon'
import { prisma } from '#app/utils/prisma-client.server'
import { createSessionCookie } from '#app/utils/session.server'
import Error from '#app/components/ui/error'
import JustifyBetween from '#app/components/ui/justify-between'

export const meta: V2_MetaFunction = () => {
	return [
		{
			title: 'Login - Epic Esports',
		},
	]
}

const LoginSchema = z.object({
	email: z
		.string({
			required_error: 'Email address is required',
		})
		.email({ message: 'Invalid email address' }),
	password: z.string({
		required_error: 'Password is required',
	}),
	remember: z.string().optional(),
})

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()

	const submission = await parse(formData, {
		schema: LoginSchema.transform(
			async ({ email, password, remember }, ctx) => {
				const user = await prisma.user.findUnique({
					select: {
						id: true,
						passwordHash: true,
					},
					where: {
						email,
					},
				})

				if (user) {
					const isValid = await bcrypt.compare(password, user.passwordHash.hash)

					if (!isValid) {
						ctx.addIssue({
							code: 'custom',
							message: 'Invalid credentials! Please try again.',
						})
					}

					const sessionCookie = await createSessionCookie(user.id, {
						maxAge: remember ? 60 * 60 * 24 * 30 : undefined,
					})
					return { sessionCookie }
				} else {
					ctx.addIssue({
						code: 'custom',
						message: 'Invalid credentials! Please try again.',
					})
				}
			},
		),
		async: true,
	})

	if (submission.value) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return redirect(process.env.ORIGIN!, {
			headers: {
				'Set-Cookie': submission.value.sessionCookie,
			},
		})
	} else {
		return json({ submission }, { status: 400 })
	}
}

const ServiceLogo = ({ src, alt }: { src: string; alt: string }) => (
	<img
		className="object-cover object-center"
		src={src}
		alt={alt}
		width="45"
		height="45"
	/>
)

export const AuthButton = ({
	className,
	...props
}: JSX.IntrinsicElements['button']) => (
	<button
		className={`h-[36px] self-stretch text-black bg-yellow-300 font-bold rounded-sm hover:text-white hover:bg-blue-600 ${className}
		disabled:bg-slate-300 disabled:hover:bg-slate-300`}
		{...props}
	/>
)

export const authInputsClassNames =
	'h-[36px] p-2 self-stretch border-2 border-black text-black placeholder:text-gray-400'

export enum AuthAction {
	Login = '/login',
	Signup = '/signup',
}

export const AuthPage = ({ children }: React.PropsWithChildren) => (
	<div className="flex-grow grid place-content-center dark:text-white">
		<div className="w-[500px] p-[30px] border-2 relative border-black dark:border-white rounded-lg text-base">
			<Icon
				name="epic-esports"
				width="100%"
				className="fill-black dark:fill-white"
			/>
			{children}
		</div>
	</div>
)

export default function LoginRoute() {
	const navigation = useNavigation()

	const actionData = useActionData<typeof action>()

	const [form, fields] = useForm({
		id: 'login-form',
		constraint: getFieldsetConstraint(LoginSchema),
		onValidate({ formData }) {
			return parse(formData, { schema: LoginSchema })
		},
		shouldValidate: 'onBlur',
		lastSubmission: actionData?.submission,
	})

	return (
		<AuthPage>
			<Form
				className="flex flex-col gap-2 items-center"
				method="POST"
				{...form.props}
			>
				<div className="w-fit my-[20px] flex flex-col gap-2">
					<span>Sign in with your social account</span>
					<JustifyBetween>
						<ServiceLogo src={facebookLogoSrc} alt="Facebook Logo" />
						<ServiceLogo src={googleLogoSrc} alt="Google Logo" />
						<ServiceLogo src={appleLogoSrc} alt="Apple Logo" />
					</JustifyBetween>
				</div>
				<span className="font-bold">Sign in with your email</span>
				<JustifyBetween>
					<label htmlFor={fields.email.id}>Email</label>
					{fields.email.error ? (
						<Error id={fields.email.id} error={fields.email.error} />
					) : null}
				</JustifyBetween>
				<input
					className={authInputsClassNames}
					type="text"
					placeholder="janedoe@email.com"
					autoFocus
					{...conform.input(fields.email)}
				/>
				<JustifyBetween>
					<label htmlFor={fields.password.id}>Password</label>
					{fields.password.error ? (
						<Error id={fields.password.id} error={fields.password.error} />
					) : null}
				</JustifyBetween>
				<input
					className={authInputsClassNames}
					type="text"
					placeholder="janedoe123"
					{...conform.input(fields.password)}
				/>
				<label className="self-start">
					<input type="checkbox" name="remember" /> Keep me signed in
				</label>
				<Link
					className="self-end text-blue-600 dark:text-blue-300 hover:underline"
					to="/forgot-password"
				>
					Forgot your password?
				</Link>
				<AuthButton
					disabled={
						// eslint-disable-next-line react/jsx-no-leaked-render
						navigation.formAction === '/login' &&
						navigation.formMethod === 'POST'
					}
				>
					Sign in
				</AuthButton>
				<div className="flex gap-2">
					<span>Don&apos;t have an account?</span>
					{form.error ? <Error error={form.error} /> : null}
					<Link
						className="text-blue-600 dark:text-blue-300 hover:underline"
						to="/signup"
					>
						Sign up now
					</Link>
				</div>
			</Form>
		</AuthPage>
	)
}
