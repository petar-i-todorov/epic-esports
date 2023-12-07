import { DataFunctionArgs, type V2_MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import PostsBlock, { Posts } from '#app/components/posts-block'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { createPostsQueryByCategory } from '~/sanity/queries'
import { loadQuery } from '~/sanity/loader.server'
import { useQuery } from '~/sanity/loader'

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
	const title = data
		? `${data.initial.data[0].category.name} | Epic Esports`
		: 'Epic Esports'
	const description = data?.initial.data[0].category.description

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
	const { category } = params
	const POSTS_QUERY = createPostsQueryByCategory(category ?? '')
	const initial = await loadQuery<Posts>(POSTS_QUERY)

	return { initial, query: POSTS_QUERY, params: {} }
}

export default function CategoryRoute() {
	const { initial, query, params } = useLoaderData<typeof loader>()
	const { data } = useQuery<typeof initial.data>(query, params, {
		initial,
	})

	if (data) {
		return <PostsBlock posts={data} />
	}
	return <div>No posts found</div>
}
