import { prisma } from '#app/utils/prisma-client.server.ts'

// used to seed the database with some initial data
// before adding Sanity to the project; may rewrite
// it soon to match the new schemas
// but currently have other priorities

await prisma.$disconnect()
