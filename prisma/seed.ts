// prisma seed breaks if using Promise.all instead of await in loops
/* eslint-disable no-await-in-loop */
import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { categories } from '#app/constants/post-categories'

const prisma = new PrismaClient()

await prisma.category.deleteMany()
await prisma.user.deleteMany()
await prisma.postReactionType.deleteMany()

console.info('Db cleared...')
console.info('Creating post reaction types...')

const postReactionTypes = ['🔥', '😍', '😄', '😐', '😕', '😡']
const savedPostReactionTypes: Array<{
	id: string
	name: string
}> = []
postReactionTypes.forEach(async reaction => {
	savedPostReactionTypes.push(
		await prisma.postReactionType.create({
			data: {
				name: reaction,
			},
		}),
	)
})

console.info('Post reaction types created...')
console.info('Creating categories...')

for (const category of categories) {
	await prisma.category.create({
		data: {
			name: category,
			urlName: category.toLowerCase().replaceAll(/[ :]/g, '-'),
			quote:
				category === 'VALORANT'
					? 'VALORANT ESPORTS NEWS - Epic Esports brings you map analysis, character guides, meta analysis, and tournament coverage.'
					: category === 'MOBILE LEGENDS'
					? 'MOBILE LEGENDS NEWS - Dive into the arena with the latest hero spotlights, strategy breakdowns, and game updates.'
					: category === 'LEAGUE OF LEGENDS'
					? 'LEAGUE OF LEGENDS UPDATES - From the Rift to your screen, catch the latest champion releases, tier lists, and meta shifts.'
					: category === 'DOTA 2'
					? 'DOTA 2 INSIGHTS - Delve deep into the world of Dota with hero insights, meta trends, and game strategies.'
					: category === 'CALL OF DUTY'
					? 'CALL OF DUTY UPDATES - Stay locked and loaded with the latest in CoD news, strategies, and game releases.'
					: category === 'ANIME'
					? 'ANIME UPDATES - Dive into the world of Anime with the latest releases, reviews, and cultural insights.'
					: category === 'CS:GO'
					? 'CS:GO ESPORTS NEWS - Stay on target with the latest game insights, weapon analysis, and competitive scenes.'
					: category === 'PUBG'
					? 'PUBG NEWS - Gear up for the ultimate survival experience with the latest news, updates, and gameplay tips.'
					: category === 'TEKKEN'
					? 'TEKKEN INSIGHTS - Step into the arena with the latest character breakdowns, combo guides, and competitive scenes.'
					: 'GENERAL NEWS - Stay updated with the latest trends and insights.',
		},
	})
}

console.info('Categories created...')
console.info('Creating posts & users...')

for (const category of categories) {
	const normalizedCategory = category.toLowerCase().replaceAll(/[ :]/g, '-')
	const foundCategory = await prisma.category.findFirst({
		select: { id: true },
		where: { name: category },
	})

	for (let i = 0; i < 10; i++) {
		const postContent = Array.from(
			{ length: faker.number.int({ min: 10, max: 15 }) },
			() => {
				const paragraph = faker.lorem.paragraph({ min: 5, max: 10 })
				return paragraph
			},
		).join('\n')

		const postReactions = savedPostReactionTypes
			.map(reaction => {
				return new Array(faker.number.int({ min: 0, max: 5 }))
					.fill(undefined)
					.map(() => {
						console.log(faker.internet.email())
						return {
							type: {
								connect: {
									id: reaction.id,
								},
							},
							user: {
								create: {
									name: faker.person.fullName(),
									email: faker.internet.email(),
									passwordHash: {
										create: {
											hash: faker.internet.password(),
										},
									},
								},
							},
						}
					})
			})
			.flat(1)

		await prisma.post.create({
			data: {
				title: faker.lorem.sentence(7),
				subtitle: faker.lorem.sentence(4),
				content: postContent,
				reactions: {
					create: postReactions,
				},
				category: {
					connect: {
						id: foundCategory?.id,
					},
				},
				authors: {
					create: {
						name: faker.person.fullName(),
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
							credit:
								category === 'VALORANT'
									? 'Riot Games'
									: category === 'MOBILE LEGENDS'
									? 'Moonton'
									: category === 'LEAGUE OF LEGENDS'
									? 'Riot Games'
									: category === 'DOTA 2'
									? 'Valve'
									: category === 'CALL OF DUTY'
									? 'Activision'
									: category === 'ANIME'
									? 'Studio Ghibli'
									: category === 'CS:GO'
									? 'Valve'
									: category === 'PUBG'
									? 'PUBG Corporation'
									: category === 'TEKKEN'
									? 'Bandai Namco'
									: 'Unsplash',
						},
					],
				},
			},
		})
	}
}

console.info('Posts & users created...')

await prisma.$disconnect()
