import { type DataFunctionArgs } from '@remix-run/node'
import { prisma } from '~/utils/prisma-client.server'
import { getEmail } from '~/utils/reset-password.server'

export async function action({ request }: DataFunctionArgs) {
	const email = await getEmail(request)

	if (typeof email === 'string') {
		const user = await prisma.user.findUnique({
			select: {
				id: true,
			},
			where: {
				email,
			},
		})
	}
}
