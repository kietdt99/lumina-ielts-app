import { expect, test } from './fixtures'
import { readingPracticePassages } from '@/lib/ielts/reading-practice'

const passage = readingPracticePassages[0]

test.describe('reading practice flow', () => {
  test('lets learners answer a reading passage and review explanations', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/reading-practice')

    await expect(
      page.getByRole('heading', {
        name: 'Train IELTS Reading with instant explanations',
      })
    ).toBeVisible()

    await page.getByLabel('Difficulty').selectOption('Balanced')
    await page.getByLabel('Topic focus').selectOption('Environment and climate')
    await page.getByLabel('Search passages').fill('cooling')

    await expect(
      page.getByRole('heading', { name: 'Urban cooling corridors' }).first()
    ).toBeVisible()

    for (const question of passage.questions) {
      await page.getByLabel(question.prompt).selectOption(question.correctAnswer)
    }

    await page.getByRole('button', { name: 'Score reading answers' }).click()

    const scoreReport = page.locator('.reading-score-card').filter({
      hasText: 'Reading score report',
    })

    await expect(scoreReport.getByText('Reading score report')).toBeVisible()
    await expect(
      scoreReport.getByRole('heading', { name: 'Strong control' })
    ).toBeVisible()
    await expect(scoreReport.getByText('100%')).toBeVisible()
    await expect(page.getByText('Correct answer: sea breezes')).toBeVisible()
    await expect(page.getByText('Recent Reading attempts')).toBeVisible()

    await gotoAndAssertOk('/')
    await expect(page.getByText('Recent Skill Attempts')).toBeVisible()
    await expect(page.getByText('Urban cooling corridors')).toBeVisible()

    const listResponse = await page.request.get(
      '/api/reading-practice?difficulty=Balanced&topic=Environment%20and%20climate&query=cooling'
    )
    const listPayload = (await listResponse.json()) as {
      ok: boolean
      passages: Array<{ id: string; questions: Array<{ correctAnswer?: string }> }>
    }

    expect(listResponse.ok()).toBe(true)
    expect(listPayload.ok).toBe(true)
    expect(listPayload.passages.map((item) => item.id)).toEqual([
      'reading-urban-cooling-corridors',
    ])
    expect(listPayload.passages[0].questions[0]).not.toHaveProperty(
      'correctAnswer'
    )

    const scoreResponse = await page.request.post('/api/reading-practice', {
      data: {
        passageId: passage.id,
        answers: Object.fromEntries(
          passage.questions.map((question) => [
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
