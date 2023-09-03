/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { json, type LoaderArgs, type V2_MetaFunction } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { formatDistanceToNow, subMonths } from 'date-fns'
import { prisma } from '~/utils/prisma-client.server'

export const meta: V2_MetaFunction = () => {
	return [
		{ title: 'New Remix App' },
		{ name: 'description', content: 'Welcome to Remix!' },
	]
}

export const loader = async ({ request }: LoaderArgs) => {
	const { searchParams } = new URL(request.url)
	const search = searchParams.get('s')

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
		where: {
			OR: [
				{
					title: {
						contains: search ?? '',
					},
				},
				{
					subtitle: {
						contains: search ?? '',
					},
				},
			],
		},
		take: 10,
	})

	const oneMonthAgo = subMonths(new Date(), 1).toISOString()

	// select a single image for each post; unlike postgres, sqlite doesn't support distinct on - sadge :c
	const featuredPosts = await prisma.$queryRawUnsafe(
		`SELECT p.id, p.title, c.name as categoryName, c.urlName as categoryUrlName, si.id as imageId, pi.altText as imageAltText
		FROM post p
		LEFT JOIN category c ON p.categoryid = c.id
		LEFT JOIN (
			SELECT MIN(pi.id) as id, pi.postid
			FROM postimage pi
			GROUP BY pi.postid
		) AS si ON si.postid = p.id
		LEFT JOIN postimage pi ON pi.id = si.id
		WHERE p.createdAt <= $1
		ORDER BY RANDOM()
		LIMIT 5;`,
		oneMonthAgo,
	)

	return json({ posts, featuredPosts, search } as {
		posts: typeof posts
		featuredPosts: Array<{
			id: string
			title: string
			categoryName: string
			categoryUrlName: string
			imageId: string
			imageAltText?: string
		}>
		search?: string
	})
}

export default function Index() {
	const { posts, featuredPosts, search } = useLoaderData<typeof loader>()
	console.log(search)

	if (search) {
		return <h1>SEARCH RESULTS FOR &quot;{search.toUpperCase()}&quot;</h1>
	}

	if (Array.isArray(posts) && posts?.length > 0) {
		return (
			<div className="w-4/6 mx-auto mt-[80px] flex gap-[25px]">
				<div className="w-[760px] flex-shrink-0">
					<Link to={`${posts[0].category.urlName}/${posts[0].id}`}>
						<div className="mb-[30px]">
							<img
								className="w-[100%] h-[425px] object-cover object-center"
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
					</Link>
					{posts.slice(1).map((post, index) => (
						<Link to={`${post.category.urlName}/${post.id}`} key={post.id}>
							<div
								// eslint-disable-next-line no-negated-condition
								className={`flex gap-[20px] ${index !== 0 ? 'mt-[20px]' : ''} ${
									// eslint-disable-next-line no-negated-condition
									index !== posts?.length - 1 ? 'mb-[20px]' : ''
								}`}
								key={post.id}
							>
								<img
									className="w-[250px] h-[141px]  object-cover object-center flex-shrink-0"
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
							{index === posts?.length - 2 || (
								<hr className="border-gray-400" />
							)}
						</Link>
					))}
				</div>
				<div className="flex-grow mt-[20px]">
					<h2 className="text-2xl font-bold leading-none">FEATURED STORIES</h2>
					<hr className="h-[3px] mb-[20px] mt-[15px] border-0 bg-gray-400" />
					<div className="flex flex-col gap-[15px]">
						{featuredPosts?.length > 0
							? featuredPosts.map((post, index) => (
									<Link
										to={`${post.categoryUrlName}/${post.id}`}
										className="flex gap-[20px]"
										key={post.id}
									>
										<img
											className="w-[214px] h-[120px] flex-shrink-0 object-cover object-center"
											src={`resources/image/${post.imageId}`}
											alt={post.imageAltText ?? ''}
										/>
										<div
											className={
												// eslint-disable-next-line no-negated-condition
												index !== featuredPosts?.length - 1
													? "featured-post relative after:content-[''] after:h-[1px] after:w-[100%] after:bg-gray-400 after:absolute"
													: 'featured-post'
											}
										>
											<span>{post.categoryName}</span>
											<h3 className="font-bold text-base">{post.title}</h3>
										</div>
									</Link>
							  ))
							: null}
					</div>
				</div>
			</div>
		)
	}
	return 'No posts found.'
}
