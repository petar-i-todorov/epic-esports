import { Link } from '@remix-run/react'
import { formatDistanceToNow } from 'date-fns'

type Posts = Array<{
	id: string
	title: string
	subtitle: string
	createdAt: string
	authors: Array<{
		id: string
		name: string
	}>
	images: Array<{
		id: string
		altText: string | null
	}>
	category: {
		name: string
		urlName: string
		quote: string
	}
}>

export default function PostsBlock({ posts }: { posts: Posts }) {
	return (
		<div className="p-10 pt-5 border border-gray-300">
			{posts.map((post, index) => {
				return (
					<>
						<div className="flex gap-5 my-5" key={post.id}>
							<img
								className="h-[220px] w-[410px] object-cover object-center"
								key={post.images[0].id}
								src={`/resources/image/${post.images[0].id}`}
								alt={post.images[0].altText ?? ''}
								loading="lazy"
							/>
							<div className="flex flex-col justify-between">
								<span className="font-bold">{post.category.name}</span>
								<h3 className="font-bold">{post.title}</h3>
								<h4>{post.subtitle}</h4>
								<span className="flex gap-3">
									<span>
										BY{' '}
										{post.authors.map(author => (
											<Link key={author.id} to={`authors/${author.id}`}>
												{author.name}
											</Link>
										))}
									</span>
									<span>
										{`${formatDistanceToNow(
											new Date(post.createdAt),
										).toUpperCase()} AGO`}
									</span>
								</span>
							</div>
						</div>
						{index === posts.length - 1 || <hr />}
					</>
				)
			})}
		</div>
	)
}
