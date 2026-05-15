import {
  createStoredHistoryEntry,
  expect,
  seedWritingHistory,
  test,
} from './fixtures'

test.describe('mistake journal flow', () => {
  test('groups saved feedback into recurring mistake patterns', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await seedWritingHistory(page, [
      createStoredHistoryEntry({
        id: 'entry-mistake-1',
        promptTitle: 'Remote work and employee productivity',
        createdAt: '2026-05-12T12:00:00.000Z',
        priorities: ['Add more development and concrete evidence to body paragraph two.'],
        revisionPlan: [
          {
            label: 'Development pass',
            action: 'Explain why the workplace example supports the main reason.',
            successCriteria: 'The paragraph has one clear explanation and one example.',
          },
          {
            label: 'Language pass',
            action: 'Replace repeated wording with more precise vocabulary.',
            successCriteria: 'The final draft avoids obvious repetition.',
          },
        ],
      }),
      createStoredHistoryEntry({
        id: 'entry-mistake-2',
        promptTitle: 'Water recycling process',
        taskType: 'Task 1',
        createdAt: '2026-05-11T12:00:00.000Z',
        priorities: ['Group the process stages into clearer paragraph boundaries.'],
        revisionPlan: [],
      }),
    ])

    await gotoAndAssertOk('/mistake-journal')

    await expect(
      page.getByRole('heading', { name: /\d+ mistake patterns found/ })
    ).toBeVisible()
    await expect(page.getByText('Top Pattern')).toBeVisible()
    await expect(page.getByText('Recurring Mistake Patterns')).toBeVisible()

    const supportPattern = page.locator('.mistake-pattern-card').filter({
      hasText: 'Underdeveloped supporting ideas',
    })
    await expect(supportPattern).toContainText('Task Response')
    await expect(supportPattern).toContainText('Add one concrete example')
    await expect(supportPattern).toContainText('Remote work and employee productivity')

    await supportPattern.getByRole('link', {
      name: /Remote work and employee productivity/i,
    }).first().click()
    await expect(page).toHaveURL(/\/tracker\/entry-mistake-1$/)
    await expect(
      page.getByRole('heading', { name: 'Remote work and employee productivity' })
    ).toBeVisible()
  })
})
