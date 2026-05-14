import { describe, expect, it } from 'vitest'
import {
  filterWritingPrompts,
  listWritingPromptTopics,
  parseWritingPromptDifficultyFilter,
  parseWritingPromptTaskFilter,
  summarizeWritingPrompts,
  writingPrompts,
} from '@/lib/ielts/writing-prompts'

describe('writing prompts', () => {
  it('summarizes the expanded owned prompt bank', () => {
    expect(summarizeWritingPrompts(writingPrompts)).toEqual({
      totalPrompts: 13,
      taskOnePrompts: 6,
      taskTwoPrompts: 7,
      guidedPrompts: 3,
      balancedPrompts: 6,
      stretchPrompts: 4,
      topics: 6,
    })
  })

  it('filters prompts by task, difficulty, topic, and search', () => {
    const prompts = filterWritingPrompts({
      taskType: 'Task 1',
      difficulty: 'Balanced',
      topic: 'Urban change and transport',
      query: 'map',
    })

    expect(prompts.map((prompt) => prompt.id)).toEqual(['task1-city-centre-map'])
  })

  it('lists all prompt topics with an all-topics option first', () => {
    const topics = listWritingPromptTopics(writingPrompts)

    expect(topics[0]).toBe('All topics')
    expect(topics).toEqual(
      expect.arrayContaining([
        'Education and technology',
        'Environment and climate',
        'Urban change and transport',
        'Work and society',
      ])
    )
  })

  it('falls back to broad filters for unsupported query params', () => {
    expect(parseWritingPromptTaskFilter('Speaking')).toBe('All')
    expect(parseWritingPromptDifficultyFilter('Extreme')).toBe('All')
  })
})
