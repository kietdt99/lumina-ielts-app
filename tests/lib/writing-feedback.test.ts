import { describe, expect, it } from 'vitest'
import { evaluateWriting, getDraftMetrics } from '@/lib/ielts/writing-feedback'
import { createPrompt } from '../helpers/fixtures'

describe('writing feedback heuristics', () => {
  it('extracts draft metrics from a multi-paragraph response', () => {
    const metrics = getDraftMetrics(
      [
        'Remote work can increase productivity because employees avoid commuting and manage their time better.',
        '',
        'However, some teams collaborate better in the office, and for example junior staff can receive faster support.',
        '',
        'Overall, a balanced remote policy often produces the best outcome for both companies and workers.',
      ].join('\n')
    )

    expect(metrics.wordCount).toBeGreaterThan(25)
    expect(metrics.paragraphCount).toBe(3)
    expect(metrics.sentenceCount).toBe(3)
    expect(metrics.transitionCount).toBeGreaterThanOrEqual(2)
    expect(metrics.hasConclusion).toBe(true)
  })

  it('flags a weak draft with practical revision priorities', () => {
    const prompt = createPrompt()
    const result = evaluateWriting(prompt, 'Remote work is good. It saves time.')

    expect(result.estimatedBand).toBeGreaterThanOrEqual(4.5)
    expect(result.rubric).toHaveLength(4)
    expect(result.priorities).toContain(
      'Add more development so the response reaches at least 250 words.'
    )
    expect(result.priorities).toContain(
      'Finish with a short conclusion that confirms your opinion.'
    )
  })

  it('rewards a developed draft with stronger signals', () => {
    const prompt = createPrompt()
    const draft = [
      'Remote work has become a normal part of modern employment, and I believe it can improve productivity when companies manage it carefully.',
      '',
      'On the one hand, staff often complete tasks faster at home because they avoid long commutes and can organise their schedule around periods of deep focus. Moreover, online tools now make it easier to track projects and communicate updates clearly.',
      '',
      'On the other hand, some employees perform better in an office because collaboration is more immediate and managers can identify problems quickly. For example, new team members may need direct support before they can work independently.',
      '',
      'In conclusion, remote work is usually more productive when organisations set clear expectations, although some office interaction remains important for teamwork and training. This model reduces wasted time, gives experienced staff more autonomy, and still allows companies to schedule in-person meetings for tasks that genuinely require them.',
      '',
      'As a result, businesses can maintain flexibility, protect staff wellbeing, and continue improving results over the long term.',
    ].join('\n')

    const result = evaluateWriting(prompt, draft)

    expect(result.estimatedBand).toBeGreaterThanOrEqual(6)
    expect(result.strengths).toContain(
      'The paragraph structure is strong enough for a clear reader journey.'
    )
    expect(result.priorities).not.toContain(
      'Rebuild the response around clearer paragraph boundaries.'
    )
  })
})
