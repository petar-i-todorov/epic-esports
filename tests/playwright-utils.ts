import * as setCookieParser from 'set-cookie-parser'
import { test } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { prisma } from '#app/utils/prisma-client.server.ts'
import { createCookie } from '#app/utils/session.server.ts'

test.extend({
	login: async ({ page }) => {
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
		const sessionCookie = await createCookie(id)

		// @ts-expect-error fix later
		await page.context().addCookies([setCookieParser.parse(sessionCookie)])
		return id
	},
})
