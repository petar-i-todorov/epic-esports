import { DataFunctionArgs, type V2_MetaFunction } from '@remix-run/node'
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
	const { categorySlug } = params
	console.log(categorySlug)
	const POSTS_QUERY = createPostsQueryByCategorySlug(categorySlug ?? '')
	const initial = await loadQuery<Posts>(POSTS_QUERY)
	console.log(initial.data)

	return { initial, query: POSTS_QUERY, params: {} }
}

export default function CategoryRoute() {
	const { initial, query, params } = useLoaderData<typeof loader>()
	console.log(initial)
	const { data } = useQuery<typeof initial.data>(query, params, {
		initial,
	})
	console.log(data.length)

	if (data) {
		return <PostsBlock posts={data} />
	}
	return <div>No posts found</div>
}
