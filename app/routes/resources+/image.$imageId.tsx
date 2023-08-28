import { LoaderArgs } from '@remix-run/node'
import { prisma } from '../../utils/prisma-client.server'

export const loader = async ({ params }: LoaderArgs) => {
	const image = await prisma.postImage.findFirst({
		select: { blob: true, contentType: true },
		where: { id: params.imageId },
	})

	return new Response(image?.blob, {
		headers: {
			'Content-Type': image?.contentType ?? 'image/png',
		},
	})
}
