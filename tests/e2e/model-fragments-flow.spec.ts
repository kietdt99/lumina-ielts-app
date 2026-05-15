import { expect, test } from './fixtures'

test.describe('model fragments flow', () => {
  test('lets learners filter short model fragments without runtime errors', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/model-fragments')

    await expect(
      page.getByRole('heading', { name: 'Study short fragments, not full essays' })
    ).toBeVisible()
    await expect(page.getByText('Balanced opinion introduction')).toBeVisible()
    await expect(page.getByText('Avoid copying').first()).toBeVisible()

    await page.getByRole('button', { name: 'Task 1' }).click()
    await page.getByLabel('Writing function').selectOption('Overview')

    await expect(page.getByText('Start-to-end overview')).toBeVisible()
    await expect(page.getByText('Balanced opinion introduction')).toHaveCount(0)

    const response = await page.request.get(
      '/api/model-fragments?taskType=Task%201&functionType=Overview'
    )
    const payload = (await response.json()) as {
      ok: boolean
      fragments: Array<{ id: string }>
    }

    expect(response.ok()).toBe(true)
    expect(payload.ok).toBe(true)
    expect(payload.fragments.map((fragment) => fragment.id)).toEqual([
      'task1-process-overview',
    ])
  })
})
