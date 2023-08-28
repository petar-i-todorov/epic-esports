// prisma seed breaks if using Promise.all instead of await in loops
/* eslint-disable no-await-in-loop */
import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { categories } from '../app/constants/post-categories'

const prisma = new PrismaClient()

await prisma.category.deleteMany()
await prisma.user.deleteMany()

console.info('Db cleared...')
console.info('Creating categories...')

for (const category of categories) {
	await prisma.category.create({ data: { name: category } })
}

console.info('Categories created...')
console.info('Creating posts & users...')

for (const category of categories) {
	const normalizedCategory = category.toLowerCase().replaceAll(/[ :]/g, '-')

	for (let i = 0; i < 10; i++) {
		const foundCategory = await prisma.category.findFirst({
			select: { id: true },
			where: { name: category },
		})

		await prisma.post.create({
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
								hash: faker.internet.password(),
							},
						},
					},
				},
				images: {
					create: [
						{
							blob: await fs.promises.readFile(
								path.join(
									process.cwd(),
									`public/images/${normalizedCategory}/${normalizedCategory}-${
										i + 1
									}.png`,
								),
							),
							altText: `${category} post image`,
							contentType: 'image/png',
						},
					],
				},
			},
		})
	}
}

console.info('Posts & users created...')

await prisma.$disconnect()
