import { expect, test } from './fixtures'

test.describe('rubric guide flow', () => {
  test('lets learners compare Task 1 and Task 2 writing criteria', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/rubric-guide')

    await expect(
      page.getByRole('heading', { name: 'Understand what moves a writing band' })
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Task Response' })).toBeVisible()
    await expect(page.getByText('Clear position').first()).toBeVisible()
    await expect(page.getByText('Band 8').first()).toBeVisible()

    await page.getByRole('button', { name: 'Task 1' }).click()

    await expect(
      page.getByRole('heading', { name: 'Task Achievement' })
    ).toBeVisible()
    await expect(page.getByText('No personal opinion')).toBeVisible()
    await expect(page.getByText('Name the main pattern in the overview.')).toBeVisible()

    const response = await page.request.get('/api/writing/rubric?taskType=Task%201')
    const payload = (await response.json()) as {
      ok: boolean
      taskType: string
      criteria: Array<{ code: string }>
    }

    expect(response.ok()).toBe(true)
    expect(payload.ok).toBe(true)
    expect(payload.taskType).toBe('Task 1')
    expect(payload.criteria.map((criterion) => criterion.code)).toContain(
      'task-achievement'
    )
  })
})
