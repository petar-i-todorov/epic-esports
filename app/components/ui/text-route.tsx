import CustomHeading from './custom-heading'

export default function TextRoute({
	heading,
	children,
}: {
	heading: string
	children: React.ReactNode
}) {
	return (
		<div className="mx-auto w-4/6 dark:text-white">
			<CustomHeading className="py-10">{heading}</CustomHeading>
			<div className="flex flex-col gap-3">{children}</div>
		</div>
	)
}
