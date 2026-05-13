import {
  createStoredHistoryEntry,
  expect,
  seedLearnerGoals,
  seedWritingHistory,
  test,
} from './fixtures'

test.describe('study plan flow', () => {
  test('builds a weekly plan from learner goals and saved writing history', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await seedLearnerGoals(page, {
      targetBand: 8,
      currentLevel: 'Band 6.0-6.5',
      focusSkill: 'Writing',
      studyFrequency: '4 sessions/week',
    })

    await seedWritingHistory(page, [
      createStoredHistoryEntry({
        id: 'entry-1',
        createdAt: '2026-05-12T12:00:00.000Z',
        estimatedBand: 7,
        priorities: ['Clarify the thesis in the introduction.'],
      }),
    ])

    await gotoAndAssertOk('/study-plan')

    await expect(page.getByRole('heading', { name: '3 sessions left this week' })).toBeVisible()
    await expect(page.getByText('Weekly target')).toBeVisible()
    await expect(page.getByText('Completed')).toBeVisible()
    await expect(page.getByText('Remaining')).toBeVisible()
    await expect(page.getByText('Priority Focus')).toBeVisible()
    await expect(
      page.getByText('Clarify the thesis in the introduction.').first()
    ).toBeVisible()
    await expect(page.getByText('This Week\'s Practice Blocks')).toBeVisible()
    await expect(page.getByText('Session 1')).toBeVisible()
  })
})
