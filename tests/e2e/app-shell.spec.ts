import { test, expect } from './fixtures'

test.describe('app shell', () => {
  test('loads the main routes without browser runtime errors', async ({
    page,
    gotoAndAssertOk,
  }) => {
    await gotoAndAssertOk('/')
    await expect(
      page.getByRole('heading', { name: 'Welcome to Lumina IELTS' })
    ).toBeVisible()

    await gotoAndAssertOk('/writing')
    await expect(
      page.getByRole('heading', { name: 'Train like a real IELTS session' })
    ).toBeVisible()

    await gotoAndAssertOk('/tracker')
    await expect(
      page.getByRole('heading', { name: 'See how your writing practice is evolving' })
    ).toBeVisible()

    await gotoAndAssertOk('/auth')
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  })

  test('navigates through the sidebar without browser runtime errors', async ({
    page,
    gotoAndAssertOk,
  }) => {
    await gotoAndAssertOk('/')

    await page.getByRole('link', { name: 'Writing Assistant' }).click()
    await expect(page).toHaveURL(/\/writing$/)
    await expect(
      page.getByRole('heading', { name: 'Train like a real IELTS session' })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Score Tracker' }).click()
    await expect(page).toHaveURL(/\/tracker$/)
    await expect(
      page.getByRole('heading', { name: 'See how your writing practice is evolving' })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Dashboard' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(
      page.getByRole('heading', { name: 'Welcome to Lumina IELTS' })
    ).toBeVisible()
  })
})
