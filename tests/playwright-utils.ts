import * as setCookieParser from 'set-cookie-parser'
import { test as base } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { prisma } from '#app/utils/prisma-client.server.ts'
import { createCookie } from '#app/utils/session.server.ts'

const test = base.extend<{
	login: () => Promise<string>
	createUser: () => Promise<string>
}>({
	login: async ({ page }, use) => {
		let userId

		await use(async () => {
			const { id } = await prisma.user.create({
				data: {
					email: faker.internet.email(),
					name: faker.person.fullName(),
					username: faker.internet.userName(),
					passwordHash: {
						create: {
							hash: faker.internet.password(),
						},
					},
				},
				select: {
					id: true,
				},
			})
			userId = id

			// the structure of the objects matches
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const cookieConfig = setCookieParser.parseString(
				await createCookie(id),
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			) as any
			await page
				.context()
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				.addCookies([{ ...cookieConfig, domain: 'localhost' }])
			return id
		})

		await prisma.user.delete({
			where: { id: userId },
		})
	},
	// playwright error - First argument must use the object destructuring pattern: _
	// eslint-disable-next-line no-empty-pattern
	createUser: async ({}, use) => {
		let userId

		await use(async () => {
			const { id } = await prisma.user.create({
				data: {
					email: faker.internet.email(),
					name: faker.person.fullName(),
					username: faker.internet.userName(),
					passwordHash: {
						create: {
							hash: faker.internet.password(),
						},
					},
				},
				select: {
					id: true,
				},
			})
			userId = id
			return id
		})

		await prisma.user.delete({
			where: { id: userId },
		})
	},
})

export { test }
