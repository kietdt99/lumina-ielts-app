import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { OutlineBuilderWorkspace } from '@/app/(app)/outline-builder/_components/outline-builder-workspace'
import { ideaBankEntries } from '@/lib/ielts/idea-bank'
import { writingPrompts } from '@/lib/ielts/writing-prompts'

describe('OutlineBuilderWorkspace', () => {
  it('renders the default outline for the first writing prompt', () => {
    render(
      <OutlineBuilderWorkspace
        ideaBankEntries={ideaBankEntries}
        prompts={writingPrompts}
      />
    )

    expect(
      screen.getByRole('heading', { name: 'Plan the answer before the timer starts' })
    ).toBeInTheDocument()
    expect(
      screen.getAllByText('Remote work and employee productivity').length
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('Work and society').length).toBeGreaterThan(0)
    expect(screen.getByText('Outline Blocks')).toBeInTheDocument()
    expect(screen.getAllByText('Body paragraph 1').length).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('link', { name: 'Start writing with this outline' })[0]
    ).toHaveAttribute('href', '/writing?promptId=task2-remote-work&outline=1')
  })

  it('switches between Task 2 and Task 1 outline structures', async () => {
    const user = userEvent.setup()

    render(
      <OutlineBuilderWorkspace
        ideaBankEntries={ideaBankEntries}
        prompts={writingPrompts}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Task 1' }))

    expect(screen.getByLabelText('Writing prompt')).toHaveValue('task1-cycle-diagram')
    expect(screen.getAllByText('Water recycling process').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Detail group 1').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Task 2' }))

    expect(screen.getByLabelText('Writing prompt')).toHaveValue('task2-remote-work')
    expect(screen.getAllByText('Body paragraph 2').length).toBeGreaterThan(0)
  })

  it('changes the outline when a different prompt is selected', async () => {
    const user = userEvent.setup()

    render(
      <OutlineBuilderWorkspace
        ideaBankEntries={ideaBankEntries}
        prompts={writingPrompts}
      />
    )

    await user.selectOptions(screen.getByLabelText('Writing prompt'), 'task2-ai-education')

    expect(screen.getAllByText('AI tools in school education').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Education and technology').length).toBeGreaterThan(0)
    expect(screen.getByText('personalized learning')).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'Start writing with this outline' })[0]
    ).toHaveAttribute('href', '/writing?promptId=task2-ai-education&outline=1')
  })
})
