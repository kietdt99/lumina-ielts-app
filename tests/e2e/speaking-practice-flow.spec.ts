import { expect, test } from './fixtures'
import { speakingPracticePrompts } from '@/lib/ielts/speaking-practice'
import { buildSpeakingTranscript } from '../support/speaking-practice'

const prompt = speakingPracticePrompts.find(
  (candidate) => candidate.id === 'speaking-part2-useful-device'
)

if (!prompt) {
  throw new Error('Expected speaking prompt fixture was not found.')
}

test.describe('speaking practice flow', () => {
  test('lets learners rehearse a speaking cue card and review feedback', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/speaking-practice')

    await expect(
      page.getByRole('heading', {
        name: 'Train IELTS Speaking with cue-card drills',
      })
    ).toBeVisible()

    await page.getByLabel('Part').selectOption('Part 2')
    await page.getByLabel('Difficulty').selectOption('Balanced')
    await page.getByLabel('Topic focus').selectOption('Technology and daily life')
    await page.getByLabel('Search prompts').fill('device')

    await expect(
      page.getByRole('heading', { name: 'A useful device' }).first()
    ).toBeVisible()

    for (const cuePoint of prompt.cuePoints) {
      await page.getByLabel(`Mark ${cuePoint.label} covered`).click()
    }

    const transcript = buildSpeakingTranscript(prompt)
    await page.getByLabel('Speaking transcript').fill(transcript)
    await page.getByRole('button', { name: 'Score speaking answer' }).click()

    const scoreReport = page.locator('.reading-score-card').filter({
      hasText: 'Speaking score report',
    })

    await expect(scoreReport.getByText('Speaking score report')).toBeVisible()
    await expect(
      scoreReport.getByRole('heading', { name: 'Strong control' })
    ).toBeVisible()
    await expect(scoreReport.getByText('Estimated band')).toBeVisible()
    await expect(page.getByText('Recent Speaking attempts')).toBeVisible()

    const listResponse = await page.request.get(
      '/api/speaking-practice?part=Part%202&difficulty=Balanced&topic=Technology%20and%20daily%20life&query=device'
    )
    const listPayload = (await listResponse.json()) as {
      ok: boolean
      prompts: Array<{ id: string }>
    }

    expect(listResponse.ok()).toBe(true)
    expect(listPayload.ok).toBe(true)
    expect(listPayload.prompts.map((item) => item.id)).toEqual([
      'speaking-part2-useful-device',
    ])

    const scoreResponse = await page.request.post('/api/speaking-practice', {
      data: {
        promptId: prompt.id,
        transcript,
        completedCuePointIds: prompt.cuePoints.map((cuePoint) => cuePoint.id),
      },
    })
    const scorePayload = (await scoreResponse.json()) as {
      ok: boolean
      score: { status: string; readinessScore: number }
    }

    expect(scoreResponse.ok()).toBe(true)
    expect(scorePayload.ok).toBe(true)
    expect(scorePayload.score.status).toBe('strong-control')
    expect(scorePayload.score.readinessScore).toBeGreaterThanOrEqual(75)
  })
})
