import { expect, test } from './fixtures'

test.describe('mistake library flow', () => {
  test('lets learners filter common mistake patterns without runtime errors', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/mistake-library')

    await expect(
      page.getByRole('heading', {
        name: 'Learn the mistakes before they steal band points',
      })
    ).toBeVisible()
    await expect(page.getByText('Missing or vague overview')).toBeVisible()
    await expect(page.getByText('Practice drill').first()).toBeVisible()

    await page.getByRole('button', { name: 'Task 1' }).click()
    await page.getByLabel('Rubric criterion').selectOption('Task Achievement')

    await expect(page.getByText('Detail dump without grouping')).toBeVisible()
    await expect(page.getByText('Unclear essay position')).toHaveCount(0)

    const response = await page.request.get(
      '/api/mistake-taxonomy?taskType=Task%201&criterion=Task%20Achievement'
    )
    const payload = (await response.json()) as {
      ok: boolean
      items: Array<{ code: string }>
    }

    expect(response.ok()).toBe(true)
    expect(payload.ok).toBe(true)
    expect(payload.items.map((item) => item.code)).toEqual([
      'task1-missing-overview',
      'task1-detail-dump',
    ])
  })
})
