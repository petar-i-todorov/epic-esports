import { prisma } from '#app/utils/prisma-client.server.ts'
import { postReactionTypes } from '#app/constants/post-reactions.ts'

// used to seed the database with some initial data
// before adding Sanity to the project; may rewrite
// it soon to match the new schemas
// but currently have other priorities

for (const name of postReactionTypes) {
	await prisma.postReactionType.upsert({
		create: {
			name,
		},
		update: {},
		where: {
			name,
		},
	})
}

await prisma.$disconnect()
