import type BaseBlockContent from '@sanity/block-content-to-react'
import { type DataFunctionArgs, type MetaFunction, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { BlockContent } from '#app/sanity/block-content.tsx'
import { loadQuery } from '#app/sanity/loader.server.ts'
import { createStaticPageQueryBySlug } from '#app/sanity/queries.ts'
import '#app/styles/block.css'
import '#app/styles/block-static-page.css'
import { toPlainText } from '#app/sanity/misc.ts'
import { invariantResponse } from '#app/utils/misc.server.ts'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}

type StaticPage = {
	title: string
	body: React.ComponentProps<typeof BaseBlockContent>['blocks']
	slug: string
	updatedAt: string
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const title = `${data?.staticPage.title ?? 'Not Found'} | Epic Esports`
	const body = data?.staticPage.body ?? []
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
	]
}

export async function loader({ params }: DataFunctionArgs) {
	const { staticPageSlug } = params
	invariantResponse(
		typeof staticPageSlug === 'string',
		'Static page slug is not defined',
	)
	const STATIC_PAGE_QUERY = createStaticPageQueryBySlug(staticPageSlug)
	const { data: staticPage } = await loadQuery<StaticPage>(STATIC_PAGE_QUERY)

	return json({ staticPage })
}

export default function StaticPageRoute() {
	const { staticPage } = useLoaderData<typeof loader>()

	return (
		<div
			className="mx-auto mt-[30px] flex w-[1290px] flex-col gap-7 2xl:w-[1140px] xl:w-[960px] md:w-[720px] sm:w-[540px] xs:w-full xs:px-[10px]"
			data-block="true"
			data-static="true"
		>
			<h1 className="text-3xl font-extrabold md:text-xl">
				{staticPage.title.toUpperCase()}
			</h1>
			<BlockContent blocks={staticPage.body} />
			<p>
				Last Updated:{' '}
				{new Date(staticPage.updatedAt ?? '').toLocaleDateString('en-US', {
					month: 'long',
					year: 'numeric',
				})}
			</p>
		</div>
	)
}
