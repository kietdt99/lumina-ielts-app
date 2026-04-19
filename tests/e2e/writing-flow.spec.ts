import {
  createStoredHistoryEntry,
  expect,
  seedWritingHistory,
  test,
} from './fixtures'

test.describe('writing flow', () => {
  test('saves a reviewed draft and exposes it in the tracker', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/writing')

    await page.getByLabel('Draft editor').fill(
      [
        'Remote work can improve productivity when teams have strong expectations.',
        'Employees often save commuting time and can protect focused blocks for deep work.',
        'However, managers still need clear communication rhythms and measurable goals.',
        'Overall, remote work is effective when it is supported by structure and accountability.',
      ].join('\n\n')
    )

    await page.getByRole('button', { name: 'Generate practice feedback' }).click()

    await expect(
      page.getByRole('heading', { name: 'Feedback Snapshot' })
    ).toBeVisible()
    await expect(page.getByText('Estimated band')).toBeVisible()
    await expect(page.getByText(/Practice result saved at/)).toBeVisible()

    await page.getByRole('link', { name: 'Score Tracker' }).click()
    await expect(page).toHaveURL(/\/tracker$/)
    await expect(
      page.getByRole('heading', { name: 'Practice history' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', {
        name: 'Remote work and employee productivity',
        exact: true,
      })
    ).toBeVisible()
  })

  test('shows a visible error state when the submissions API fails', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await page.route('**/api/writing/submissions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          error: 'Mocked API failure for browser coverage.',
        }),
      })
    })

    await gotoAndAssertOk('/writing')

    await page.getByLabel('Draft editor').fill('A complete draft that should trigger the mocked API failure.')
    await page.getByRole('button', { name: 'Generate practice feedback' }).click()

    const feedbackAlert = page.locator('.feedback-error[role="alert"]')

    await expect(feedbackAlert).toContainText('Practice review failed')
    await expect(feedbackAlert).toContainText(
      'Mocked API failure for browser coverage.'
    )
  })

  test('hydrates dashboard and tracker from saved history without runtime errors', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await seedWritingHistory(page, [
      createStoredHistoryEntry(),
      createStoredHistoryEntry({
        id: 'entry-2',
        promptId: 'task1-cycle-diagram',
        promptTitle: 'Water recycling process',
        taskType: 'Task 1',
        createdAt: '2026-03-31T11:00:00.000Z',
        estimatedBand: 6.5,
        wordCount: 190,
        draftExcerpt: 'A concise Task 1 excerpt',
        strengths: ['The overview is clear.'],
        priorities: ['Group the middle stages more clearly.'],
      }),
    ])

    await gotoAndAssertOk('/')
    await expect(page.getByText('You have completed 2 tracked writing sessions.')).toBeVisible()
    await expect(
      page.getByRole('heading', {
        name: 'Water recycling process',
        exact: true,
      })
    ).toBeVisible()

    await gotoAndAssertOk('/tracker')
    await expect(page.getByText('Saved sessions')).toBeVisible()
    await expect(
      page.getByRole('heading', {
        name: 'Water recycling process',
        exact: true,
      })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', {
        name: 'Remote work and employee productivity',
        exact: true,
      })
    ).toBeVisible()
  })

  test('opens a dedicated submission detail page from the tracker', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await seedWritingHistory(page, [
      createStoredHistoryEntry({
        id: 'entry-detail',
        promptTitle: 'AI tools in school education',
        estimatedBand: 7.5,
        priorities: ['Clarify the thesis in the introduction.'],
      }),
    ])

    await gotoAndAssertOk('/tracker')
    await page.getByRole('link', { name: 'Open full detail page' }).click()

    await expect(page).toHaveURL(/\/tracker\/entry-detail$/)
    await expect(
      page.getByRole('heading', { name: 'AI tools in school education' })
    ).toBeVisible()
    await expect(page.getByText('Rubric breakdown')).toBeVisible()
    await expect(page.getByText('Clarify the thesis in the introduction.')).toBeVisible()
  })
})
