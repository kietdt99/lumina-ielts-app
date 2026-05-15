import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from '@/app/api/reading-practice/route'
import { readingPracticePassages } from '@/lib/ielts/reading-practice'

const routeMocks = vi.hoisted(() => ({
  requireLearnerAppSession: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => ({
  requireLearnerAppSession: routeMocks.requireLearnerAppSession,
}))

function postReadingPractice(body: unknown) {
  return POST(
    new Request('http://localhost/api/reading-practice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  )
}

describe('reading practice route', () => {
  beforeEach(() => {
    routeMocks.requireLearnerAppSession.mockReset()
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })
  })

  it('returns filtered public reading passages for the current learner', async () => {
    const response = await GET(
      new Request(
        'http://localhost/api/reading-practice?difficulty=Balanced&topic=Environment%20and%20climate&query=cooling'
      )
    )
    const payload = (await response.json()) as {
      ok: boolean
      passages: Array<{
        id: string
        questions: Array<{ correctAnswer?: string; explanation?: string }>
      }>
      summary: { totalPassages: number }
      topics: string[]
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.passages.map((passage) => passage.id)).toEqual([
      'reading-urban-cooling-corridors',
    ])
    expect(payload.passages[0].questions[0]).not.toHaveProperty('correctAnswer')
    expect(payload.passages[0].questions[0]).not.toHaveProperty('explanation')
    expect(payload.summary.totalPassages).toBe(1)
    expect(payload.topics).toContain('Environment and climate')
    expect(routeMocks.requireLearnerAppSession).toHaveBeenCalled()
  })

  it('scores submitted reading answers', async () => {
    const passage = readingPracticePassages[0]
    const response = await postReadingPractice({
      passageId: passage.id,
      answers: Object.fromEntries(
        passage.questions.map((question) => [
          question.id,
          question.correctAnswer,
        ])
      ),
    })
    const payload = (await response.json()) as {
      ok: boolean
      score: { accuracy: number; correctAnswers: number; status: string }
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.score).toMatchObject({
      accuracy: 100,
      correctAnswers: passage.questions.length,
      status: 'strong-control',
    })
  })

  it('returns 400 when the request body is not valid JSON', async () => {
    const response = await postReadingPractice('{invalid json')
    const payload = (await response.json()) as { ok: boolean; error: string }

    expect(response.status).toBe(400)
    expect(payload).toEqual({
      ok: false,
      error: 'Request body must be valid JSON.',
    })
  })

  it('returns 404 when the passage is unknown', async () => {
    const response = await postReadingPractice({
      passageId: 'missing-passage',
      answers: {},
    })
    const payload = (await response.json()) as { ok: boolean; error: string }

    expect(response.status).toBe(404)
    expect(payload).toEqual({
      ok: false,
      error: 'The selected reading passage could not be found.',
    })
  })
})
