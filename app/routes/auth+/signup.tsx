import { useId } from 'react'
import {
	authInputsClassNames,
	AuthButton,
	AuthPage,
	AuthAction,
} from '#app/routes/auth+/login'
import Link from '~/components/ui/custom-link'
import Mandatory from '~/components/ui/mandatory'

export default function SignupRoute() {
	const id = useId()
	const emailId = `${id}-email`
	const passwordId = `${id}-password`
	const confirmPasswordId = `${id}-confirm-password`
	const usernameId = `${id}-username`
	const fullNameId = `${id}-full-name`

	return (
		<AuthPage action={AuthAction.Signup}>
			<label htmlFor={emailId}>
				Email
				<Mandatory />
			</label>
			<input
				id={emailId}
				className={authInputsClassNames}
				type="email"
				name="email"
				placeholder="janedoh@email.com"
			/>
			<label htmlFor={passwordId}>
				Password
				<Mandatory />
			</label>
			<input
				className={authInputsClassNames}
				type="password"
				name="password"
				autoComplete="new-password"
				placeholder="Jane123456"
			/>
			<label htmlFor={confirmPasswordId}>
				Confirm password
				<Mandatory />
			</label>
			<input
				className={authInputsClassNames}
				type="password"
				name="confirm-password"
				autoComplete="new-password"
				placeholder="Jane123456"
			/>
			<label htmlFor={usernameId}>
				Username
				<Mandatory />
			</label>
			<input
				className={authInputsClassNames}
				type="text"
				name="username"
				placeholder="janedoe123"
			/>
			<label htmlFor={fullNameId}>
				Full name
				<Mandatory />
			</label>
			<input
				className={authInputsClassNames}
				type="text"
				name="full-name"
				placeholder="Jane Doe"
			/>
			<label>
				<input type="checkbox" name="terms" /> By creating an account, I agree
				with EPIC Esports <Link to="/privacy">Privacy Policy</Link> and{' '}
				<Link to="/terms-and-conditions">Terms of Use</Link>
				<Mandatory />.
			</label>
			<label>
				<input type="checkbox" name="promotions" /> I would like to receive
				updates and promotions from EPIC Esports.
			</label>
			<AuthButton>Accept & Create Account</AuthButton>
		</AuthPage>
	)
}
