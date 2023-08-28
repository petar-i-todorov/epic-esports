import { json, type LoaderArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { prisma } from '~/utils/prisma-client.server'

export async function loader({ params }: LoaderArgs) {
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

	return json({ posts })
}

export default function CategoryRoute() {
	const { posts } = useLoaderData<typeof loader>()

	if (Array.isArray(posts) && posts.length > 0) {
		return (
			<div className="w-[80%] mx-auto">
				<h1 className="font-bold my-4">{posts[0].category.name}</h1>
				<h2 className="my-4">{posts[0].category.quote}</h2>
				<div className="p-10 pt-5 border border-gray-300">
					{posts.map((post, id) => {
						return (
							<>
								<div className="flex gap-5 my-5" key={post.id}>
									<img
										className="h-[220px] w-[410px] object-cover object-center"
										key={post.images[0].id}
										src={`/resources/image/${post.images[0].id}`}
										alt={post.images[0].altText ?? ''}
										loading="lazy"
									/>
									<div>
										<h1>{post.title}</h1>
										<p>{post.content}</p>
										<p>
											Written by{' '}
											{post.authors.map(author => author.name).join(', ')}
										</p>
									</div>
								</div>
								{id === posts.length || <hr />}
							</>
						)
					})}
				</div>
			</div>
		)
	}
	return 'No posts found.'
}
