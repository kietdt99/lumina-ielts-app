import { describe, expect, it } from 'vitest'
import {
  buildWritingPromptSeedSql,
  writingPromptSeedRows,
} from '@/lib/db/writing-prompt-seed'

describe('writing prompt seed rows', () => {
  it('maps the in-app prompt library into database-ready rows', () => {
    expect(writingPromptSeedRows).toHaveLength(13)
    expect(writingPromptSeedRows[0]).toEqual(
      expect.objectContaining({
        id: 'task2-remote-work',
        task_type: 'Task 2',
        topic: 'Work and society',
        difficulty: 'Balanced',
        is_active: true,
        source: 'seed',
      })
    )
    expect(writingPromptSeedRows.map((row) => row.id)).toEqual(
      expect.arrayContaining([
        'task1-cycle-diagram',
        'task1-city-centre-map',
        'task2-public-transport-funding',
      ])
    )
  })

  it('builds idempotent SQL for the writing prompt seed file', () => {
    const sql = buildWritingPromptSeedSql()

    expect(sql).toContain('insert into public.writing_prompts')
    expect(sql).toContain("'task2-remote-work'")
    expect(sql).toContain("'task2-ai-education'")
    expect(sql).toContain("'task1-cycle-diagram'")
    expect(sql).toContain('topic,')
    expect(sql).toContain('difficulty,')
    expect(sql).toContain("'task1-city-centre-map'")
    expect(sql).toContain('on conflict (id) do update')
  })
})
