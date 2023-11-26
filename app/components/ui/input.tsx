import { FieldConfig, conform } from '@conform-to/react'
import JustifyBetween from '#app/components/ui/justify-between'
import Mandatory from '#app/components/ui/mandatory'
import Error from '#app/components/ui/error'

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
				className={`h-[36px] p-2 self-stretch border-2 border-black text-black placeholder:text-gray-400 ${
					fieldConfig.error ? 'border-red-500' : ''
				}`}
				{...props}
				{...conform.input(fieldConfig)}
			/>
		</>
	)
}
