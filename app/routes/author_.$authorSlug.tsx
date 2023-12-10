// @ts-expect-error - fix before deploument
import { PortableText } from '@portabletext/react'
import { DataFunctionArgs, V2_MetaFunction, json } from '@remix-run/node'
import { useLoaderData, Link, useRouteLoaderData } from '@remix-run/react'
import Icon from '#app/components/icon'
import PostsBlock, { Author, Posts } from '#app/components/posts-block'
import { useQuery } from '#app/sanity/loader'
import { loadQuery } from '#app/sanity/loader.server'
import {
	createAuthorQueryBySlug,
	createPostsQueryByAuthorSlug,
} from '#app/sanity/queries'
import { invariantResponse } from '#app/utils/misc.server'
import { loader as rootLoader } from '#app/root'

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
	const authorName = `${data?.initialAuthor.data.firstName} "${data?.initialAuthor.data.nickname}" ${data?.initialAuthor.data.lastName}`
	const title = data
		? `${authorName} | Epic Esports`
		: 'Author not found | Epic Esports'
	const description = data?.initialAuthor.data.bio ?? ''

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

export async function loader({ params }: DataFunctionArgs) {
	const { authorSlug } = params
	invariantResponse(authorSlug, 'Author slug is required')
	const AUTHOR_QUERY = createAuthorQueryBySlug(authorSlug)
	const initialAuthor = await loadQuery<Author>(AUTHOR_QUERY)

	const POSTS_QUERY = createPostsQueryByAuthorSlug(authorSlug)
	const initialPosts = await loadQuery<Posts>(POSTS_QUERY)

	return json({
		initialAuthor,
		queryAuthor: AUTHOR_QUERY,
		paramsAuthor: {},
		initialPosts,
		queryPosts: POSTS_QUERY,
		paramsPosts: {},
	})
}

export default function AuthorRoute() {
	const {
		initialAuthor,
		queryAuthor,
		paramsAuthor,
		initialPosts,
		queryPosts,
		paramsPosts,
	} = useLoaderData<typeof loader>()
	const { data: author } = useQuery<typeof initialAuthor.data>(
		queryAuthor,
		paramsAuthor,
		{
			initial: initialAuthor,
		},
	)

	const { data: posts } = useQuery<typeof initialPosts.data>(
		queryPosts,
		paramsPosts,
		{
			initial: initialPosts,
		},
	)

	const rootData = useRouteLoaderData<typeof rootLoader>('root')

	if (author) {
		const authorName = `${author.firstName} "${author.nickname}" ${author.lastName}`

		return (
			<div className="w-[1320px] 2xl:w-[1110px] xl:w-[930px] md:w-[690px] sm:w-[550px] xs:w-full xs:px-[10px] mx-auto pt-[50px] dark:text-white transition-colors">
				<div className="flex justify-between md:flex-col-reverse md:gap-3">
					<div className="flex flex-col gap-[20px]">
						<h1 className="flex gap-3">
							<span className="text-lg font-bold delay-200 duration-300">
								{authorName}
							</span>
							<span className="font-semibold bg-yellow-400 text-black px-3 py-1">
								EPIC ESPORTS STAFF
							</span>
						</h1>
						<div className="flex gap-3">
							<span>
								{author.email ? (
									<Link to="mailto:46651r@unibit.bg">
										<Icon
											name="mail"
											className="w-[35px] h-[35px]"
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
									>
										<Icon
											name="twitter-logo"
											className="w-[35px] h-[35px]"
											fill={rootData?.theme === 'dark' ? 'white' : 'black'}
										/>
									</Link>
								) : null}
							</span>
						</div>
						<div className="text-lg md:text-base delay-200 duration-300">
							<PortableText value={author.bio} />
						</div>
					</div>
					<img
						src={author.image.url}
						alt={author.image.alt}
						className="w-[300px] 2xl:w-[250px] xl:w-[200px] h-[250px] object-cover object-center transition-all"
					/>
				</div>
				{posts ? (
					<>
						<h2 className="font-bold text-2xl py-5 md:text-lg delay-200 duration-300">
							ARTICLES BY {authorName.toUpperCase()}
						</h2>
						<PostsBlock posts={posts} />
					</>
				) : (
					<p>This author hasn&apps;t created any articles, yet.</p>
				)}
			</div>
		)
	}

	return null
}
