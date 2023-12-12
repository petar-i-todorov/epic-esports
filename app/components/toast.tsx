import React from 'react'
import { useRouteLoaderData } from '@remix-run/react'
import { Toaster, toast as showToast } from 'sonner'
import { loader as rootLoader } from '../root.js'

export default function EpicToaster() {
	const rootData = useRouteLoaderData<typeof rootLoader>('root')

	React.useEffect(() => {
		if (rootData?.toast) {
			showToast[rootData.toast.type](rootData.toast.title, {
				description: rootData.toast.description,
			})
		}
	}, [rootData?.toast])

	return <Toaster position="top-center" />
}
