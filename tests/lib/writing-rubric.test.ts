import { describe, expect, it } from 'vitest'
import {
  findRubricCriterion,
  getWritingRubric,
  summarizeWritingRubric,
  writingRubricCriteria,
} from '@/lib/ielts/writing-rubric'

describe('writing rubric', () => {
  it('returns task-specific criteria with shared language criteria', () => {
    const taskOneCriteria = getWritingRubric('Task 1')
    const taskTwoCriteria = getWritingRubric('Task 2')

    expect(taskOneCriteria.map((criterion) => criterion.name)).toContain(
      'Task Achievement'
    )
    expect(taskOneCriteria.map((criterion) => criterion.name)).not.toContain(
      'Task Response'
    )
    expect(taskTwoCriteria.map((criterion) => criterion.name)).toContain(
      'Task Response'
    )
    expect(taskTwoCriteria.map((criterion) => criterion.name)).not.toContain(
      'Task Achievement'
    )
    expect(taskOneCriteria.map((criterion) => criterion.name)).toContain(
      'Lexical Resource'
    )
    expect(taskTwoCriteria.map((criterion) => criterion.name)).toContain(
      'Grammatical Range and Accuracy'
    )
  })

  it('summarizes the rubric descriptor library', () => {
    const summary = summarizeWritingRubric(writingRubricCriteria)

    expect(summary.totalCriteria).toBe(5)
    expect(summary.totalDescriptors).toBe(20)
    expect(summary.taskOneCriteria).toBe(4)
    expect(summary.taskTwoCriteria).toBe(4)
  })

  it('finds a criterion only when it applies to the selected task', () => {
    expect(findRubricCriterion('task-achievement', 'Task 1')?.name).toBe(
      'Task Achievement'
    )
    expect(findRubricCriterion('task-achievement', 'Task 2')).toBeNull()
  })
})
