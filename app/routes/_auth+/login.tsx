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
import { useForm } from '@conform-to/react'
import facebookLogoSrc from '#app/assets/auth-logos/facebook-logo.jpg'
import appleLogoSrc from '#app/assets/auth-logos/apple-logo.jpg'
import googleLogoSrc from '#app/assets/auth-logos/google-logo.jpg'
import Icon from '#app/components/icon'
import { prisma } from '#app/utils/prisma-client.server'
import { createCookie } from '#app/utils/session.server'
import Error from '#app/components/ui/error'
import { authenticator } from '~/utils/authenticator.server'
import { PasswordSchemaNoFingerprints } from '~/utils/auth'
import Input from '~/components/ui/input'
import { invariantResponse } from '~/utils/misc.server'

export const meta: V2_MetaFunction = () => {
	return [
		{
			title: 'Login - Epic Esports',
		},
	]
}

const EmailSchema = z
	.string({
		required_error: 'Email address is required',
	})
	.email({
		message: 'Invalid email address',
	})

const LoginSchema = z.discriminatedUnion('intent', [
	z.object({
		intent: z.literal('standard'),
		email: EmailSchema,
		password: PasswordSchemaNoFingerprints,
		remember: z.literal('on').optional(),
	}),
	z.object({
		intent: z.enum(['github', 'google', 'facebook']),
	}),
])

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData()

	const submission = await parse(formData, {
		schema: LoginSchema.transform(async (data, ctx) => {
			if (data.intent === 'standard') {
				const { email, password, remember } = data

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

					const sessionCookie = await createCookie(user.id, {
						maxAge: remember ? 60 * 60 * 24 * 30 : undefined,
					})
					return { sessionCookie }
				} else {
					ctx.addIssue({
						code: 'custom',
						message: 'Invalid credentials! Please try again.',
					})
				}
			} else {
				await authenticator.authenticate(data.intent, request)
			}
		}),
		async: true,
	})

	if (submission.value) {
		invariantResponse(process.env.ORIGIN, 'Missing ORIGIN env variable', {
			status: 500,
		})
		return redirect(process.env.ORIGIN, {
			headers: {
				'Set-Cookie': submission.value.sessionCookie,
			},
		})
	} else {
		return json({ submission }, { status: 400 })
	}
}

const ServiceLogo = (
	props: JSX.IntrinsicElements['img'] & {
		alt: string
	},
	// alt is provided from props
	// eslint-disable-next-line jsx-a11y/alt-text
) => <img className="object-cover object-center w-[45px] h-[45px]" {...props} />

export const AuthButton = ({
	className,
	...props
}: JSX.IntrinsicElements['button']) => (
	<button
		className={`h-[36px] self-stretch text-black bg-yellow-300 font-bold rounded-sm hover:text-white hover:bg-blue-600 ${className}
		disabled:bg-slate-300 disabled:hover:bg-slate-300`}
		type="submit"
		{...props}
	/>
)

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
			<div className="w-full my-[20px] flex flex-col items-center gap-2">
				<span>Sign in with your social account</span>
				<div className="w-full flex justify-evenly">
					<Form method="POST">
						<input type="hidden" name="intent" value="facebook" />
						<button>
							<ServiceLogo src={facebookLogoSrc} alt="Log in with Facebook" />
						</button>
					</Form>
					<Form method="POST">
						<input type="hidden" name="intent" value="google" />
						<button>
							<ServiceLogo src={googleLogoSrc} alt="Log in with Google" />
						</button>
					</Form>
					<Form method="POST">
						<input type="hidden" name="intent" value="github" />
						{/* TODO - change to github logo; rn I'm lazy af */}
						<button>
							<ServiceLogo src={appleLogoSrc} alt="Log in with Github" />
						</button>
					</Form>
				</div>
			</div>
			<Form
				className="flex flex-col gap-2 items-center"
				method="POST"
				{...form.props}
			>
				<span className="font-bold">Sign in with your email</span>
				<Input
					type="email"
					placeholder="janedoe@email.com"
					fieldConfig={fields.email}
					label="Email"
				/>
				<Input
					type="password"
					placeholder="janedoe123"
					fieldConfig={fields.password}
					label="Password"
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
				<input type="hidden" name="intent" value="standard" />
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
