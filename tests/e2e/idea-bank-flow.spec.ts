import { expect, test } from './fixtures'

test.describe('idea bank flow', () => {
  test('lets learners search and filter topic ideas before writing', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/idea-bank')

    await expect(
      page.getByRole('heading', { name: 'Build answers faster with topic-ready ideas' })
    ).toBeVisible()
    await expect(page.getByText('Education and technology').first()).toBeVisible()

    await page.getByLabel('Search the idea bank').fill('renewable')
    await expect(page.getByText('Environment and climate').first()).toBeVisible()
    await expect(page.getByText('renewable energy')).toBeVisible()
    await expect(page.getByText('Work and society')).toHaveCount(0)

    await page.getByLabel('Search the idea bank').fill('')
    await page.getByRole('button', { name: 'Task 1' }).click()
    await expect(page.getByText('Urban change and transport').first()).toBeVisible()
    await expect(page.getByText('Education and technology')).toHaveCount(0)

    await page.getByRole('link', { name: 'Open writing workspace' }).click()
    await expect(page).toHaveURL(/\/writing$/)
    await expect(
      page.getByRole('heading', { name: 'Train like a real IELTS session' })
    ).toBeVisible()
  })
})
