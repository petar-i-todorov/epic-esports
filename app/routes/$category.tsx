import {
	json,
	type V2_MetaFunction,
	type LoaderArgs,
	redirect,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import PostsBlock from '#app/components/posts-block'
import { prisma } from '#app/utils/prisma-client.server'
import { GeneralErrorBoundary } from '~/components/error-boundary'

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
	const title = `${data?.categoryName} | Epic Esports`
	const description = data?.categoryQuote

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

export async function loader({ params }: LoaderArgs) {
	const posts = await prisma.post.findMany({
		select: {
			id: true,
			title: true,
			subtitle: true,
			createdAt: true,
			authors: {
				select: {
					id: true,
					name: true,
				},
			},
			images: {
				select: {
					id: true,
					altText: true,
				},
			},
			category: {
				select: {
					name: true,
					slug: true,
					quote: true,
				},
			},
		},
		where: {
			category: {
				slug: params.category,
			},
		},
	})

	if (posts.length === 0) {
		return redirect('..')
	}

	const category = await prisma.category.findUnique({
		select: {
			name: true,
			quote: true,
		},
		where: {
			slug: params.category,
		},
	})

	return json({
		posts,
		categoryName: category?.name,
		categoryQuote: category?.quote,
	})
}

export default function CategoryRoute() {
	const { posts } = useLoaderData<typeof loader>()

	if (Array.isArray(posts) && posts.length > 0) {
		return (
			<div className="w-[1320px] 2xl:w-[1110px] xl:w-[930px] md:w-[690px] sm:w-[550px] xs:w-full xs:px-[10px] mx-auto pt-[50px] dark:text-white">
				<h1 className="my-4 font-bold">{posts[0].category.name}</h1>
				<h2 className="my-4">{posts[0].category.quote}</h2>
				<PostsBlock posts={posts} />
			</div>
		)
	}
	return 'No posts found.'
}
