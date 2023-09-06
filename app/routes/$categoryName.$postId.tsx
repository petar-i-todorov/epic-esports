import { json, type DataFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData, useLocation } from '@remix-run/react'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import Icon from '~/components/icon'
import CustomLink from '~/components/custom-link'
import { prisma } from '~/utils/prisma-client.server'

export const loader = async ({ params }: DataFunctionArgs) => {
	const post = await prisma.post.findUnique({
		select: {
			title: true,
			subtitle: true,
			createdAt: true,
			content: true,
			category: {
				select: {
					id: true,
					name: true,
				},
			},
			authors: {
				select: {
					id: true,
					name: true,
				},
			},
			images: {
				select: {
					id: true,
					credit: true,
					altText: true,
					contentType: true,
				},
			},
			reactions: {
				select: {
					type: true,
				},
			},
		},
		where: {
			id: params.postId,
		},
	})

	const readMorePost = await prisma.post.findFirst({
		select: {
			id: true,
			title: true,
			category: {
				select: {
					urlName: true,
				},
			},
		},
		where: {
			categoryId: post?.category.id,
			id: {
				not: params.postId,
			},
		},
	})

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	const reactions = (await prisma.$queryRawUnsafe(
		'select rt.name, count(rt.name) as count from postReaction pr inner join postReactionType rt on pr.typeId = rt.id where pr.postId = $1 group by rt.name;',
		params.postId,
	)) as Array<{ name: string; count: bigint }>

	return {
		post,
		readMorePost,
		reactions: reactions.map(reaction => {
			const result = {
				...reaction,
				// queryRawUnsafe returns the count as a bigint and the browser is unable to serialize it
				count: Number(reaction.count),
			}
			return result
		}),
	}
}

export const action = async ({ request }: DataFunctionArgs) => {
	const formData = await request.formData()

	// TODO: handle after login/signup feature is implemented
	console.log(formData.get('intent'))

	return json({})
}

export default function PostRoute() {
	const { post, reactions, readMorePost } = useLoaderData<typeof loader>()

	const location = useLocation()
	const domain = 'http://localhost:3000'
	const currentUrl = `${domain}${location.pathname}`

	const twitterBaseUrl = 'https://twitter.com/intent/tweet?'
	const facebookBaseUrl = 'https://www.facebook.com/sharer/sharer.php?u='
	const redditBaseUrl = 'https://www.reddit.com/submit?'

	const minutesToRead = post
		? Math.max(1, Math.ceil(post.content.length / 250))
		: 0

	const emojis = ['🔥', '😍', '😄', '😐', '😕', '😡']

	if (post) {
		return (
			<div className="ml-[16.67%] mr-[40%] flex flex-col gap-7">
				<div className="mt-28">
					<CustomLink to="..">{'HOME'}</CustomLink>
					{' > '}
					<CustomLink to=".." relative="path">
						{post.category.name}
					</CustomLink>
				</div>
				<div className="flex items-center font-bold">
					<Icon name="hourglass" width="20" height="20" fill="orange" />
					<span>{minutesToRead}-minute read</span>
				</div>
				<h1 className="text-4xl font-bold">{post.title}</h1>
				<h2 className="text-xl font-semibold">{post.subtitle}</h2>
				<div>
					<span className="font-bold">
						BY{' '}
						{post.authors.map((author, index) => (
							<>
								<CustomLink key={author.id} to={`/author/${author.id}`}>
									{author.name.toUpperCase()}
								</CustomLink>
								{/* eslint-disable-next-line no-negated-condition */}
								{index !== post.authors.length - 1 ? ',' : ''}{' '}
							</>
						))}
					</span>
					{format(
						parseISO(post.createdAt),
						'MMMM d, yyyy h:mm a',
					).toUpperCase()}
				</div>
				<div className="flex gap-2 items-center">
					<span className="text-xl font-bold">SHARE ARTICLE</span>
					<Link to={`${facebookBaseUrl}${currentUrl}`} target="_blank">
						<Icon name="facebook-logo" width="24" height="24" />
					</Link>
					<Link
						to={`${twitterBaseUrl}text=${post.title}&url=${currentUrl}`}
						target="_blank"
					>
						<Icon name="twitter-logo" width="24" height="24" />
					</Link>
					<Link
						to={`${redditBaseUrl}url=${currentUrl}&title=${post.title}`}
						target="_blank"
					>
						<Icon name="reddit" width="24" height="24" />
					</Link>
					<Link
						to="."
						onClick={() => navigator.clipboard.writeText(currentUrl)}
					>
						<Icon name="link-2" width="24" height="24" />
					</Link>
				</div>
				<div className="flex flex-col items-center">
					<img
						src={`/resources/image/${post.images[0].id}`}
						alt={post.images[0].altText ?? ''}
					/>
					<span className="text-xs">Credit: {post.images[0].credit}</span>
				</div>
				{post.content.split('\n').map((paragraph, index) => (
					<p className="my-2 text-lg" key={index}>
						{paragraph}
					</p>
				))}
				<span>
					Follow Epic Esports on Facebook, Instagram and Tiktok for{' '}
					{post.category.name} esports news, guides and updates!
				</span>
				{readMorePost ? (
					<span className="text-lg font-semibold">
						READ MORE:{' '}
						<Link
							className="text-blue-900 hover:underline hover:brightness-150 transition-colors"
							to={`/${readMorePost.category.urlName}/${readMorePost.id}`}
						>
							{readMorePost.title}
						</Link>
					</span>
				) : null}
				<div className="w-fit p-1 flex flex-col items-center bg-blue-200">
					<span className="font-bold">How did this article make you feel?</span>
					<div className="flex gap-1 py-3">
						{emojis.map(emoji => (
							<Form key={emoji} method="post">
								<button className="flex flex-col gap-1 items-center text-4xl bg-white">
									<span>{emoji}</span>
									<span className="text-base">
										{reactions.find(reaction => reaction.name === emoji)
											?.count ?? 0}
									</span>
									<input
										type="hidden"
										name="intent"
										value={`reaction ${emoji}`}
									/>
								</button>
							</Form>
						))}
					</div>
				</div>
			</div>
		)
	}
	return 'No post was found.'
}
