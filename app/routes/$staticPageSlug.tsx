// @ts-expect-error - fix before deploument
import { PortableText } from '@portabletext/react'
import { DataFunctionArgs, LinksFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { BlockContent } from '~/sanity/block-content'
import { useQuery } from '~/sanity/loader'
import { loadQuery } from '~/sanity/loader.server'
import { createStaticPageQueryBySlug } from '~/sanity/queries'
import blockStyles from '#app/styles/block.css'
import staticPageStyles from '#app/styles/block-static-page.css'

type StaticPage = {
	title: string
	body: React.ComponentProps<typeof PortableText>['value']
	slug: string
}

export const links: LinksFunction = () => {
	return [
		{ rel: 'stylesheet', href: blockStyles },
		{
			rel: 'stylesheet',
			href: staticPageStyles,
		},
	]
}

export async function loader({ params }: DataFunctionArgs) {
	const { staticPageSlug } = params
	const STATIC_PAGE_QUERY = createStaticPageQueryBySlug(staticPageSlug ?? '')
	const initial = await loadQuery<StaticPage>(STATIC_PAGE_QUERY)

	return json({ initial, query: STATIC_PAGE_QUERY, params: {} })
}

export default function StaticPageRoute() {
	const { initial, query, params } = useLoaderData<typeof loader>()
	const { data } = useQuery<typeof initial.data>(query, params, {
		initial,
	})

	return (
		<div className="mx-auto w-[1300px]" data-block="true" data-static="true">
			<h1 className="text-3xl font-bold">{data?.title}</h1>
			<BlockContent blocks={data?.body} />
		</div>
	)
}
