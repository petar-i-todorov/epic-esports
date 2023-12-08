import { json, type LoaderArgs } from '@remix-run/node'
import { Posts } from '~/components/posts-block'
import { loadQuery } from '~/sanity/loader.server'
import { createPostsQueryByCursorId } from '~/sanity/queries'

export const loader = async ({ request }: LoaderArgs) => {
	const { searchParams } = new URL(request.url)
	const offset = searchParams.get('offset')

	const POSTS_QUERY = createPostsQueryByCursorId(offset ?? '')
	const initialPosts = await loadQuery<Posts>(POSTS_QUERY)
	const posts = initialPosts.data

	if (posts.length) {
		return json({ posts })
	}
	return 'Not found...'
}
