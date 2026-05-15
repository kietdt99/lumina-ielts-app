import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from '@/app/api/speaking-practice/route'
import { speakingPracticePrompts } from '@/lib/ielts/speaking-practice'
import { buildSpeakingTranscript } from '../../support/speaking-practice'

const routeMocks = vi.hoisted(() => ({
  requireLearnerAppSession: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => ({
  requireLearnerAppSession: routeMocks.requireLearnerAppSession,
}))

function postSpeakingPractice(body: unknown) {
  return POST(
    new Request('http://localhost/api/speaking-practice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  )
}

describe('speaking practice route', () => {
  beforeEach(() => {
    routeMocks.requireLearnerAppSession.mockReset()
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })
  })

  it('returns filtered speaking prompts for the current learner', async () => {
    const response = await GET(
      new Request(
        'http://localhost/api/speaking-practice?part=Part%202&difficulty=Balanced&topic=Technology%20and%20daily%20life&query=device'
      )
    )
    const payload = (await response.json()) as {
      ok: boolean
      prompts: Array<{ id: string }>
      summary: { totalPrompts: number }
      topics: string[]
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.prompts.map((prompt) => prompt.id)).toEqual([
      'speaking-part2-useful-device',
    ])
    expect(payload.summary.totalPrompts).toBe(1)
    expect(payload.topics).toContain('Technology and daily life')
    expect(routeMocks.requireLearnerAppSession).toHaveBeenCalled()
  })

  it('scores submitted speaking answers', async () => {
    const prompt = speakingPracticePrompts.find(
      (candidate) => candidate.id === 'speaking-part2-useful-device'
    )!
    const response = await postSpeakingPractice({
      promptId: prompt.id,
      transcript: buildSpeakingTranscript(prompt),
      completedCuePointIds: prompt.cuePoints.map((cuePoint) => cuePoint.id),
    })
    const payload = (await response.json()) as {
      ok: boolean
      score: { status: string; readinessScore: number; criteria: unknown[] }
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.score.status).toBe('strong-control')
    expect(payload.score.readinessScore).toBeGreaterThanOrEqual(75)
    expect(payload.score.criteria).toHaveLength(4)
  })

  it('returns 400 when the request body is not valid JSON', async () => {
    const response = await postSpeakingPractice('{invalid json')
    const payload = (await response.json()) as { ok: boolean; error: string }

    expect(response.status).toBe(400)
    expect(payload).toEqual({
      ok: false,
      error: 'Request body must be valid JSON.',
    })
  })

  it('returns 404 when the prompt is unknown', async () => {
    const response = await postSpeakingPractice({
      promptId: 'missing-prompt',
      transcript: '',
      completedCuePointIds: [],
    })
    const payload = (await response.json()) as { ok: boolean; error: string }

    expect(response.status).toBe(404)
    expect(payload).toEqual({
      ok: false,
      error: 'The selected speaking prompt could not be found.',
    })
  })
})
