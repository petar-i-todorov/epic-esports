import { json, type LoaderArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { formatDistanceToNow } from 'date-fns'
import { prisma } from '~/utils/prisma-client.server'

export async function loader({ params }: LoaderArgs) {
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
		where: {
			category: {
				urlName: params.category,
			},
		},
	})

	return json({ posts })
}

export default function CategoryRoute() {
	const { posts } = useLoaderData<typeof loader>()

	if (Array.isArray(posts) && posts.length > 0) {
		return (
			<div className="w-[70%] mx-auto mt-[100px]">
				<h1 className="my-4 font-bold">{posts[0].category.name}</h1>
				<h2 className="my-4">{posts[0].category.quote}</h2>
				<div className="p-10 pt-5 border border-gray-300">
					{posts.map((post, index) => {
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
									<div className="flex flex-col justify-between">
										<span className="font-bold">{post.category.name}</span>
										<h3 className="font-bold">{post.title}</h3>
										<h4>{post.subtitle}</h4>
										<span className="flex gap-3">
											<span>
												BY{' '}
												{post.authors.map(author => (
													<Link key={author.id} to={`authors/${author.id}`}>
														{author.name}
													</Link>
												))}
											</span>
											<span>
												{`${formatDistanceToNow(
													new Date(post.createdAt),
												).toUpperCase()} AGO`}
											</span>
										</span>
									</div>
								</div>
								{index === posts.length - 1 || <hr />}
							</>
						)
					})}
				</div>
			</div>
		)
	}
	return 'No posts found.'
}
