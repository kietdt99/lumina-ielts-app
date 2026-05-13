import { expect, test } from './fixtures'

test.describe('outline builder flow', () => {
  test('builds task-specific outlines and links into writing practice', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/outline-builder')

    await expect(
      page.getByRole('heading', { name: 'Plan the answer before the timer starts' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Remote work and employee productivity' })
    ).toBeVisible()
    await expect(
      page.locator('.outline-block-card').filter({ hasText: 'Body paragraph 1' })
    ).toBeVisible()
    await expect(page.getByText('Vocabulary Pack')).toBeVisible()

    await page.getByLabel('Writing prompt').selectOption('task2-ai-education')
    await expect(
      page.getByRole('heading', { name: 'AI tools in school education' })
    ).toBeVisible()
    await expect(page.getByText('Education and technology').first()).toBeVisible()
    await expect(page.getByText('personalized learning')).toBeVisible()

    await page.getByRole('button', { name: 'Task 1' }).click()
    await expect(page.getByLabel('Writing prompt')).toHaveValue('task1-cycle-diagram')
    await expect(
      page.getByRole('heading', { name: 'Water recycling process' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Overview', exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Detail group 1', exact: true })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Open writing workspace' }).click()
    await expect(page).toHaveURL(/\/writing$/)
    await expect(
      page.getByRole('heading', { name: 'Train like a real IELTS session' })
    ).toBeVisible()
  })
})
