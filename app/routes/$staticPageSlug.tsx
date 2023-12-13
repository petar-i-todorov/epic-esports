import { PortableText } from '@portabletext/react'
import {
	DataFunctionArgs,
	LinksFunction,
	MetaFunction,
	json,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { BlockContent } from '#app/sanity/block-content.tsx'
import { useQuery } from '#app/sanity/loader.ts'
import { loadQuery } from '#app/sanity/loader.server.ts'
import { createStaticPageQueryBySlug } from '#app/sanity/queries.ts'
import blockStyles from '#app/styles/block.css'
import staticPageStyles from '#app/styles/block-static-page.css'
import { toPlainText } from '#app/sanity/misc.ts'
import appLogo from '#app/assets/favicon.svg'
import { invariantResponse } from '#app/utils/misc.server.ts'

type StaticPage = {
	title: string
	body: React.ComponentProps<typeof PortableText>['value']
	slug: string
	updatedAt: string
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const title = `${data?.initial.data.title ?? 'Not Found'} | Epic Esports`
	const body = data?.initial.data.body ?? []
	const description = toPlainText(body).slice(0, 160)

	return [
		{
			title,
		},
		{
			name: 'description',
			content: description,
		},
		{
			name: 'og:title',
			content: title,
		},
		{
			name: 'og:description',
			content: description,
		},
		{
			name: 'twitter:title',
			content: title,
		},
		{
			name: 'twitter:description',
			content: description,
		},
		{
			name: 'twitter:image',
			content: appLogo,
		},
		{
			name: 'og:image:alt',
			content: 'Epic Esports logo',
		},
		{
			name: 'og:image',
			content: appLogo,
		},
		{
			name: 'og:image:alt',
			content: 'Epic Esports logo',
		},
	]
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
	invariantResponse(
		typeof staticPageSlug === 'string',
		'Static page slug is not defined',
	)
	const STATIC_PAGE_QUERY = createStaticPageQueryBySlug(staticPageSlug)
	const initial = await loadQuery<StaticPage>(STATIC_PAGE_QUERY)

	return json({ initial, query: STATIC_PAGE_QUERY, params: {} })
}

export default function StaticPageRoute() {
	const { initial, query, params } = useLoaderData<typeof loader>()
	const { data } = useQuery<typeof initial.data>(query, params, {
		// SerializeObject<UndefinedToOptional<QueryResponseInitial<StaticPage>>>
		initial,
	})

	return (
		<div
			className="mx-auto flex w-[1290px] flex-col gap-7 2xl:w-[1140px] xl:w-[960px] md:w-[720px] sm:w-[540px] xs:w-full xs:px-[10px]"
			data-block="true"
			data-static="true"
		>
			<h1 className="text-3xl font-extrabold md:text-xl">
				{data?.title.toUpperCase()}
			</h1>
			<BlockContent blocks={data?.body} />
			<p>
				Last Updated:{' '}
				{new Date(data?.updatedAt ?? '').toLocaleDateString('en-US', {
					month: 'long',
					year: 'numeric',
				})}
			</p>
		</div>
	)
}
