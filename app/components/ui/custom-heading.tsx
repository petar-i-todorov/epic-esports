export default function CustomHeading({
	className,
	children,
}: {
	className: string
	children: React.ReactNode
}) {
	return <h1 className={`text-2xl font-bold ${className}`}>{children}</h1>
}
