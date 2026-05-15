import { expect, test } from './fixtures'

test.describe('practice sprint flow', () => {
  test('lets learners choose a sprint and open writing with an outline', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/practice-sprint')

    await expect(
      page.getByRole('heading', { name: 'Start a focused IELTS writing sprint' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Remote work and employee productivity' })
    ).toBeVisible()

    await page.getByRole('button', { name: 'Task 2' }).click()
    await page.getByLabel('Search sprints').fill('school')

    await expect(
      page.getByRole('heading', { name: 'AI tools in school education' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Remote work and employee productivity' })
    ).toHaveCount(0)

    await page.getByLabel('Mark Warm up vocabulary done').click()
    await expect(page.getByLabel('Unmark Warm up vocabulary done')).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    const response = await page.request.get(
      '/api/practice-sprint?taskType=Task%202&query=school'
    )
    const payload = (await response.json()) as {
      ok: boolean
      sprints: Array<{ id: string }>
    }

    expect(response.ok()).toBe(true)
    expect(payload.ok).toBe(true)
    expect(payload.sprints.map((sprint) => sprint.id)).toContain(
      'sprint-task2-ai-education'
    )

    await page.getByRole('link', { name: 'Start sprint in Writing' }).click()
    await expect(page).toHaveURL(/\/writing\?promptId=task2-ai-education&outline=1$/)
    await expect(
      page.getByRole('heading', { name: 'AI tools in school education' })
    ).toBeVisible()
    await expect(page.getByLabel('Loaded writing outline')).toBeVisible()
  })
})
