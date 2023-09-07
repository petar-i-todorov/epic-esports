/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import React from 'react'
import { json, type LoaderArgs, type V2_MetaFunction } from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import { formatDistanceToNow, subMonths } from 'date-fns'
import PostsBlock from '~/components/posts-block'
import CustomLink from '~/components/ui/custom-link'
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

	const selectQuery = {
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
			reactions: true,
		},
	}

	const mainPostsResult = {
		posts: await prisma.post.findMany({
			...selectQuery,
			orderBy: {
				createdAt: 'desc' as const,
			},
			take: 5,
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
		}),
		postsCount: await prisma.post.count(),
		notFound: false,
	}

	if (mainPostsResult.posts.length === 0) {
		mainPostsResult.posts = await prisma.post.findMany({
			...selectQuery,
			orderBy: {
				createdAt: 'desc' as const,
			},
			take: 5,
		})

		mainPostsResult.notFound = true
	}

	const oneMonthAgo = subMonths(new Date(), 1).toISOString()

	const featuredPosts = search
		? []
		: await prisma.post.findMany({
				...selectQuery,
				take: 5,
				orderBy: {
					reactions: {
						_count: 'desc' as const,
					},
				},
				where: {
					OR: [
						{
							createdAt: {
								gte: oneMonthAgo,
							},
						},
						{
							updatedAt: {
								gte: oneMonthAgo,
							},
						},
					],
				},
		  })

	return json({ mainPostsResult, featuredPosts, search })
}

export default function Index() {
	const { mainPostsResult, featuredPosts, search } =
		useLoaderData<typeof loader>()

	const {
		posts: initialPosts,
		notFound,
		postsCount: postsCountInDb,
	} = mainPostsResult

	const [posts, setPosts] = React.useState(initialPosts)

	const fetcher = useFetcher()

	React.useEffect(() => {
		if (fetcher.data) {
			setPosts(prev => [...prev, ...fetcher.data.posts])
		}
	}, [fetcher.data])

	const classNamesThemeToggleDelay = 'delay-500 duration-700'

	return (
		<div
			className={`w-4/6 mx-auto pt-[80px] ${search ? '' : 'flex gap-[25px]'}`}
		>
			{search ? (
				<div className="flex flex-col gap-[20px] dark:text-white">
					<h1 className="text-2xl font-bold text-gray-500">
						SEARCH RESULTS FOR{' '}
						<span className="text-black dark:text-white">
							&quot;{search.toUpperCase()}&quot;
						</span>
					</h1>
					{posts.length ? (
						<>
							{notFound ? (
								<>
									<span>No results were found.</span>
									<span className="text-2xl font-bold">LATEST</span>
								</>
							) : null}
							<PostsBlock posts={posts} />
						</>
					) : (
						'No posts found.'
					)}
				</div>
			) : posts.length ? (
				<>
					<div className="w-[760px] flex-shrink-0 flex flex-col dark:text-white">
						<div className="mb-[30px]">
							<Link to={`${posts[0].category.urlName}/${posts[0].id}`}>
								<img
									className="w-[100%] h-[425px] object-cover object-center"
									src={`resources/image/${posts[0].images[0].id}`}
									alt={posts[0].images[0].id}
								/>
							</Link>
							<div className="p-5 bg-black">
								<div className="mb-1 flex justify-between">
									<Link
										className="text-yellow-300 hover:underline hover:brightness-75"
										to={`/${posts[0].category.urlName}`}
									>
										{posts[0].category.name}
									</Link>
									<span className="text-yellow-300">{`${formatDistanceToNow(
										new Date(posts[0].createdAt),
									).toUpperCase()} AGO`}</span>
								</div>
								<Link to={`${posts[0].category.urlName}/${posts[0].id}`}>
									<h2 className="text-3xl text-white">{posts[0].title}</h2>
								</Link>
							</div>
						</div>
						{posts.slice(1, posts.length + 1).map((post, index) => {
							return (
								<div key={post.id}>
									<div
										className={`flex gap-[20px] ${
											// eslint-disable-next-line no-negated-condition
											index !== 0 ? 'mt-[20px]' : ''
										} ${
											// eslint-disable-next-line no-negated-condition
											index !== posts?.length - 1 ? 'mb-[20px]' : ''
										}`}
									>
										<Link
											className="w-[250px] h-[141px] flex-shrink-0"
											to={`${post.category.urlName}/${post.id}`}
										>
											<img
												className="w-[100%] h-[100%] object-cover object-center "
												src={`resources/image/${post.images[0].id}`}
												alt={post.images[0].altText ?? ''}
											/>
										</Link>
										<div className="w-[100%] flex flex-col gap-[10px]">
											<span className="flex justify-between">
												<CustomLink to={`/${post.category.urlName}`}>
													{post.category.name}
												</CustomLink>
												<span>{`${formatDistanceToNow(
													new Date(posts[0].createdAt),
												).toUpperCase()} AGO`}</span>
											</span>
											<Link to={`${post.category.urlName}/${post.id}`}>
												<h2 className="font-bold text-lg">{post.title}</h2>
											</Link>
											<h3 className={classNamesThemeToggleDelay}>
												{post.subtitle}
											</h3>
										</div>
									</div>
									{index >= postsCountInDb - 2 ? null : (
										<hr className="border-gray-400" />
									)}
								</div>
							)
						})}
						{postsCountInDb <= posts.length ? null : (
							<button
								className={`px-2 py-3 my-10 self-center bg-yellow-400 font-bold ${
									fetcher.state !== 'idle' && 'opacity-50'
								} dark:text-black`}
								onClick={() => {
									const url = `/posts?offset=${posts[posts.length - 1].id}`

									fetcher.load(url)
								}}
								disabled={fetcher.state !== 'idle'}
							>
								{fetcher.state === 'idle' ? 'LOAD MORE' : 'LOADING MORE...'}
							</button>
						)}
					</div>
					<div className="flex-grow mt-[20px] dark:text-white">
						<h2
							className={`text-2xl font-bold leading-none ${classNamesThemeToggleDelay}`}
						>
							FEATURED STORIES
						</h2>
						<hr className="h-[3px] mb-[20px] mt-[15px] border-0 bg-gray-400" />
						<div className="flex flex-col gap-[15px]">
							{featuredPosts?.length > 0
								? featuredPosts.map((post, index) => (
										<div className="flex gap-[20px]" key={post.images[0].id}>
											<Link
												className="w-[214px] h-[120px] flex-shrink-0 "
												to={`${post.category.urlName}/${post.id}`}
											>
												<img
													className="w-[100%] h-[100%] object-cover object-center"
													src={`resources/image/${post.images[0].id}`}
													alt={post.images[0].altText ?? ''}
												/>
											</Link>
											<div
												className={
													// eslint-disable-next-line no-negated-condition
													index !== featuredPosts?.length - 1
														? "featured-post relative after:content-[''] after:h-[1px] after:w-[100%] after:bg-gray-400 after:absolute"
														: 'featured-post'
												}
											>
												<CustomLink to={`/${post.category.urlName}`}>
													{post.category.name}
												</CustomLink>
												<Link
													className="w-[214px] h-[120px] flex-shrink-0 "
													to={`${post.category.urlName}/${post.id}`}
												>
													<h3 className="font-bold text-base dark:text-white">
														{post.title}
													</h3>
												</Link>
											</div>
										</div>
								  ))
								: null}
						</div>
					</div>
				</>
			) : (
				'No posts found.'
			)}
		</div>
	)
}
