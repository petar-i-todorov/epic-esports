import { json, type LoaderArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { prisma } from '~/utils/prisma-client.server'

export async function loader({ params }: LoaderArgs) {
	console.time('prisma')
	const posts = await prisma.post.findMany({
		select: {
			id: true,
			title: true,
			content: true,
			authors: {
				select: {
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
					quote: true,
				},
			},
		},
		where: {
			category: {
				name: params.category?.toUpperCase(),
			},
		},
	})
	console.timeEnd('prisma')

	return json({ posts })
}

export default function CategoryRoute() {
	console.time('component')
	const { posts } = useLoaderData<typeof loader>()
	console.timeEnd('component')

	if (Array.isArray(posts) && posts.length > 0) {
		return (
			<div>
				<h1>{posts[0].category.name}</h1>
				<h2>{posts[0].category.quote}</h2>
				{posts.map(post => {
					return (
						<div key={post.id}>
							<h1>{post.title}</h1>
							<p>{post.content}</p>
							<p>
								Written by {post.authors.map(author => author.name).join(', ')}
							</p>
							{post.images.map(image => {
								return (
									<img
										className="h-[220px] w-[410px] object-cover object-center"
										key={image.id}
										src={`/resources/image/${image.id}`}
										alt={image.altText ?? ''}
										loading="lazy"
									/>
								)
							})}
						</div>
					)
				})}
			</div>
		)
	}
	return 'No posts found.'
}
