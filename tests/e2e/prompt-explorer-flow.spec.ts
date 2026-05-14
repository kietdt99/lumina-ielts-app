import { expect, test } from './fixtures'

test.describe('prompt explorer flow', () => {
  test('lets learners filter prompts and hand off into writing without runtime errors', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/prompt-explorer')

    await expect(
      page.getByRole('heading', {
        name: 'Choose the right IELTS prompt before the timer starts',
      })
    ).toBeVisible()
    await expect(page.getByText('Remote work and employee productivity')).toBeVisible()

    await page.getByRole('button', { name: 'Task 2' }).click()
    await page.getByLabel('Search prompts').fill('school')

    await expect(page.getByText('AI tools in school education')).toBeVisible()
    await expect(page.getByText('Remote work and employee productivity')).toHaveCount(0)

    const response = await page.request.get(
      '/api/prompt-explorer?taskType=Task%202&query=school'
    )
    const payload = (await response.json()) as {
      ok: boolean
      prompts: Array<{ id: string }>
    }

    expect(response.ok()).toBe(true)
    expect(payload.ok).toBe(true)
    expect(payload.prompts.map((prompt) => prompt.id)).toContain(
      'task2-ai-education'
    )

    await page.getByRole('link', { name: 'Start with outline' }).click()
    await expect(page).toHaveURL(/\/writing\?promptId=task2-ai-education&outline=1$/)
    await expect(
      page.getByRole('heading', { name: 'AI tools in school education' })
    ).toBeVisible()
    await expect(page.getByLabel('Loaded writing outline')).toBeVisible()
  })
})
