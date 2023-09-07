export default function CustomParagraph({
	heading,
	HeadingSize = 'h2',
	children,
}: {
	heading?: string
	HeadingSize?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
	children: React.ReactNode
}) {
	return (
		<p className={`${heading ? 'flex flex-col gap-3' : ''} dark:text-white`}>
			{heading ? (
				<HeadingSize className="text-lg font-bold">{heading}</HeadingSize>
			) : null}
			{children}
		</p>
	)
}
