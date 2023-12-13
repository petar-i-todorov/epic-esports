export type ClientEnv = {
	SENTRY_DSN: string
	SANITY_STUDIO_PROJECT_ID: string
	SANITY_STUDIO_DATASET: string
	SANITY_STUDIO_URL: string
	SANITY_STUDIO_USE_STEGA: string
}

export function isClientEnv(env: unknown): env is ClientEnv {
	if (typeof env !== 'object' || env === null) {
		return false
	}

	// prettier-ignore
	if ('SENTRY_DSN' in env && typeof env['SENTRY_DSN'] === 'string') return true;

	// prettier-ignore
	if ('SANITY_STUDIO_PROJECT_ID' in env && typeof env['SANITY_STUDIO_PROJECT_ID'] === 'string') return true;

	// prettier-ignore
	if ('SANITY_STUDIO_DATASET' in env && typeof env['SANITY_STUDIO_DATASET'] === 'string') return true;

	// prettier-ignore
	if ('SANITY_STUDIO_URL' in env && typeof env['SANITY_STUDIO_URL'] === 'string') return true;

	// prettier-ignore
	if ('SANITY_STUDIO_USE_STEGA' in env && typeof env['SANITY_STUDIO_USE_STEGA'] === 'string') return true;

	return false
}
