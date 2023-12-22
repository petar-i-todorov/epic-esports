import { prisma } from '#app/utils/prisma-client.server.ts'
import { test } from '../playwright-utils.ts'

const { expect } = test

test("user can't login with valid email and invalid password", async ({
	page,
	createUser,
}) => {
	await page.goto('/login')
	const id = await createUser()
	const { email } = (await prisma.user.findUnique({
		where: { id },
		select: { email: true },
	})) as { email: string }

	const emailInput = page.getByRole('textbox', { name: /email/i })
	const passwordInput = page.getByRole('textbox', { name: /password/i })
	const submitButton = page.getByRole('button', { name: /sign in/i })

	await emailInput.fill(email)
	await passwordInput.fill('invalid-password')
	await submitButton.click()

	const errorMessage = page.getByRole('alert')
	await expect(errorMessage).toBeVisible()
	await expect(errorMessage).toHaveText(/invalid credentials/i)
})

test("user gets redirected if they're already logged in", async ({
	page,
	login,
}) => {
	await login()
	await page.goto('/login')
	await page.waitForURL('/')
	await expect(page).toHaveURL('/')
})
