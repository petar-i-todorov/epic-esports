import { json, type LoaderArgs } from '@remix-run/node'
import { prisma } from '#app/utils/prisma-client.server'

export const loader = async ({ request }: LoaderArgs) => {
	const { searchParams } = new URL(request.url)
	const offset = searchParams.get('offset')

	const posts = await prisma.post.findMany({
		select: {
			id: true,
			title: true,
			subtitle: true,
			createdAt: true,
			authors: {
				select: {
					id: true,
					name: true,
				},
			},
			images: {
				select: {
					id: true,
					altText: true,
				},
			},
			category: {
				select: {
					name: true,
					urlName: true,
					quote: true,
				},
			},
		},
		orderBy: {
			createdAt: 'desc' as const,
		},
		take: 5,
		cursor: {
			id: offset ?? '',
		},
		skip: 1,
	})

	if (posts.length) {
		return json({ posts })
	}
	return 'Not found...'
}
