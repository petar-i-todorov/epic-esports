import { z } from 'zod'

export const ClientEnv = z.object({
	SENTRY_DSN: z.string(),
	SANITY_STUDIO_PROJECT_ID: z.string(),
	SANITY_STUDIO_DATASET: z.string(),
	SANITY_STUDIO_URL: z.string(),
	SANITY_STUDIO_USE_STEGA: z.string(),
})

export type ClientEnv = z.infer<typeof ClientEnv>
