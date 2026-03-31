import { describe, expect, it } from 'vitest'
import { POST } from '@/app/api/writing/submissions/route'

describe('POST /api/writing/submissions', () => {
  it('returns a feedback payload for a valid writing submission', async () => {
    const request = new Request('http://localhost/api/writing/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promptId: 'task2-remote-work',
        draft: [
          'Remote work can improve productivity because staff have more control over their schedule.',
          '',
          'However, managers still need clear communication systems to keep teams aligned.',
          '',
          'In conclusion, remote work succeeds when businesses combine flexibility with accountability.',
        ].join('\n'),
      }),
    })

    const response = await POST(request)
    const payload = (await response.json()) as {
      ok: boolean
      feedback?: { rubric: unknown[] }
      historyEntry?: { promptId: string }
    }

    expect(response.status).toBe(201)
    expect(payload.ok).toBe(true)
    expect(payload.historyEntry?.promptId).toBe('task2-remote-work')
    expect(payload.feedback?.rubric).toHaveLength(4)
  })

  it('returns 400 when the request body is not valid JSON', async () => {
    const request = new Request('http://localhost/api/writing/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{invalid json',
    })

    const response = await POST(request)
    const payload = (await response.json()) as { ok: boolean; error: string }

    expect(response.status).toBe(400)
    expect(payload).toEqual({
      ok: false,
      error: 'Request body must be valid JSON.',
    })
  })

  it('returns 404 when the prompt does not exist', async () => {
    const request = new Request('http://localhost/api/writing/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promptId: 'missing-prompt',
        draft: 'A short but valid draft body.',
      }),
    })

    const response = await POST(request)
    const payload = (await response.json()) as { ok: boolean; error: string }

    expect(response.status).toBe(404)
    expect(payload).toEqual({
      ok: false,
      error: 'The selected writing prompt could not be found.',
    })
  })
})
