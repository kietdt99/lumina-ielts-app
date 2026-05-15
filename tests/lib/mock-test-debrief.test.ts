import { describe, expect, it } from 'vitest'
import { createMockTestDebrief } from '@/lib/ielts/mock-test-debrief'
import { writingMockTests } from '@/lib/ielts/mock-test-lab'
import { buildReadyDraft } from '../support/mock-test-drafts'

const [mockTest] = writingMockTests

describe('createMockTestDebrief', () => {
  it('guides learners before they start the mock test', () => {
    const debrief = createMockTestDebrief({
      test: mockTest,
    })

    expect(debrief.status).toBe('not-started')
    expect(debrief.statusLabel).toBe('Not started')
    expect(debrief.totalWordCount).toBe(0)
    expect(debrief.priorityTask?.taskType).toBe('Task 2')
    expect(debrief.nextActions).toContain(
      'Finish Task 1 word target before polishing Task 2.'
    )
    expect(debrief.nextActions).toContain(
      'Finish Task 2 word target before treating the mock as complete.'
    )
  })

  it('prioritizes the task with the largest completion risk', () => {
    const debrief = createMockTestDebrief({
      test: mockTest,
      taskOneDraft: buildReadyDraft({
        minimumWords: mockTest.taskOnePrompt.minimumWords,
        taskType: 'Task 1',
      }),
      taskTwoDraft: 'In conclusion, this essay has only a short plan.',
      completedCheckpointIds: ['scan-prompts'],
      remainingSeconds: 0,
    })

    expect(debrief.status).toBe('incomplete')
    expect(debrief.timeStatus).toBe('rushed')
    expect(debrief.priorityTask?.taskType).toBe('Task 2')
    expect(debrief.nextActions).toContain(
      'Finish Task 2 word target before treating the mock as complete.'
    )
  })

  it('marks a complete mock as ready for feedback', () => {
    const debrief = createMockTestDebrief({
      test: mockTest,
      taskOneDraft: buildReadyDraft({
        minimumWords: mockTest.taskOnePrompt.minimumWords,
        taskType: 'Task 1',
      }),
      taskTwoDraft: buildReadyDraft({
        minimumWords: mockTest.taskTwoPrompt.minimumWords,
        taskType: 'Task 2',
      }),
      completedCheckpointIds: mockTest.checkpoints.map((checkpoint) => checkpoint.id),
      remainingSeconds: 240,
    })

    expect(debrief.status).toBe('ready-for-feedback')
    expect(debrief.statusLabel).toBe('Ready for feedback')
    expect(debrief.priorityTask).toBeNull()
    expect(debrief.checkpointCompletion).toBe(100)
    expect(debrief.completionScore).toBeGreaterThanOrEqual(85)
    expect(debrief.nextActions).toEqual([
      'Submit each task in Writing for feedback, then review the results in Revision Studio.',
    ])
  })
})
