import { expect, test } from './fixtures'
import { writingMockTests } from '@/lib/ielts/mock-test-lab'
import { buildReadyDraft } from '../support/mock-test-drafts'

const selectedMockTest = writingMockTests.find(
  (mockTest) =>
    mockTest.id === 'mock-task1-energy-line-chart-task2-environment-responsibility'
)

if (!selectedMockTest) {
  throw new Error('Expected mock test fixture was not found.')
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

    const taskOneDraft = buildReadyDraft({
      minimumWords: selectedMockTest.taskOnePrompt.minimumWords,
      taskType: 'Task 1',
    })
    const taskTwoDraft = buildReadyDraft({
      minimumWords: selectedMockTest.taskTwoPrompt.minimumWords,
      taskType: 'Task 2',
    })

    await page.getByLabel('Task 1 draft').fill(taskOneDraft)
    await page.getByLabel('Task 2 draft').fill(taskTwoDraft)

    for (const checkpoint of selectedMockTest.checkpoints) {
      await page.getByLabel(`Mark ${checkpoint.label} done`).click()
    }

    await expect(page.getByLabel('Unmark Scan both tasks done')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await expect(page.getByText('Ready for feedback').first()).toBeVisible()
    await expect(page.getByLabel('Mock debrief')).toBeVisible()
    await expect(
      page.getByText('Ready to send both tasks for feedback')
    ).toBeVisible()

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

    const debriefResponse = await page.request.post('/api/mock-test/debrief', {
      data: {
        testId: selectedMockTest.id,
        taskOneDraft,
        taskTwoDraft,
        completedCheckpointIds: selectedMockTest.checkpoints.map(
          (checkpoint) => checkpoint.id
        ),
        remainingSeconds: 300,
      },
    })
    const debriefPayload = (await debriefResponse.json()) as {
      ok: boolean
      debrief: { status: string; checkpointCompletion: number }
    }

    expect(debriefResponse.ok()).toBe(true)
    expect(debriefPayload.ok).toBe(true)
    expect(debriefPayload.debrief.status).toBe('ready-for-feedback')
    expect(debriefPayload.debrief.checkpointCompletion).toBe(100)

    await page.getByRole('link', { name: 'Open Task 1 in Writing' }).click()
    await expect(page).toHaveURL(/\/writing\?promptId=task1-energy-line-chart$/)
    await expect(
      page.getByRole('heading', { name: 'Household energy use trends' })
    ).toBeVisible()
  })
})
