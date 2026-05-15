import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from '@/app/api/listening-practice/route'
import { listeningPracticeTracks } from '@/lib/ielts/listening-practice'

const routeMocks = vi.hoisted(() => ({
  requireLearnerAppSession: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => ({
  requireLearnerAppSession: routeMocks.requireLearnerAppSession,
}))

function postListeningPractice(body: unknown) {
  return POST(
    new Request('http://localhost/api/listening-practice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  )
}

describe('listening practice route', () => {
  beforeEach(() => {
    routeMocks.requireLearnerAppSession.mockReset()
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })
  })

  it('returns filtered public listening tracks for the current learner', async () => {
    const response = await GET(
      new Request(
        'http://localhost/api/listening-practice?section=Part%202&difficulty=Balanced&topic=Culture%20and%20community&query=museum'
      )
    )
    const payload = (await response.json()) as {
      ok: boolean
      tracks: Array<{
        id: string
        questions: Array<{ correctAnswer?: string; explanation?: string }>
      }>
      summary: { totalTracks: number }
      topics: string[]
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.tracks.map((track) => track.id)).toEqual([
      'listening-museum-tour',
    ])
    expect(payload.tracks[0].questions[0]).not.toHaveProperty('correctAnswer')
    expect(payload.tracks[0].questions[0]).not.toHaveProperty('explanation')
    expect(payload.summary.totalTracks).toBe(1)
    expect(payload.topics).toContain('Culture and community')
    expect(routeMocks.requireLearnerAppSession).toHaveBeenCalled()
  })

  it('scores submitted listening answers', async () => {
    const track = listeningPracticeTracks[0]
    const response = await postListeningPractice({
      trackId: track.id,
      notes: 'library membership residents address rooms printing',
      answers: Object.fromEntries(
        track.questions.map((question) => [
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
      correctAnswers: track.questions.length,
      status: 'strong-control',
    })
  })

  it('returns 400 when the request body is not valid JSON', async () => {
    const response = await postListeningPractice('{invalid json')
    const payload = (await response.json()) as { ok: boolean; error: string }

    expect(response.status).toBe(400)
    expect(payload).toEqual({
      ok: false,
      error: 'Request body must be valid JSON.',
    })
  })

  it('returns 404 when the track is unknown', async () => {
    const response = await postListeningPractice({
      trackId: 'missing-track',
      answers: {},
    })
    const payload = (await response.json()) as { ok: boolean; error: string }

    expect(response.status).toBe(404)
    expect(payload).toEqual({
      ok: false,
      error: 'The selected listening track could not be found.',
    })
  })
})
