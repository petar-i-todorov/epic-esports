import {
	json,
	type DataFunctionArgs,
	LinksFunction,
	V2_MetaFunction,
	redirect,
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
import { AuthButton } from '#app/routes/_auth+/login'
import Icon from '#app/components/icon'
import CustomLink from '#app/components/ui/custom-link'
import { prisma } from '#app/utils/prisma-client.server'
import { getUser } from '#app/utils/use-user'
import postStyles from '#app/styles/post.css'
import { loader as rootLoader } from '#app/root'
import { type Posts } from '#app/components/posts-block'
import {
	createNewestPostQueryByCategorySlugExceptId,
	createPostQueryByCategoryAndSlug,
} from '#app/sanity/queries'
import { loadQuery } from '#app/sanity/loader.server'
import { useQuery } from '#app/sanity/loader'
import { postReactionTypes } from '#app/constants/post-reactions'
import { BlockContent } from '~/sanity/block-content'

type ExtractFromArray<T> = T extends Array<infer U> ? U : never
type Post = ExtractFromArray<Posts>

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
	const title = `${data?.initial.data.title} | Epic Esports`
	const description = data?.initial.data.subtitle

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
	const { categorySlug, postSlug } = params
	const POST_QUERY = createPostQueryByCategoryAndSlug(
		categorySlug ?? '',
		postSlug ?? '',
	)

	const initial = await loadQuery<Post>(POST_QUERY)
	const postId = initial.data.id

	if (!postId) {
		throw redirect(`/${params.categoryName}`)
	}

	const existingPost = await prisma.post.findUnique({
		select: {
			id: true,
		},
		where: {
			id: postId,
		},
	})
	if (!existingPost) {
		await prisma.post.create({
			data: {
				id: initial.data.id,
				slug: initial.data.slug,
			},
		})
	}

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	const reactions = (await prisma.$queryRawUnsafe(
		'select rt.name, count(rt.name) as count from postReaction pr inner join postReactionType rt on pr.typeId = rt.id where pr.postId = $1 group by rt.name;',
		postId,
	)) as Array<{ name: string; count: bigint }>

	const origin = process.env.ORIGIN

	const READ_MORE_POST_QUERY = createNewestPostQueryByCategorySlugExceptId({
		categorySlug: params.categorySlug ?? '',
		id: initial.data.id,
	})
	const initialPost = await loadQuery<
		Pick<Post, 'slug' | 'category' | 'title'>
	>(READ_MORE_POST_QUERY)
	const slug = `/${initialPost.data.category.slug}/${initialPost.data.slug}`
	const readMorePost = {
		title: initialPost.data.title,
		slug,
	}

	return {
		initial,
		query: POST_QUERY,
		params: {},
		reactions: reactions.map(reaction => {
			const result = {
				...reaction,
				// queryRawUnsafe returns the count as a bigint and the browser is unable to serialize it
				count: Number(reaction.count),
			}
			return result
		}),
		origin,
		readMorePost,
	}
}

const IntentSchema = z.enum(postReactionTypes)

export const action = async ({ request, params }: DataFunctionArgs) => {
	const user = await getUser(request.headers.get('Cookie') ?? '')

	if (user) {
		const formData = await request.formData()
		const result = IntentSchema.safeParse(formData.get('intent'))
		if (result.success) {
			const post = await prisma.post.findUnique({
				select: {
					id: true,
				},
				where: {
					slug: params.postSlug ?? '',
				},
			})

			const previousReaction = await prisma.postReaction.findUnique({
				select: {
					id: true,
					type: true,
				},
				where: {
					userId_postId: {
						userId: user.id,
						postId: post?.id ?? '',
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
				const POST_QUERY = createPostQueryByCategoryAndSlug(
					params.categorySlug ?? '',
					params.postSlug ?? '',
				)
				const initial = await loadQuery<Post>(POST_QUERY)
				const postId = initial.data.id

				await prisma.postReaction.create({
					data: {
						type: {
							connect: {
								name: result.data,
							},
						},
						post: {
							connect: {
								id: postId,
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
	const { initial, query, params, reactions, origin, readMorePost } =
		useLoaderData<typeof loader>()
	const { data: post } = useQuery<typeof initial.data>(query, params, {
		initial,
	})

	const location = useLocation()
	const currentUrl = `${origin}${location.pathname}`

	const twitterBaseUrl = 'https://twitter.com/intent/tweet?'
	const facebookBaseUrl = 'https://www.facebook.com/sharer/sharer.php?u='
	const redditBaseUrl = 'https://www.reddit.com/submit?'

	const minutesToRead = post
		? Array.isArray(post.body)
			? Math.max(1, Math.ceil(post.body.length / 10))
			: 1
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
			<div
				className="pl-[170px] 2xl:pl-[10%] w-[900px] 2xl:w-[760px] flex flex-col gap-7 dark:text-white"
				data-post="true"
			>
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
							Sign up for a free Epic Esports account and start engaging with
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
						{post.category.name.toUpperCase()}
					</CustomLink>
				</div>
				<div className="flex items-center font-bold text-yellow-300">
					<Icon name="hourglass" width="20" height="20" fill="orange" />
					<span>{minutesToRead}-minute read</span>
				</div>
				<h1 className="text-4xl font-bold">{post.title}</h1>
				<h2 className="text-xl font-semibold">{post.subtitle}</h2>
				<div>
					<span className="font-bold">
						BY{' '}
						<CustomLink to={`/author/${post.author.slug}`}>
							{`${post.author.firstName} ${post.author.lastName}`.toUpperCase()}
						</CustomLink>{' '}
						{/* eslint-disable-next-line no-negated-condition */}
					</span>
					{format(
						parseISO(post.createdAt),
						'MMMM d, yyyy h:mm a',
					).toUpperCase()}
				</div>
				<div className="flex gap-2 items-center text-white">
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
					<img src={post.banner.url} alt={post.banner.alt} />
					<span className="text-xs">Credit: {post.banner.credit}</span>
				</div>
				<BlockContent blocks={post.body} />
				<div className="text-lg">
					<span className="font-semibold">READ MORE: </span>
					<CustomLink to={readMorePost.slug}>{readMorePost.title}</CustomLink>
				</div>
				<div className="w-fit p-1 flex flex-col items-center bg-blue-200 dark:text-black">
					<span className="font-bold">How did this article make you feel?</span>
					<div className="flex gap-1 py-3">
						{postReactionTypes.map(reactionType => (
							<Form key={reactionType} method="post">
								<button className="flex flex-col gap-1 items-center text-4xl bg-white">
									<span>{reactionType}</span>
									<span className="text-base">
										{reactions.find(reaction => reaction.name === reactionType)
											?.count ?? 0}
									</span>
									<input type="hidden" name="intent" value={reactionType} />
								</button>
							</Form>
						))}
					</div>
				</div>
			</div>
		)
	}
	throw json({ message: 'Post not found' }, { status: 404 })
}
