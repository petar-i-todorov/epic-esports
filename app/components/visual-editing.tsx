import { useLocation, useNavigate } from '@remix-run/react'
import { type HistoryUpdate, enableOverlays } from '@sanity/overlays'
import { useEffect, useRef } from 'react'
import { useLiveMode } from '../sanity/loader.js'
import { client } from '../sanity/client.js'
import { studioUrl } from '../sanity/project-details.js'

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
