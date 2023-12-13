import { type IconName } from '#app/types/sprite-names.ts'
import spriteHref from '#app/components/sprite.svg'

export default function Icon({
	name,
	children,
	...props
}: JSX.IntrinsicElements['svg'] & { name: IconName }) {
	if (children) {
		return (
			<p className="flex items-center gap-1">
				<Icon name={name} {...props} /> {children}
			</p>
		)
	} else {
		return (
			<svg {...props}>
				<use href={`${spriteHref}#${name}`} />
			</svg>
		)
	}
}
