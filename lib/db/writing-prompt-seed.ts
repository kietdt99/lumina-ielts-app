import { writingPrompts } from '@/lib/ielts/writing-prompts'

export type WritingPromptSeedRow = {
  id: string
  task_type: 'Task 1' | 'Task 2'
  title: string
  duration_minutes: number
  minimum_words: number
  brief: string
  instructions: string[]
  planning_checklist: string[]
  is_active: boolean
  source: 'seed'
}

export const writingPromptSeedRows: WritingPromptSeedRow[] = writingPrompts.map(
  (prompt) => ({
    id: prompt.id,
    task_type: prompt.taskType,
    title: prompt.title,
    duration_minutes: prompt.durationMinutes,
    minimum_words: prompt.minimumWords,
    brief: prompt.brief,
    instructions: prompt.instructions,
    planning_checklist: prompt.planningChecklist,
    is_active: true,
    source: 'seed',
  })
)

function escapeSqlString(value: string) {
  return value.replace(/'/g, "''")
}

function toSqlArrayLiteral(values: string[]) {
  return `'${escapeSqlString(JSON.stringify(values))}'::jsonb`
}

export function buildWritingPromptSeedSql() {
  const values = writingPromptSeedRows
    .map(
      (row) => `(
  '${escapeSqlString(row.id)}',
  '${escapeSqlString(row.task_type)}',
  '${escapeSqlString(row.title)}',
  ${row.duration_minutes},
  ${row.minimum_words},
  '${escapeSqlString(row.brief)}',
  ${toSqlArrayLiteral(row.instructions)},
  ${toSqlArrayLiteral(row.planning_checklist)},
  ${row.is_active},
  '${row.source}'
)`
    )
    .join(',\n')

  return `insert into public.writing_prompts (
  id,
  task_type,
  title,
  duration_minutes,
  minimum_words,
  brief,
  instructions,
  planning_checklist,
  is_active,
  source
)
values
${values}
on conflict (id) do update
set
  task_type = excluded.task_type,
  title = excluded.title,
  duration_minutes = excluded.duration_minutes,
  minimum_words = excluded.minimum_words,
  brief = excluded.brief,
  instructions = excluded.instructions,
  planning_checklist = excluded.planning_checklist,
  is_active = excluded.is_active,
  source = excluded.source;`
}
