import { type IconName } from '../types/sprite-names'
import spriteHref from './sprite.svg'

export default function Icon({
	name,
	children,
	...props
}: JSX.IntrinsicElements['svg'] & { name: IconName }) {
	if (children) {
		return (
			<p className="flex gap-1 items-center">
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
