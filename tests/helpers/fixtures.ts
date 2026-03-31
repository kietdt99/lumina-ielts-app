import type { WritingEvaluation } from '@/lib/ielts/writing-feedback'
import type { WritingHistoryEntry } from '@/lib/ielts/writing-history'
import type { WritingPrompt } from '@/lib/ielts/writing-prompts'
import type { WritingSubmissionSuccess } from '@/lib/ielts/writing-submissions'
import type { LearnerGoals } from '@/lib/learner/learner-goals'
import { defaultLearnerGoals } from '@/lib/learner/learner-goals'

export function createPrompt(
  overrides: Partial<WritingPrompt> = {}
): WritingPrompt {
  return {
    id: 'task2-remote-work',
    taskType: 'Task 2',
    title: 'Remote work and employee productivity',
    durationMinutes: 40,
    minimumWords: 250,
    brief:
      'Discuss whether remote work improves productivity compared with office work.',
    instructions: ['Write a clear position.', 'Support each main point.'],
    planningChecklist: ['Plan your paragraphs.', 'End with a conclusion.'],
    ...overrides,
  }
}

export function createEvaluation(
  overrides: Partial<WritingEvaluation> = {}
): WritingEvaluation {
  return {
    estimatedBand: 7,
    wordCount: 280,
    paragraphCount: 4,
    sentenceCount: 12,
    rubric: [
      {
        label: 'Task Response',
        score: 7,
        summary: 'Task response is moving in the right direction but still needs refinement.',
      },
      {
        label: 'Coherence and Cohesion',
        score: 7,
        summary:
          'Coherence and cohesion is moving in the right direction but still needs refinement.',
      },
      {
        label: 'Lexical Resource',
        score: 7,
        summary: 'Lexical resource is moving in the right direction but still needs refinement.',
      },
      {
        label: 'Grammatical Range and Accuracy',
        score: 7,
        summary: 'Grammar control is moving in the right direction but still needs refinement.',
      },
    ],
    strengths: ['The draft has a clear structure.'],
    priorities: ['Develop the second body paragraph with more precise support.'],
    coachingNote: 'Clarify your position earlier in the introduction.',
    ...overrides,
  }
}

export function createHistoryEntry(
  overrides: Partial<WritingHistoryEntry> = {}
): WritingHistoryEntry {
  return {
    id: 'entry-1',
    promptId: 'task2-remote-work',
    promptTitle: 'Remote work and employee productivity',
    taskType: 'Task 2',
    createdAt: '2026-03-31T10:00:00.000Z',
    draftExcerpt: 'A focused IELTS draft excerpt',
    wordCount: 280,
    estimatedBand: 7,
    rubric: createEvaluation().rubric,
    strengths: ['The draft has a clear structure.'],
    priorities: ['Develop the second body paragraph with more precise support.'],
    ...overrides,
  }
}

export function createSubmissionSuccess(
  overrides: Partial<WritingSubmissionSuccess> = {}
): WritingSubmissionSuccess {
  return {
    ok: true,
    feedback: createEvaluation(),
    historyEntry: createHistoryEntry(),
    ...overrides,
  }
}

export function createLearnerGoals(
  overrides: Partial<LearnerGoals> = {}
): LearnerGoals {
  return {
    ...defaultLearnerGoals,
    ...overrides,
  }
}
