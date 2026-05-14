import { describe, expect, it } from 'vitest'
import {
  filterModelFragments,
  modelFragments,
  parseModelFragmentFunctionFilter,
  parseModelFragmentTaskFilter,
  summarizeModelFragments,
} from '@/lib/ielts/model-fragments'

describe('model fragments', () => {
  it('summarizes the model fragment library', () => {
    expect(summarizeModelFragments(modelFragments)).toEqual({
      totalFragments: 8,
      taskOneFragments: 4,
      taskTwoFragments: 5,
      functionTypes: 5,
    })
  })

  it('filters fragments by task type and writing function', () => {
    const fragments = filterModelFragments({
      taskType: 'Task 1',
      functionType: 'Overview',
    })

    expect(fragments).toHaveLength(1)
    expect(fragments[0]).toEqual(
      expect.objectContaining({
        id: 'task1-process-overview',
        title: 'Start-to-end overview',
      })
    )
  })

  it('searches fragments by topic, tags, and explanation text', () => {
    const fragments = filterModelFragments({
      query: 'counterpoint',
      taskType: 'Task 2',
    })

    expect(fragments.map((fragment) => fragment.id)).toEqual([
      'task2-counterpoint',
    ])
  })

  it('parses unsupported filters back to All', () => {
    expect(parseModelFragmentTaskFilter('Speaking')).toBe('All')
    expect(parseModelFragmentFunctionFilter('Full essay')).toBe('All')
  })
})
