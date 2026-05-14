import type { WritingHistoryEntry } from './writing-history'
import {
  writingMistakeTaxonomy,
  type WritingMistakeCriterion,
  type WritingMistakeTaxonomyItem,
} from './mistake-taxonomy'

export type MistakeSourceType = 'priority' | 'revision-plan'

export type MistakeEvidence = {
  id: string
  entryId: string
  promptTitle: string
  taskType: WritingHistoryEntry['taskType']
  createdAt: string
  sourceType: MistakeSourceType
  text: string
}

export type MistakeJournalPattern = Omit<WritingMistakeTaxonomyItem, 'keywords'> & {
  count: number
  lastSeenAt: string
  taskTypes: WritingHistoryEntry['taskType'][]
  evidence: MistakeEvidence[]
}

export type MistakeJournal = {
  headline: string
  summary: string
  totalPatterns: number
  totalEvidence: number
  sourceSessions: number
  mostAffectedCriterion: WritingMistakeCriterion | null
  topPattern: MistakeJournalPattern | null
  patterns: MistakeJournalPattern[]
}

const defaultPatternLimit = 6
const evidencePerPatternLimit = 3

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural
}

function normalizeText(value: string) {
  return value.toLowerCase()
}

function sortByNewest(entries: WritingHistoryEntry[]) {
  return [...entries].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  )
}

function evidenceFromEntry(entry: WritingHistoryEntry): MistakeEvidence[] {
  const priorityEvidence = entry.priorities.map((text, index) => ({
    id: `${entry.id}-priority-${index}`,
    entryId: entry.id,
    promptTitle: entry.promptTitle,
    taskType: entry.taskType,
    createdAt: entry.createdAt,
    sourceType: 'priority' as const,
    text,
  }))

  const revisionEvidence = entry.revisionPlan.map((step, index) => ({
    id: `${entry.id}-revision-${index}`,
    entryId: entry.id,
    promptTitle: entry.promptTitle,
    taskType: entry.taskType,
    createdAt: entry.createdAt,
    sourceType: 'revision-plan' as const,
    text: `${step.action} ${step.successCriteria}`,
  }))

  return [...priorityEvidence, ...revisionEvidence]
}

function matchingTaxonomyItems(evidence: MistakeEvidence) {
  const text = normalizeText(evidence.text)

  return writingMistakeTaxonomy.filter(
    (item) =>
      item.applicableTaskTypes.includes(evidence.taskType) &&
      item.keywords.some((keyword) => text.includes(keyword))
  )
}

function mostAffectedCriterion(patterns: MistakeJournalPattern[]) {
  const counts = new Map<WritingMistakeCriterion, number>()

  for (const pattern of patterns) {
    counts.set(pattern.criterion, (counts.get(pattern.criterion) ?? 0) + pattern.count)
  }

  const [criterion] =
    [...counts.entries()].sort((left, right) => right[1] - left[1])[0] ?? []

  return criterion ?? null
}

function toPattern(
  item: WritingMistakeTaxonomyItem,
  evidence: MistakeEvidence[]
): MistakeJournalPattern {
  const taskTypes = [...new Set(evidence.map((source) => source.taskType))]

  return {
    code: item.code,
    criterion: item.criterion,
    label: item.label,
    description: item.description,
    applicableTaskTypes: item.applicableTaskTypes,
    bandRisk: item.bandRisk,
    revisionHint: item.revisionHint,
    examplePattern: item.examplePattern,
    practiceDrill: item.practiceDrill,
    count: evidence.length,
    lastSeenAt: evidence[0]?.createdAt ?? new Date(0).toISOString(),
    taskTypes,
    evidence: evidence.slice(0, evidencePerPatternLimit),
  }
}

export function createMistakeJournal(
  entries: WritingHistoryEntry[],
  limit = defaultPatternLimit
): MistakeJournal {
  const evidenceByCode = new Map<string, MistakeEvidence[]>()

  for (const entry of sortByNewest(entries)) {
    for (const evidence of evidenceFromEntry(entry)) {
      for (const item of matchingTaxonomyItems(evidence)) {
        const currentEvidence = evidenceByCode.get(item.code) ?? []
        currentEvidence.push(evidence)
        evidenceByCode.set(item.code, currentEvidence)
      }
    }
  }

  const patterns = writingMistakeTaxonomy
    .map((item) => {
      const evidence = evidenceByCode.get(item.code) ?? []
      return evidence.length ? toPattern(item, evidence) : null
    })
    .filter((pattern): pattern is MistakeJournalPattern => pattern !== null)
    .sort(
      (left, right) =>
        right.count - left.count ||
        new Date(right.lastSeenAt).getTime() - new Date(left.lastSeenAt).getTime()
    )
    .slice(0, limit)

  const totalEvidence = patterns.reduce((total, pattern) => total + pattern.count, 0)
  const sourceSessions = new Set(
    patterns.flatMap((pattern) => {
      const evidence = evidenceByCode.get(pattern.code) ?? []
      return evidence.map((source) => source.entryId)
    })
  ).size
  const topPattern = patterns[0] ?? null

  if (!patterns.length) {
    return {
      headline: 'Build your mistake journal',
      summary:
        'Save a few reviewed writing sessions and Lumina will group repeated issues into clear mistake patterns.',
      totalPatterns: 0,
      totalEvidence: 0,
      sourceSessions: 0,
      mostAffectedCriterion: null,
      topPattern: null,
      patterns,
    }
  }

  return {
    headline: `${patterns.length} mistake ${pluralize(patterns.length, 'pattern')} found`,
    summary: `Lumina found ${totalEvidence} evidence ${pluralize(totalEvidence, 'point')} across ${sourceSessions} writing ${pluralize(sourceSessions, 'session')}. Start with ${topPattern?.label.toLowerCase()} before your next timed draft.`,
    totalPatterns: patterns.length,
    totalEvidence,
    sourceSessions,
    mostAffectedCriterion: mostAffectedCriterion(patterns),
    topPattern,
    patterns,
  }
}
