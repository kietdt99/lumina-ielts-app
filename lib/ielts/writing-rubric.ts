import type { WritingPrompt } from './writing-prompts'

export type RubricTaskType = WritingPrompt['taskType']

export type RubricBandDescriptor = {
  band: number
  label: string
  descriptor: string
  watchFor: string[]
  nextStep: string
}

export type WritingRubricCriterion = {
  code: string
  name: string
  shortName: string
  appliesTo: RubricTaskType[]
  learnerQuestion: string
  scoringFocus: string[]
  bandDescriptors: RubricBandDescriptor[]
}

export type WritingRubricSummary = {
  totalCriteria: number
  totalDescriptors: number
  taskOneCriteria: number
  taskTwoCriteria: number
}

const sharedCriteria: WritingRubricCriterion[] = [
  {
    code: 'coherence-cohesion',
    name: 'Coherence and Cohesion',
    shortName: 'Coherence',
    appliesTo: ['Task 1', 'Task 2'],
    learnerQuestion: 'Can the examiner follow the answer without working hard?',
    scoringFocus: [
      'Clear paragraphing',
      'Logical progression',
      'Accurate linking',
      'Controlled referencing',
    ],
    bandDescriptors: [
      {
        band: 5,
        label: 'Basic organization',
        descriptor:
          'The answer has some organization, but ideas may be repetitive, under-linked, or hard to follow.',
        watchFor: [
          'Single-block paragraphs',
          'Overused linking words',
          'Missing topic focus',
        ],
        nextStep: 'Separate the response into clear paragraphs before polishing language.',
      },
      {
        band: 6,
        label: 'Mostly clear flow',
        descriptor:
          'The response is generally organized, though linking and paragraph focus may still feel mechanical.',
        watchFor: [
          'Paragraphs that drift',
          'Repeated connectors',
          'Unclear references such as this or it',
        ],
        nextStep: 'Give each paragraph one job and use linking only where it helps the reader.',
      },
      {
        band: 7,
        label: 'Clear progression',
        descriptor:
          'Ideas are logically sequenced with effective paragraphing and mostly natural cohesion.',
        watchFor: [
          'Occasional over-explanation',
          'Minor linking awkwardness',
          'Uneven paragraph length',
        ],
        nextStep: 'Refine topic sentences so each paragraph announces its main move quickly.',
      },
      {
        band: 8,
        label: 'Fluent control',
        descriptor:
          'The answer progresses smoothly, and cohesion supports meaning without drawing attention to itself.',
        watchFor: [
          'Subtle repetition',
          'Unnecessary signposting',
          'Paragraphs that could be tighter',
        ],
        nextStep: 'Remove any connector or sentence that does not improve reader movement.',
      },
    ],
  },
  {
    code: 'lexical-resource',
    name: 'Lexical Resource',
    shortName: 'Vocabulary',
    appliesTo: ['Task 1', 'Task 2'],
    learnerQuestion: 'Is the vocabulary precise, flexible, and natural for the task?',
    scoringFocus: [
      'Topic-specific vocabulary',
      'Paraphrasing control',
      'Collocation accuracy',
      'Low error impact',
    ],
    bandDescriptors: [
      {
        band: 5,
        label: 'Limited range',
        descriptor:
          'Vocabulary communicates basic meaning, but repetition and word-choice errors limit precision.',
        watchFor: [
          'Repeating prompt words',
          'General words such as good or bad',
          'Unnatural collocations',
        ],
        nextStep: 'Replace repeated key words with two accurate paraphrases, not a long synonym list.',
      },
      {
        band: 6,
        label: 'Adequate range',
        descriptor:
          'Vocabulary is adequate for the task, with some flexibility and some noticeable word-choice limits.',
        watchFor: [
          'Safe but generic phrasing',
          'Incorrect word forms',
          'Forced advanced vocabulary',
        ],
        nextStep: 'Add topic-specific collocations that you can use accurately in context.',
      },
      {
        band: 7,
        label: 'Flexible range',
        descriptor:
          'The answer uses enough range and precision to express detailed meaning with only occasional slips.',
        watchFor: [
          'Minor collocation errors',
          'A few repeated phrases',
          'Overly formal wording',
        ],
        nextStep: 'Tighten collocations and choose words that carry exact meaning, not just higher level style.',
      },
      {
        band: 8,
        label: 'Precise control',
        descriptor:
          'Vocabulary is varied, natural, and precise, with errors rare enough not to affect communication.',
        watchFor: [
          'Tiny register mismatches',
          'Near-synonyms used too broadly',
          'Unneeded complexity',
        ],
        nextStep: 'Edit for natural phrasing and remove any word used only to sound advanced.',
      },
    ],
  },
  {
    code: 'grammar-accuracy',
    name: 'Grammatical Range and Accuracy',
    shortName: 'Grammar',
    appliesTo: ['Task 1', 'Task 2'],
    learnerQuestion: 'Does sentence control support complex meaning without frequent errors?',
    scoringFocus: [
      'Sentence variety',
      'Complex clauses',
      'Punctuation control',
      'Error frequency and impact',
    ],
    bandDescriptors: [
      {
        band: 5,
        label: 'Frequent limits',
        descriptor:
          'The draft uses some correct sentences, but frequent grammar errors reduce clarity or confidence.',
        watchFor: [
          'Sentence fragments',
          'Run-on sentences',
          'Frequent tense or article mistakes',
        ],
        nextStep: 'Repair sentence boundaries first, then add one controlled complex sentence per paragraph.',
      },
      {
        band: 6,
        label: 'Mixed control',
        descriptor:
          'The answer uses simple and some complex structures, but errors are still noticeable.',
        watchFor: [
          'Clause errors',
          'Subject-verb agreement slips',
          'Punctuation around linking words',
        ],
        nextStep: 'Keep complex sentences shorter and check the main verb in every sentence.',
      },
      {
        band: 7,
        label: 'Good range',
        descriptor:
          'The response uses a useful range of structures with generally good control and only limited error impact.',
        watchFor: [
          'Small article errors',
          'Occasional awkward complex sentences',
          'Repeated sentence patterns',
        ],
        nextStep: 'Vary sentence openings while keeping each clause easy to parse.',
      },
      {
        band: 8,
        label: 'Strong control',
        descriptor:
          'Grammar is flexible and accurate, with rare errors that do not distract from the answer.',
        watchFor: [
          'Very minor punctuation issues',
          'Overlong sentences',
          'Unnecessary subordination',
        ],
        nextStep: 'Shorten any sentence that contains more complexity than the idea needs.',
      },
    ],
  },
]

