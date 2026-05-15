import { expect, test } from './fixtures'
import { listeningPracticeTracks } from '@/lib/ielts/listening-practice'

const track = listeningPracticeTracks[1]

test.describe('listening practice flow', () => {
  test('lets learners simulate a listening track and review explanations', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/listening-practice')

    await expect(
      page.getByRole('heading', {
        name: 'Train IELTS Listening with replayable simulations',
      })
    ).toBeVisible()

    await page.getByLabel('Section').selectOption('Part 2')
    await page.getByLabel('Difficulty').selectOption('Balanced')
    await page.getByLabel('Topic focus').selectOption('Culture and community')
    await page.getByLabel('Search tracks').fill('museum')

    await expect(
      page.getByRole('heading', { name: 'Museum volunteer tour' }).first()
    ).toBeVisible()

    await page.getByRole('button', { name: 'Show full transcript' }).click()
    await expect(page.getByText('Welcome to the Riverside Museum')).toBeVisible()
    await page
      .getByLabel('Listening notes')
      .fill('entrance hall transport gallery glass cases river trade gift shop lift')

    for (const question of track.questions) {
      await page.getByLabel(question.prompt).selectOption(question.correctAnswer)
    }

    await page.getByRole('button', { name: 'Score listening answers' }).click()

    const scoreReport = page.locator('.reading-score-card').filter({
      hasText: 'Listening score report',
    })

    await expect(scoreReport.getByText('Listening score report')).toBeVisible()
    await expect(
      scoreReport.getByRole('heading', { name: 'Strong control' })
    ).toBeVisible()
    await expect(scoreReport.getByText('100%')).toBeVisible()
    await expect(page.getByText('Correct answer: Beside the gift shop')).toBeVisible()
    await expect(page.getByText('Recent Listening attempts')).toBeVisible()

    const listResponse = await page.request.get(
      '/api/listening-practice?section=Part%202&difficulty=Balanced&topic=Culture%20and%20community&query=museum'
    )
    const listPayload = (await listResponse.json()) as {
      ok: boolean
      tracks: Array<{ id: string; questions: Array<{ correctAnswer?: string }> }>
    }

    expect(listResponse.ok()).toBe(true)
    expect(listPayload.ok).toBe(true)
    expect(listPayload.tracks.map((item) => item.id)).toEqual([
      'listening-museum-tour',
    ])
    expect(listPayload.tracks[0].questions[0]).not.toHaveProperty(
      'correctAnswer'
    )

    const scoreResponse = await page.request.post('/api/listening-practice', {
      data: {
        trackId: track.id,
        notes: 'museum tour notes with gallery location and lift details',
        answers: Object.fromEntries(
          track.questions.map((question) => [
            question.id,
            question.correctAnswer,
          ])
        ),
      },
    })
    const scorePayload = (await scoreResponse.json()) as {
      ok: boolean
      score: { accuracy: number; status: string }
    }

    expect(scoreResponse.ok()).toBe(true)
    expect(scorePayload.ok).toBe(true)
    expect(scorePayload.score).toMatchObject({
      accuracy: 100,
      status: 'strong-control',
    })
  })
})
