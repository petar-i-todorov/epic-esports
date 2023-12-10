import { json, type LoaderArgs } from '@remix-run/node'
import { Posts } from '~/components/posts-block'
import { loadQuery } from '~/sanity/loader.server'
import { createPostsQueryByCursor } from '~/sanity/queries'

export const loader = async ({ request }: LoaderArgs) => {
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
