import * as React from 'react'
import clsx from 'clsx'
import type BaseBlockContent from '@sanity/block-content-to-react'
import { Link } from '@remix-run/react'
import { formatDistanceToNow } from 'date-fns'
import { Link as CustomLink } from '#app/components/ui/link.tsx'

export type Image = {
	url: string
	alt: string
}

export type Author = {
	id: string
	firstName: string
	lastName: string
	nickname: string
	slug: string
	twitter?: string
	email?: string
	image: Image
	bio?: React.ComponentProps<typeof BaseBlockContent>['blocks']
	postsCount: number
}

type Banner = {
	url: string
	alt: string
	credit: string
	dataUrl: string
}

export type Category = {
	title: string
	slug: string
	description: string
	postsCount: number
}

export type Posts = Array<{
	id: string
	title: string
	subtitle: string
	createdAt: string
	slug: string
	body?: React.ComponentProps<typeof BaseBlockContent>['blocks']
	author: Author
	banner: Banner
	category: Category
}>

export default function PostsBlock({ posts }: { posts: Posts }) {
	return (
		<div className="border border-gray-300 p-10 pt-5 dark:text-foreground-dark md:border-none md:p-0">
			{posts.map((post, index) => {
				const postUrl = `/articles/${post.category.slug}/${post.slug}`

				return (
					<React.Fragment key={post.id}>
						<div
							className={clsx('my-5 flex gap-5 md:flex-row-reverse', {
								'mb-0': index === posts.length - 1,
							})}
							data-testid="post"
						>
							<Link
								to={postUrl}
								className="h-[220px] w-[410px] flex-shrink-0 transition-all 2xl:h-[190px] 2xl:w-[339px] xl:grow sm:h-[143px] sm:w-[255px] xs:h-auto xs:w-0 xs:self-center"
							>
								<img
									className="h-full w-full object-cover object-center xs:aspect-[1.78] xs:h-auto"
									src={post.banner.url}
									alt={post.banner.alt}
									loading="lazy"
								/>
							</Link>
							<div className="flex grow flex-col justify-between md:justify-start md:gap-2 xs:w-0">
								<CustomLink to={`/articles/${post.category.slug}`}>
									{post.category.title.toUpperCase()}
								</CustomLink>
								<Link to={postUrl} className="text-2xl hover:brightness-[90%]">
									<h3 className="font-bold md:line-clamp-3 md:text-lg xs:text-sm">
										{post.title}
									</h3>
								</Link>
								<Link to={postUrl} className="delay-500 duration-700 md:hidden">
									<h4>{post.subtitle}</h4>
								</Link>
								<span className="flex gap-1 font-oswald delay-500 duration-700 md:hidden">
									<span className="w-0 max-w-max flex-grow overflow-clip text-ellipsis whitespace-nowrap">
										BY{' '}
										<CustomLink to={`/author/${post.author.slug}`}>
											{`${post.author.firstName} ${post.author.lastName}`.toUpperCase()}
										</CustomLink>
									</span>
									<span className="whitespace-nowrap font-thin">
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
