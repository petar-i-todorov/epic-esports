// @ts-expect-error - module problem, to fix before deploying
import { createClient } from '@sanity/client/stega'
import { useStega, projectId, dataset, studioUrl } from './project-details'

// Do not import this into client-side components unless lazy-loaded
export const client = createClient({
	projectId,
	dataset,
	useCdn: true,
	apiVersion: '2023-03-20',
	stega: {
		enabled: useStega,
		studioUrl,
	},
})
