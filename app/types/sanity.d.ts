declare module '@sanity/block-content-to-react' {
	import { type ImageUrlBuilderOptionsWithAliases } from '@sanity/image-url/lib/types/types'
	import { type ElementType, type ReactElement } from 'react'

	namespace BlockContent {
		interface PortableTextEntry {
			[key: string]: unknown
			_type?: string
			_key?: string
		}

		interface PortableTextProps {
			blocks?: PortableTextEntry[]
			className?: string
			renderContainerOnSingleChild?: boolean
			serializers?: PortableTextSerializers
			imageOptions?: ImageUrlBuilderOptionsWithAliases

			projectId?: string
			dataset?: string
		}

		interface PortableTextSerializers {
			types?: Record<string, string | ElementType>
			marks?: Record<string, string | ElementType>
			list?: string | ElementType
			listItem?: string | ElementType
			hardBreak?: string | ElementType
			container?: string | ElementType
			markFallback?: string | ElementType
			text?: string | ElementType
		}
	}

	function BlockContent(props: BlockContent.PortableTextProps): ReactElement
	export = BlockContent
}
