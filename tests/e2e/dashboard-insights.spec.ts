import {
  createStoredHistoryEntry,
  expect,
  seedLearnerGoals,
  seedWritingHistory,
  test,
} from './fixtures'

test.describe('dashboard insights', () => {
  test('personalizes the next-step recommendation from goals and recent history', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await seedLearnerGoals(page, {
      targetBand: 8,
      currentLevel: 'Band 6.0-6.5',
      focusSkill: 'Writing',
      studyFrequency: 'Daily',
    })

    await seedWritingHistory(page, [
      createStoredHistoryEntry({
        id: 'entry-3',
        estimatedBand: 7.5,
        createdAt: '2026-03-31T12:00:00.000Z',
        priorities: ['Clarify the thesis in the introduction.'],
      }),
      createStoredHistoryEntry({
        id: 'entry-2',
        estimatedBand: 7,
        createdAt: '2026-03-30T12:00:00.000Z',
        priorities: ['Clarify the thesis in the introduction.'],
      }),
      createStoredHistoryEntry({
        id: 'entry-1',
        estimatedBand: 6.5,
        createdAt: '2026-03-29T12:00:00.000Z',
        priorities: ['Develop the second body paragraph with more precise support.'],
      }),
    ])

    await gotoAndAssertOk('/')

    await expect(page.getByText('Close the gap to Band 8.0')).toBeVisible()
    await expect(page.getByText('Recent average')).toBeVisible()
    await expect(page.getByText('1.0', { exact: true })).toBeVisible()
    await expect(page.getByText('Recurring focus')).toBeVisible()
    await expect(
      page.locator('.metric-pill').filter({
        hasText: 'Recurring focus',
      })
    ).toContainText('Clarify the thesis in the introduction.')
  })
})
