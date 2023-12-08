/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import React from 'react'
import { json, type LoaderArgs } from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import { formatDistanceToNow } from 'date-fns'
import PostsBlock, { Posts } from '#app/components/posts-block'
import CustomLink from '#app/components/ui/custom-link'
import {
	POSTS_LIMIT5_QUERY,
	POSTS_COUNT_QUERY,
	createPostsQueryByIds,
	createPostsQueryByQuery,
} from '~/sanity/queries'
import { loadQuery } from '~/sanity/loader.server'
import { prisma } from '~/utils/prisma-client.server'

export const loader = async ({ request }: LoaderArgs) => {
	const { searchParams } = new URL(request.url)
	const search = searchParams.get('s')

	const initialPosts = await loadQuery<Posts>(POSTS_LIMIT5_QUERY)
	const initialPostsCount = await loadQuery<number>(POSTS_COUNT_QUERY)

	const mainPostsResult = {
		posts: initialPosts.data,
		postsCount: initialPostsCount.data,
	}

	const mostReactedPosts = await prisma.post.findMany({
		select: {
			id: true,
		},
		orderBy: {
			reactions: {
				_count: 'desc',
			},
		},
		take: 5,
	})

	const ids = mostReactedPosts.map(post => post.id)
	const FEATURED_POSTS_QUERY = createPostsQueryByIds(ids)
	const initialFeaturedPosts = await loadQuery<Posts>(FEATURED_POSTS_QUERY)

	const featuredPosts = search ? [] : initialFeaturedPosts.data

	const POSTS_BY_QUERY_QUERY = createPostsQueryByQuery(search ?? '')
	const { data } = search
		? await loadQuery<Posts>(POSTS_BY_QUERY_QUERY)
		: { data: [] }

	return json({ mainPostsResult, featuredPosts, search, postsByQuery: data })
}

export default function Index() {
	const { mainPostsResult, featuredPosts, search, postsByQuery } =
		useLoaderData<typeof loader>()
	const { posts: initialPosts, postsCount: postsCountInDb } = mainPostsResult

	const [posts, setPosts] = React.useState(initialPosts)
	const fetcher = useFetcher()

	React.useEffect(() => {
		if (fetcher.data) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			setPosts(prev => [...prev, ...fetcher.data.posts])
		}
	}, [fetcher.data])

	const classNamesThemeToggleDelay = 'delay-500 duration-700'

	return (
		<div
			className={`w-[1320px] 2xl:w-[1120px] xl:w-[960px] mx-auto pt-[80px] ${
				search ? '' : 'flex gap-[25px] items-start lg:justify-center'
			}`}
		>
			{search ? (
				<div className="flex flex-col gap-[20px] dark:text-white">
					<h1 className="text-2xl font-bold text-gray-500">
						SEARCH RESULTS FOR{' '}
						<span className="text-black dark:text-white">
							&quot;{search.toUpperCase()}&quot;
						</span>
					</h1>
					<PostsBlock posts={postsByQuery} />
				</div>
			) : posts.length ? (
				<>
					<div className="w-[760px] 2xl:w-[637px] xl:w-[532px] lg:w-[690px] flex-shrink-0 flex flex-col dark:text-white">
						<div className="mb-[30px]">
							<Link to={`${posts[0].category.slug}/${posts[0].slug}`}>
								<img
									className="w-full h-[425px] object-cover object-center"
									src={posts[0].banner.url}
									alt={posts[0].banner.alt}
								/>
							</Link>
							<div className="p-5 bg-black">
								<div className="mb-1 flex justify-between font-oswald">
									<CustomLink
										className="text-yellow-300 hover:underline hover:brightness-75"
										to={`/${posts[0].category.slug}`}
									>
										{posts[0].category.name.toUpperCase()}
									</CustomLink>
									<span className="text-yellow-300 font-thin">{`${formatDistanceToNow(
										new Date(posts[0].createdAt),
									).toUpperCase()} AGO`}</span>
								</div>
								<Link to={`${posts[0].category.slug}/${posts[0].id}`}>
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
											to={`${post.category.slug}/${post.slug}`}
										>
											<img
												className="w-full h-full object-cover object-center"
												src={post.banner.url}
												alt={post.banner.alt}
											/>
										</Link>
										<div className="w-full flex flex-col gap-[10px]">
											<span className="flex justify-between font-oswald">
												<CustomLink to={`/${post.category.slug}`}>
													{post.category.name.toUpperCase()}
												</CustomLink>
												<span className="font-thin">{`${formatDistanceToNow(
													new Date(post.createdAt),
												).toUpperCase()} AGO`}</span>
											</span>
											<Link to={`${post.category.slug}/${post.slug}`}>
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
									const url = `/posts?offset=${
										posts[posts.length - 1].createdAt
									}`

									fetcher.load(url)
								}}
								disabled={fetcher.state !== 'idle'}
							>
								{fetcher.state === 'idle' ? 'LOAD MORE' : 'LOADING MORE...'}
							</button>
						)}
					</div>
					<div className="grow flex flex-col gap-[15px] dark:text-white lg:hidden">
						<h2
							className={`text-2xl font-bold leading-none ${classNamesThemeToggleDelay}`}
						>
							FEATURED STORIES
						</h2>
						<hr className="h-[3px] border-0 bg-gray-400" />
						{featuredPosts?.length > 0
							? featuredPosts.map((post, index) => (
									<div
										className="flex h-[120px] 2xl:h-[100px] xl:h-[84px]"
										key={post.banner.url}
									>
										<Link
											className="w-[40%] h-full flex-shrink-0 flex"
											to={`${post.category.slug}/${post.slug}`}
										>
											<img
												className="h-full w-full object-cover object-center"
												src={post.banner.url}
												alt={post.banner.alt}
											/>
										</Link>
										<div
											className={
												// eslint-disable-next-line no-negated-condition
												index !== featuredPosts?.length - 1
													? "featured-post relative after:content-[''] after:h-[1px] after:w-[calc(100%-20px)] after:bg-gray-400 after:absolute"
													: 'featured-post'
											}
										>
											<CustomLink to={`/${post.category.slug}`}>
												{post.category.name.toUpperCase()}
											</CustomLink>
											<Link
												className="w-[214px] h-[120px] flex-shrink-0 "
												to={`${post.category.slug}/${post.slug}`}
											>
												<h3 className="h-2/3 font-semibold text-base dark:text-white scroll overflow-clip">
													{post.title}
												</h3>
											</Link>
										</div>
									</div>
							  ))
							: null}
					</div>
				</>
			) : (
				'No posts found.'
			)}
		</div>
	)
}
