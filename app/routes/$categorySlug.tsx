import { DataFunctionArgs, json, type V2_MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import PostsBlock, { Posts } from '#app/components/posts-block'
import { GeneralErrorBoundary } from '#app/components/error-boundary'
import { createPostsQueryByCategorySlug } from '#app/sanity/queries'
import { loadQuery } from '#app/sanity/loader.server'
import { useQuery } from '#app/sanity/loader'

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
	const categoryTitle = data?.initial.data[0]?.category?.name ?? 'Not Found'
	const title = data ? `${categoryTitle} | Epic Esports` : 'Epic Esports'
	const description =
		data?.initial.data[0]?.category?.description ?? 'Not Found'

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

export const loader = async ({ params }: DataFunctionArgs) => {
	const { categorySlug } = params
	const POSTS_QUERY = createPostsQueryByCategorySlug(categorySlug ?? '')
	const initial = await loadQuery<Posts>(POSTS_QUERY)

	return { initial, query: POSTS_QUERY, params: {} }
}

export default function CategoryRoute() {
	const { initial, query, params } = useLoaderData<typeof loader>()
	const { data } = useQuery<Posts>(query, params, {
		initial,
	})

	if (data && data.length > 0) {
		return <PostsBlock posts={data} />
	}
	throw new Error('No posts found')
}
