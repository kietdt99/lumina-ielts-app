create extension if not exists pgcrypto;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  target_band numeric(2,1) not null check (target_band between 5.0 and 9.0),
  current_level text not null,
  focus_skill text not null,
  study_frequency text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.writing_prompts (
  id text primary key,
  task_type text not null check (task_type in ('Task 1', 'Task 2')),
  title text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  minimum_words integer not null check (minimum_words > 0),
  brief text not null,
  instructions jsonb not null default '[]'::jsonb,
  planning_checklist jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  source text not null default 'seed' check (source in ('seed', 'admin')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_type text not null check (skill_type in ('Writing')),
  status text not null default 'draft' check (status in ('draft', 'submitted', 'reviewed')),
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.writing_submissions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.practice_sessions(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  prompt_id text not null references public.writing_prompts(id),
  draft text not null,
  word_count integer not null check (word_count >= 0),
  source text not null default 'web' check (source in ('web')),
  submitted_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.writing_feedback (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references public.writing_submissions(id) on delete cascade,
  estimated_band numeric(2,1) not null check (estimated_band between 0 and 9.0),
  rubric jsonb not null default '[]'::jsonb,
  strengths jsonb not null default '[]'::jsonb,
  priorities jsonb not null default '[]'::jsonb,
  coaching_note text not null,
  sample_rewrite text,
  provider text not null default 'heuristic' check (provider in ('heuristic', 'openai')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_user_goals_user_id on public.user_goals(user_id);
create index if not exists idx_practice_sessions_user_id on public.practice_sessions(user_id);
create index if not exists idx_writing_submissions_user_id on public.writing_submissions(user_id);
create index if not exists idx_writing_submissions_prompt_id on public.writing_submissions(prompt_id);
create index if not exists idx_activity_logs_user_id on public.activity_logs(user_id);
create index if not exists idx_activity_logs_event_name on public.activity_logs(event_name);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

drop trigger if exists user_goals_set_updated_at on public.user_goals;
create trigger user_goals_set_updated_at
before update on public.user_goals
for each row
execute function public.handle_updated_at();

drop trigger if exists practice_sessions_set_updated_at on public.practice_sessions;
create trigger practice_sessions_set_updated_at
before update on public.practice_sessions
for each row
execute function public.handle_updated_at();

alter table public.profiles enable row level security;
alter table public.user_goals enable row level security;
alter table public.writing_prompts enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.writing_submissions enable row level security;
alter table public.writing_feedback enable row level security;
alter table public.activity_logs enable row level security;

create policy if not exists "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

create policy if not exists "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy if not exists "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

create policy if not exists "user_goals_select_own"
on public.user_goals
for select
using (auth.uid() = user_id);

create policy if not exists "user_goals_insert_own"
on public.user_goals
for insert
with check (auth.uid() = user_id);

create policy if not exists "user_goals_update_own"
on public.user_goals
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "writing_prompts_select_active"
on public.writing_prompts
for select
using (is_active = true);

create policy if not exists "practice_sessions_select_own"
on public.practice_sessions
for select
using (auth.uid() = user_id);

create policy if not exists "practice_sessions_insert_own"
on public.practice_sessions
for insert
with check (auth.uid() = user_id);

create policy if not exists "practice_sessions_update_own"
on public.practice_sessions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "writing_submissions_select_own"
on public.writing_submissions
for select
using (auth.uid() = user_id);

create policy if not exists "writing_submissions_insert_own"
on public.writing_submissions
for insert
with check (auth.uid() = user_id);

create policy if not exists "writing_feedback_select_own"
on public.writing_feedback
for select
using (
  exists (
    select 1
    from public.writing_submissions submissions
    where submissions.id = submission_id
      and submissions.user_id = auth.uid()
  )
);

create policy if not exists "activity_logs_select_own"
on public.activity_logs
for select
using (auth.uid() = user_id);

create policy if not exists "activity_logs_insert_own"
on public.activity_logs
for insert
with check (auth.uid() = user_id);
