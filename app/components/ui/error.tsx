export default function Error({
	error,
	className,
	...props
}: JSX.IntrinsicElements['p'] & { error: string }) {
	return (
		<p className={`text-red-500 ${className}`} {...props}>
			{error}
		</p>
	)
}
