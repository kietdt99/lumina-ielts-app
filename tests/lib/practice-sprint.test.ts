import { describe, expect, it } from 'vitest'
import {
  filterPracticeSprints,
  listPracticeSprintTopics,
  parsePracticeSprintDifficultyFilter,
  parsePracticeSprintTaskFilter,
  parsePracticeSprintTopicFilter,
  practiceSprints,
  summarizePracticeSprints,
} from '@/lib/ielts/practice-sprint'

describe('practice sprint', () => {
  it('creates one sprint per owned writing prompt with attached learning content', () => {
    const summary = summarizePracticeSprints(practiceSprints)
    const remoteWorkSprint = practiceSprints.find(
      (sprint) => sprint.promptId === 'task2-remote-work'
    )

    expect(summary).toEqual({
      totalSprints: 13,
      taskOneSprints: 6,
      taskTwoSprints: 7,
      guidedSprints: 3,
      balancedSprints: 6,
      stretchSprints: 4,
      averageMinutes: 48,
    })
    expect(remoteWorkSprint).toEqual(
      expect.objectContaining({
        id: 'sprint-task2-remote-work',
        ideaBankTopic: 'Work and society',
        totalMinutes: 60,
      })
    )
    expect(remoteWorkSprint?.vocabularyCards.map((card) => card.term)).toContain(
      'workplace autonomy'
    )
    expect(remoteWorkSprint?.revisionFocus.length).toBe(3)
  })

  it('filters sprints by task, difficulty, topic, and search', () => {
    const sprints = filterPracticeSprints({
      taskType: 'Task 1',
      difficulty: 'Guided',
      topic: 'Process diagram',
      query: 'water',
    })

    expect(sprints.map((sprint) => sprint.id)).toEqual([
      'sprint-task1-cycle-diagram',
    ])
  })

  it('lists sprint topics with an all-topics option first', () => {
    expect(listPracticeSprintTopics(practiceSprints)).toContain('All topics')
    expect(listPracticeSprintTopics(practiceSprints)).toContain(
      'Urban change and transport'
    )
  })

  it('parses unsupported filters back to broad defaults', () => {
    expect(parsePracticeSprintTaskFilter('Speaking')).toBe('All')
    expect(parsePracticeSprintDifficultyFilter('Extreme')).toBe('All')
    expect(parsePracticeSprintTopicFilter('Unknown topic')).toBe('All topics')
  })
})
