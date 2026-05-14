import { describe, expect, it } from 'vitest'
import {
  filterMistakeTaxonomy,
  parseMistakeTaxonomyCriterionFilter,
  parseMistakeTaxonomyTaskFilter,
  summarizeMistakeTaxonomy,
  writingMistakeTaxonomy,
} from '@/lib/ielts/mistake-taxonomy'

describe('mistake taxonomy', () => {
  it('summarizes the product-owned mistake library', () => {
    const summary = summarizeMistakeTaxonomy(writingMistakeTaxonomy)

    expect(summary).toEqual({
      totalItems: 8,
      taskOneItems: 6,
      taskTwoItems: 6,
      criteriaCovered: 5,
      drills: 8,
    })
  })

  it('filters Task 1 task achievement patterns', () => {
    const items = filterMistakeTaxonomy({
      taskType: 'Task 1',
      criterion: 'Task Achievement',
    })

    expect(items.map((item) => item.code)).toEqual([
      'task1-missing-overview',
      'task1-detail-dump',
    ])
  })

  it('searches revision symptoms across hints and examples', () => {
    const items = filterMistakeTaxonomy({ query: 'linking' })

    expect(items.map((item) => item.code)).toContain('mechanical-cohesion')
  })

  it('falls back to broad filters for unsupported query params', () => {
    expect(parseMistakeTaxonomyTaskFilter('Speaking')).toBe('All')
    expect(parseMistakeTaxonomyCriterionFilter('Fluency')).toBe('All')
  })
})
