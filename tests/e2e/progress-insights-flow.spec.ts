import {
  createStoredHistoryEntry,
  expect,
  seedLearnerGoals,
  seedWritingHistory,
  test,
} from './fixtures'

const coherenceFocusedRubric = [
  {
    label: 'Task Response',
    score: 7,
    summary: 'Task response is moving in the right direction.',
  },
  {
    label: 'Coherence and Cohesion',
    score: 6,
    summary: 'Coherence needs clearer paragraph progression.',
  },
  {
    label: 'Lexical Resource',
    score: 7,
    summary: 'Lexical resource is controlled.',
  },
  {
    label: 'Grammatical Range and Accuracy',
    score: 6.5,
    summary: 'Grammar control is improving.',
  },
]

test.describe('progress insights flow', () => {
  test('summarizes rubric gaps and next actions from saved writing history', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await seedLearnerGoals(page, {
      targetBand: 7.5,
      currentLevel: 'Band 6.0-6.5',
      focusSkill: 'Writing',
      studyFrequency: '4 sessions/week',
    })

    await seedWritingHistory(page, [
      createStoredHistoryEntry({
        id: 'entry-progress-newest',
        createdAt: '2026-05-14T10:00:00.000Z',
        estimatedBand: 7,
        rubric: coherenceFocusedRubric,
        priorities: ['Improve paragraph progression.', 'Add specific support.'],
      }),
      createStoredHistoryEntry({
        id: 'entry-progress-middle',
        createdAt: '2026-05-12T10:00:00.000Z',
        estimatedBand: 6.5,
        rubric: coherenceFocusedRubric,
        priorities: ['Improve paragraph progression.', 'Clarify the thesis.'],
      }),
      createStoredHistoryEntry({
        id: 'entry-progress-older',
        createdAt: '2026-05-01T10:00:00.000Z',
        estimatedBand: 6.5,
        rubric: coherenceFocusedRubric,
        priorities: ['Improve paragraph progression.'],
      }),
    ])

    await gotoAndAssertOk('/progress-insights')

    await expect(
      page.getByRole('heading', {
        name: 'Close a 0.8 band gap with focused practice',
      })
    ).toBeVisible()
    await expect(page.getByText('Rubric heatmap')).toBeVisible()
    await expect(page.getByText('Coherence and Cohesion').first()).toBeVisible()
    await expect(page.getByText('Improve paragraph progression.').first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Start action' }).first()).toHaveAttribute(
      'href',
      '/outline-builder'
    )

    await page.getByRole('link', { name: 'Open tracker' }).click()
    await expect(page).toHaveURL(/\/tracker$/)
    await expect(
      page.getByRole('heading', { name: 'See how your writing practice is evolving' })
    ).toBeVisible()
  })
})
