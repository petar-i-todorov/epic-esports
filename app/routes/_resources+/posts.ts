import { json, type DataFunctionArgs } from '@remix-run/node'
import { type Posts } from '#app/components/posts-block.tsx'
import { loadQuery } from '#app/sanity/loader.server.ts'
import { createPostsQueryByCursor } from '#app/sanity/queries.ts'

export const loader = async ({ request }: DataFunctionArgs) => {
	const { searchParams } = new URL(request.url)
	const offset = searchParams.get('offset')
	const authorSlug = searchParams.get('authorSlug')
	const categorySlug = searchParams.get('categorySlug')

	const POSTS_QUERY = createPostsQueryByCursor({
		cursor: offset ?? '',
		authorSlug: authorSlug ?? '',
		categorySlug: categorySlug ?? '',
	})
	const initialPosts = await loadQuery<Posts>(POSTS_QUERY)
	const posts = initialPosts.data

	if (posts.length) {
		return json({ posts })
	}
	return 'Not found...'
}
