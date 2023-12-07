import { useLocation, useNavigate } from '@remix-run/react'
// @ts-expect-error - module problem, to fix before deploying
import { type HistoryUpdate, enableOverlays } from '@sanity/overlays'
import { useEffect, useRef } from 'react'
import { useLiveMode } from '#app/sanity/loader'
import { client } from '#app/sanity/client'
import { studioUrl } from '#app/sanity/project-details'

export default function VisualEditing() {
	const navigateRemix = useNavigate()
	const navigateComposerRef = useRef<null | ((update: HistoryUpdate) => void)>(
		null,
	)

	useEffect(() => {
		// When displayed inside an iframe
		if (window.parent !== window.self) {
			const disable = enableOverlays({
				allowStudioOrigin: studioUrl,
				zIndex: 999999,
				history: {
					subscribe: navigate => {
						navigateComposerRef.current = navigate
						return () => {
							navigateComposerRef.current = null
						}
					},
					update: update => {
						if (update.type === 'push' || update.type === 'replace') {
							navigateRemix(update.url, { replace: update.type === 'replace' })
						} else {
							navigateRemix(-1)
						}
					},
				},
			})
			return () => disable()
		}
	}, [navigateRemix])

	const location = useLocation()
	useEffect(() => {
		if (navigateComposerRef.current) {
			navigateComposerRef.current({
				type: 'push',
				url: `${location.pathname}${location.search}${location.hash}`,
			})
		}
	}, [location.hash, location.pathname, location.search])

	// Enable live queries from the specified studio origin URL
	useLiveMode({ allowStudioOrigin: studioUrl, client })

	return null
}
