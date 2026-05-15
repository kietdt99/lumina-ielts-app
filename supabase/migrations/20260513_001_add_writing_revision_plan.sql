alter table public.writing_feedback
  add column if not exists revision_plan jsonb not null default '[]'::jsonb;
