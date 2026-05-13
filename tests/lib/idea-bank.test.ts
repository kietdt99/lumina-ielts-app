import { describe, expect, it } from 'vitest'
import {
  filterIdeaBankEntries,
  ideaBankEntries,
  parseIdeaBankTaskFilter,
  summarizeIdeaBank,
} from '@/lib/ielts/idea-bank'

describe('idea bank', () => {
  it('summarizes the product-owned idea bank content', () => {
    const summary = summarizeIdeaBank()

    expect(summary.totalTopics).toBe(ideaBankEntries.length)
    expect(summary.taskOneTopics).toBeGreaterThan(0)
    expect(summary.taskTwoTopics).toBeGreaterThan(0)
    expect(summary.vocabularyItems).toBeGreaterThan(10)
    expect(summary.collocationItems).toBeGreaterThan(10)
  })

  it('filters entries by query across topic, vocabulary, and idea text', () => {
    const results = filterIdeaBankEntries({ query: 'renewable energy' })

    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('environment-climate')
  })

  it('filters entries by task type', () => {
    const taskOneResults = filterIdeaBankEntries({ taskType: 'Task 1' })

    expect(taskOneResults.length).toBeGreaterThan(0)
    expect(taskOneResults.every((entry) => entry.taskTypes.includes('Task 1'))).toBe(true)
  })

  it('parses unsupported task filters as all topics', () => {
    expect(parseIdeaBankTaskFilter('Task 2')).toBe('Task 2')
    expect(parseIdeaBankTaskFilter('Speaking')).toBe('All')
    expect(parseIdeaBankTaskFilter(null)).toBe('All')
  })
})
