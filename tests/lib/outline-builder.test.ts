import { describe, expect, it } from 'vitest'
import {
  createOutlineLibrary,
  createWritingOutline,
  findBestIdeaBankEntry,
} from '@/lib/ielts/outline-builder'
import { ideaBankEntries } from '@/lib/ielts/idea-bank'
import { writingPrompts } from '@/lib/ielts/writing-prompts'

describe('outline builder', () => {
  it('matches a Task 2 prompt with the closest idea bank topic', () => {
    const prompt = writingPrompts.find((item) => item.id === 'task2-remote-work')

    expect(prompt).toBeDefined()
    expect(findBestIdeaBankEntry(prompt!, ideaBankEntries)?.id).toBe('work-society')
  })

  it('creates a Task 2 argument outline with body paragraphs and vocabulary', () => {
    const prompt = writingPrompts.find((item) => item.id === 'task2-ai-education')
    const outline = createWritingOutline(prompt!)

    expect(outline.headline).toBe('Plan a focused Task 2 argument')
    expect(outline.ideaBankTopic).toBe('Education and technology')
    expect(outline.blocks.map((block) => block.id)).toEqual([
      'introduction',
      'body-1',
      'body-2',
      'conclusion',
    ])
    expect(outline.vocabulary).toContain('personalized learning')
    expect(outline.thesisFrame).toContain('access versus distraction')
  })

  it('creates a Task 1 reporting outline with overview and detail groups', () => {
    const prompt = writingPrompts.find((item) => item.id === 'task1-cycle-diagram')
    const outline = createWritingOutline(prompt!)

    expect(outline.headline).toBe('Plan a clear Task 1 response')
    expect(outline.blocks.map((block) => block.id)).toEqual([
      'introduction',
      'overview',
      'detail-group-1',
      'detail-group-2',
    ])
    expect(outline.thesisFrame).toContain('main stages')
    expect(outline.collocations.length).toBeGreaterThan(0)
  })

  it('creates one outline per available writing prompt', () => {
    const outlines = createOutlineLibrary(writingPrompts)

    expect(outlines).toHaveLength(writingPrompts.length)
    expect(outlines.map((outline) => outline.promptId)).toEqual(
      writingPrompts.map((prompt) => prompt.id)
    )
  })
})
