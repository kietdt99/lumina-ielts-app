import {
  createStoredHistoryEntry,
  expect,
  seedWritingHistory,
  test,
} from './fixtures'

test.describe('review queue flow', () => {
  test('shows revision actions from saved writing feedback', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await seedWritingHistory(page, [
      createStoredHistoryEntry({
        id: 'entry-review-1',
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

    await gotoAndAssertOk('/review-queue')

    await expect(page.getByRole('heading', { name: '2 review actions ready' })).toBeVisible()
    const firstCard = page.locator('.review-queue-card').filter({
      hasText: 'Thesis pass',
    })
    await expect(firstCard).toContainText('High priority')
    await expect(firstCard).toContainText('Make the introduction answer the question more directly.')
    await expect(firstCard).toContainText('The introduction has one clear position sentence.')
    await expect(firstCard).toContainText('Revision checklist')
    await expect(firstCard).toContainText('Make the position unmistakable')
    await expect(firstCard).toContainText('A reader can underline your position')

    await page.getByRole('link', { name: 'Open full detail' }).first().click()
    await expect(page).toHaveURL(/\/tracker\/entry-review-1$/)
    await expect(
      page.getByRole('heading', { name: 'Remote work and employee productivity' })
    ).toBeVisible()
  })
})
