import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SpeakingPracticeWorkspace } from '@/app/(app)/speaking-practice/_components/speaking-practice-workspace'
import {
  scoreSpeakingPracticeAttempt,
  speakingPracticePrompts,
} from '@/lib/ielts/speaking-practice'
import { buildSpeakingTranscript } from '../support/speaking-practice'

function mockScoringApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init?: RequestInit) => {
      const payload = JSON.parse(init?.body as string)
      const result = scoreSpeakingPracticeAttempt(payload)

      return new Response(JSON.stringify(result), {
        status: result.ok ? 200 : 400,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
  )
}

describe('SpeakingPracticeWorkspace', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mockScoringApi()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the speaking practice workspace and timer controls', () => {
    render(<SpeakingPracticeWorkspace prompts={speakingPracticePrompts} />)

    expect(
      screen.getByRole('heading', {
        name: 'Train IELTS Speaking with cue-card drills',
      })
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('heading', { name: 'Study routine' }).length
    ).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Start prep' })).toBeInTheDocument()
    expect(screen.getByLabelText('Speaking transcript')).toBeInTheDocument()
  })

  it('filters prompts by part, difficulty, topic, and search', async () => {
    const user = userEvent.setup()

    render(<SpeakingPracticeWorkspace prompts={speakingPracticePrompts} />)

    await user.selectOptions(screen.getByLabelText('Part'), 'Part 2')
    await user.selectOptions(screen.getByLabelText('Difficulty'), 'Balanced')
    await user.selectOptions(screen.getByLabelText('Topic focus'), 'Technology and daily life')
    await user.type(screen.getByLabelText('Search prompts'), 'device')

    expect(
      screen.getAllByRole('heading', { name: 'A useful device' }).length
    ).toBeGreaterThan(0)
    expect(
      screen.queryByRole('heading', { name: 'Study routine' })
    ).not.toBeInTheDocument()
  })

  it('stores transcript and cue coverage locally and shows the score report', async () => {
    const user = userEvent.setup()
    const prompt = speakingPracticePrompts[0]

    render(<SpeakingPracticeWorkspace prompts={speakingPracticePrompts} />)

    for (const cuePoint of prompt.cuePoints) {
      await user.click(screen.getByLabelText(`Mark ${cuePoint.label} covered`))
    }

    fireEvent.change(screen.getByLabelText('Speaking transcript'), {
      target: {
        value: buildSpeakingTranscript(prompt),
      },
    })

    await user.click(screen.getByRole('button', { name: 'Score speaking answer' }))

    await waitFor(() => {
      expect(screen.getByText('Speaking score report')).toBeInTheDocument()
    })
    expect(screen.getAllByText('Strong control')).not.toHaveLength(0)
    expect(screen.getByText('Estimated band')).toBeInTheDocument()
    expect(screen.getByText('Recent Speaking attempts')).toBeInTheDocument()

    const storedState = JSON.parse(
      window.localStorage.getItem('lumina-speaking-practice') ?? '{}'
    ) as Record<string, { transcript: string; completedCuePointIds: string[] }>
    const storedAttempts = JSON.parse(
      window.localStorage.getItem('lumina-practice-attempt-history') ?? '[]'
    ) as Array<{ skill: string; itemTitle: string; metricLabel: string }>

    expect(storedState[prompt.id].completedCuePointIds).toEqual(
      prompt.cuePoints.map((cuePoint) => cuePoint.id)
    )
    expect(storedState[prompt.id].transcript).toContain('Overall')
    expect(storedAttempts[0]).toMatchObject({
      skill: 'Speaking',
      itemTitle: prompt.title,
      metricLabel: 'Readiness',
    })
  })

  it('shows an empty state and can reset filters', async () => {
    const user = userEvent.setup()

    render(<SpeakingPracticeWorkspace prompts={speakingPracticePrompts} />)

    await user.type(screen.getByLabelText('Search prompts'), 'no speaking match')

    expect(screen.getByText('No speaking prompts match this filter')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Reset filters' })[0])

    expect(
      screen.getAllByRole('heading', { name: 'Study routine' }).length
    ).toBeGreaterThan(0)
  })
})
