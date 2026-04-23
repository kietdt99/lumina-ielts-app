import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import WritingPage from '@/app/(app)/writing/page'

const repositoryMocks = vi.hoisted(() => ({
  listWritingPrompts: vi.fn(),
}))

vi.mock('@/lib/ielts/writing-prompts-repository', () => repositoryMocks)

describe('WritingPage', () => {
  it('renders repository-backed prompts in the writing workspace', async () => {
    repositoryMocks.listWritingPrompts.mockResolvedValue({
      prompts: [
        {
          id: 'task2-public-transport',
          taskType: 'Task 2',
          title: 'Public transport investment',
          durationMinutes: 40,
          minimumWords: 250,
          brief:
            'Governments should spend more on public transport than on roads. Discuss both views and give your opinion.',
          instructions: ['Present both sides before your conclusion.'],
          planningChecklist: ['Decide your main position before drafting.'],
        },
      ],
      storageMode: 'supabase',
    })

    render(await WritingPage())

    expect(
      screen.getByRole('heading', { level: 2, name: 'Public transport investment' })
    ).toBeInTheDocument()
    expect(screen.getAllByText('Task 2')).not.toHaveLength(0)
  })
})
