import { json, type LoaderArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { prisma } from '~/utils/prisma-client.server'

export async function loader({ params }: LoaderArgs) {
	const posts = await prisma.post.findMany({
		where: {
			category: {
				name: params.name,
			},
		},
	})

	return json({ posts })
}

export default function CategoryRoute() {
	const { posts } = useLoaderData<typeof loader>()

	if (Array.isArray(posts)) {
		return posts.map(post => post.title)
	}
	return 'No posts found.'
}
