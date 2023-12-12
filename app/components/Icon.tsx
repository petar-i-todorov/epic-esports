import { type IconName } from '../types/sprite-names.js'
import spriteHref from '../components/sprite.svg'

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
