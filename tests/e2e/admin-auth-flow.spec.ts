import { expect, test } from './fixtures'

test.describe('admin-managed auth flow', () => {
  test('lets the admin create a learner account and forces a first-login password change', async ({
    page,
    loginAsDemoAdmin,
  }) => {
    await loginAsDemoAdmin()

    const uniqueSuffix = Date.now()
    const learnerEmail = `learner-${uniqueSuffix}@example.com`
    const learnerName = `Learner ${uniqueSuffix}`

    await page.getByRole('link', { name: 'Create Account' }).click()
    await page.getByLabel('Full name').fill(learnerName)
    await page.getByLabel('Email address').fill(learnerEmail)
    await page.getByRole('button', { name: 'Create learner account' }).click()

    const successBanner = page.locator('.success-banner')
    await expect(successBanner).toContainText('Temporary password:')
    const temporaryPasswordText = (await successBanner.textContent()) ?? ''
    const temporaryPassword = temporaryPasswordText.split('Temporary password:')[1]?.trim()

    expect(temporaryPassword).toBeTruthy()

    await page.getByRole('button', { name: 'Sign Out' }).first().click()
    await expect(page).toHaveURL(/\/auth\/login$/)

    await page.getByLabel('Email address').fill(learnerEmail)
    await page.getByLabel('Password').fill(temporaryPassword!)
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page).toHaveURL(/\/auth\/change-password$/)
    await page.getByLabel('New password', { exact: true }).fill('LearnerReset!2026')
    await page.getByLabel('Confirm new password').fill('LearnerReset!2026')
    await page.getByRole('button', { name: 'Update password' }).click()

    await expect(page).toHaveURL(/\/onboarding$/)
    await page.getByRole('button', { name: 'Save and continue' }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: `Welcome back, ${learnerName}` })).toBeVisible()
  })
})
