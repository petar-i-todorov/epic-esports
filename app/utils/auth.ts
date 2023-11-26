import z from 'zod'

export function createPasswordSchema({
	requiredErrorMessage = 'Password is required',
	// don't give potential attacker information about the length of the password
	// during login
	noFingerprints = false,
} = {}) {
	const NoFingerprintsSchema = z.string({
		required_error: requiredErrorMessage,
	})
	return noFingerprints
		? NoFingerprintsSchema
		: NoFingerprintsSchema.min(8, {
				message: 'Password must contain at least 8 characters',
		  }).max(50, { message: "Password can't contain more than 50 characters" })
}

export const PasswordSchema = createPasswordSchema()
export const ConfirmPasswordSchema = createPasswordSchema({
	requiredErrorMessage: 'Confirm password is required',
})
export const PasswordSchemaNoFingerprints = createPasswordSchema({
	noFingerprints: true,
})
