declare global {
	interface Window {
		ENV: {
			SANITY_STUDIO_PROJECT_ID: string
			SANITY_STUDIO_DATASET: string
			SANITY_STUDIO_URL: string
			SANITY_STUDIO_USE_STEGA: string
		}
	}
}

const projectDetails = {
	projectId: '',
	dataset: '',
	studioUrl: '',
	useStega: false,
}

if (typeof document === 'undefined') {
	if (!process.env.SANITY_STUDIO_PROJECT_ID) {
		throw new Error('Missing SANITY_STUDIO_PROJECT_ID in .env')
	}
	if (!process.env.SANITY_STUDIO_DATASET) {
		throw new Error('Missing SANITY_STUDIO_DATASET in .env')
	}
	if (!process.env.SANITY_STUDIO_URL) {
		throw new Error('Missing SANITY_STUDIO_URL in .env')
	}
	if (!process.env.SANITY_STUDIO_USE_STEGA) {
		throw new Error('Missing SANITY_STUDIO_USE_STEGA in .env')
	}

	projectDetails.projectId = process.env.SANITY_STUDIO_PROJECT_ID
	projectDetails.dataset = process.env.SANITY_STUDIO_DATASET
	projectDetails.studioUrl = process.env.SANITY_STUDIO_URL
} else {
	projectDetails.projectId = window.ENV.SANITY_STUDIO_PROJECT_ID
	projectDetails.dataset = window.ENV.SANITY_STUDIO_DATASET
	projectDetails.studioUrl = window.ENV.SANITY_STUDIO_URL
}

export const { projectId, dataset, studioUrl, useStega } = projectDetails
