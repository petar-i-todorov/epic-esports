import { Form, Link } from '@remix-run/react'
import facebookLogoSrc from '#app/assets/auth-logos/facebook-logo.jpg'
import appleLogoSrc from '#app/assets/auth-logos/apple-logo.jpg'
import googleLogoSrc from '#app/assets/auth-logos/google-logo.jpg'
import Icon from '~/components/icon'

const ServiceLogo = ({ src, alt }: { src: string; alt: string }) => (
	<img
		className="object-cover object-center"
		src={src}
		alt={alt}
		width="45"
		height="45"
	/>
)

export const AuthButton = ({ children }: { children: string }) => (
	<button className="h-[36px] self-stretch text-black bg-yellow-300 font-bold rounded-sm hover:text-white hover:bg-blue-600">
		{children}
	</button>
)

export const authInputsClassNames =
	'h-[36px] p-2 self-stretch border-2 border-black text-black placeholder:text-gray-400'

export enum AuthAction {
	Login = '/auth/login',
	Signup = '/auth/signup',
}

export const AuthPage = ({ children }: React.PropsWithChildren) => (
	<div className="flex-grow grid place-content-center dark:text-white">
		<div className="w-[500px] p-[30px] border-2 border-black dark:border-white rounded-lg text-base">
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
	return (
		<AuthPage>
			<Form
				className="flex flex-col gap-2 items-center"
				method="POST"
				{...form.props}
			>
				<div className="w-fit my-[20px] flex flex-col gap-2">
					<span>Sign in with your social account</span>
					<div className="flex justify-between">
						<ServiceLogo src={facebookLogoSrc} alt="Facebook Logo" />
						<ServiceLogo src={googleLogoSrc} alt="Google Logo" />
						<ServiceLogo src={appleLogoSrc} alt="Apple Logo" />
					</div>
				</div>
				<span className="font-bold">Sign in with your email</span>
				<label className="sr-only" htmlFor="login-email">
					Enter your email:
				</label>
				<input
					className={authInputsClassNames}
					type="text"
					placeholder="janedoe@email.com"
					id="login-email"
				/>
				<label className="sr-only" htmlFor="login-password">
					Enter your password:
				</label>
				<input
					className={authInputsClassNames}
					type="text"
					placeholder="janedoe123"
					id="login-password"
				/>
				<label className="self-start">
					<input type="checkbox" /> Keep me signed in
				</label>
				<Link
					className="self-end text-blue-600 dark:text-blue-300 hover:underline"
					to="#"
				>
					Forgot your password?
				</Link>
				<AuthButton>Sign in</AuthButton>
				<div className="flex gap-2">
					<span>Don&apos;t have an account?</span>
					<Link
						className="text-blue-600 dark:text-blue-300 hover:underline"
						to="/auth/signup"
					>
						Sign up now
					</Link>
				</div>
			</Form>
		</AuthPage>
	)
}
