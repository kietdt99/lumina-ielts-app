import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/writing/prompts/route'
import { writingPrompts } from '@/lib/ielts/writing-prompts'

const repositoryMocks = vi.hoisted(() => ({
  listWritingPrompts: vi.fn(),
}))

vi.mock('@/lib/ielts/writing-prompts-repository', () => repositoryMocks)

describe('writing prompts route', () => {
  beforeEach(() => {
    repositoryMocks.listWritingPrompts.mockReset()
  })

  it('returns prompts from the repository', async () => {
    repositoryMocks.listWritingPrompts.mockResolvedValue({
      prompts: writingPrompts,
      storageMode: 'library',
    })

    const response = await GET()
    const payload = (await response.json()) as {
      ok: boolean
      prompts: typeof writingPrompts
      storageMode: 'library' | 'supabase'
    }

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      ok: true,
      prompts: writingPrompts,
      storageMode: 'library',
    })
  })
})
