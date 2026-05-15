import { describe, expect, it } from 'vitest'
import {
  filterSpeakingPracticePrompts,
  parseSpeakingPracticeDifficultyFilter,
  parseSpeakingPracticePartFilter,
  parseSpeakingPracticeTopicFilter,
  scoreSpeakingPracticeAttempt,
  speakingPracticePrompts,
  summarizeSpeakingPracticePrompts,
} from '@/lib/ielts/speaking-practice'
import { buildSpeakingTranscript } from '../support/speaking-practice'

describe('speaking practice domain', () => {
  it('filters prompts by part, difficulty, topic, and search', () => {
    const prompts = filterSpeakingPracticePrompts({
      part: 'Part 2',
      difficulty: 'Balanced',
      topic: 'Technology and daily life',
      query: 'device',
    })

    expect(prompts.map((prompt) => prompt.id)).toEqual([
      'speaking-part2-useful-device',
    ])
  })

  it('summarizes speaking prompt coverage', () => {
    const summary = summarizeSpeakingPracticePrompts(speakingPracticePrompts)

    expect(summary.totalPrompts).toBe(4)
    expect(summary.balancedPrompts).toBe(2)
    expect(summary.topics).toBe(4)
  })

  it('scores a controlled answer with rubric criteria and next actions', () => {
    const prompt = speakingPracticePrompts.find(
      (candidate) => candidate.id === 'speaking-part2-useful-device'
    )

    expect(prompt).toBeDefined()

    const result = scoreSpeakingPracticeAttempt({
      promptId: prompt?.id,
      transcript: buildSpeakingTranscript(prompt!),
      completedCuePointIds: prompt?.cuePoints.map((cuePoint) => cuePoint.id),
    })

    expect(result.ok).toBe(true)
    expect(result.ok ? result.score.status : '').toBe('strong-control')
    expect(result.ok ? result.score.estimatedBand : 0).toBeGreaterThanOrEqual(7)
    expect(result.ok ? result.score.criteria : []).toHaveLength(4)
  })

  it('flags short answers with missing cue coverage', () => {
    const prompt = speakingPracticePrompts[0]
    const result = scoreSpeakingPracticeAttempt({
      promptId: prompt.id,
      transcript: 'I prefer studying alone because it is quiet.',
      completedCuePointIds: [],
    })

    expect(result.ok).toBe(true)
    expect(result.ok ? result.score.status : '').toBe('needs-practice')
    expect(result.ok ? result.score.nextActions : []).toContain(
      'Cover every cue point before moving to follow-up questions.'
    )
  })

  it('returns useful fallbacks for invalid filters and payloads', () => {
    expect(parseSpeakingPracticePartFilter('Part 4')).toBe('All')
    expect(parseSpeakingPracticeDifficultyFilter('Extreme')).toBe('All')
    expect(parseSpeakingPracticeTopicFilter('Unknown')).toBe('All topics')
    expect(scoreSpeakingPracticeAttempt({ promptId: 123, transcript: '' })).toEqual({
      ok: false,
      error: 'Invalid speaking practice payload.',
    })
    expect(
      scoreSpeakingPracticeAttempt({ promptId: 'missing', transcript: '' })
    ).toEqual({
      ok: false,
      error: 'The selected speaking prompt could not be found.',
    })
  })
})
