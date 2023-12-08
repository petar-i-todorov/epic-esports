import BaseBlockContent from '@sanity/block-content-to-react'
import React from 'react'
import imageUrlBuilder from '@sanity/image-url'
import * as clientConfig from './project-details'

// Set up the builder
const builder = imageUrlBuilder(clientConfig)

// Function to return the image URL
function urlFor(source: string) {
	return builder.image(source)
}

type Props = {
	node: {
		image: string
		caption: string
		alt: string
	}
}

const serializers = {
	types: {
		captionedImage: (props: Props) => (
			<figure>
				<img src={urlFor(props.node.image).url()} alt={props.node.alt || ''} />
				<figcaption>{props.node.caption}</figcaption>
			</figure>
		),
	},
}

export const BlockContent = ({
	blocks,
}: {
	blocks: React.ComponentProps<typeof BaseBlockContent>['blocks']
}) => (
	<BaseBlockContent
		blocks={blocks}
		serializers={serializers}
		{...clientConfig}
	/>
)
