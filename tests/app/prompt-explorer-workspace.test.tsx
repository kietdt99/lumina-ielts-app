import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PromptExplorerWorkspace } from '@/app/(app)/prompt-explorer/_components/prompt-explorer-workspace'
import { writingPrompts } from '@/lib/ielts/writing-prompts'

describe('PromptExplorerWorkspace', () => {
  it('renders the expanded prompt bank and writing handoff links', () => {
    render(<PromptExplorerWorkspace prompts={writingPrompts} storageMode="library" />)

    expect(
      screen.getByRole('heading', {
        name: 'Choose the right IELTS prompt before the timer starts',
      })
    ).toBeInTheDocument()
    expect(screen.getByText('Public transport funding')).toBeInTheDocument()
    expect(screen.getAllByText('Planning checklist').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Start timed draft' })[0]).toHaveAttribute(
      'href',
      '/writing?promptId=task2-remote-work'
    )
  })

  it('filters prompts by task, difficulty, topic, and search', async () => {
    const user = userEvent.setup()

    render(<PromptExplorerWorkspace prompts={writingPrompts} storageMode="library" />)

    await user.click(screen.getByRole('button', { name: 'Task 1' }))
    await user.selectOptions(screen.getByLabelText('Difficulty'), 'Balanced')
    await user.selectOptions(
      screen.getByLabelText('Topic'),
      'Urban change and transport'
    )
    await user.type(screen.getByLabelText('Search prompts'), 'map')

    expect(screen.getByText('City centre redevelopment map')).toBeInTheDocument()
    expect(screen.queryByText('Public transport funding')).not.toBeInTheDocument()
  })

  it('shows an empty state and can reset filters', async () => {
    const user = userEvent.setup()

    render(<PromptExplorerWorkspace prompts={writingPrompts} storageMode="library" />)

    await user.type(screen.getByLabelText('Search prompts'), 'no matching prompt')

    expect(screen.getByText('No prompts match this filter')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset filters' }))

    expect(screen.getByText('Public transport funding')).toBeInTheDocument()
  })
})
