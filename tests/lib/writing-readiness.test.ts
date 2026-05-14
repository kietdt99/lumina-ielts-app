import { describe, expect, it } from 'vitest'
import {
  createWritingReadiness,
  createWritingReadinessCheck,
} from '@/lib/ielts/writing-readiness'
import { writingPrompts } from '@/lib/ielts/writing-prompts'

const taskTwoPrompt = writingPrompts.find(
  (prompt) => prompt.id === 'task2-remote-work'
)!
const taskOnePrompt = writingPrompts.find(
  (prompt) => prompt.id === 'task1-cycle-diagram'
)!

describe('writing readiness', () => {
  it('marks an empty draft as missing core readiness checks', () => {
    const readiness = createWritingReadinessCheck(taskTwoPrompt, '')

    expect(readiness.readinessScore).toBe(0)
    expect(readiness.headline).toBe('Build the draft before requesting feedback')
    expect(readiness.items.map((item) => item.status)).toEqual(
      Array(6).fill('missing')
    )
  })

  it('detects a stronger Task 2 draft as mostly ready for feedback', () => {
    const draft = [
      'Remote work can improve productivity because employees protect focused time and avoid tiring commutes.',
      '',
      'For example, a software developer may complete complex tasks faster at home because fewer interruptions break concentration. Moreover, flexible schedules can help people work during their most productive hours.',
      '',
      'However, office work remains useful because new employees often need direct mentoring and quick informal feedback. Therefore, companies should create communication routines instead of assuming remote work succeeds automatically.',
      '',
      'In conclusion, remote work is productive when autonomy is balanced with accountability and clear team communication.',
    ].join('\n')

    const readiness = createWritingReadinessCheck(taskTwoPrompt, draft)

    expect(readiness.readinessScore).toBeGreaterThanOrEqual(80)
    expect(readiness.headline).toBe('Ready for practice feedback')
    expect(readiness.items.find((item) => item.id === 'task-focus')?.status).toBe(
      'ready'
    )
    expect(readiness.items.find((item) => item.id === 'paragraph-structure')?.status).toBe(
      'ready'
    )
  })

  it('uses a Task 1 overview signal for the task focus check', () => {
    const readiness = createWritingReadinessCheck(
      taskOnePrompt,
      [
        'The diagram illustrates how water is recycled in a modern city.',
        '',
        'Overall, the process begins with collection and ends with clean water being returned for reuse.',
        '',
        'In the first stages, used water is collected, filtered, and moved through treatment equipment.',
      ].join('\n')
    )

    expect(readiness.items.find((item) => item.id === 'task-focus')).toEqual(
      expect.objectContaining({
        label: 'Overview signal',
        status: 'ready',
      })
    )
  })

  it('validates readiness API payloads without requiring a non-empty draft', () => {
    expect(
      createWritingReadiness({
        promptId: 'task2-remote-work',
        draft: '',
      })
    ).toEqual(
      expect.objectContaining({
        ok: true,
      })
    )

    expect(createWritingReadiness({ promptId: 'missing', draft: '' })).toEqual({
      ok: false,
      error: 'The selected writing prompt could not be found.',
    })
  })
})
