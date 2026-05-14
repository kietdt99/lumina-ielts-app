import {
  createStoredHistoryEntry,
  expect,
  seedWritingHistory,
  test,
} from './fixtures'

test.describe('revision studio flow', () => {
  test('lets a learner rewrite saved feedback with live readiness metrics', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await seedWritingHistory(page, [
      createStoredHistoryEntry({
        id: 'entry-revision-studio-1',
        promptTitle: 'Remote work and employee productivity',
        createdAt: '2026-05-12T12:00:00.000Z',
        estimatedBand: 7,
        revisionPlan: [
          {
            label: 'Thesis pass',
            action: 'Make the introduction answer the question more directly.',
            successCriteria: 'The introduction has one clear position sentence.',
          },
          {
            label: 'Evidence pass',
            action: 'Add a concrete workplace example to body paragraph two.',
            successCriteria: 'The example clearly supports the main reason.',
          },
        ],
      }),
    ])

    await gotoAndAssertOk('/revision-studio')

    await expect(
      page.getByRole('heading', {
        name: 'Rewrite one saved draft with a clear revision target',
      })
    ).toBeVisible()
    await expect(
      page.getByText('Make the introduction answer the question more directly.', {
        exact: true,
      })
    ).toBeVisible()
    await expect(page.getByText('Make the position unmistakable').first()).toBeVisible()
    await expect(page.getByText('Not started').first()).toBeVisible()

    const rewriteDraft = Array.from({ length: 120 }, (_, index) => `word${index}`)
      .join(' ')
    await page.getByLabel('Rewrite draft').fill(rewriteDraft)

    await expect(page.getByText('Rewrite words', { exact: true })).toBeVisible()
    await expect(page.getByText('120').first()).toBeVisible()
    await expect(page.getByText('Ready for readiness check').first()).toBeVisible()

    await page.getByRole('link', { name: 'Open full detail' }).click()
    await expect(page).toHaveURL(/\/tracker\/entry-revision-studio-1$/)
    await expect(
      page.getByRole('heading', { name: 'Remote work and employee productivity' })
    ).toBeVisible()
  })
})
