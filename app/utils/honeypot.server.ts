import { Honeypot } from 'remix-utils/honeypot/server'

const honeypot = new Honeypot({
	nameFieldName: 'name',
	randomizeNameFieldName: true,
	validFromFieldName: 'valid_from',
	encryptionSeed: process.env.HONEYPOT_ENCRYPTION_SEED,
})

export { honeypot }
