import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearPracticeAttemptHistory,
  createListeningPracticeAttemptHistoryEntry,
  createReadingPracticeAttemptHistoryEntry,
  createSpeakingPracticeAttemptHistoryEntry,
  getPracticeAttemptHistorySnapshot,
  getServerPracticeAttemptHistorySnapshot,
  savePracticeAttemptHistoryEntry,
  subscribeToPracticeAttemptHistory,
  type PracticeAttemptHistoryEntry,
} from '@/lib/ielts/practice-attempt-history'
import {
  listeningPracticeTracks,
  scoreListeningPracticeAttempt,
} from '@/lib/ielts/listening-practice'
import {
  readingPracticePassages,
  scoreReadingPracticeAttempt,
} from '@/lib/ielts/reading-practice'
import {
  scoreSpeakingPracticeAttempt,
  speakingPracticePrompts,
} from '@/lib/ielts/speaking-practice'
import { buildSpeakingTranscript } from '../support/speaking-practice'

function createAttempt(
  overrides: Partial<PracticeAttemptHistoryEntry> = {}
): PracticeAttemptHistoryEntry {
  return {
    id: 'attempt-1',
    skill: 'Reading',
    itemId: 'item-1',
    itemTitle: 'Practice item',
    topic: 'Practice topic',
    difficulty: 'Balanced',
    createdAt: '2026-03-31T10:00:00.000Z',
    estimatedBand: 7,
    statusLabel: 'Strong control',
    summary: 'A saved practice summary.',
    nextActions: ['Repeat under time pressure.'],
    metricLabel: 'Accuracy',
    metricValue: '100%',
    ...overrides,
  }
}

describe('practice attempt history store', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.useRealTimers()
  })

  it('returns a stable empty snapshot when no local history exists', () => {
    const serverSnapshot = getServerPracticeAttemptHistorySnapshot()
    const firstSnapshot = getPracticeAttemptHistorySnapshot()
    const secondSnapshot = getPracticeAttemptHistorySnapshot()

    expect(serverSnapshot).toEqual([])
    expect(firstSnapshot).toEqual([])
    expect(firstSnapshot).toBe(secondSnapshot)
  })

  it('saves entries in newest-first order and caps the history at thirty items', () => {
    for (let index = 0; index < 31; index += 1) {
      savePracticeAttemptHistoryEntry(
        createAttempt({
          id: `attempt-${index + 1}`,
          createdAt: new Date(Date.UTC(2026, 2, index + 1, 10)).toISOString(),
        })
      )
    }

    const snapshot = getPracticeAttemptHistorySnapshot()

    expect(snapshot).toHaveLength(30)
    expect(snapshot[0]?.id).toBe('attempt-31')
    expect(snapshot.at(-1)?.id).toBe('attempt-2')
  })

  it('notifies subscribers when history changes', () => {
    const onStoreChange = vi.fn()
    const unsubscribe = subscribeToPracticeAttemptHistory(onStoreChange)

    savePracticeAttemptHistoryEntry(createAttempt())
    clearPracticeAttemptHistory()
    unsubscribe()

    expect(onStoreChange).toHaveBeenCalledTimes(2)
  })

  it('creates history entries from reading, listening, and speaking scores', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-31T10:15:00.000Z'))

    const readingPassage = readingPracticePassages[0]
    const readingScore = scoreReadingPracticeAttempt({
      passageId: readingPassage.id,
      answers: Object.fromEntries(
        readingPassage.questions.map((question) => [
          question.id,
          question.correctAnswer,
        ])
      ),
    })
    const listeningTrack = listeningPracticeTracks[0]
    const listeningScore = scoreListeningPracticeAttempt({
      trackId: listeningTrack.id,
      notes: 'membership residents address rooms printing',
      answers: Object.fromEntries(
        listeningTrack.questions.map((question) => [
          question.id,
          question.correctAnswer,
        ])
      ),
    })
    const speakingPrompt = speakingPracticePrompts[0]
    const speakingScore = scoreSpeakingPracticeAttempt({
      promptId: speakingPrompt.id,
      transcript: buildSpeakingTranscript(speakingPrompt),
      completedCuePointIds: speakingPrompt.cuePoints.map(
        (cuePoint) => cuePoint.id
      ),
    })

    if (!readingScore.ok || !listeningScore.ok || !speakingScore.ok) {
      throw new Error('Expected scoring fixtures to be valid.')
    }

    expect(createReadingPracticeAttemptHistoryEntry(readingScore.score)).toMatchObject({
      skill: 'Reading',
      itemTitle: readingPassage.title,
      metricLabel: 'Accuracy',
      metricValue: '100%',
      createdAt: '2026-03-31T10:15:00.000Z',
    })
    expect(
      createListeningPracticeAttemptHistoryEntry(listeningScore.score)
    ).toMatchObject({
      skill: 'Listening',
      itemTitle: listeningTrack.title,
      metricLabel: 'Accuracy',
      metricValue: '100%',
    })
    expect(
      createSpeakingPracticeAttemptHistoryEntry(speakingScore.score)
    ).toMatchObject({
      skill: 'Speaking',
      itemTitle: speakingPrompt.title,
      metricLabel: 'Readiness',
    })
  })
})
