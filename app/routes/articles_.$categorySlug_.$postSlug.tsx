import {
	json,
	type DataFunctionArgs,
	LinksFunction,
	MetaFunction,
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
import format from 'date-fns/format/index.js'
import parseISO from 'date-fns/parseISO/index.js'
import { DialogContent, DialogOverlay } from '@reach/dialog'
import { useEffect, useState } from 'react'
import z from 'zod'
import { AuthButton } from '#app/routes/_auth+/login.tsx'
import Icon from '#app/components/icon.tsx'
import CustomLink from '#app/components/ui/custom-link.tsx'
import { prisma } from '#app/utils/prisma-client.server.ts'
import { getUser } from '#app/utils/use-user.tsx'
import blockStyles from '#app/styles/block.css'
import postStyles from '#app/styles/block-post.css'
import { loader as rootLoader } from '#app/root.tsx'
import { type Posts } from '#app/components/posts-block.tsx'
import {
	createNewestPostQueryByCategorySlugExceptId,
	createPostQueryByCategoryAndSlug,
} from '#app/sanity/queries.ts'
import { loadQuery } from '#app/sanity/loader.server.ts'
import { useQuery } from '#app/sanity/loader.ts'
import { postReactionTypes } from '#app/constants/post-reactions.ts'
import { BlockContent } from '#app/sanity/block-content.tsx'

type ExtractFromArray<T> = T extends Array<infer U> ? U : never
type Post = ExtractFromArray<Posts>

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const title = `${data?.initial.data.title} | Epic Esports`
	const description = data?.initial.data.subtitle
	const image = data?.initial.data.banner.url
	const imageAlt = data?.initial.data.banner.alt

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
		{
			name: 'og:image',
			content: image,
		},
		{
			name: 'og:image:alt',
			content: imageAlt,
		},
		{
			name: 'twitter:image',
			content: image,
		},
		{
			name: 'twitter:image:alt',
			content: imageAlt,
		},
	]
}

export const links: LinksFunction = () => {
	return [
		{
			rel: 'stylesheet',
			href: blockStyles,
		},
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

	const reactions = await prisma.$queryRawUnsafe(
		'select rt.name, count(rt.name) as count from postReaction pr inner join postReactionType rt on pr.typeId = rt.id where pr.postId = $1 group by rt.name;',
		postId,
	)

	const origin = process.env.ORIGIN

	const READ_MORE_POST_QUERY = createNewestPostQueryByCategorySlugExceptId({
		categorySlug: params.categorySlug ?? '',
		id: initial.data.id,
	})
	const initialPost =
		await loadQuery<Pick<Post, 'slug' | 'category' | 'title'>>(
			READ_MORE_POST_QUERY,
		)
	const slug = `/articles/${initialPost.data.category.slug}/${initialPost.data.slug}`
	const readMorePost = {
		title: initialPost.data.title,
		slug,
	}

	return {
		initial,
		query: POST_QUERY,
		params: {},
		reactions: (reactions as Array<{ name: string; count: bigint }>).map(
			reaction => {
				const result = {
					...reaction,
					// queryRawUnsafe returns the count as a bigint and the browser is unable to serialize it
					count: Number(reaction.count),
				}
				return result
			},
		),
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
			<div className="mx-auto w-[1290px] 2xl:w-[1100px] xl:w-[950px] lg:w-[700px] md:w-[540px] sm:w-full sm:p-[10px]">
				<div
					className="flex w-[900px] flex-col gap-7 dark:text-white 2xl:w-[750px] xl:w-[630px] lg:w-full md:text-sm"
					data-block="true"
					data-post="true"
				>
					<DialogOverlay
						isOpen={isOpen}
						onDismiss={onDismiss}
						className="fixed inset-0 flex h-full w-full items-center justify-center bg-[hsla(0,0%,100%,0.8)]"
					>
						<DialogContent className="login-dialog flex h-[370px] w-[250px] flex-col items-center justify-between gap-4 border-2 border-solid border-white bg-black p-6 text-white">
							<button className="self-end" onClick={() => setIsOpen(false)}>
								<Icon name="cross-1" className="h-6 w-6" fill="white" />
							</button>
							<Icon
								name="epic-esports"
								fill={rootData?.theme === 'light' ? 'black' : 'white'}
							/>
							<span className="text-center text-lg font-bold">
								Sign up for a free Epic Esports account and start engaging with
								other fans!
							</span>
							<AuthButton>
								<Link to="/login">
									<div className="h-full w-full">Login/Signup</div>
								</Link>
							</AuthButton>
						</DialogContent>
					</DialogOverlay>
					<div>
						<CustomLink to="..">{'HOME'}</CustomLink>
						{' > '}
						<CustomLink to=".." relative="path">
							{post.category.title.toUpperCase()}
						</CustomLink>
					</div>
					<div className="flex items-center font-bold text-blue-900 dark:text-yellow-300">
						<Icon name="hourglass" width="20" height="20" fill="orange" />
						<span>{minutesToRead}-minute read</span>
					</div>
					<h1 className="text-4xl font-bold delay-200 duration-300">
						{post.title}
					</h1>
					<h2 className="text-xl font-semibold delay-200 duration-300">
						{post.subtitle}
					</h2>
					<div className="delay-200 duration-300">
						<span className="font-bold">
							BY{' '}
							<CustomLink to={`/author/${post.author.slug}`}>
								{`${post.author.firstName} ${post.author.lastName}`.toUpperCase()}
							</CustomLink>{' '}
						</span>
						{format(
							parseISO(post.createdAt),
							'MMMM d, yyyy h:mm a',
						).toUpperCase()}
					</div>
					<div className="flex items-center gap-2 text-black dark:text-white">
						<span className="text-xl font-bold delay-200 duration-300">
							SHARE ARTICLE
						</span>
						<Link
							to={`${facebookBaseUrl}${currentUrl}`}
							target="_blank"
							aria-label="Share on Facebook"
						>
							<Icon
								fill={rootData?.theme === 'light' ? 'black' : 'white'}
								name="facebook-logo"
								width="24"
								height="24"
							/>
						</Link>
						<Link
							to={`${twitterBaseUrl}text=${post.title}&url=${currentUrl}`}
							target="_blank"
							aria-label="Share on Twitter"
						>
							<Icon
								fill={rootData?.theme === 'light' ? 'black' : 'white'}
								name="twitter-logo"
								width="24"
								height="24"
							/>
						</Link>
						<Link
							to={`${redditBaseUrl}url=${currentUrl}&title=${post.title}`}
							target="_blank"
							aria-label="Share on Reddit"
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
							aria-label="Copy the post link"
						>
							<Icon
								name="link-2"
								width="24"
								height="24"
								fill={rootData?.theme === 'light' ? 'black' : 'white'}
							/>
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
					<div className="flex w-fit flex-col items-center bg-blue-200 p-1 dark:text-black">
						<span className="font-bold">
							How did this article make you feel?
						</span>
						<div className="flex gap-1 py-3">
							{postReactionTypes.map(reactionType => (
								<Form key={reactionType} method="post">
									<button className="flex flex-col items-center gap-1 bg-white text-4xl">
										<span>{reactionType}</span>
										<span className="text-base">
											{reactions.find(
												reaction => reaction.name === reactionType,
											)?.count ?? 0}
										</span>
										<input type="hidden" name="intent" value={reactionType} />
									</button>
								</Form>
							))}
						</div>
					</div>
				</div>
			</div>
		)
	}
	throw json({ message: 'Post not found' }, { status: 404 })
}
