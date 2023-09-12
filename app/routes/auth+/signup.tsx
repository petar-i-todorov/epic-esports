import {
	authInputsClassNames,
	AuthButton,
	AuthPage,
} from '#app/routes/auth+/login'
import Link from '~/components/ui/custom-link'

export default function SignupRoute() {
	return (
		<AuthPage>
			<input className={authInputsClassNames} type="email" name="email" />
			<input className={authInputsClassNames} type="password" name="password" />
			<input
				className={authInputsClassNames}
				type="password"
				name="confirm-password"
			/>
			<input className={authInputsClassNames} type="text" name="username" />
			<input className={authInputsClassNames} type="text" name="fullname" />
			<label>
				<input type="checkbox" name="terms" /> By creating an account, I agree
				with EPIC Esports <Link to="/privacy">Privacy Policy</Link> and{' '}
				<Link to="/terms-and-conditions">Terms of Use</Link>.
			</label>
			<label>
				<input type="checkbox" name="promotions" /> I would like to receive
				updates and promotions from EPIC Esports.
			</label>
			<AuthButton>Accept & Create Account</AuthButton>
		</AuthPage>
	)
}
