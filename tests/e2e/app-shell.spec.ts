import { test, expect } from './fixtures'

test.describe('app shell', () => {
  test('loads the main routes without browser runtime errors', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/')
    await expect(
      page.getByRole('heading', { name: 'Welcome back, Demo Learner' })
    ).toBeVisible()

    await gotoAndAssertOk('/writing')
    await expect(
      page.getByRole('heading', { name: 'Train like a real IELTS session' })
    ).toBeVisible()

    await gotoAndAssertOk('/tracker')
    await expect(
      page.getByRole('heading', { name: 'See how your writing practice is evolving' })
    ).toBeVisible()

    await gotoAndAssertOk('/settings')
    await expect(
      page.getByRole('heading', { name: 'Set the goals that shape your study plan' })
    ).toBeVisible()

    await gotoAndAssertOk('/auth/login')
    await expect(page).toHaveURL(/\/$/)
  })

  test('navigates through the sidebar without browser runtime errors', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

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

    await page.getByRole('link', { name: 'Profile Settings' }).click()
    await expect(page).toHaveURL(/\/settings\/profile$/)
    await expect(
      page.getByRole('heading', { name: 'Set the goals that shape your study plan' })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Dashboard' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(
      page.getByRole('heading', { name: 'Welcome back, Demo Learner' })
    ).toBeVisible()
  })
})
