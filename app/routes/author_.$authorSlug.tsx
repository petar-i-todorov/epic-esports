import React from 'react'
import clsx from 'clsx'
import {
	type DataFunctionArgs,
	type MetaFunction,
	type LinksFunction,
	json,
} from '@remix-run/node'
import {
	useLoaderData,
	Link,
	useRouteLoaderData,
	useFetcher,
} from '@remix-run/react'
import Icon from '#app/components/Icon.tsx'
import PostsBlock, {
	type Author,
	type Posts,
} from '#app/components/posts-block.tsx'
import { loadQuery } from '#app/sanity/loader.server.ts'
import {
	createAuthorQueryBySlug,
	createPostsQueryByAuthorSlug,
} from '#app/sanity/queries.ts'
import { invariantResponse } from '#app/utils/misc.server.ts'
import { type loader as rootLoader } from '#app/root.tsx'
import { BlockContent } from '#app/sanity/block-content.tsx'
import blockStyles from '#app/styles/block.css'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const authorName = `${data?.author.firstName} "${data?.author.nickname}" ${data?.author.lastName}`
	const title = data
		? `${authorName} | Epic Esports`
		: 'Author not found | Epic Esports'
	const description = data?.author.bio ?? ''
	const image = data?.author.image.url ?? ''
	const imageAlt = data?.author.image.alt ?? ''

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
			name: 'twitter:image',
			content: { image },
		},
		{
			name: 'twitter:image:alt',
			content: imageAlt,
		},
		{
			name: 'og:image',
			content: { image },
		},
		{
			name: 'og:image:alt',
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
	]
}

export async function loader({ params }: DataFunctionArgs) {
	const { authorSlug } = params
	invariantResponse(authorSlug, 'Author slug is required')
	const AUTHOR_QUERY = createAuthorQueryBySlug(authorSlug)
	const authorDataPromise = loadQuery<Author>(AUTHOR_QUERY)

	const POSTS_QUERY = createPostsQueryByAuthorSlug(authorSlug)
	const postsDataPromise = loadQuery<Posts>(POSTS_QUERY)

	const [{ data: author }, { data: posts }] = await Promise.all([
		authorDataPromise,
		postsDataPromise,
	])

	return json({
		author,
		posts,
	})
}

export default function AuthorRoute() {
	const { author, posts: initialPosts } = useLoaderData<typeof loader>()

	const rootData = useRouteLoaderData<typeof rootLoader>('root')

	const [posts, setPosts] = React.useState(initialPosts)
	const fetcher = useFetcher<{
		posts: Posts
	}>()

	React.useEffect(() => {
		const fetcherData = fetcher.data
		if (fetcherData) {
			setPosts(prev => [...prev, ...fetcherData.posts])
		}
	}, [fetcher.data])

	const authorName = `${author.firstName} "${author.nickname}" ${author.lastName}`

	return (
		<div className="mx-auto flex w-[1290px] flex-col pt-[50px] transition-colors dark:text-gray-50 2xl:w-[1110px] xl:w-[930px] md:w-[690px] sm:w-[550px] xs:w-full xs:px-[10px]">
			<div className="flex justify-between gap-5 md:flex-col-reverse md:gap-3">
				<div className="flex flex-col gap-[20px]">
					<h1 className="flex gap-3">
						<span className="text-lg font-bold delay-200 duration-300">
							{authorName}
						</span>
						<span className="bg-yellow-400 px-3 py-1 font-semibold text-black">
							EPIC ESPORTS STAFF
						</span>
					</h1>
					<div className="flex gap-3">
						<span>
							{author.email ? (
								<Link to="mailto:46651r@unibit.bg" aria-label="Send an email">
									<Icon
										name="mail"
										className="h-[35px] w-[35px]"
										fill={rootData?.theme === 'dark' ? 'white' : 'black'}
									/>
								</Link>
							) : null}
						</span>
						<span>
							{author.twitter ? (
								<Link
									to={`https://twitter.com/${author.twitter}`}
									target="_blank"
									aria-label="Twitter profile"
								>
									<Icon
										name="twitter-logo"
										className="h-[35px] w-[35px]"
										fill={rootData?.theme === 'dark' ? 'white' : 'black'}
									/>
								</Link>
							) : null}
						</span>
					</div>
					<div
						className="text-lg delay-200 duration-300 md:text-base"
						data-block="true"
					>
						<BlockContent blocks={author.bio} />
					</div>
				</div>
				<img
					src={author.image.url}
					alt={author.image.alt}
					className="h-[250px] w-[300px] flex-shrink-0 object-cover object-center transition-all 2xl:w-[250px] xl:w-[200px]"
				/>
			</div>
			<h2 className="py-5 text-2xl font-bold delay-200 duration-300 md:text-lg">
				ARTICLES BY {authorName.toUpperCase()}
			</h2>
			<PostsBlock posts={posts} />
			{author.postsCount <= posts.length ? null : (
				<button
					className={clsx(
						'my-5 self-center bg-yellow-400 px-2 py-3 font-bold dark:text-black',
						fetcher.state !== 'idle' && 'opacity-50',
					)}
					onClick={() => {
						const url = `/posts?offset=${
							posts[posts.length - 1].createdAt
						}&authorSlug=${author.slug}`

						fetcher.load(url)
					}}
					disabled={fetcher.state !== 'idle'}
				>
					{fetcher.state === 'idle' ? 'LOAD MORE' : 'LOADING MORE...'}
				</button>
			)}
		</div>
	)
}
