import BaseBlockContent from '@sanity/block-content-to-react'
import imageUrlBuilder from '@sanity/image-url'
import * as clientConfig from '#app/sanity/project-details.ts'

// Set up the builder
const builder = imageUrlBuilder(clientConfig)

// Function to return the image URL
function urlFor(source: string) {
	return builder.image(source)
}

type CaptionedImageProps = {
	node: {
		image: string
		caption: string
		alt: string
	}
}

type Row = {
	cells: string[]
}

type TableProps = {
	node: {
		rows: Array<Row>
	}
}

const serializers = {
	types: {
		captionedImage: (props: CaptionedImageProps) => (
			<figure>
				<img src={urlFor(props.node.image).url()} alt={props.node.alt || ''} />
				<figcaption>{props.node.caption}</figcaption>
			</figure>
		),
		table: (props: TableProps) => {
			const theadCells = props.node.rows[0].cells
			const tbodyRows = props.node.rows.slice(1)
			return (
				<table>
					<thead>
						<tr>
							{theadCells.map((cell, i) => (
								<th key={i}>{cell}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{tbodyRows.map((row, i) => (
							<tr key={i}>
								{row.cells.map((cell, i) => (
									<td key={i}>{cell}</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			)
		},
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
