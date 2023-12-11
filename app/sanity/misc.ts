import { PortableText } from '@portabletext/react'

export function toPlainText(
	blocks: React.ComponentProps<typeof PortableText>['value'] | undefined = [],
): string {
	if (Array.isArray(blocks)) {
		return (
			blocks
				// loop through each block
				.map(block => {
					// if it's not a text block with children,
					// return nothing
					if (block._type !== 'block' || !block.children) {
						return ''
					}
					// loop through the children spans, and join the
					// text strings
					return block.children.map(child => child.text).join('')
				})
				// join the paragraphs leaving split by two linebreaks
				.join('\n\n')
		)
	}
	return blocks.children.map(child => child.text).join('')
}
