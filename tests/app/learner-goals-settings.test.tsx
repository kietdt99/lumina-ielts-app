import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LearnerGoalsSettings } from '@/app/(app)/settings/_components/learner-goals-settings'
import { createLearnerGoals } from '../helpers/fixtures'

const routerState = {
  refresh: vi.fn(),
}

vi.mock('next/navigation', () => ({
  useRouter: () => routerState,
}))

describe('LearnerGoalsSettings', () => {
  beforeEach(() => {
    routerState.refresh.mockReset()
    globalThis.fetch = vi.fn()
  })

  it('saves learner goals through the API and refreshes the page state', async () => {
    const user = userEvent.setup()

    vi.mocked(globalThis.fetch).mockResolvedValue(
      Response.json({
        ok: true,
        goals: createLearnerGoals({
          targetBand: 8,
          focusSkill: 'Reading',
          studyFrequency: 'Daily',
        }),
      })
    )

    render(<LearnerGoalsSettings initialGoals={createLearnerGoals()} />)

    await user.selectOptions(screen.getByLabelText('Target band'), '8')
    await user.selectOptions(screen.getByLabelText('Focus skill'), 'Reading')
    await user.selectOptions(screen.getByLabelText('Study frequency'), 'Daily')
    await user.click(screen.getByRole('button', { name: 'Save learner goals' }))

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/learner-goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          createLearnerGoals({
            targetBand: 8,
            focusSkill: 'Reading',
            studyFrequency: 'Daily',
          })
        ),
      })
    })

    expect(
      await screen.findByText('Learner goals saved for this browser.')
    ).toBeInTheDocument()
    expect(routerState.refresh).toHaveBeenCalledTimes(1)
  })

  it('restores the recommended defaults locally before saving', async () => {
    const user = userEvent.setup()

    render(
      <LearnerGoalsSettings
        initialGoals={createLearnerGoals({
          targetBand: 8,
          focusSkill: 'Listening',
          studyFrequency: 'Daily',
        })}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Restore recommended goals' }))

    expect(screen.getByLabelText('Target band')).toHaveValue('7.5')
    expect(screen.getByLabelText('Focus skill')).toHaveValue('Writing')
    expect(screen.getByLabelText('Study frequency')).toHaveValue('4 sessions/week')
    expect(
      screen.getByText('Recommended learner goals restored locally. Save to apply them.')
    ).toBeInTheDocument()
  })
})
