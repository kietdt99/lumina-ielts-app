import {
  createStoredHistoryEntry,
  expect,
  seedLearnerGoals,
  seedWritingHistory,
  test,
} from './fixtures'

test.describe('tracker insights', () => {
  test('shows coaching insights from learner goals and filtered history', async ({
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
        id: 'entry-task-2',
        taskType: 'Task 2',
        estimatedBand: 7,
        priorities: ['Clarify the thesis in the introduction.'],
      }),
      createStoredHistoryEntry({
        id: 'entry-task-1',
        taskType: 'Task 1',
        promptId: 'task1-cycle-diagram',
        promptTitle: 'Water recycling process',
        estimatedBand: 6.5,
        priorities: ['Group the middle stages more clearly.'],
      }),
    ])

    await gotoAndAssertOk('/tracker')

    await expect(page.getByText('Target Gap')).toBeVisible()
    await expect(page.getByText('Recurring Focus')).toBeVisible()
    await expect(
      page.locator('.dashboard-card').filter({
        hasText: 'Recurring Focus',
      })
    ).toContainText('Clarify the thesis in the introduction.')

    await page.getByRole('button', { name: 'Task 1', exact: true }).click()

    await expect(
      page.locator('.dashboard-card').filter({
        hasText: 'Recurring Focus',
      })
    ).toContainText('Group the middle stages more clearly.')
  })
})
