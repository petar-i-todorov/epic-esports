import { Form, Link } from '@remix-run/react'
import { AuthButton, AuthPage, authInputsClassNames } from './login'
import Icon from '#app/components/icon'

export default function ForgorPasswordRoute() {
	return (
		<AuthPage>
			<Link
				to="/login"
				className="flex absolute top-[25px] left-[30px] text-gray-300"
			>
				<Icon name="chevron-left" width="25" height="25" />
				<span className="hover:text-orange-300">Login</span>
			</Link>
			<Form
				action="/forgot-password"
				method="POST"
				className="flex flex-col gap-2 items-center relative"
			>
				<input
					type="email"
					placeholder="janedoe@email.com"
					className={authInputsClassNames}
				/>
				<AuthButton>Send verification code</AuthButton>
			</Form>
		</AuthPage>
	)
}
