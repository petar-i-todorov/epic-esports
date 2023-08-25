import { type IconName } from '../types/sprite-names'
import spriteHref from './sprite.svg'

export default function Icon({
	name,
	...props
}: JSX.IntrinsicElements['svg'] & { name: IconName }) {
	return (
		<svg {...props}>
			<use href={`${spriteHref}#${name}`} />
		</svg>
	)
}
