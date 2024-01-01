import clsx from 'clsx'
import { type FieldConfig, conform } from '@conform-to/react'
import JustifyBetween from '#app/components/ui/justify-between.tsx'
import Mandatory from '#app/components/ui/mandatory.tsx'
import Error from '#app/components/ui/error.tsx'

export default function Input({
	fieldConfig,
	label,
	headless,
	...props
}: JSX.IntrinsicElements['input'] & {
	fieldConfig: FieldConfig<string>
	label: string
	headless?: true
}) {
	if (headless) {
		return (
			<>
				{fieldConfig.error ? (
					<Error id={fieldConfig.errorId} error={fieldConfig.error} />
				) : null}
				<label htmlFor={fieldConfig.id} className="sr-only">
					{label}
				</label>
				<input {...props} {...conform.input(fieldConfig)} />
			</>
		)
	}
	return (
		<>
			<JustifyBetween>
				<label htmlFor={fieldConfig.id}>
					{label}
					<Mandatory />
				</label>
				{fieldConfig.error ? (
					<Error id={fieldConfig.errorId} error={fieldConfig.error} />
				) : null}
			</JustifyBetween>
			<input
				className={clsx(
					'h-[36px] self-stretch border-2 border-black p-2 text-black placeholder:text-gray-400',
					fieldConfig.error && 'border-red-500',
				)}
				{...props}
				{...conform.input(fieldConfig)}
			/>
		</>
	)
}
