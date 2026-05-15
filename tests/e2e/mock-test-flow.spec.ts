import { expect, test } from './fixtures'

function words(count: number) {
  return Array.from({ length: count }, (_, index) => `word${index}`).join(' ')
}

test.describe('mock test lab flow', () => {
  test('lets learners run a full writing mock test simulation', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/mock-test')

    await expect(
      page.getByRole('heading', {
        name: 'Complete a full IELTS Writing mock test',
      })
    ).toBeVisible()

    await page.getByLabel('Topic pair').selectOption('Environment and climate')
    await page.getByLabel('Search mock tests').fill('energy')

    await expect(
      page.getByText('Household energy use trends + Environmental responsibility').first()
    ).toBeVisible()

    await page.getByLabel('Task 1 draft').fill(words(150))
    await page.getByLabel('Task 2 draft').fill(words(250))
    await page.getByLabel('Mark Scan both tasks done').click()

    await expect(page.getByLabel('Unmark Scan both tasks done')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await expect(page.getByText('Ready for feedback')).toBeVisible()
    await expect(page.getByText('400').first()).toBeVisible()

    const response = await page.request.get(
      '/api/mock-test?difficulty=Balanced&topic=Environment%20and%20climate&query=energy'
    )
    const payload = (await response.json()) as {
      ok: boolean
      tests: Array<{ id: string }>
    }

    expect(response.ok()).toBe(true)
    expect(payload.ok).toBe(true)
    expect(payload.tests.map((test) => test.id)).toEqual([
      'mock-task1-energy-line-chart-task2-environment-responsibility',
    ])

    await page.getByRole('link', { name: 'Open Task 1 in Writing' }).click()
    await expect(page).toHaveURL(/\/writing\?promptId=task1-energy-line-chart$/)
    await expect(
      page.getByRole('heading', { name: 'Household energy use trends' })
    ).toBeVisible()
  })
})
