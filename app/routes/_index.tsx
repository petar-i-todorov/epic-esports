import { json, type V2_MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { formatDistanceToNow } from 'date-fns'
import { prisma } from '~/utils/prisma-client.server'

export const meta: V2_MetaFunction = () => {
	return [
		{ title: 'New Remix App' },
		{ name: 'description', content: 'Welcome to Remix!' },
	]
}

export const loader = async () => {
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
			createdAt: 'desc',
		},
		take: 10,
	})

	return json({ posts })
}

export default function Index() {
	const { posts } = useLoaderData<typeof loader>()

	if (Array.isArray(posts) && posts.length > 0) {
		return (
			<div className="w-4/6 mx-auto mt-[80px]">
				<div className="w-[760px]">
					<img
						className="w-[100%] h-[425px]"
						src={`resources/image/${posts[0].images[0].id}`}
						alt={posts[0].images[0].id}
					/>
					<div className="p-5 bg-black">
						<div className="mb-1 flex justify-between">
							<span className="text-yellow-300">{posts[0].category.name}</span>
							<span className="text-yellow-300">{`${formatDistanceToNow(
								new Date(posts[0].createdAt),
							).toUpperCase()} AGO`}</span>
						</div>
						<span className="text-3xl text-white">{posts[0].title}</span>
					</div>
				</div>
			</div>
		)
	}
	return 'No posts found.'
}
