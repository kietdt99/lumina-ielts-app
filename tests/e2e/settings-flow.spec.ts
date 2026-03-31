import { expect, test } from './fixtures'

test.describe('learner goals settings flow', () => {
  test('saves learner goals and reflects them on the dashboard', async ({
    page,
    gotoAndAssertOk,
  }) => {
    await gotoAndAssertOk('/settings')

    await page.getByLabel('Target band').selectOption('8')
    await page.getByLabel('Current level').selectOption('Band 5.0-5.5')
    await page.getByLabel('Focus skill').selectOption('Reading')
    await page.getByLabel('Study frequency').selectOption('Daily')
    await page.getByRole('button', { name: 'Save learner goals' }).click()

    await expect(
      page.getByText('Learner goals saved for this browser.')
    ).toBeVisible()

    await page.getByRole('link', { name: 'Dashboard' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: 'Target Band' })).toBeVisible()
    await expect(page.getByText('8.0', { exact: true })).toBeVisible()
    await expect(page.getByText(/Focus skill: Reading/)).toBeVisible()
    await expect(page.getByText(/Study rhythm: Daily/)).toBeVisible()
  })
})
