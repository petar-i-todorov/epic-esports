import { type LoaderArgs } from '@remix-run/node'
import { Link, useLoaderData, useLocation } from '@remix-run/react'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import Icon from '~/components/Icon'
import { prisma } from '~/utils/prisma-client.server'

export const loader = async ({ params }: LoaderArgs) => {
	const post = await prisma.post.findUnique({
		select: {
			title: true,
			subtitle: true,
			createdAt: true,
			category: {
				select: {
					name: true,
				},
			},
			authors: {
				select: {
					name: true,
				},
			},
		},
		where: {
			id: params.postId,
		},
	})

	return {
		post,
	}
}

export default function PostRoute() {
	const { post } = useLoaderData<typeof loader>()

	const location = useLocation()
	const domain = 'http://localhost:3000'
	const currentUrl = `${domain}${location.pathname}`

	const twitterBaseUrl = 'https://twitter.com/intent/tweet?'
	const facebookBaseUrl = 'https://www.facebook.com/sharer/sharer.php?u='
	const redditBaseUrl = 'https://www.reddit.com/submit?'

	if (post) {
		return (
			<div>
				<div>
					<Link to="..">{'HOME >'}</Link>{' '}
					<Link to=".." relative="path">
						{post.category.name}
					</Link>
				</div>
				<div>{post.title}</div>
				<div>{post.subtitle}</div>
				<div>
					BY {post.authors.map(author => author.name).join(', ')}{' '}
					{format(
						parseISO(post.createdAt),
						'MMMM d, yyyy h:mm a',
					).toUpperCase()}
				</div>
				<div className="flex gap-2">
					<span>SHARE ARTICLE</span>
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
			</div>
		)
	}
	return 'No post was found.'
}
