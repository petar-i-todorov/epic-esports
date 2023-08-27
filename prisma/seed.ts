// TODO - currently works only if enable type: "module" in package.json; fix
import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import categories from '../app/constants/post-categories'

const prisma = new PrismaClient()

await prisma.category.deleteMany()
await prisma.post.deleteMany()
await prisma.user.deleteMany()
await prisma.passwordHash.deleteMany()

console.info('Db cleared...')
console.info('Creating categories...')

await Promise.all(
	categories.map(category =>
		prisma.category.create({ data: { name: category } }),
	),
)

console.info('Categories created...')
console.info('Creating posts & users...')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const users: Array<Promise<any>> = []

categories.forEach(category => {
	console.log(category)

	for (let i = 0; i < 10; i++) {
		users.push(
			(async () => {
				const foundCategory = await prisma.category.findFirst({
					select: { id: true },
					where: { name: category },
				})

				return prisma.post.create({
					data: {
						title: faker.lorem.sentence(),
						content: faker.lorem.paragraphs(),
						category: {
							connect: {
								id: foundCategory?.id,
							},
						},
						authors: {
							create: {
								name: faker.internet.userName(),
								email: faker.internet.email(),
								passwordHash: {
									create: {
										hash: bcrypt.hashSync(faker.internet.password(), 10),
									},
								},
							},
						},
					},
				})
			})(),
		)
	}
})

console.info('Posts & users created...')

await Promise.all(users)

await prisma.$disconnect()
