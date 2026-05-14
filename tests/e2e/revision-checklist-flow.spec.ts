import { expect, test } from './fixtures'

test.describe('revision checklist flow', () => {
  test('lets learners filter revision checklist actions without runtime errors', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/revision-checklist')

    await expect(
      page.getByRole('heading', {
        name: 'Turn feedback into a focused rewrite checklist',
      })
    ).toBeVisible()
    await expect(page.getByText('Rewrite the overview sentence')).toBeVisible()
    await expect(page.getByText('Success signal').first()).toBeVisible()

    await page.getByRole('button', { name: 'Task 2' }).click()
    await page.getByLabel('Rubric criterion').selectOption('Task Response')
    await page.getByLabel('Priority').selectOption('High')
    await page.getByLabel('Search checklist actions').fill('thesis')

    await expect(page.getByText('Make the position unmistakable')).toBeVisible()
    await expect(page.getByText('Rewrite the overview sentence')).toHaveCount(0)

    const response = await page.request.get(
      '/api/revision-checklist?taskType=Task%202&criterion=Task%20Response&priorityLevel=High&query=thesis'
    )
    const payload = (await response.json()) as {
      ok: boolean
      items: Array<{ id: string }>
    }

    expect(response.ok()).toBe(true)
    expect(payload.ok).toBe(true)
    expect(payload.items.map((item) => item.id)).toEqual(['task2-direct-position'])
  })
})
