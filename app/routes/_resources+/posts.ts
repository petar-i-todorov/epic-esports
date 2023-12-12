import { json, type DataFunctionArgs } from '@remix-run/node'
import { Posts } from '../../components/posts-block.tsx'
import { loadQuery } from '../../sanity/loader.server.js'
import { createPostsQueryByCursor } from '../../sanity/queries.js'

export const loader = async ({ request }: DataFunctionArgs) => {
	const { searchParams } = new URL(request.url)
	const offset = searchParams.get('offset')
	const authorSlug = searchParams.get('authorSlug')
	const categorySlug = searchParams.get('categorySlug')
	console.log(offset)
	console.log(categorySlug)

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
