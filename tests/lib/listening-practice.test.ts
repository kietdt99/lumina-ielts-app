import { describe, expect, it } from 'vitest'
import {
  filterListeningPracticeTracks,
  listeningPracticeTracks,
  parseListeningPracticeDifficultyFilter,
  parseListeningPracticeSectionFilter,
  parseListeningPracticeTopicFilter,
  scoreListeningPracticeAttempt,
  summarizeListeningPracticeTracks,
  toPublicListeningPracticeTrack,
} from '@/lib/ielts/listening-practice'

describe('listening practice domain', () => {
  it('filters tracks by section, difficulty, topic, and search', () => {
    const tracks = filterListeningPracticeTracks({
      section: 'Part 2',
      difficulty: 'Balanced',
      topic: 'Culture and community',
      query: 'museum',
    })

    expect(tracks.map((track) => track.id)).toEqual([
      'listening-museum-tour',
    ])
  })

  it('summarizes listening track coverage', () => {
    const summary = summarizeListeningPracticeTracks(listeningPracticeTracks)

    expect(summary.totalTracks).toBe(3)
    expect(summary.totalQuestions).toBe(15)
    expect(summary.topics).toBe(3)
  })

  it('strips answer keys from public tracks', () => {
    const publicTrack = toPublicListeningPracticeTrack(listeningPracticeTracks[0])

    expect(publicTrack.questions[0]).not.toHaveProperty('correctAnswer')
    expect(publicTrack.questions[0]).not.toHaveProperty('explanation')
    expect(publicTrack.questions[0].options).toContain('residents')
  })

  it('scores a completed listening attempt with explanations', () => {
    const track = listeningPracticeTracks[0]
    const result = scoreListeningPracticeAttempt({
      trackId: track.id,
      notes: 'membership free residents proof address ID study rooms printing',
      answers: Object.fromEntries(
        track.questions.map((question) => [
          question.id,
          question.correctAnswer,
        ])
      ),
    })

    expect(result.ok).toBe(true)
    expect(result.ok ? result.score.accuracy : 0).toBe(100)
    expect(result.ok ? result.score.status : '').toBe('strong-control')
    expect(result.ok ? result.score.questionResults[0].explanation : '').toContain(
      'local residents'
    )
  })

  it('returns useful failures for invalid payloads and filters', () => {
    expect(parseListeningPracticeSectionFilter('Part 5')).toBe('All')
    expect(parseListeningPracticeDifficultyFilter('Extreme')).toBe('All')
    expect(parseListeningPracticeTopicFilter('Unknown')).toBe('All topics')
    expect(scoreListeningPracticeAttempt({ trackId: 123, answers: {} })).toEqual({
      ok: false,
      error: 'Invalid listening practice payload.',
    })
    expect(scoreListeningPracticeAttempt({ trackId: 'missing', answers: {} })).toEqual({
      ok: false,
      error: 'The selected listening track could not be found.',
    })
  })
})
