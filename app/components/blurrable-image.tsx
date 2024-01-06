import clsx from 'clsx'
import React from 'react'

export const BlurrableImage = ({
	dataUrl,
	src,
	...props
}: JSX.IntrinsicElements['img'] & {
	src: string
	alt: string
	dataUrl: string
}) => {
	const [isLoaded, setIsLoaded] = React.useState(false)
	const imageRef = React.useRef<HTMLImageElement>(null)

	React.useEffect(() => {
		if (imageRef.current?.complete) {
			setIsLoaded(true)
		}
	}, [])

	return (
		<>
			{/* it gets the alt from the props */}
			{/* eslint-disable-next-line jsx-a11y/alt-text */}
			<img
				{...props}
				src={src}
				onLoad={() => setIsLoaded(true)}
				className={clsx(
					{
						hidden: !isLoaded,
					},
					props.className,
				)}
				ref={imageRef}
			/>
			{/* it gets the alt from the props */}
			{/* eslint-disable-next-line jsx-a11y/alt-text */}
			<img
				{...props}
				src={`data:image/webp;base64,${dataUrl}`}
				className={clsx(
					{
						hidden: isLoaded,
					},
					props.className,
				)}
			/>
		</>
	)
}
