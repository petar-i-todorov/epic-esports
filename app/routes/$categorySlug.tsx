import React from 'react'
import { DataFunctionArgs, type V2_MetaFunction } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import PostsBlock, { Posts } from '#app/components/posts-block'
import { GeneralErrorBoundary } from '#app/components/error-boundary'
import { createPostsQueryByCategorySlug } from '#app/sanity/queries'
import { loadQuery } from '#app/sanity/loader.server'

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
	const categoryTitle = data?.initial.data[0]?.category.name ?? 'Not Found'
	const title = data ? `${categoryTitle} | Epic Esports` : 'Epic Esports'
	const description = data?.initial.data[0]?.category.description ?? 'Not Found'

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
	const { initial: initialPosts } = useLoaderData<typeof loader>()

	const [posts, setPosts] = React.useState(initialPosts.data)
	const fetcher = useFetcher<{
		posts: Posts
	}>()

	React.useEffect(() => {
		const fetcherData = fetcher.data
		if (fetcherData) {
			setPosts(prev => [...prev, ...fetcherData.posts])
		}
	}, [fetcher.data])

	if (Array.isArray(posts) && posts.length > 0) {
		return (
			<div className="mx-auto flex w-[1320px] flex-col pt-[50px] transition-colors dark:text-white 2xl:w-[1110px] xl:w-[930px] md:w-[690px] sm:w-[550px] xs:w-full xs:px-[10px]">
				<h1 className="my-4 font-bold">{posts[0].category.name}</h1>
				<h2 className="my-4 delay-200 duration-300">
					{posts[0].category.description}
				</h2>
				<PostsBlock posts={posts} />
				{posts[0].category.postsCount <= posts.length ? null : (
					<button
						className={`my-10 self-center bg-yellow-400 px-2 py-3 font-bold ${
							fetcher.state !== 'idle' && 'opacity-50'
						} dark:text-black`}
						onClick={() => {
							const url = `/posts?offset=${
								posts[posts.length - 1].createdAt
							}&categorySlug=${posts[0].category.slug}`

							fetcher.load(url)
						}}
						disabled={fetcher.state !== 'idle'}
					>
						{fetcher.state === 'idle' ? 'LOAD MORE' : 'LOADING MORE...'}
					</button>
				)}
			</div>
		)
	}
	throw new Error('No posts found')
}
