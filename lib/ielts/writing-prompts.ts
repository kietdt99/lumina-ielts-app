export type WritingPrompt = {
  id: string
  taskType: 'Task 1' | 'Task 2'
  title: string
  durationMinutes: number
  minimumWords: number
  brief: string
  instructions: string[]
  planningChecklist: string[]
}

export const writingPrompts: WritingPrompt[] = [
  {
    id: 'task2-remote-work',
    taskType: 'Task 2',
    title: 'Remote work and employee productivity',
    durationMinutes: 40,
    minimumWords: 250,
    brief:
      'Some people believe remote work improves productivity, while others think employees work better in an office. Discuss both views and give your own opinion.',
    instructions: [
      'Present both views in a balanced way before giving your final position.',
      'Support your opinion with clear reasons and practical examples.',
      'Aim for a focused four-paragraph structure.',
    ],
    planningChecklist: [
      'Clarify your position before you begin writing.',
      'Write one body paragraph for each side of the argument.',
      'Use a short conclusion that reinforces your opinion.',
    ],
  },
  {
    id: 'task2-ai-education',
    taskType: 'Task 2',
    title: 'AI tools in school education',
    durationMinutes: 40,
    minimumWords: 250,
    brief:
      'Schools are increasingly using AI tools to support teaching and learning. Do the advantages outweigh the disadvantages?',
    instructions: [
      'State a clear overall judgement early in the essay.',
      'Explain both the opportunities and the risks of AI in education.',
      'Keep examples realistic and directly connected to the main point.',
    ],
    planningChecklist: [
      'Decide whether your essay is mainly positive, negative, or balanced.',
      'Use topic sentences to make the argument easy to follow.',
      'Avoid listing ideas without explaining their impact.',
    ],
  },
  {
    id: 'task1-cycle-diagram',
    taskType: 'Task 1',
    title: 'Water recycling process',
    durationMinutes: 20,
    minimumWords: 150,
    brief:
      'The diagram shows the stages used to recycle water in a modern city. Summarize the information by selecting and reporting the main features.',
    instructions: [
      'Write an overview that identifies the start and end of the cycle.',
      'Group related stages together instead of describing every step in isolation.',
      'Use precise process language and sequencing connectors.',
    ],
    planningChecklist: [
      'Write a one-sentence overview before the detailed description.',
      'Move through the process in a logical order.',
      'Check verb tenses and passive voice choices.',
    ],
  },
]
