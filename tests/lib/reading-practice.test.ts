import { describe, expect, it } from 'vitest'
import {
  filterReadingPracticePassages,
  parseReadingPracticeDifficultyFilter,
  parseReadingPracticeTopicFilter,
  readingPracticePassages,
  scoreReadingPracticeAttempt,
  summarizeReadingPracticePassages,
  toPublicReadingPracticePassage,
} from '@/lib/ielts/reading-practice'

describe('reading practice domain', () => {
  it('filters reading passages by difficulty, topic, and search', () => {
    const passages = filterReadingPracticePassages({
      difficulty: 'Balanced',
      topic: 'Environment and climate',
      query: 'cooling',
    })

    expect(passages.map((passage) => passage.id)).toEqual([
      'reading-urban-cooling-corridors',
    ])
  })

  it('summarizes passage coverage for the workspace hero', () => {
    const summary = summarizeReadingPracticePassages(readingPracticePassages)

    expect(summary.totalPassages).toBe(3)
    expect(summary.totalQuestions).toBe(15)
    expect(summary.topics).toBe(3)
  })

  it('strips answer keys from public passages', () => {
    const publicPassage = toPublicReadingPracticePassage(readingPracticePassages[0])

    expect(publicPassage.questions[0]).not.toHaveProperty('correctAnswer')
    expect(publicPassage.questions[0]).not.toHaveProperty('explanation')
    expect(publicPassage.questions[0].options).toContain(
      'To explain one planning response to urban heat'
    )
  })

  it('scores a completed reading attempt with explanations and next actions', () => {
    const passage = readingPracticePassages[0]
    const result = scoreReadingPracticeAttempt({
      passageId: passage.id,
      answers: Object.fromEntries(
        passage.questions.map((question) => [
          question.id,
          question.correctAnswer,
        ])
      ),
    })

    expect(result.ok).toBe(true)
    expect(result.ok ? result.score.accuracy : 0).toBe(100)
    expect(result.ok ? result.score.status : '').toBe('strong-control')
    expect(result.ok ? result.score.questionResults[0].explanation : '').toContain(
      'planning response'
    )
  })

  it('returns useful failures for invalid payloads and unsupported filters', () => {
    expect(parseReadingPracticeDifficultyFilter('Extreme')).toBe('All')
    expect(parseReadingPracticeTopicFilter('Unknown')).toBe('All topics')
    expect(scoreReadingPracticeAttempt({ passageId: 123, answers: {} })).toEqual({
      ok: false,
      error: 'Invalid reading practice payload.',
    })
    expect(
      scoreReadingPracticeAttempt({ passageId: 'missing', answers: {} })
    ).toEqual({
      ok: false,
      error: 'The selected reading passage could not be found.',
    })
  })
})
