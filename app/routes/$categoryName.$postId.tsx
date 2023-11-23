import {
	json,
	type DataFunctionArgs,
	LinksFunction,
	V2_MetaFunction,
} from '@remix-run/node'
import {
	Form,
	Link,
	useActionData,
	useLoaderData,
	useLocation,
	useRouteLoaderData,
} from '@remix-run/react'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import { DialogContent, DialogOverlay } from '@reach/dialog'
import { useEffect, useState } from 'react'
import z from 'zod'
import * as React from 'react'
import { AuthButton } from './_auth+/login'
import Icon from '#app/components/icon'
import CustomLink from '#app/components/ui/custom-link'
import { prisma } from '#app/utils/prisma-client.server'
import { getUser } from '~/utils/use-user'
import postStyles from '#app/styles/post.css'
import { loader as rootLoader } from '#app/root'

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
	const title = `${data?.post?.title} | Epic Esports`
	const description = data?.post?.subtitle

	return [
		{
			title,
		},
		{
			name: 'description',
			content: description,
		},
		{
			name: 'og:title',
			content: title,
		},
		{
			name: 'og:description',
			content: description,
		},
		{
			name: 'twitter:title',
			content: title,
		},
		{
			name: 'twitter:description',
			content: description,
		},
	]
}

export const links: LinksFunction = () => {
	return [
		{
			rel: 'stylesheet',
			href: postStyles,
		},
	]
}

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

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const origin = process.env.ORIGIN!

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
		origin,
	}
}

const emojis = ['🔥', '😍', '😄', '😐', '😕', '😡'] as const
const IntentSchema = z.enum(emojis)

export const action = async ({ request, params }: DataFunctionArgs) => {
	const user = await getUser(request.headers.get('Cookie') ?? '')

	if (user) {
		const formData = await request.formData()
		const result = IntentSchema.safeParse(formData.get('intent'))
		if (result.success) {
			const previousReaction = await prisma.postReaction.findUnique({
				select: {
					id: true,
					type: true,
				},
				where: {
					userId_postId: {
						userId: user.id,
						postId: params.postId ?? '',
					},
				},
			})

			if (previousReaction) {
				if (previousReaction.type.name === result.data) {
					await prisma.postReaction.delete({
						where: {
							id: previousReaction.id,
						},
					})
				} else {
					await prisma.postReaction.update({
						where: {
							id: previousReaction.id,
						},
						data: {
							type: {
								connect: {
									name: result.data,
								},
							},
						},
					})
				}
			} else {
				await prisma.postReaction.create({
					data: {
						type: {
							connect: {
								name: result.data,
							},
						},
						post: {
							connect: {
								id: params.postId,
							},
						},
						user: {
							connect: {
								id: user.id,
							},
						},
					},
				})
			}

			return json({ openModal: false })
		}
	}

	return json({ openModal: !user }, { status: 401 })
}

export default function PostRoute() {
	const { post, reactions, readMorePost, origin } =
		useLoaderData<typeof loader>()

	const location = useLocation()
	const currentUrl = `${origin}${location.pathname}`

	const twitterBaseUrl = 'https://twitter.com/intent/tweet?'
	const facebookBaseUrl = 'https://www.facebook.com/sharer/sharer.php?u='
	const redditBaseUrl = 'https://www.reddit.com/submit?'

	const minutesToRead = post
		? Math.max(1, Math.ceil(post.content.length / 250))
		: 0

	const rootData = useRouteLoaderData<typeof rootLoader>('root')

	const actionData = useActionData<typeof action>()
	const [isOpen, setIsOpen] = useState(actionData?.openModal ?? false)
	const onDismiss = () => setIsOpen(false)

	useEffect(() => {
		if (actionData?.openModal) {
			setIsOpen(true)
		}
	}, [actionData])

	if (post) {
		return (
			<div className="ml-[16.67%] mr-[40%] flex flex-col gap-7 dark:text-white">
				<DialogOverlay
					isOpen={isOpen}
					onDismiss={onDismiss}
					className="fixed w-full h-full inset-0 bg-[hsla(0,0%,100%,0.8)] flex justify-center items-center"
				>
					<DialogContent className="w-[250px] h-[370px] border-2 p-6 border-white border-solid flex flex-col items-center justify-between gap-4 bg-black text-white login-dialog">
						<button className="self-end" onClick={() => setIsOpen(false)}>
							X
						</button>
						<Icon name="epic-esports" fill="white" className="scale-150" />
						<span className="text-lg font-bold text-center">
							Sign up for a free ONE Esports account and start engaging with
							other fans!
						</span>
						<AuthButton>
							<Link to="/login">
								<div className="w-full h-full">Login/Signup</div>
							</Link>
						</AuthButton>
					</DialogContent>
				</DialogOverlay>
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
							<React.Fragment key={author.id}>
								<CustomLink to={`/author/${author.id}`}>
									{author.name.toUpperCase()}
								</CustomLink>
								{/* eslint-disable-next-line no-negated-condition */}
								{index !== post.authors.length - 1 ? ',' : ''}{' '}
							</React.Fragment>
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
						<Icon
							name="reddit"
							width="24"
							height="24"
							fill={rootData?.theme === 'light' ? 'black' : 'white'}
						/>
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
				<div className="w-fit p-1 flex flex-col items-center bg-blue-200 dark:text-black">
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
									<input type="hidden" name="intent" value={emoji} />
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
