import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ReadingPracticeWorkspace } from '@/app/(app)/reading-practice/_components/reading-practice-workspace'
import {
  readingPracticePassages,
  scoreReadingPracticeAttempt,
  toPublicReadingPracticePassage,
} from '@/lib/ielts/reading-practice'

const publicPassages = readingPracticePassages.map(toPublicReadingPracticePassage)

function mockScoringApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init?: RequestInit) => {
      const payload = JSON.parse(init?.body as string)
      const result = scoreReadingPracticeAttempt(payload)

      return new Response(JSON.stringify(result), {
        status: result.ok ? 200 : 400,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
  )
}

describe('ReadingPracticeWorkspace', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mockScoringApi()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the reading practice workspace and public passage content', () => {
    render(<ReadingPracticeWorkspace passages={publicPassages} />)

    expect(
      screen.getByRole('heading', {
        name: 'Train IELTS Reading with instant explanations',
      })
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('heading', { name: 'Urban cooling corridors' }).length
    ).toBeGreaterThan(0)
    expect(screen.getByLabelText('What is the main purpose of the passage?')).toBeInTheDocument()
  })

  it('filters passages by difficulty, topic, and search', async () => {
    const user = userEvent.setup()

    render(<ReadingPracticeWorkspace passages={publicPassages} />)

    await user.selectOptions(screen.getByLabelText('Difficulty'), 'Guided')
    await user.selectOptions(screen.getByLabelText('Topic focus'), 'Education and technology')
    await user.type(screen.getByLabelText('Search passages'), 'credentials')

    expect(
      screen.getAllByRole('heading', { name: 'Micro-credentials at work' }).length
    ).toBeGreaterThan(0)
    expect(
      screen.queryByRole('heading', { name: 'Urban cooling corridors' })
    ).not.toBeInTheDocument()
  })

  it('stores answers locally and shows the API score report', async () => {
    const user = userEvent.setup()
    const passage = readingPracticePassages[0]

    render(<ReadingPracticeWorkspace passages={publicPassages} />)

    for (const question of passage.questions) {
      await user.selectOptions(
        screen.getByLabelText(question.prompt),
        question.correctAnswer
      )
    }

    await user.click(screen.getByRole('button', { name: 'Score reading answers' }))

    await waitFor(() => {
      expect(screen.getByText('Reading score report')).toBeInTheDocument()
    })
    expect(screen.getAllByText('Strong control')).not.toHaveLength(0)
    expect(screen.getAllByText('100%')).not.toHaveLength(0)
    expect(screen.getByText('Correct answer: sea breezes')).toBeInTheDocument()
    expect(screen.getByText('Recent Reading attempts')).toBeInTheDocument()

    const storedAnswers = JSON.parse(
      window.localStorage.getItem('lumina-reading-practice-answers') ?? '{}'
    ) as Record<string, Record<string, string>>
    const storedAttempts = JSON.parse(
      window.localStorage.getItem('lumina-practice-attempt-history') ?? '[]'
    ) as Array<{ skill: string; itemTitle: string; metricValue: string }>

    expect(storedAnswers[passage.id][passage.questions[0].id]).toBe(
      passage.questions[0].correctAnswer
    )
    expect(storedAttempts[0]).toMatchObject({
      skill: 'Reading',
      itemTitle: passage.title,
      metricValue: '100%',
    })
  })

  it('shows an empty state and can reset filters', async () => {
    const user = userEvent.setup()

    render(<ReadingPracticeWorkspace passages={publicPassages} />)

    await user.type(screen.getByLabelText('Search passages'), 'no reading match')

    expect(screen.getByText('No reading passages match this filter')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Reset filters' })[0])

    expect(
      screen.getAllByRole('heading', { name: 'Urban cooling corridors' }).length
    ).toBeGreaterThan(0)
  })
})
