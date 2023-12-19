import clsx from 'clsx'

export default function Error({
	error,
	className,
	...props
}: JSX.IntrinsicElements['p'] & { error: string | undefined }) {
	return (
		<p className={clsx('text-red-500', className)} role="alert" {...props}>
			{error}
		</p>
	)
}
