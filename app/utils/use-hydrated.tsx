import * as React from 'react'

export default () => {
	const [isHydrated, setIsHydrated] = React.useState(false)

	React.useEffect(() => {
		setIsHydrated(true)
	}, [])

	return isHydrated
}
