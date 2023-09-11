import { Link } from '@remix-run/react'
import facebookLogoSrc from '#app/assets/auth-logos/facebook-logo.jpg'
import appleLogoSrc from '#app/assets/auth-logos/apple-logo.jpg'
import googleLogoSrc from '#app/assets/auth-logos/google-logo.jpg'

export default function LoginRoute() {
	const loginInputsClassNames =
		'h-[36px] p-2 self-stretch text-black placeholder:text-gray-400'
	return (
		<div className="h-[100%] grid place-content-center dark:text-white">
			<div className="w-[400px] h-[500px] p-[30px] flex flex-col gap-2 items-center border-white border-2 rounded-lg text-sm">
				<span className="text-5xl">#</span>
				<div className="w-fit my-auto flex flex-col gap-2">
					<span>Sign in with your social account</span>
					<div className="flex justify-between">
						<img
							src={facebookLogoSrc}
							width="45"
							height="45"
							alt="Facebook Logo"
						/>
						<img src={googleLogoSrc} alt="Google Logo" width="45" height="45" />
						<img src={appleLogoSrc} alt="Apple Logo" width="45" height="45" />
					</div>
				</div>
				<span className="font-bold">Sign in with your email</span>
				<label className="sr-only" htmlFor="login-email">
					Enter your email:
				</label>
				<input
					className={loginInputsClassNames}
					type="text"
					placeholder="janedoe@email.com"
					id="login-email"
				/>
				<label className="sr-only" htmlFor="login-password">
					Enter your password:
				</label>
				<input
					className={loginInputsClassNames}
					type="text"
					placeholder="janedoe123"
					id="login-password"
				/>
				<label className="self-start">
					<input type="checkbox" /> Keep me signed in
				</label>
				<Link className="self-end text-blue-300 hover:underline" to="#">
					Forgot your password?
				</Link>
				<button className="h-[36px] self-stretch text-black bg-yellow-300 font-bold rounded-sm hover:text-white hover:bg-blue-600">
					Sign in
				</button>
				<div className="flex gap-2">
					<span>Don&apos;t have an account?</span>
					<Link className="text-blue-300 hover:underline" to="/auth/signup">
						Sign up now
					</Link>
				</div>
			</div>
		</div>
	)
}
