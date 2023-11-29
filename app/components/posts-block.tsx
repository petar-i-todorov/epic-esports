import * as React from 'react'
import { Link } from '@remix-run/react'
import { formatDistanceToNow } from 'date-fns'
import CustomLink from '#app/components/ui/custom-link'

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
		slug: string
		quote: string
	}
}>

export default function PostsBlock({ posts }: { posts: Posts }) {
	return (
		<div className="p-10 md:p-0 pt-5 border border-gray-300 md:border-none dark:text-white">
			{posts.map((post, index) => {
				return (
					<React.Fragment key={post.id}>
						<div className="flex md:flex-row-reverse gap-5 my-5">
							<Link
								to={`${post.id}`}
								className="h-[220px] w-[410px] 2xl:h-[190px] 2xl:w-[339px] sm:w-[255px] sm:h-[143px] xs:w-0 xs:h-auto xs:self-center grow flex-shrink-0 transition-all"
							>
								<img
									className="w-full h-full xs:h-auto xs:aspect-[1.78] object-cover object-center"
									src={`/resources/image/${post.images[0].id}`}
									alt={post.images[0].altText ?? ''}
									loading="lazy"
								/>
							</Link>
							<div className="flex flex-col justify-between md:justify-start md:gap-2 xs:w-0 grow">
								<CustomLink to=".">
									{post.category.name.toUpperCase()}
								</CustomLink>
								<Link to={post.id} className="text-2xl hover:brightness-[90%]">
									<h3 className="font-bold md:text-lg xs:text-sm md:line-clamp-3">
										{post.title}
									</h3>
								</Link>
								<Link to={post.id} className="md:hidden">
									<h4>{post.subtitle}</h4>
								</Link>
								<span className="flex gap-1 md:hidden">
									<span className="w-0 max-w-max flex-grow text-ellipsis whitespace-nowrap overflow-clip">
										BY{' '}
										{post.authors.map(author => (
											<CustomLink key={author.id} to={`author/${author.id}`}>
												{author.name.toUpperCase()}
											</CustomLink>
										))}
									</span>
									<span className="whitespace-nowrap">
										{`${formatDistanceToNow(
											new Date(post.createdAt),
										).toUpperCase()} AGO`}
									</span>
								</span>
							</div>
						</div>
						{index === posts.length - 1 || <hr />}
					</React.Fragment>
				)
			})}
		</div>
	)
}
