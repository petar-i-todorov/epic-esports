import { json, type V2_MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { formatDistanceToNow, subMonths } from 'date-fns'
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

	const oneMonthAgo = subMonths(new Date(), 1).toISOString()

	const featuredPosts = await prisma.$queryRawUnsafe(
		"select * from post where createdAt <= '$1';",
		oneMonthAgo,
	)

	return json({ posts, featuredPosts })
}

export default function Index() {
	const { posts, featuredPosts } = useLoaderData<typeof loader>()

	console.log(featuredPosts)

	if (Array.isArray(posts) && posts.length > 0) {
		return (
			<div className="w-4/6 mx-auto mt-[80px] flex gap-[25px]">
				<div className="w-[760px]">
					<div className="mb-[30px]">
						<img
							className="w-[100%] h-[425px]"
							src={`resources/image/${posts[0].images[0].id}`}
							alt={posts[0].images[0].id}
						/>
						<div className="p-5 bg-black">
							<div className="mb-1 flex justify-between">
								<span className="text-yellow-300">
									{posts[0].category.name}
								</span>
								<span className="text-yellow-300">{`${formatDistanceToNow(
									new Date(posts[0].createdAt),
								).toUpperCase()} AGO`}</span>
							</div>
							<span className="text-3xl text-white">{posts[0].title}</span>
						</div>
					</div>
					{posts.slice(1).map((post, index) => (
						<>
							<div
								// eslint-disable-next-line no-negated-condition
								className={`flex gap-[20px] ${index !== 0 ? 'mt-[20px]' : ''} ${
									// eslint-disable-next-line no-negated-condition
									index !== posts.length - 1 ? 'mb-[20px]' : ''
								}`}
								key={post.id}
							>
								<img
									className="w-[250px] h-[141px]"
									src={`resources/image/${post.images[0].id}`}
									alt={post.images[0].altText ?? ''}
								/>
								<div className="w-[100%] flex flex-col gap-[10px]">
									<span className="flex justify-between">
										<span>{post.category.name}</span>
										<span>{`${formatDistanceToNow(
											new Date(posts[0].createdAt),
										).toUpperCase()} AGO`}</span>
									</span>
									<h2 className="font-bold text-lg">{post.title}</h2>
									<h3>{post.subtitle}</h3>
								</div>
							</div>
							{index === posts.length - 2 || <hr />}
						</>
					))}
				</div>
				<div className="flex-grow">
					FEATURED STORIES
					<hr className="my-[20px]" />
				</div>
			</div>
		)
	}
	return 'No posts found.'
}
