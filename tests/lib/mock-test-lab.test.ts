import { describe, expect, it } from 'vitest'
import {
  filterWritingMockTests,
  listWritingMockTestTopics,
  parseMockTestDifficultyFilter,
  parseMockTestTopicFilter,
  summarizeWritingMockTests,
  writingMockTests,
} from '@/lib/ielts/mock-test-lab'

describe('mock test lab', () => {
  it('creates exam-style Task 1 and Task 2 mock test pairs', () => {
    const summary = summarizeWritingMockTests(writingMockTests)
    const environmentTest = writingMockTests.find(
      (test) =>
        test.id ===
        'mock-task1-energy-line-chart-task2-environment-responsibility'
    )

    expect(summary).toEqual({
      totalTests: 6,
      guidedTests: 1,
      balancedTests: 3,
      stretchTests: 2,
      averageMinutes: 60,
      topics: 4,
    })
    expect(environmentTest).toEqual(
      expect.objectContaining({
        difficulty: 'Balanced',
        topicPair: 'Environment and climate',
        totalMinutes: 60,
        totalMinimumWords: 400,
      })
    )
    expect(environmentTest?.checkpoints.map((checkpoint) => checkpoint.id)).toEqual([
      'scan-prompts',
      'finish-task-1',
      'lock-task-2-plan',
      'finish-task-2',
      'final-check',
    ])
  })

  it('filters mock tests by difficulty, topic, and query', () => {
    const tests = filterWritingMockTests({
      difficulty: 'Balanced',
      topic: 'Environment and climate',
      query: 'energy',
    })

    expect(tests.map((test) => test.id)).toEqual([
      'mock-task1-energy-line-chart-task2-environment-responsibility',
    ])
  })

  it('lists topics with an all-topics option first', () => {
    expect(listWritingMockTestTopics(writingMockTests)[0]).toBe('All topics')
    expect(listWritingMockTestTopics(writingMockTests)).toContain(
      'Environment and climate'
    )
  })

  it('parses unsupported filters back to broad defaults', () => {
    expect(parseMockTestDifficultyFilter('Extreme')).toBe('All')
    expect(parseMockTestTopicFilter('Unknown topic')).toBe('All topics')
  })
})