export const writingRubricCriteria: WritingRubricCriterion[] = [
  {
    code: 'task-achievement',
    name: 'Task Achievement',
    shortName: 'Task Achievement',
    appliesTo: ['Task 1'],
    learnerQuestion: 'Does the answer summarize the visual information accurately and completely?',
    scoringFocus: [
      'Clear overview',
      'Main feature selection',
      'Accurate detail grouping',
      'No personal opinion',
    ],
    bandDescriptors: [
      {
        band: 5,
        label: 'Partial coverage',
        descriptor:
          'The answer covers some information, but the overview or key features may be unclear, missing, or inaccurate.',
        watchFor: [
          'No clear overview',
          'Too many minor details',
          'Personal opinion in a report',
        ],
        nextStep: 'Write one overview sentence before describing any details.',
      },
      {
        band: 6,
        label: 'Main features present',
        descriptor:
          'The response covers the task and includes an overview, though feature selection or grouping may be uneven.',
        watchFor: [
          'Overview mixed with details',
          'Mechanical stage-by-stage listing',
          'Missed comparisons',
        ],
        nextStep: 'Group details by pattern, stage, or contrast instead of listing everything.',
      },
      {
        band: 7,
        label: 'Clear report',
        descriptor:
          'The answer presents a clear overview and supports it with relevant, well-selected details.',
        watchFor: [
          'One underdeveloped detail group',
          'Small accuracy slips',
          'Overview could be sharper',
        ],
        nextStep: 'Make the overview more specific by naming the biggest change or process endpoint.',
      },
      {
        band: 8,
        label: 'Well-selected summary',
        descriptor:
          'The response selects, groups, and reports the main information very clearly with strong factual control.',
        watchFor: [
          'Minor over-reporting',
          'Small wording imprecision',
          'Unnecessary exact figures',
        ],
        nextStep: 'Cut any detail that does not support the main pattern.',
      },
    ],
  },
  {
    code: 'task-response',
    name: 'Task Response',
    shortName: 'Task Response',
    appliesTo: ['Task 2'],
    learnerQuestion: 'Does the essay answer the question with a clear position and developed support?',
    scoringFocus: [
      'Direct answer to the question',
      'Clear position',
      'Developed body paragraphs',
      'Relevant examples',
    ],
    bandDescriptors: [
      {
        band: 5,
        label: 'Limited development',
        descriptor:
          'The essay addresses the topic but may be incomplete, unclear, or weakly supported.',
        watchFor: [
          'Position appears late or changes',
          'General examples',
          'Body paragraphs repeat the same idea',
        ],
        nextStep: 'Write a direct thesis and give each body paragraph a different supporting reason.',
      },
      {
        band: 6,
        label: 'Relevant but uneven',
        descriptor:
          'The essay answers the question and presents relevant ideas, but development may be uneven or partly general.',
        watchFor: [
          'Examples without explanation',
          'One stronger body paragraph',
          'Conclusion repeats mechanically',
        ],
        nextStep: 'Add a cause, result, or concrete example after every main claim.',
      },
      {
        band: 7,
        label: 'Clear position',
        descriptor:
          'The essay maintains a clear position and develops main ideas with relevant support.',
        watchFor: [
          'Some support could be deeper',
          'Counterpoint not fully handled',
          'Minor task nuance missed',
        ],
        nextStep: 'Make the weaker body paragraph more specific with one realistic example.',
      },
      {
        band: 8,
        label: 'Well-developed answer',
        descriptor:
          'The answer fully addresses the prompt with a sustained position and well-developed support.',
        watchFor: [
          'Tiny imbalance between ideas',
          'Overlong examples',
          'Conclusion could be more concise',
        ],
        nextStep: 'Trim support that repeats the same logic and keep only the strongest evidence.',
      },
    ],
  },
  ...sharedCriteria,
]

export function getWritingRubric(
  taskType: RubricTaskType,
  criteria: WritingRubricCriterion[] = writingRubricCriteria
) {
  return criteria.filter((criterion) =>
    criterion.appliesTo.includes(taskType)
  )
}

export function summarizeWritingRubric(
  criteria: WritingRubricCriterion[] = writingRubricCriteria
): WritingRubricSummary {
  return {
    totalCriteria: criteria.length,
    totalDescriptors: criteria.reduce(
      (total, criterion) => total + criterion.bandDescriptors.length,
      0
    ),
    taskOneCriteria: getWritingRubric('Task 1', criteria).length,
    taskTwoCriteria: getWritingRubric('Task 2', criteria).length,
  }
}

export function findRubricCriterion(code: string, taskType: RubricTaskType) {
  return (
    getWritingRubric(taskType).find((criterion) => criterion.code === code) ??
    null
  )
}
