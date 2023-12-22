import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

test('if no posts are found, show latest ones', async ({ page }) => {
	await page.goto('/')
	const searchButton = page.getByRole('button', {
		name: 'Search',
	})
	await searchButton.click()
	const searchInput = page.getByRole('textbox', {
		name: 'Search',
	})
	const fakeQuery = faker.string.uuid()
	await searchInput.fill(fakeQuery)
	await page
		.getByRole('button', {
			name: /go/i,
		})
		.click()
	await page.waitForURL(`/?s=${fakeQuery}`)
	const latestPostsHeading = page.getByRole('heading', {
		name: /latest/i,
	})
	await expect(latestPostsHeading).toBeVisible()
	const latestPosts = await page.getByTestId('post').all()
	expect(latestPosts).toHaveLength(5)
})
