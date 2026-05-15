import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/mock-test/debrief/route'
import { writingMockTests } from '@/lib/ielts/mock-test-lab'
import { buildReadyDraft } from '../../support/mock-test-drafts'

const routeMocks = vi.hoisted(() => ({
  requireLearnerAppSession: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => ({
  requireLearnerAppSession: routeMocks.requireLearnerAppSession,
}))

const mockTest = writingMockTests[0]

function postDebrief(body: unknown) {
  return POST(
    new Request('http://localhost/api/mock-test/debrief', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  )
}

describe('mock test debrief route', () => {
  beforeEach(() => {
    routeMocks.requireLearnerAppSession.mockReset()
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })
  })

  it('returns a debrief for a completed mock test', async () => {
    const response = await postDebrief({
      testId: mockTest.id,
      taskOneDraft: buildReadyDraft({
        minimumWords: mockTest.taskOnePrompt.minimumWords,
        taskType: 'Task 1',
      }),
      taskTwoDraft: buildReadyDraft({
        minimumWords: mockTest.taskTwoPrompt.minimumWords,
        taskType: 'Task 2',
      }),
      completedCheckpointIds: mockTest.checkpoints.map((checkpoint) => checkpoint.id),
      remainingSeconds: 300,
    })
    const payload = (await response.json()) as {
      ok: boolean
      debrief: { status: string; checkpointCompletion: number }
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.debrief.status).toBe('ready-for-feedback')
    expect(payload.debrief.checkpointCompletion).toBe(100)
    expect(routeMocks.requireLearnerAppSession).toHaveBeenCalled()
  })

  it('returns 400 when the request body is not valid JSON', async () => {
    const response = await postDebrief('{invalid json')
    const payload = (await response.json()) as { ok: boolean; error: string }

    expect(response.status).toBe(400)
    expect(payload).toEqual({
      ok: false,
      error: 'Request body must be valid JSON.',
    })
  })

  it('returns 400 when the payload shape is invalid', async () => {
    const response = await postDebrief({
      testId: mockTest.id,
      taskOneDraft: '',
      taskTwoDraft: '',
      completedCheckpointIds: ['scan-prompts'],
      remainingSeconds: 'soon',
    })
    const payload = (await response.json()) as { ok: boolean; error: string }

    expect(response.status).toBe(400)
    expect(payload).toEqual({
      ok: false,
      error: 'Invalid mock test debrief payload.',
    })
  })

  it('returns 404 when the mock test does not exist', async () => {
    const response = await postDebrief({
      testId: 'missing-test',
      taskOneDraft: '',
      taskTwoDraft: '',
      completedCheckpointIds: [],
    })
    const payload = (await response.json()) as { ok: boolean; error: string }

    expect(response.status).toBe(404)
    expect(payload).toEqual({
      ok: false,
      error: 'Mock test not found.',
    })
  })
})
