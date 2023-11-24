import z from 'zod'

export function createPasswordSchema(
	requiredErrorMessage: string = 'Password is required',
) {
	return z
		.string({
			required_error: requiredErrorMessage,
		})
		.min(8, { message: 'Password must contain at least 8 characters' })
		.max(50, { message: "Password can't contain more than 50 characters" })
}

export const PasswordSchema = createPasswordSchema()
export const ConfirmPasswordSchema = createPasswordSchema(
	'Confirm password is required',
)
